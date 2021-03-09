import 'reflect-metadata';
import "dotenv-safe/config";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from './resolvers/user';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis'
import cors from "cors";
import { createConnection } from 'typeorm'
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';
import { Updoot } from './entities/Updoot';
import { createUserLoader } from './utils/createUserLoader';
import { createUpdootLoader } from './utils/createUpdootLoader';

const main = async () => {
    const conn = await createConnection({
        url: process.env.DATABASE_URL,
        host: 'localhost',
        type: 'postgres',
        logging: true,
        // synchronize: true,
        migrations: [path.join(__dirname, "./migrations/*")], // concatenate absolute path
        entities: [Post, User, Updoot],        
    })
    await conn.runMigrations();

    const app = express();

    // The order that you add express middleware is the order it runs
    // Session middleware must run before apollo middleware because we're
    // using session middleware inside apollo
    const RedisStore = connectRedis(session)
    const redis = new Redis(process.env.REDIS_URL)
    app.set("trust proxy", 1); // tell express we have a proxy sitting in front so cookies/sessions work
    app.use(
      cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
      })
    );
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ 
                client: redis,
                disableTouch: true,
            }),
            
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true, // Good for security - can't access cookie from frontend js
                sameSite: "lax", // csrf
                // secure: false,
                domain: __prod__ ? ".sermohub.com" : undefined,
                secure: __prod__, // cookie only works in https
            },
            saveUninitialized: false,
            secret: process.env.SESSION_SECRET, // You want to hide this make env variable
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({req, res}) => ({ // acessible by all resolvers
            req,
            res,
            redis,
            userLoader: createUserLoader(), // The context runs on every request, so every user loader gets created. So we batch and caches loading of users within a single request
            updootLoader: createUpdootLoader(), 
        }),
    })

    // Create graphql endpoint on express
    apolloServer.applyMiddleware({
        app, 
        cors: false, 
    });

    app.listen(parseInt(process.env.PORT), () => {
        console.log('server started on localhost:5000');
    })
};



main().catch((err) => {
    console.error(err);
})

