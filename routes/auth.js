const express = require("express");
const app = express();
const session = require("express-session");
const router = require("express").Router();
const bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

router.post("/login" , async (req, res) => {

  // Login information object.
  const loginInformation = {

    // Get the given login information for the request
    username: req.body.username,
    password: req.body.password
  };

  req.session.userId = loginInformation.username;

  connection.connect(function (err) {

    connection.query('SELECT * FROM users WHERE username="' + loginInformation.username + '";',
    async function (err, result, fields) {

      if (result && result.length > 0) {

        const isPasswordCorrect = await bcrypt.compare(
          loginInformation.password,
          result[0].password
        );

        if(isPasswordCorrect){

          req.session.userId = result[0].ID;

          redisClient.set(req.session.id, req.session.userId, (err) => {

            if(err){

              console.log(err)
            }
          });
          

          console.log(req.session.id);
          res.status(200).json({"session-token" : req.session.id});
        }

        else{
          res.status(404).json({"session-token" : req.session.id}).send("Sees");
        }
      }

      // Username of password is wrong.
      else {
        console.log("Username wrong");
        res.status(404).json({"session-token" : req.session.id});
      }
    });
  });
})

router.post("/register" , async (req, res) => {

  // Hash the password.
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const registerInformation = {

    username: req.body.username,
    password: hashedPassword,
    email: req.body.email
  };

  // Create connection
  connection.connect(function (err) {

    // Create query for looking for users that are registered with given information.
    connection.query('SELECT * FROM users WHERE username="' + registerInformation.username + '" or email="' + registerInformation.email + '";',
    function (err, result, fields) {

      // If there was no unique data in the database, register the use.
      if (result.length < 1) {

        connection.query("INSERT INTO users (username, password, email) VALUES('" +
          registerInformation.username + "', '" +
          registerInformation.password + "', '" +
          registerInformation.email + "')");

        res.status(200).send("User registered.");
      }

      else {

        // Precondition failed
        res.status(400).send("Username already exists");
      }
    });
  });
})

router.post("/validateSession", async (req, res) => {

  if(req.body.cookie){
    const cookie = await redisClient.get(req.body.cookie, (err, sessionID) => {

      if(err){

        // If any errors happened, log them onto the server console.
        console.log(err);
      }

      if(sessionID){

        const user = FindUserByID(res, sessionID)
      }

      else{

        res.sendStatus(404);
      }
    })
  }
})

const FindUserByID = async (res, userID) => {

  connection.connect((err) => {

    connection.query("SELECT username FROM users WHERE ID='" + userID + "'",
    function await (err, result, fields){

      if(err){

        console.log(err);
        res.sendStatus(500);
      }

      else{

        res.status(200).json({"ID": result[0].username});
      }
    })
  })
}

module.exports = router;
