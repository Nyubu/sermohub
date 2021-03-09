import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './Post';
import { User } from './User';

// m to n relationship 
// user <-> posts
// user -> join table <- posts
// user -> updoot <- posts

@Entity()
export class Updoot extends BaseEntity {

    @Column({ type: "int" }) // 1 or -1 for up or downvote
    value: number;

    @PrimaryColumn()
    userId: number;

    @ManyToOne(() => User, (user) => user.updoots)
    user: User;

    @PrimaryColumn()
    postId: number;

    @ManyToOne(() => Post, (Post) => Post.updoots)
    post: Post;
 
}