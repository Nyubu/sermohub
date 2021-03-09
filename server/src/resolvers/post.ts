import { Post } from '../entities/Post';
import { Query,Resolver,Arg,Int,Mutation, Field, Ctx, InputType, UseMiddleware, Root, FieldResolver, ObjectType } from 'type-graphql';
import { MyContext } from '../types';
import { isAuth } from '../middleware/isAuth';
import { getConnection } from 'typeorm';
import { Updoot } from '../entities/Updoot';
import { User } from '../entities/User';

@InputType()
class PostInput {
    @Field()
    title: string 
    @Field()
    text: string
}

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post]) // graphql type
    posts: Post[] // typescript type
    @Field()
    hasMore: boolean
}

@Resolver(Post) // <- mandated by field resolver
export class PostResolver {  
    
    @FieldResolver(() => String)
    textSnippet(
        @Root() post: Post
    ) {
        return post.text.slice(0,50); // Allows you to pull only this much ( have to edit query in fr-end )
    }

    @FieldResolver(() => User)
    creator(
        @Root() post: Post,
        @Ctx() { userLoader }: MyContext
    ) {
        // returns a promise of the user
        return userLoader.load(post.creatorId); // Batches all ids into a single function call
    }

    @FieldResolver(() => Int, {nullable: true})
    async voteStatus(
        @Root() post: Post,
        @Ctx() { updootLoader, req }: MyContext
    ) {
        if (!req.session.userId) {
            return null;
        }

        // returns a promise of the user
        const updoot = await updootLoader.load({ postId: post.id, userId: req.session.userId as number}); // Batches all ids into a single function call

        return updoot ? updoot.value : null; // If we get an updoot, return value, else null
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() {req}: MyContext
    ) {
        const isUpdoot = value !== -1;
        const realValue = isUpdoot ? 1 : -1;
        const { userId } = req.session;
        
        const updoot = await Updoot.findOne({ where: {postId, userId}})

        // User has voted on the post before and are changing their vote
        if (updoot && updoot.value !== realValue) {
            getConnection().transaction( async (tm) => {
                await tm.query(
                `
                UPDATE updoot
                SET value = $1
                WHERE "postId" = $2 and "userId" = $3
                `,
                    [realValue, postId, userId]
                )

                await tm.query(
                `
                UPDATE updoot
                SET points = points + $1
                WHERE id = $2
                `,
                   [2 * realValue, postId]
                )
            })
        } else if (!updoot) {
            // Has never voted before
            getConnection().transaction( async (tm) => {
                await tm.query(
                `
                INSERT INTO updoot ("userId", "postId", value)
                VALUES ($1, $2, $3);
                `,
                    [userId, postId, realValue]
                )
                await tm.query(
                `
                UPDATE post
                SET points = points + $1
                WHERE id = $2;
                `,
                    [realValue, postId]
                );
            });

        }        

        return true // success
    }

    // Get all posts
    @Query(() => PaginatedPosts)
    async posts( 
        @Arg('limit', () => Int) limit: number, // For pagination
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null,        
    ): Promise<PaginatedPosts> {
        // Fetch 1 more, and check if there is more posts ahead of time for the load more button
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;  // +1 for the hasMore variable

        const replacements: any[] = [realLimitPlusOne];

        // cursor = '1609500742000';

        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }        

        // Run actual SQL - join
        const posts = await getConnection().query(
        `
            SELECT p.*                         
            FROM post p
            ${ cursor ? `WHERE p."createdAt" < $2`: ""}
            ORDER BY p."createdAt" DESC
            limit $1            
        `, replacements);

        // const qb = getConnection() // getConnection from typeorm
        //     .getRepository(Post)
        //     .createQueryBuilder("p")
        //     .innerJoinAndSelect( // inner join to get user by post
        //         "p.creator",
        //         "u",
        //         'u.id = p."creatorId"'
        //     )
        //     .orderBy('p."createdAt"', "DESC") // Double quotes to reference the column
        //     .take(realLimitPlusOne); // Cap the number of posts

        // if (cursor) {
        //     qb.where('p."createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) })
        // }
        // const posts = await qb.getMany();
        // console.log("posts: ", posts);

        // PaginatedPosts object
        return { 
            posts: posts.slice(0, realLimit), 
            hasMore: posts.length === realLimitPlusOne };
    
    }
    
    @Query(() => Post, { nullable: true }) // getting data
    post( @Arg('id', () => Int) id: number): Promise<Post | undefined> { //typescript type
        return Post.findOne(id); // match the manytoone field in Post
    }

    @Mutation(() => Post) // Mutation is for update, insert, delete
    @UseMiddleware(isAuth)
    async createPost( 
        @Arg("input") input: PostInput,
        @Ctx() {req}: MyContext
    ): Promise<Post> {
       
        // Post.create({ ...input, creatorId: req.session.id, }).save();
        return Post.create({
            ...input,
            creatorId: req.session.userId,
          }).save();
    }

    @Mutation(() => Post, { nullable: true }) // Mutation is for update, insert, delete
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title') title: string,
        @Arg('text') text: string,
        @Ctx() {req}: MyContext
        ): Promise<Post | null> {

            const result = await getConnection()
                .createQueryBuilder()
                .update(Post)
                .set({ title, text })
                .where('id = :id and "creatorId" = :creatorId', {id, creatorId: req.session.userId })
                .returning('*')
                .execute();

            return result.raw[0]; // raw has the information we want (the post)
        }

    @Mutation(() => Boolean) // Mutation is for update, insert, delete
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() {req}: MyContext
    ): Promise<boolean> {

        const post = await Post.findOne(id)

        if (!post) {
            return false;
        }

        if (post.creatorId !== req.session.userId) {
            throw new Error('You are not the author');
        }

        try {
            await Updoot.delete({ postId: id })
            await Post.delete({ id });
        } catch(err) {
            console.error(err);
            return false;
        }
        
        return true;
    }
}