const express = require("express");
const { ObjectId } = require("mongodb");

const db = require("../data/database");

const router = express.Router();

db.connectToDatabase();

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
  const posts = await db
    .getDB()
    .collection("posts")
    .find({})
    .project({ title: 1, summary: 1, "author.name": 1 })
    .toArray();

  /* 
  const test = await db.getDB().collection("posts").aggregate([
    {
      $project: {
        _id: 1,
        title: 1,
        summary: 1,
        "author.name": 1
      }
    }
  ])
  .toArray();
  console.log(test);
  */

  res.render("posts-list", { posts: posts });
});

router.get("/new-post", async function (req, res) {
  try {
    // Now you can access the database using db.getDB()
    const authors = await db.getDB().collection("authors").find().toArray();
    res.render("create-post", { authors: authors });
  } catch (error) {
    console.error("An error occurred while connecting to the database:", error);
  }
});

router.post("/posts", async function (req, res) {
  let idAuthor;

  try {
    idAuthor = new ObjectId(req.body.author);
  } catch(error) {
    res.status(404).render('404');
  }

  const author = await db
    .getDB()
    .collection("authors")
    .findOne({ _id: idAuthor });
    
  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      idAuthor: idAuthor,
      name: author.name,
      email: author.email,
    },
  };

  const result = await db.getDB().collection("posts").insertOne(newPost);
  
  res.redirect("/posts");
});

router.get("/posts/:idPost", async function (req, res) {
  const postId = req.params.idPost;
  const post = await db
    .getDB()
    .collection("posts")
    .findOne(
      { _id: new ObjectId(postId) },

      /* Projection to exclude "summary" */
      { projection: { summary: 0 } }
    );
  

  if (!post) {
    return res.status(404).render("404");
  }

  post.humanReadableDate = post.date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    moth: "long",
    day: "numeric",
  });
  post.date = post.date.toISOString();

  res.render("post-detail", { post: post });
});

router.get("/posts/:id/edit", async function (req, res) {
  const idPost = new ObjectId(req.params.id);
  const post = await db
    .getDB()
    .collection("posts")
    .findOne({ _id: idPost }, { title: 1, summary: 1, body: 1 });

  if (!post) {
    return res.status(404).render("404");
  }

  res.render("update-post", { post: post });
});

router.post("/posts/:id/edit", async function (req, res) {
  const postId = new ObjectId(req.params.id);

  const post = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
  };

  db.getDB().collection("posts").updateOne({ _id: postId }, { $set: post });

  res.redirect('/posts');
});

router.post('/posts/:id/delete', async function(req, res) {
  const idPost = new ObjectId(req.params.id);
  const result = await db.getDB().collection('posts').deleteOne({_id: idPost});
  
  console.log(result);

  res.redirect('/posts');
});

module.exports = router;
