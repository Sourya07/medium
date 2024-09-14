import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'
import { userRouter } from './routes/user';  // Adjust the path as necessary
import { blogRouter } from './routes/blog';  // Adjust the path as necessary
import { cors } from 'hono/cors'
// Then your existing code


// Create the main Hono app
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string,

  }


}>();
app.use('/*', cors())
app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);









export default app;
