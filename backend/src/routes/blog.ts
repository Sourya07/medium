import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    },
    Variables: {
        userId: string;
    }

}>();


blogRouter.use("/*", async (c, next) => {
    ///extract the user id
    /// pass it dwon to the route handler

    const authHeader = c.req.header("authorization") || "";
    try {
        const user = await verify(authHeader, c.env.JWT_SECRET)
        if (user) {
            //@ts-ignore
            c.set("userId", user.id);
            await next()
        } else {
            return c.json({
                msg: "you are not authorise"
            })
        }

    }
    catch (e) {
        c.status(403);
        return c.json({
            message: "you are not logged in"
        })
    }



})


blogRouter.post("/", async (c) => {
    const body = await c.req.json();
    const userId = c.get("userId")
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const post = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: userId

        }
    })
    console.log(body)

    return c.json({
        id: post.id
    })
})

blogRouter.put('/', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const post = await prisma.post.update({
        where: {
            id: body.id
        },
        data: {
            title: body.title,
            content: body.content,
        }
    })

    return c.json({
        id: post.id
    })

})

//// pagination
blogRouter.get('/bulk', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const posts = await prisma.post.findMany();
    console.log(posts)
    return c.json({
        posts
    })

})


blogRouter.get('/:id', async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());




    try {
        const post = await prisma.post.findFirst({
            where: {
                id: id
            },

        })

        return c.json({
            post
        })
    }
    catch (e) {
        return c.json({
            msg: "there is an error in finding the post"
        })
    }

})


