
import express from 'express';
import { nanoid } from 'nanoid'
import { client } from './../mongodb.mjs'
import { ObjectId } from 'mongodb'
import OpenAI from "openai";
import admin from "firebase-admin";
import multer, { diskStorage } from "multer";
import fs from "fs";


const db = client.db("dbcrud");
const messagesCollection = db.collection("messages");
const col = db.collection("posts");
const userCollection = db.collection("users");
import { globalIoObject, socketUsers } from '../core.mjs';



let router = express.Router()

const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

router.post("/message", multer().none(), async (req, res, next) => {

    console.log("req.body: ", req.body);
    console.log("req.currentUser: ", req.currentUser);

    if (!req.body.to_id || !req.body.messageText) {
        res.status(403);
        res.send(`required parameters missing, 
        example request body:
        {
            to_id: "43532452453565645635345",
            messageText: "some post text"
        } `);
        return; 
    }

    if (!ObjectId.isValid(req.body.to_id)) {
        res.status(403).send(`Invalid user id`);
        return;
    }

    try {
        const newMessage = {

            fromName: req.currentUser.firstName + " " + req.currentUser.lastName,
            fromEamil: req.currentUser.email, // malik@abc.com
            from_id: new ObjectId(req.currentUser._id), // 245523423423424234

            to_id: new ObjectId(req.body.to_id),

            messageText: req.body.messageText,
            imgUrl: req.body.imgUrl,
            createdOn: new Date()
        }
        

        const insertResponse = await messagesCollection.insertOne(newMessage);
        console.log("insertResponse: ", insertResponse);

        newMessage._id = insertResponse.insertedId;

        // private emit only to a user
        if (socketUsers[req.body.to_id]) { // if user is online
            socketUsers[req.body.to_id].emit("NEW_MESSAGE", newMessage)
            socketUsers[req.body.to_id].emit(
                `NOTIFICATIONS`,
                `new message from ${req.currentUser.firstName}: ${req.body.messageText}`
            );
        }else{
            console.log("this iser is not online");
        }
        res.send({ message: 'message sent' });
    
    } catch (e) {
        console.log("error sending message mongodb: ", e);
        res.status(500).send({ message: 'server error, please try later' });
    }

});

router.get("/messages/:from_id", async (req, res, next) => {

    if (!req.params.from_id) {
        res.status(403);
        res.send(`required parameters missing, 
        example request body:
        {
            from_id: "43532452453565645635345"
        } `);
    }

    if (!ObjectId.isValid(req.params.from_id)) {
        res.status(403).send(`Invalid user id`);
        return;
    }


    const cursor = messagesCollection.find({
        $or: [
            {
                to_id: new ObjectId(req.currentUser._id),
                from_id: new ObjectId(req.params.from_id),
            }
            ,
            {
                from_id: new ObjectId(req.currentUser._id),
                to_id: new ObjectId(req.params.from_id)
            }
        ]
    })

        .sort({ _id: -1 })
        .limit(100);

    try {
        let results = await cursor.toArray()
        // console.log("results: ", results);
        res.send(results);
    } catch (e) {
        console.log("error getting data mongodb: ", e);
        res.status(500).send('server error, please try later');
    }

});


export default router