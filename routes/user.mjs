// Import Libraries:
import express from 'express';
import { ObjectId } from "mongodb"; 

// Imports Data from file:
import { client } from "./../mongodb.mjs"; 

// Create Database and Collections:
const db = client.db("dbcrud");         
const col = db.collection("posts");     
const userCollection = db.collection("users");

let router = express.Router();

// GET: All users
router.get("/users", async (req, res, next) => {
    const userId = req.query._id || req.body.decoded._id;
  
    if (!ObjectId.isValid(userId)) {
      res.status(403).send(`Invalid user id`);
      return;
    }
  
    
    try {
      const cursor = await userCollection.find({}).sort({ _id: -1 }).limit(100);
      let results = await cursor.toArray();
      // console.log("results: ", results);
  
      const modifiedUserList = results.map((eachUser) => {
        let user = {
          _id: eachUser._id,
          firstName: eachUser.firstName,
          lastName: eachUser.lastName,
          email: eachUser.email,
        };
        if (eachUser._id.toString() === userId) {
          user.me = true;
          return user;
        } else {
          return user;
        }
      });
  
      res.send(modifiedUserList);
    } catch (err) {
      console.log(" error getting data mongodb : ", err);
      res.status(500).send("server error, please try later..");
    }
  });

// GET: One user
router.get("/user/:userId", async (req, res) => {
    const userId = req.params.userId;
  
    if (!ObjectId.isValid(userId)) {
      res.status(403).send(`Invalid user id`);
      return;
    }
  
    try {
      const cursor = await userCollection.findOne({ _id: new ObjectId(userId) });
      // console.log("cursor: ", cursor);
      res.send(cursor);
    } catch (err) {
      console.log(" error getting data mongodb : ", err);
      res.status(500).send("server error, please try later..");
    }
});

export default router;