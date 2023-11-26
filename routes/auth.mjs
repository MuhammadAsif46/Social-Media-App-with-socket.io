import express from "express";                          //import express in express
import jwt  from 'jsonwebtoken';                        //import jwt in jwt
import { client } from "./../mongodb.mjs";              //import client in mongoDb.mjs file
import { stringToHash, verifyHash } from "bcrypt-inzi"; //import stringToHash and verifyHash in bcrypt-inzi
import otpGenerator from 'otp-generator';               //import otpGenerator in otp-generator
import moment from "moment";                            //import moment in moment


let router = express.Router();  //initialize express router

const userCollection = client.db("dbcrud").collection("users");   //create DB and userCollection
const otpCollection = client.db("dbcrud").collection("otpCodes"); //create DB and otpCollection

router.post("/login", async (req, res, next) => {   // create login API

  if (!req.body?.email || !req.body?.password) {    // condition check
    res.status(403);
    res.send(`required parameters missing, 
            example request body:
            {
                email: "some@email.com",
                password: "some password"
            } `);
            return;
  }

  req.body.email = req.body.email.toLowerCase();    //convert email to lower case

  try {
    let result = await userCollection.findOne({ email: req.body.email });   //find Email in userCollection
   // console.log("result: ", result); 

    if (!result) { //user not found

      res.status(401).send({
        message: "Email or password incorrect",
      });
      return;
    
    } else { // user found

        const isMatch = await verifyHash(req.body.password, result.password)

      if (isMatch) {  //Match found
        // TODO: create token for this user

        const token = jwt.sign({ // payload
            isAdmin: result.isAdmin,
            firstName: result.firstName,
            lastName: result.lastName,
            email: req.body.email,
            _id: result._id
        }, process.env.SECRET, {
            expiresIn: "24h"
        });

        res.cookie("token", token, {  //response cookie
            httpOnly: true,
            secure: true,
            expires: new Date(Date.now() + 86400000)
        })

        res.send({   // send message and data to user
          message: "login succesful",
          data: {
            isAdmin: result.isAdmin,
            firstName: result.firstName,
            lastName: result.lastName,
            email: req.body.email,
            _id: result._id 
          }
        });
        return;

      } else {  //Match not found
        res.status(401).send({
          message: "Email or password incorrect",
        });
        return;
      }
    }
  } catch (e) {
    console.log("error getting data mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
  
});
 
router.post("/logout", (req, res, next) => {        // create logout API

  res.clearCookie("token"); // clear cookie
  res.send({ message: "logout successful"});  // send message user

});

router.post("/signup", async (req, res, next) => {  // create signup API

  if (
    !req.body?.firstName ||
    !req.body?.lastName ||   //family name, sur name
    !req.body?.email ||
    !req.body?.password
  ) {
    res.status(403);
    res.send(`required parameters missing, 
            example request body:
            {
                firstName: "some firstName",
                lastName: "some lastName",
                email: "some@email.com",
                password: "some password"
            } `);
            return;
  }

  req.body.email = req.body.email.toLowerCase();
  // TODO: validate email

  try {
    let result = await userCollection.findOne({ email: req.body.email });
    console.log("result: ", result); // [{...}] []

    if (!result) { //user not found

        const passwordHash = await stringToHash(req.body.password);

      const insertResponse = await userCollection.insertOne({
        isAdmin: false,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: passwordHash, // TODO: convert password into hash
        createdOn: new Date()
      });

      console.log("insertResponse : ", insertResponse);

      res.send({ message: "Signup Succssful" });

    } else { // user already exists
        res.status(403).send({ 
            message: "User already exist with this email" 
        });
    }
  } catch (e) {
    console.log("error getting data mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
});


router.post('/forget-password', async (req, res, next) => {     //create forgetPassword API

  if (!req.body?.email) {
      res.status(403);
      res.send(`required parameters missing, 
      example request body:
      {
          email: "some@email.com"
      } `);
      return;
  }

  req.body.email = req.body.email.toLowerCase();

  try {
      const user = await userCollection.findOne({ email: req.body.email });
      // console.log("user: ", user);

      if (!user) { // user not found
          res.status(403).send({
              message: "user not found"
          });
          return;
      }

      const otpCode = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false
      });

      console.log("otpCode: ", otpCode);

      const otpCodeHash = await stringToHash(otpCode);

      const insertResponse = await otpCollection.insertOne({
          email: req.body.email,
          otpCodeHash: otpCodeHash,
          createdOn: new Date()
      });
      console.log("insertResponse: ", insertResponse);

      res.send({ message: 'Forget password otp send' });

  } catch (e) {
      console.log("error getting data mongodb: ", e);
      res.status(500).send('server error, please try later');
  }
})

router.post('/forget-password-complete', async (req, res, next) => {   //create forgetPasswordComplete API

  if (!req.body?.email
      || !req.body.otpCode
      || !req.body.newPassword) {

      res.status(403);
      res.send(`required parameters missing, 
      example request body:
      {
          email: "some@email.com",
          otpCode: "344532",
      } `);
      return;
  }

  req.body.email = req.body.email.toLowerCase();

  try {
      const otpRecord = await otpCollection.findOne(
          { email: req.body.email },
          { sort: { _id: -1 } }
      )
      console.log("otpRecord: ", otpRecord);

      if (!otpRecord) { // user not found
          res.status(403).send({
              message: "invalid otp"
          });
          return;
      }

      const isOtpValid = await verifyHash(req.body.otpCode, otpRecord.otpCodeHash);

      if (!isOtpValid) {
          res.status(403).send({
              message: "invalid otp"
          });
          return;
      }

      if (moment().diff(moment(otpRecord.createdOn), 'minutes') >= 15) {
          res.status(403).send({
              message: "invalid otp"
          });
          return;
      }

      const passwordHash = await stringToHash(req.body.newPassword);

      const updateResp = await userCollection.updateOne(
          { email: otpRecord.email },
          {
              $set: { password: passwordHash }
          });
      console.log("updateResp: ", updateResp);


      res.send({ message: 'Forget password completed, proceed to login with new password' });

  } catch (e) {
      console.log("error getting data mongodb: ", e);
      res.status(500).send('server error, please try later');
  }
})

export default router;      // export router
