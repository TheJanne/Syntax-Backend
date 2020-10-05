const express = require("express");
const app = express();
const router = require("express").Router();
const verifier = require("./verify");
const session = require("express-session");
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const redisClient  = redis.createClient({host: "localhost", port: 6379});

redisClient.on("error", (err) => {

  console.log("Redis error: ", err);
})

redisClient.on("ready", () => {

  console.info("Successfully connected to Redis.");
})

// SQL Connection
const mySQL = require('mysql');
const connection = mySQL.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "syntax"
});

router.post("/", (req, res) => {

  connection.connect(function(err) {

    connection.query("SELECT * FROM posts ORDER BY postID DESC", function (err, result, fields){

      if(result.length > 0){

        res.json(result);
      }
    })
  });
});

router.post("/createPost", (req, res) => {

  if(req.body.cookie){
    
    const cookie = redisClient.get(req.body.cookie, (err, userID) => {

      if(err){

        // If any errors happened, log them onto the server console.
        console.log(err);
      }

      if(userID){

        //const user = FindUserByID(res, sessionID)
        connection.connect((err) => {

          // INSERT INTO posts (authorID, postTitle, postContent) VALUES (16, "Minun testi title", "Minun testi content");
          connection.query("INSERT INTO posts (authorID, postTitle, postContent) VALUES ('" + userID + "','" + req.body.title + "','" + req.body.content + "')", function(err, result, fields){

            if(err){
              console.log(err)
            }

            res.sendStatus(200);
          })
        })
      }

      else{

        res.sendStatus(404);
      }
    })
  }
});

module.exports = router;
