var express = require('express');
//load express module
var path = require('path');
//load path module to make path manipulation easier
require('dotenv').config({silent: true});
//load dotenv module to work with .env file
var bodyParser = require('body-parser');
//load body parser to parse incoming request bodies, available under req.body
var mongodb = require('mongodb');
//load native mongoDB driver
var ObjectID = mongodb.ObjectID
//load objectID method so we can do var objectId = new ObjectID

var POLLS_COLLECTION = "polls";
//set the variable POLLS_COLLECTION to the string "polls"

var app = express();
//intialize express and save the instance as variable app
app.use(express.static(__dirname + "/public"));
//use static middleware for public folders in the app instance
app.use(bodyParser.json());
//parse the request body as json in the app instance

var db;
//create a database variable outside of the database connection callback to reuse the connection

mongodb.MongoClient.connect(process.env.DB_URL, function(err,database){
//Connect to the database before starting the app server
    
    if(err){
    //handle db connection error    
        console.log(err);
        process.exit(1);
        //exit using global process with failure code 1 (0 is success code)
        
    }
    
    //Save database object as global variable
    db = database;
    console.log("Successfully connected to database");
    
    //Initialize app
    var server = app.listen(process.env.PORT || 8080, function(){
        
        var port = server.address().port;
        console.log("App is now running on port", port);
        
    });


/**RESTful API server for interacting with MongoDB database**/

/* "/polls"
*  GET: find all polls
*  POST: creates a new poll
*/





    

});