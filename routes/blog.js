const { Router } = require("express");
const multer = require('multer');
const path = require("path");
const fs = require("fs");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName)
  }
})

const upload = multer({ storage: storage })

router.get("/add-new", (req, res) => {
  res.render("addBlog", {
    user: req.user,
  });
})

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");
  return res.render("blog", {
    user: req.user,
    blog,
    comments
  });
})

router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
})

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  const blog = await Blog.create({
    title,
    body,
    createdBy: req.user._id,
    coverImageUrl: `/uploads/${req.file.filename}`,
  });
  return res.redirect(`/blog/${blog._id}`);
});

router.delete("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).render("error", {
        user: req.user,
        message: "Blog not found",
      });
    }

    // Authorization Check
    const isOwner = blog.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).render("error", {
        user: req.user,
        message: "You are not authorized to delete this blog.",
      });
    }

    // Delete the cover image if it exists
    const imagePath = path.join(__dirname, "..", "public", blog.coverImageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete the blog from the database
    await Blog.deleteOne({ _id: req.params.id });

    return res.redirect("/");
  } catch (err) {
    console.error("Error deleting blog or image:", err);
    return res.status(500).render("error", {
      user: req.user,
      message: "Something went wrong. Please try again later.",
    });
  }
});

module.exports = router;

