const dotenv = require('dotenv')
dotenv.config();

const express = require("express");
const path = require("path");
const userRoute= require("./routes/user");
const BlogRoute= require("./routes/blog");
const { connectMongoDB } = require('./connection');
const cookieParser=require("cookie-parser");
const { checkForAuthentication } = require("./middlewares/auth");
const methodOverride = require('method-override');

const Blog= require("./models/blog");

const app = express();
const PORT = process.env.PORT || 8000;

// Connection
connectMongoDB(process.env.MONGO_URL).then(() => console.log("MongoDB connected successfully!"))
    .catch((err) => console.error("MongoDB connection failed!", err));

// Views
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(checkForAuthentication);
app.use(express.static(path.resolve("./public")))  // public folder will be trated as static

// Home route
app.get("/", async(req, res) => {
    const allBlogs=await Blog.find({}).populate("createdBy");
    res.render("home",{
        user:req.user,
        blogs:allBlogs,
    })
})
// User Route & Blog Route
app.use("/user",userRoute);
app.use("/blog",BlogRoute)

app.listen(PORT, () => {
  console.log(`Server started at Port:${PORT}`);
});
