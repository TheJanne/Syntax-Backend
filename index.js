const express = require("express");
const app = express();

// Libraies
const session = require("express-session");
const redis = require('redis');
const redisStore = require('connect-redis')(session);

// Import Routes
const authRoute = require("./routes/auth");
const postsRoute = require("./routes/posts");

const redisClient  = redis.createClient({host: "localhost", port: 6379});

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', true);

  if (req.method === 'OPTIONS'){

    res.header('Access-Control-Allow-Methods', 'POST, GET');
  }

  next();
});

redisClient.on("error", (err) => {

  console.log("Redis error: ", err);
})

redisClient.on("ready", () => {

  console.info("Successfully connected to Redis.");
})

// Sessions.
app.use(session({

  name:"sessname",
  secret: "slgahfj5t82jfrelvfoiqj49trq13ot´v418h398415r435i31+th48rtewsf",
  store: new redisStore({client: redisClient}),
  resave: false,
  saveUninitialized: false,
  maxAge: 600,
  cookie: {
    secure: false
  }
}));

// Route Middlawares. When calling routes in authRoute, /api/users/ needs to be set as a prefix.
app.use("/api/user", authRoute);
app.use("/api/posts", postsRoute);

app.listen(port = 5000, () => {

  console.log('Server started on port ' + port);
});

app.post('*', (req, res) => {/*Empty for a reason*/})
