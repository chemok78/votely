 /*global angular*/

angular.module("pollsApp", ['ngRoute'])
//create Angular app and inject ngRoute dependency
    .config(function($routeProvider){
       $routeProvider
        .when("/", {
        //configure root route with routeProvider    
            templateUrl: "list.html",
            controller: "ListController",
            resolve: {
             
             polls: function(Polls){
             //inject Polls service and use .getPolls() to get all the polls
             //returns a polls property that can be injected in controller 
             //must be resolved before this route is loaded and injected in controller
                 return Polls.getPolls();
                 
                }   
                
            }
            
        })
        .when("/newpoll", {
        //route for creating a new poll
        //shows the form for creating a new poll
            templateUrl: "form.html",
            controller: "NewPollController"
        })
        .when("/polls/:pollId", {
        //find and show a poll by pollId
        //edit a poll: add new options 
        //delete a poll
            
            templateUrl: "poll.html",
            controller: "EditPollController"
            
        })
        .when("/mypolls", {
        //route for showing polls of logged in user
        templateUrl: "mylist.html",
        controller: "MyListController"
            
        })
        .otherwise({
           
           redirectTo: "/" 
            
        });
        
    })
    .service("Polls", function($http){
    //Service that interacts with database via REST API
    //returns a promise with methods that can be injected into a route
    //injects $http for communicating with remote (database) server
        this.getPolls = function(){
        //service for getting all the polls. GET /polls    
            return $http.get("/polls")
                .then(function(response){
                    
                    return response;
                    
                }, function(response){
                    
                   alert("Error retrieving polls."); 
                    
                });
            
            
        };
        
        this.getMyPolls = function(){
        //service for getting all polls of logged in user. GET /polls    
          return $http.get("/polls")
            .then(function(response){
                
                return response;
                
            }, function(response){
                
                alert("Error retrieving polls.");
                
            })
          
            
            
        };
        
        this.createPoll = function(poll){
        //service for creating a new poll. POST /polls
        //inserts a poll as a parameter
            return $http.post("/polls", poll)
            //$http.post(url, data, [config]);
                .then(function(response){
                    
                    return response;
                    
                }, function(response){
                   
                   alert("Error creating poll");
                    
                });
            
        };
        
        this.getPoll = function(pollId){
        //service for getting a poll by pollId. GET /polls/:pollId  
            
            var url = "/polls/" + pollId;
            
            return $http.get(url)
            //$http.get(url,[config)
                .then(function(response){
                    
                    return response;
                    
                }, function(response){
                    
                    alert("Error finding this poll");
                    
                });
            
        };
        
        this.editPoll = function(poll) {
         //service for editing a poll. PUT /polls/:pollId
         var url = "/polls/" + poll._id;
         
         return $http.put(url,poll)
         //$http.put(url, data, [config])
            .then(function(response){
                
                alert("Thanks for the vote!");
                
                return response;
                
                
            }, function(response){
                
                alert("Error editing poll");
                
                console.log(response);
                
            });
          
        };
        
        this.deletePoll = function(pollId){
        //service for deleting a poll. DELETE /polls/:pollId
            var url = "/polls/" + pollId;
            return $http.delete(url)
                .then(function(response){
                    
                    return response;
                    
                }, function(response){
                    
                    alert("Error deleting poll");
                    console.log(response);
                    
                })
            
            
        };
         
        
    })
    .controller('ListController', function(polls, $scope){
    //controller to show all polls   
    //inject the resolved promise 'polls' from route
    //inject scope and attach the polls data to the scope
       $scope.polls = polls.data; 
       
    })
    .controller('NewPollController', function($scope,$location,Polls){
    //controller to inset new poll in database using Polls service
    //and route the user to the specific poll
    //inject scope and Polls service
    //inject $location service to parse URL in browser bar
    
        $scope.back = function(){
        //attach back() method to scope that routes back to root 
        
            $location.path("/");
            
        };
        
        $scope.savePoll = function(poll){
        //attach savePoll method to scope that actually calls POST on /polls, using POLLS service
            
            Polls.createPoll(poll).then(function(doc){
            //call createPoll method from Polls service and return a doc with results
            
                var pollUrl = "/polls/" + doc.data._id;
                
                $location.path(pollUrl);
                //$location.path() redirects to specified url + path
                
            }, function(response){
            //second function handles the error       
                
                alert(response);
                
            });
            
            
            
        };
        
       
        
    })
    
    .controller("EditPollController", function($scope,$routeParams,$location,Polls){
    //edit (add new option) and delete a poll        
        Polls.getPoll($routeParams.pollId)
        //routeparams.pollId matches whenever :pollId is in the route. Which is .when("/polls/:pollId"..
        //get the poll first using the contactId parameter
            .then(function(doc){
                
               $scope.poll = doc.data; 
               //attach the data to the $scope as poll property
               
               $scope.poll.vote = $scope.poll.options[0].option;
                //poll.vote in scope holds the selected option
                //set poll.vote to first option in options array to prevent array showing empty first option
                
            }, function (response){
                
                alert(response);
                
            });
        
            
        $scope.savePoll = function(poll){
            
          Polls.editPoll(poll);
            
        };
        
        $scope.votePoll = function(poll){
        //bind a votePoll method to $scope that takes the key = poll.vote from the view and increases count by 1
          
          var key = poll.vote;
          //bind poll.vote key from view to local variable key
          
          for(var i=0; i < poll.options.length; i++){
          //loop through poll.options and find the option that matches poll.vote
          //if so, update the votes by 1
              if(poll.options[i].option === key ){
                  
                  poll.options[i].votes = poll.options[i].votes + 1;
                  
              }
              
          }
          
          delete poll.vote;
          //delete poll.vote before saving to database
          
          Polls.editPoll(poll);
          //replace poll by scope.poll
          
          $scope.poll.vote = $scope.poll.options[0].option;
          //set poll.vote to first option in options array again for re-rendering poll.html    
        };
        
        $scope.deletePoll = function(pollId){
            
          Polls.deletePoll(pollId);  
            
        };
    
            
    });
    