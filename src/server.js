import Express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import blogPostsRouter from "./api/blogPosts/index.js";
import {
  badRequestHandler,
  notFoundHandler,
  genericErrorHandler,
} from "./errorHandlers.js";
import authorsRouter from "./api/authors/index.js";
import usersRouter from "./api/users/index.js";

const server = Express();
const port = process.env.PORT || 3005;
const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

server.use(
  cors({
    origin: (currentOrigin, corsNext) => {
      if (!currentOrigin || whitelist.indexOf(currentOrigin) !== -1) {
        // origin is in the whitelist
        corsNext(null, true);
      } else {
        // origin is not in the whitelist
        corsNext(
          createHttpError(
            400,
            `Origin ${currentOrigin} is not in the whitelist!`
          )
        );
      }
    },
  })
);
server.use(Express.json());

server.use("/blogPosts", blogPostsRouter);
server.use("/authors", authorsRouter);
server.use("/users", usersRouter);

server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);
mongoose.connection.on("connected", () => {
  console.log("✅ Successfully connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`✅ Server on port ${port}`);
  });
});
