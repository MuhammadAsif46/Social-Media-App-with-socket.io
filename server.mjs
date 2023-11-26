import express from "express";   // import express
import cors from "cors";         // import cors
import path from "path";         // import path
import "dotenv/config";          // import dotenv
import cookieParser from "cookie-parser";         // import cookie-parser
import jwt from "jsonwebtoken";                   // import jwt
import { ObjectId } from "mongodb";               // import object  
import { createServer } from "http";              // import createServer in http package 
import { Server as socketIo } from 'socket.io';   // import socketIo in socket.io 
import cookie from 'cookie';                      // import cookie



import { client } from "./mongodb.mjs";           // import client in mongodb.mjs file
import authRouter from "./routes/auth.mjs";       // import authRouter in routes folder
import postRouter from "./routes/post.mjs";       // import postRouter in routes folder
import chatRouter from "./routes/chat.mjs";       // import chatRouter in routes folder
import unAuthProfileRoutes from "./unAuthRoutes/profile.mjs";     // import unAuthRoutes in unAuthRoutes folder
import { globalIoObject, socketUsers } from './core.mjs';         // import globalIoObject and socketUsers in core.mjs file


const __dirname = path.resolve();                 // create path 
const db = client.db("dbcrud");                   // create database  // document base database
const col = db.collection("posts");               // create post collection
const userCollection = db.collection("users");    // create user collection


const app = express();        // express app convert app
app.use(express.json());      // body parser
app.use(cookieParser());      // cookie parser
app.use(                      // cors initialize and define request path
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

// /api/v1/login
app.use("/api/v1", authRouter);     // unSecuri API

app.use("/api/v1", (req, res, next) => {   // JWT --- // bayriyar : yha sy agay na ja paye
  
  // console.log("cookies: ", req.cookies);

  const token = req.cookies.token;

  try {
    console.log(token);
    const decoded = jwt.verify(token, process.env.SECRET);
    // console.log("decoded : ", decoded);

    req.body.decoded = {
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
      _id: decoded._id,
    };

    req.currentUser = {
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
      _id: decoded._id,
    };

    next();
    
  } catch (err) {
    unAuthProfileRoutes(req, res, next);
    return;
  }
});

app.use("/api/v1", postRouter);     // Securi API
app.use("/api/v1", chatRouter);     // Securi API

app.use("/api/v1/ping", (req, res) => { // Securi API
  res.send("OK");
});


app.get("/api/v1/users", async (req, res, next) => {

  const userId = req.query._id || req.body.decoded._id;

  if (!ObjectId.isValid(userId)) {
    res.status(403).send(`Invalid user id`);
    return;
  }

  const cursor = userCollection
    .find({})
    .sort({ _id: -1 })
    .limit(100);

  try {
    let results = await cursor.toArray();
    console.log("results: ", results);

    const modifiedUserList = results.map(eachUser => {
  
      let user ={
        _id: eachUser._id,
        firstName: eachUser.firstName,
        lastName: eachUser.lastName,
        email: eachUser.email
      }
      if(eachUser._id.toString() === userId){
        user.me = true
        return user;
      }else{
        return user;
      }
    })

    res.send(modifiedUserList);
    
  } catch (err) {
    console.log(" error getting data mongodb : ", err);
    res.status(500).send("server error, please try later..");
  }



});

app.use("/", express.static(path.join(__dirname, "web/build")));    // static Hosting  
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/web/build/index.html"));     // Redirect to index
  // res.redirect("/");
});

// THIS IS THE ACTUAL SERVER WHICH IS RUNNING
const server = createServer(app);

// handing over server access to socket.io
const io = new socketIo(server, {
    cors: {
        origin: ["*", "http://localhost:3000"],
        methods: "*",
        credentials: true
    }
});

globalIoObject.io = io;


io.use((socket, next) => {
    console.log("socket middleware");
    // Access cookies, including secure cookies

    const parsedCookies = cookie.parse(socket.request.headers.cookie || "");
    console.log("parsedCookies: ", parsedCookies.token);

    try {
        const decoded = jwt.verify(parsedCookies.token, process.env.SECRET);
        console.log("decoded: ", decoded);

        socketUsers[decoded._id] = socket;

        socket.on("disconnect", (reason, desc) => {
            console.log("disconnect event: ", reason, desc); // "ping timeout"
        });

        next();

    } catch (err) {
        return next(new Error('Authentication error'));
    }
});

io.on("connection", (socket) => {
    console.log("New client connected with id: ", socket.id);

})

const PORT = process.env.PORT || 4001;          // Define PORT 
server.listen(PORT, () => {                        // Listen on port
  console.log(`Example server listening on port ${PORT}`);
});
