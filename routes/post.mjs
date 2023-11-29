// Import Libraries:
import express from "express";
import { nanoid } from "nanoid";
import { ObjectId } from "mongodb";
import admin from "firebase-admin";
import multer, { diskStorage } from "multer";
import fs from "fs";


// Imports Data from files:
import { client } from "./../mongodb.mjs";
import { openai as openaiClient } from "./../mongodb.mjs";


// Create Database and Collections: 
const db = client.db("dbcrud"); 
const col = db.collection("posts"); 
const userCollection = db.collection("users");

//file uplaod work:
//==============================================

const storageConfig = diskStorage({    // https://www.npmjs.com/package/multer#diskstorage
  destination: "./uploads/",
  filename: function (req, file, cb) {
    // console.log("mul-file: ", file);
    cb(null, `postImg-${new Date().getTime()}-${file.originalname}`);
  },
});

let upload = multer({ storage: storageConfig });

//==============================================


// https://firebase.google.com/docs/storage/admin/start:

let serviceAccount =  {
  type: "service_account",
  project_id: "react-assignment-cv",
  private_key_id: "5c4224a29f45b4131724f18470bbb02a177de940",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCyaGNZvpgTHmaB\nVC7Fe2XZup7qDKcrDU0Ajp7vsGib6gUGKtu5/S9nBYYI9rN1r0kDbmWG8UJdUtUY\nsEvZMsJF9ozikkqCPjDIC2/D5CYmkuWX/Gw/X/4x3RqfWlxmggGmzlQGRyh6EQjv\nMqA2IM3HUAf51NM36bOE0qxAHIdK4T9QWNvXplW8FNU3omZmflDTf+us6zX8AUEq\nwGhijKMJw67SFNgLxpZCs7INycQ96KJhHy+9Y8iRgRpZTfIW/OK07Cnue1ldE3O+\nNo5PWWNJNHgkfIPutqUY7lWF31Vs5V78gIPuyzhzoiJC3FhBU4QTr2mC9vUIFyOf\nr38Byo47AgMBAAECggEAAv02r1HyV1S6wyKN10HuUdNUIHw5DXXWwYnM207h+c48\nlT74Ya3cco6ZPBHyE/3caDUkvO0F0JgidOCJsQ6uKEMPrFrvctja5nHL8UksMHaH\nI6TKnPhH7de+8r42zJNo+vDIX9CNmKBe5/vb7UCBhEBXHiL1At21wcfps8TiVBP7\n/fJA+n+8zNNGzb/x5q5yWh1wRheGEYftXjVWkdI45GZsa24plHIPZW6wizDTmZKS\n/jNjjDdlUTHvt/H+A8r0qws0pFQTsBEAMnWA+60/CqI6hXK7Lwfv5awTkUfYEkzI\nMf+2V917tmPrTNyWje3Ez0ps0rx6US4kqM7/B0aIYQKBgQDql9SwRSd8F43lSbf1\n+mNrx2pNdi4JsG/9lkrLUI2LTwBI9Wg1pUwJ/InpPUg4sIZaGJSt2XpSjX3QogGR\nbH/9CBRVm994St2HF4UKXMzPqTFS1BsBJbBUzGHJUW2rVGq9382uNIhGE2REIzPn\noThOgX+zYWEnImqyzi5SqmFxWwKBgQDCsAzdVRLnl+dl0QCZax1ds1Apwk6wAEdH\notfNrru99MISeCeRoqjPPhmINv7O0IcWmy/lcwlo0mUipzF/Y9wfUPeURSL1h/V3\n9NPbAgvefAmPWHdvPbVcBiVJY1Obl3HRTrTKjrY369VOA5UV0dKfXaCopCNLdnsb\nHjokIDYMoQKBgDJwgMeBpvK0ccrp5cbalkPXNZEAJvfoWrvwc5ZxdG2Oh+Yn9ccL\nCmVfShu/FGcz9T8r59PVXcqgJ3wTSTkGViKGeTDK+ep4Vlc0hGNs/pBrtXI0rrW5\nb8dbxm6ttmHPHcBDfYrGOsKuarGHzCIydNPUXiuodWYfrUdSs30MqzTfAoGBAI7b\n1HTNKnQauUezF7d8LC5Hl/kshcUMT0G3spdRMp5u7cHTvWVWcHyyWtXjVRK5XYcv\nFPRPd4YdbO0CtoV951ZreWCpYr+8plkBpDu+wqrdZb5z8iAErgH62H2DjyRK+s/V\n6z//fKKIQRtf8ZPzRZR/hZZ56xRCuo7pnUxI/qBBAoGBAIzUUxX7cn/tjmPtYo1Q\nQMdU0j+D/mR+DKjUCEfLdmrSPIJQMbzLz8r27ssnHzVeD5yq8bLHBjK4no1a+z86\npzLuopuprkxTRRnE/IfZfd0XM22EsqZzDyfh1i0FssAOV5hByOzy7Q4qPxCTyUI8\nXcG4B1+LKq06qX0Zarmi0/Sr\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-prf42@react-assignment-cv.iam.gserviceaccount.com",
  client_id: "113715168894191185787",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-prf42%40react-assignment-cv.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: "https://smit-b9.firebaseio.com"
});

