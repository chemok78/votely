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
var expressValidator = require('express-validator');
var mongodb = require('mongodb');
//load native mongoDB driver
var ObjectID = mongodb.ObjectID;
//load objectID method so we can do var objectId = new ObjectID
var passport = require('passport');
//load passport js
var FacebookStrategy = require('passport-facebook').Strategy;
//load passport js Facebook strategy

var FACEBOOK_APP_ID = '1736061676654316';
var FACEBOOK_APP_SECRET = '5cbf7c4e121413e47f8a0e27b7684840';
//set the App ID and App Secret for passport js

var session = require('express-session');
//load express sessions 

var POLLS_COLLECTION = "polls";
//set the variable POLLS_COLLECTION to the string cd"polls"

var app = express();
//intialize express and save the instance as variable app
app.use(express.static(__dirname + "/public"));
//use static middleware for public folders in the app instance
app.use(bodyParser.json());
//parse the request body as json in the app instance
app.use(session({ secret: 'keyboard cat' }));
//use express sessions in the app instance
app.use(passport.initialize());
//initialize passport js and use it in the app instance
app.use(passport.session());
//intialize passport js sessions and use it in the app instance
app.use(expressValidator({
//use express Validator in app instance
//with a custom validator checking for length of options array(must be at least 2 options)
  customValidators: {
     
     minArrayLength: function(value) {
       
        return value > 1;
        
     }
     
  }
}));


passport.use(new FacebookStrategy({
//use Facebook strategy with Passport JS  
  
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: 'https://votely-chemok78.c9users.io/auth/facebook/callback'

}, function(accessToken, refreshToken, profile, done){  
//callback function after login  
  
  process.nextTick(function(){
    
    done(null, profile);
    //return the user profile after login
    
  });
  
}));


passport.serializeUser(function(user,done){
//save user object in session
//it determines which data of the user object is stored in the session
//result of serializeUser is attached to the session as req.session.passport.user = {};  
  
  console.log("serialize ok!");
  
  
  done(null, user);
  
  
});

passport.deserializeUser(function(id, done){
//retrieve with the key given as obj parameter
//will be matced with the in memory object
//the fetched object will be attached to req.user;

      /*User.findById(id, function(err, user) {
        done(err, user);*/
  
  console.log("deserialize ok!")

  done(null, id);
  
});


app.get('/auth/facebook', passport.authenticate('facebook'));
//Authenticate with Passport JS when hitting this route

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
//Redirect to this route after login and redirect to success or error route  
    successRedirect: '/success',
    failureRedirect: '/error'
  
}));

app.get('/success', function(req, res, next) {
//redirect success route for Passport JS  
  
  res.send('Successfully logged in. You can close this window');
  
});


app.get('/error', function(req, res, next) {
//redirect error route for Passport JS

  res.send("Error logging in.");
  
});


app.get('/checklogin', function(req,res,next){
//API endpoint for checking if a user is logged in in Angular JS service and controller
  
    if(req.user){
    //Passport js attaches a user object to every request when user is logged in
    //if req.user is true there is a logged in user
      
     return res.status(200).json(req.user);
     //return the req.user as a JSON object
   
      
    } else {
    //if req.user doesnt exist
        
      console.log("there is no user logged in");
  
      
    } 
  
});


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
    
    req.checkBody('title', 'No title').notEmpty();
    req.checkBody('options.length', 'Minimum of 2 options').minArrayLength();
    //server side validation of submitted poll
    
    var errors = req.validationErrors();
    
    console.log(errors);
    
    if(!errors){
    //if no validaiton errors, insert the poll in the database
    
        newPoll.date = Date();
        //create a new Date string and attach to .date property
        
        /*newPoll.options is an array of options as strings*/
        /*convert newPoll.options to an object with key:value as option: 0 (zero for number of votes to start with)*/
        
        var newArray = [ ];
        //create new empty array, to hold objects for each option and votes
        
        newPoll.options.forEach(function(item){
        //loop and add each item of options array as key and set to 0 value
          
          var newObject = { };
          //empty local object
          
          newObject.option = item;
          //set option property to the item
          
          newObject.votes = 0;
          //set votes property to 0 to start with
          
          newArray.push(newObject);
          //push the object to the array
          
        });
        
        newPoll.options = newArray;
        //replace options object with the array
        
   
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
    
        }); 
      
      
      
    } else {
    //else: if there are validation errors  
      
        
        res.send('Check your form again', 400);
      
      
    }
    
    
  }); //app.post("/contacts")

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

        handleError(res, err.message, "Failed to get poll");

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

        handleError(res, err.message, "Failed to delete contact");

      } else {

        res.status(204).end();
      }


    });


  });


}); //app.delete("/polls/:id")

app.get('/logout', function(req, res){
  
  req.logout();
  
  res.redirect('/');
  
});