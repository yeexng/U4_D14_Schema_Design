import express from "express";
import createHttpError from "http-errors";
import BlogPostsModel from "./model.js";
import q2m from "query-to-mongo";

const blogPostsRouter = express.Router();

blogPostsRouter.post("/", async (req, res, next) => {
  try {
    const newBlogPost = new BlogPostsModel(req.body);
    const { _id } = await newBlogPost.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get("/", async (req, res, next) => {
  try {
    // console.log("req.query", req.query);
    // console.log("q2m", q2m(req.query));
    const mongoQuery = q2m(req.query);
    const blogPosts = await BlogPostsModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort)
      .populate({
        path: "author likes",
        select: "firstName lastName userName",
      }); // add this line and refer to the schema path that you wanted to refer
    const total = await BlogPostsModel.countDocuments(mongoQuery.criteria);
    res.send({
      links: mongoQuery.links("http://localhost:3005/blogPosts", total),
      total,
      numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      blogPosts,
    });
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get("/:blogPostsID", async (req, res, next) => {
  try {
    const blogPost = await BlogPostsModel.findById(
      req.params.blogPostsID
    ).populate({ path: "author likes", select: "firstName lastName userName" }); // add this line and refer to the schema path that you wanted to refer
    if (blogPost) {
      res.send(blogPost);
    } else {
      next(
        createHttpError(
          404,
          `BlogPost with id ${req.params.blogPostsID} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.put("/:blogPostsID", async (req, res, next) => {
  try {
    const updatedBlogPost = await BlogPostsModel.findByIdAndUpdate(
      req.params.blogPostsID,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedBlogPost) {
      res.send(updatedBlogPost);
    } else {
      next(
        createHttpError(
          404,
          `BlogPost with id ${req.params.blogPostsID} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.delete("/:blogPostsID", async (req, res, next) => {
  try {
    const deletedBlogPost = await BlogPostsModel.findByIdAndDelete(
      req.params.blogPostsID
    );
    if (deletedBlogPost) {
      res.status(204).send({ message: "BlogPost Deleted" });
    } else {
      next(
        createHttpError(
          404,
          `BlogPost with id ${req.params.blogPostsID} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// EMBEDDED CRUD ------------ COMMENT
blogPostsRouter.post("/:blogPostsID", async (req, res, next) => {
  try {
    const newComment = req.body;
    const commentsToInsert = {
      ...newComment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedBlogPost = await BlogPostsModel.findByIdAndUpdate(
      req.params.blogPostsID, //who
      { $push: { comments: commentsToInsert } }, //how
      { new: true, runValidators: true }
    );
    if (updatedBlogPost) {
      res.status(201).send(updatedBlogPost);
    } else {
      next(
        createHttpError(
          404,
          `BlogPost with id ${req.params.blogPostsID} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get("/:blogPostsID/comments", async (req, res, next) => {
  try {
    const blogPost = await BlogPostsModel.findById(req.params.blogPostsID);
    //console.log(blogPost)
    if (blogPost) {
      res.send(blogPost.comments);
    } else {
      next(
        createHttpError(
          404,
          `BlogPost with id ${req.params.blogPostsID} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get(
  "/:blogPostsID/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogPost = await BlogPostsModel.findById(req.params.blogPostsID);
      if (blogPost) {
        const comment = blogPost.comments.find(
          (c) => c._id.toString() === req.params.commentId
        );
        if (comment) {
          res.send(comment);
        } else {
          next(
            createHttpError(
              404,
              `Comment with id ${req.params.commentId} not found!`
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `BlogPost with id ${req.params.blogPostsID} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);
blogPostsRouter.put(
  "/:blogPostsID/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogPost = await BlogPostsModel.findById(req.params.blogPostsID);
      if (blogPost) {
        const i = blogPost.comments.findIndex(
          (c) => c._id.toString() === req.params.commentId
        );
        if (i !== -1) {
          blogPost.comments[i] = {
            ...blogPost.comments[i].toObject(),
            ...req.body,
            updatedAt: new Date(),
          };
          await blogPost.save();
          res.send(blogPost.comments[i]);
        }
      } else {
        next(
          createHttpError(
            404,
            `Comment with id ${req.params.commentId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);
blogPostsRouter.delete(
  "/:blogPostsID/comments/:commentId",
  async (req, res, next) => {
    try {
      const updatedBlogPost = await BlogPostsModel.findByIdAndUpdate(
        req.params.blogPostsID,
        { $pull: { comments: { _id: req.params.commentId } } },
        { new: true, runValidators: true }
      );
      if (updatedBlogPost) {
        res.status(204).send({ message: "Comment Deleted" });
      } else {
        next(
          createHttpError(
            404,
            `Comment with id ${req.params.commentId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default blogPostsRouter;