const bucket = admin.storage().bucket("react-assignment-cv.appspot.com");

//==============================================


let router = express.Router();

// GET: vector Search
router.get("/search", async (req, res, next) => {

  try {
    const response = await openaiClient.embeddings.create({
      model: "text-embedding-ada-002",
      input: req.query.q,
    });

    const vector = response?.data[0]?.embedding;
    // console.log("vector: ", vector);
    // [ 0.0023063174, -0.009358601, 0.01578391, ... , 0.01678391, ]

    // Query for similar documents.
    const documents = await col
      .aggregate([
        {
          $search: {
            index: "vectorIndex",
            knnBeta: {
              vector: vector,
              path: "embedding",
              k: 10, // number of documents
            },
            scoreDetails: true,
          },
        },
        {
          $project: {
            embedding: 0,
            score: { $meta: "searchScore" },
            scoreDetails: { $meta: "searchScoreDetails" },
          },
        },
      ])
      .toArray();

      documents.map((eachMatch) => {
        // console.log(`score ${eachMatch?.score?.toFixed(3)} => ${JSON.stringify(eachMatch)}\n\n`);
      });
      // console.log(`${documents.length} records found `);
          
    res.send(documents);

  } catch (e) {
    console.log("error getting data mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
});


// POST: Create a new post user:
router.post("/post", //file upload
  (req, res, next) => {
    req.decoded = { ...req.body.decoded };
    next();
  },
  upload.any(),

  async (req, res, next) => {
    console.log("req.body: ", req.body);

    if (!req.body.text) {
      //!req.body.title ||
      res.status(403);
      res.send(`required parameters missing, 
        example request body:
        {
            title: "abc post title",
            text: "some post text"
        } `);
      return;
    }

    // TODO: save file in storage bucket and get public url
    //file upload work

    // console.log("req.files: ", req.files);

    if (req.files[0].size > 2000000) { // size bytes, limit of 2MB
      res.status(403).send({ message: "File size limit exceed, max limit 2MB" });
      return;
    }

    bucket.upload(
      req.files[0].path,
      {
        destination: `profile/${req.files[0].filename}`, // give destination name if you want to give a certain name to file in bucket, include date to make name unique otherwise it will replace previous file with the same name
      },
      function (err, file, apiResponse) {
        
        if (!err) {
          // console.log("api resp: ", apiResponse);

          // https://googleapis.dev/nodejs/storage/latest/Bucket.html#getSignedUrl

          file.getSignedUrl({
              action: "read",
              expires: "03-09-2491",
            }).then(async (urlData, err) => {
              if (!err) {
                console.log("public downloadable url: ", urlData[0]); // this is public downloadable url

                try {
                  const insertResponse = await col.insertOne({
                    // _id: "7864972364724b4h2b4jhgh42",
                    // title: req.body.title,
                    text: req.body.text,
                    img: urlData[0],
                    authorEmail: req.decoded.email,
                    authorId: new ObjectId(req.decoded._id),
                    createdOn: new Date(),
                  });

                  // console.log("insertResponse : ", insertResponse);

                  res.send({ message: "post created" });
                } catch (err) {
                  console.log(" error inserting mongodb : ", err);
                  res.status(500).send("server error, please try later..");
                }

                // // delete file from folder before sending response back to client (optional but recommended)
                // // optional because it is gonna delete automatically sooner or later
                // // recommended because you may run out of space if you dont do so, and if your files are sensitive it is simply not safe in server folder

                try {
                  fs.unlinkSync(req.files[0].path);
                  //file removed
                } catch (err) {
                  console.error(err);
                }
              }
            });
        } else {
          console.log("err: ", err);
          res.status(500).send({
            message: "server error",
          });
        }
      }
    );
  }
);

// GET: All post users get
router.get("/feed", async (req, res, next) => {

  const cursor = col.aggregate([
    {
      $lookup: {
        from: "users", // users collection name
        localField: "authorId",
        foreignField: "_id",
        as: "authorObject",
      },
    },
    {
      $unwind: {
        path: "$authorObject",
        preserveNullAndEmptyArrays: true, // Include documents with null authorId
      },
    },
    {
      $project: {
        _id: 1,
        text: 1,
        title: 1,
        img: 1,
        createdOn: 1,
        likes: { $ifNull: ["$likes", []] },
        authorObject: {
          firstName: "$authorObject.firstName",
          lastName: "$authorObject.lastName",
          email: "$authorObject.email",
          _id: "$authorObject._id",
        },
      },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $skip: 0,
    },
    {
      $limit: 100,
    },
  ]);

  try {
    let results = await cursor.toArray();
    // console.log("results: ", results);
    res.send(results);
  } catch (err) {
    console.log(" error getting data mongodb : ", err);
    res.status(500).send("server error, please try later..");
  }
});

// GET: All post users get old
router.get("/posts", async (req, res, next) => {

  const userId = req.query._id || req.body.decoded._id;

  if (!ObjectId.isValid(userId)) {
    res.status(403).send(`Invalid user id`);
    return;
  }

  const cursor = col
    .find({ authorId: new ObjectId(userId) })
    .sort({ _id: -1 })
    .limit(100);

  try {
    let results = await cursor.toArray();
    // console.log("results: ", results);
    res.send(results);
  } catch (err) {
    console.log(" error getting data mongodb : ", err);
    res.status(500).send("server error, please try later..");
  }
});

// GET: get post with user id
router.get("/post/:postId", async (req, res, next) => {

  if (!ObjectId.isValid(req.params.postId)) {
    res.status(403).send(`Invalid post id`);
    return;
  }

  try {
    let result = await col.findOne({ _id: new ObjectId(req.params.postId) });
    // console.log("result: ", result); // [{...}] []
    res.send(result);
  } catch (e) {
    console.log("error getting data mongodb: ", e);
    res.status(500).send("server error, please try later");
  }

});

// profile middleware
const getProfileMiddleware = async (req, res, next) => {

  const userId = req.params.userId || req.body.decoded._id;

  if (!ObjectId.isValid(userId)) {
    res.status(403).send(`Invalid user id`);
    return;
  }

  try {
    let result = await userCollection.findOne({ _id: new ObjectId(userId) });
    // console.log("result: ", result); // [{...}] []
    res.send({
      message: "profile fetched",
      data: {
        isAdmin: result?.isAdmin,
        firstName: result?.firstName,
        lastName: result?.lastName,
        email: result?.email,
        _id: result?._id,
      },
    });
  } catch (e) {
    console.log("error getting data mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
};

// GET: all profile and profile id
router.get("/profile", getProfileMiddleware);
router.get("/profile/:userId", getProfileMiddleware);

// PUT: edit user post with id
router.put("/post/:postId", async (req, res, next) => {

  if (!ObjectId.isValid(req.params.postId)) {
    res.status(403).send(`Invalid post id`);
    return;
  }

  if (!req.body.text) {
    // || !req.body.title
    res.status(403)
      .send(`required parameter missing, atleast one key is required.
            example put body: 
            PUT     /api/v1/post/:postId
            {
                title: "updated title",
                text: "updated text"
            }
        `);
  }

  let dataToBeUpdated = {};

  // if(req.body.title){dataToBeUpdated.title = req.body.title};
  if (req.body.text) {
    dataToBeUpdated.text = req.body.text;
  }

  try {
    const updateResponse = await col.updateOne(
      {
        _id: new ObjectId(req.params.postId),
      },
      {
        $set: dataToBeUpdated,
      }
    );

    // console.log("updateResponse : ", updateResponse);

    res.send("post updated");
  } catch (err) {
    console.log(" error inserting mongodb : ", err);
    res.status(500).send("server error, please try later..");
  }
});

// DELETE: user post with id 
router.delete("/post/:postId", async (req, res, next) => {
  
  if (!ObjectId.isValid(req.params.postId)) {
    res.status(403).send(`Invalid post id`);
    return;
  }

  try {
    const deleteResponse = await col.deleteOne({
      _id: new ObjectId(req.params.postId),
    });
    // console.log("deleteResponse : ", deleteResponse);

    res.send({ message: "post delete" });

  } catch (err) {
    console.log(" error deleting mongodb : ", err);
    res.status(500).send("server error, please try later..");
  }
});

// POST: user post like
router.post("/post/:postId/dolike", async (req, res, next) => {
  if (!ObjectId.isValid(req.params.postId)) {
    res.status(403).send(`Invalid post id`);
    return;
  }

  try {
    const doLikeResponse = await col.updateOne(
      { _id: new ObjectId(req.params.postId) },
      {
        $addToSet: {
          likes: new ObjectId(req.body.decoded._id),
        },
      }
    );
    // console.log("doLikeResponse: ", doLikeResponse);
    res.send({ message:"like done" });
  } catch (e) {
    console.log("error like post mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
});

export default router;
