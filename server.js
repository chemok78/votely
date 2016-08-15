var express = require('express');
//load express module
var path = require('path');
//load path module to make path manipulation easier
require('dotenv').config({
  silent: true
});
//load dotenv module to work with .env file
var bodyParser = require('body-parser');
//load body parser to parse incoming request bodies, available under req.body
var mongodb = require('mongodb');
//load native mongoDB driver
var ObjectID = mongodb.ObjectID
//load objectID method so we can do var objectId = new ObjectID

var POLLS_COLLECTION = "polls";
//set the variable POLLS_COLLECTION to the string cd"polls"

var app = express();
//intialize express and save the instance as variable app
app.use(express.static(__dirname + "/public"));
//use static middleware for public folders in the app instance
app.use(bodyParser.json());
//parse the request body as json in the app instance

var db;
//create a database variable outside of the database connection callback to reuse the connection

mongodb.MongoClient.connect(process.env.DB_URL, function(err, database) {
  //Connect to the database before starting the app server

  if (err) {
    //handle db connection error    
    console.log(err);
    process.exit(1);
    //exit using global process with failure code 1 (0 is success code)

  }

  //Save database object as global variable
  db = database;
  console.log("Successfully connected to database");

  //Initialize app
  var server = app.listen(process.env.PORT || 8080, function() {

    var port = server.address().port;
    console.log("App is now running on port", port);

  });


  /*RESTful API server for interacting with MongoDB database*/

  //Generic error handler to be used in all API endpoints

  function handleError(res, reason, message, code) {

    console.log("ERROR: " + reason);
    //log the reason for the error
    res.status(code || 500).json({
      "error": message
    });
    //send a 500 internal server error, statuscode to the client and json object with the error message
    //res.status: sets the HTTP status for the response
  }





  /* "/polls"
   *  GET: find all polls
   *  POST: creates a new poll
   */

  app.get("/polls", function(req, res) {

    db.collection(POLLS_COLLECTION).find({}).toArray(function(err, docs) {
      //get the polls collection
      //use find with empty object to load all documents 
      //find returns and cursor and convert it to Array. It iterates completely the cursor

      if (err) {

        handleError(res, err.message, "Failed to get polls.");

      } else {

        res.status(200).json(docs);
        //Status code 200 OK and send results as JSON object to client

      }



    });


  }); //app.get("/polls")

  app.post("/polls", function(req, res) {
    //create a new poll

    var newPoll = req.body;
    //get the request body and save as newPoll
    newPoll.createDate = new Date();
    //save the date created as property createDate

    if (!req.body.title || !req.body.options) {
      //if the title field and the options array are empty, do:    

      handleError(res, "Invalid user input", "Fill in title and options.", 400);
      //send a 400 bad requets HTTP status code


    }

    db.collection(POLLS_COLLECTION).insertOne(newPoll, function(err, doc) {
      //insert newPoll and call a function with error and the result
      //result contains the document from MongoDB
      //ops contains the document(s) inserted with added _id fields
      //native MongoDB Node JS driver - https://github.com/mongodb/node-mongodb-native

      if (err) {

        handleError(res, err.message, "Failed to create new poll.");


      } else {

        res.status(201).json(doc.ops[0]);
        //201 Created statuscode and send the inserted document in JSON format.
      }

    }); //app.post("/contacts")





  });

  /* "/polls/:id"
   *   GET: find poll by id
   *   PUT: update poll by id
   *   DELETE: deletes contact by id
   */

  app.get("/polls/:id", function(req, res) {

    db.collection(POLLS_COLLECTION).findOne({
      _id: new ObjectID(req.params.id)
    }, function(err, doc) {
      //load the POLLS collection
      //convert id paramater to mongo ObjectID (12 byte BSON object) and search the database for ID


      if (err) {

        handleError(res, err.message, "Failed to get contact");

      } else {

        res.status(200).json(doc);

      }


    });

  });

  app.put("/polls/:id", function(req, res) {

    var updatePoll = req.body;
    //set a local variable updatePoll to the request.body
    delete updatePoll._id;
    //delete the id from the updatePoll, because we don't want to change the id of the existing document in the db

    db.collection(POLLS_COLLECTION).updateOne({
      _id: new ObjectID(req.params.id)
    }, updatePoll, function(err, doc) {
      //convert id from parameter to mongo ObjectID and find the document
      //change the document with updatePoll

      if (err) {

        handleError(res, err.message, "Failed to update poll");

      } else {

        res.status(204).end();
        //if update successfull send a 204 status code: successfully fullfilled request and there is no additional content to send
        //end pipe

      }

    });


  }); //app.put("polls/:id")

  app.delete("/polls/:id", function(req, res) {

    db.collection(POLLS_COLLECTION).deleteOne({
      _id: new ObjectID(req.params.id)
    }, function(err, doc) {

      if (err) {

        handleError(res, err.message, "Failed to dalete contact");

      } else {

        res.status(204).end();
      }


    });


  });


}); //app.delete("/polls/:id")