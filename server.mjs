// Import Libraries:
import express from "express"; 
import cors from "cors"; 
import path from "path"; 
import "dotenv/config";
import cookieParser from "cookie-parser"; 
import jwt from "jsonwebtoken"; 
import { ObjectId } from "mongodb"; 
import { createServer } from "http"; 
import { Server as socketIo } from "socket.io"; 
import cookie from "cookie"; 

// Imports Data from files:
import { client } from "./mongodb.mjs"; 
import { globalIoObject, socketUsers } from "./core.mjs"; 

// Imports Routes:
import authRouter from "./routes/auth.mjs"; 
import postRouter from "./routes/post.mjs"; 
import chatRouter from "./routes/chat.mjs"; 
import userRouter from "./routes/user.mjs"; 
import unAuthProfileRoutes from "./unAuthRoutes/profile.mjs"; 

// Create Database, Collections and path: 
const __dirname = path.resolve();       
const db = client.db("dbcrud");         
const col = db.collection("posts");     
const userCollection = db.collection("users");    

const app = express();
app.use(express.json()); // body parser
app.use(cookieParser()); // cookie parser
app.use(
  // cors initialize and define request path
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.use("/api/v1", authRouter); // unSecuri API --> Auth-APIs

app.use("/api/v1", (req, res, next) => { // JWT --- // bayriyar : yha sy agay na ja paye

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

app.use("/api/v1", postRouter); // Securi API --> Post-APIs
app.use("/api/v1", chatRouter); // Securi API --> Chat-APIs
app.use("/api/v1", userRouter); // Securi API --> User-APIs



app.use("/", express.static(path.join(__dirname, "web/build"))); // static Hosting
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/web/build/index.html")); // Redirect to index
  // res.redirect("/");
});

// THIS IS THE ACTUAL SERVER WHICH IS RUNNING
const server = createServer(app);

// handing over server access to socket.io
const io = new socketIo(server, {
  cors: {
    origin: ["*", "http://localhost:3000"],
    methods: "*",
    credentials: true,
  },
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
    return next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("New client connected with id: ", socket.id);
});

const PORT = process.env.PORT || 4001; // Define PORT
server.listen(PORT, () => {
  // Listen on port
  console.log(`Example server listening on port ${PORT}`);
});
