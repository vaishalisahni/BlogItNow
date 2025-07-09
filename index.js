const express = require("express");
const path = require("path");
const userRoute= require("./routes/user");
const { connectMongoDB } = require('./connection');

const app = express();
const PORT = 8000;

// Connection
connectMongoDB('mongodb://127.0.0.1:27017/blogItNow').then(() => console.log("MongoDB connected successfully!"))
    .catch((err) => console.error("MongoDB connection failed!", err));

// Views
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({extended:false}));

// Home route
app.get("/", (req, res) => {
    res.render("home")
})
// User Route
app.use("/user",userRoute);

app.listen(PORT, () => {
    console.log(`Server started at Port:${PORT}`);

})