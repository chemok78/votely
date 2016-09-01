/*global angular*/
 /*global Chart*/
 
var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
//funciton that that checks if a user is loggedin by answering to a promise

    var deferred = $q.defer();
    //initialize a new promise
    
    $http.get('/loggedin').success(function(user){
    //make $http GET call to check if user is logged in    
        
       if(user !== '0'){
    //resolve the promise if user is logged in       
           deferred.resolve();
           
       } else{
    //if user is not logged in, reject the promise and redirect to login path       
           
           
           $rootScope.message = 'You need to log in.';
           alert("You need to login to access this page");
           deferred.reject();
           $location.url('/auth/facebook');
           
       }
        
    });
    
    return deferred.promise;
    
    
};

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
            controller: "NewPollController",
            resolve: {
            //controller instantiates only after the login check is done    
                
                loggedin: checkLoggedin
                
            }
        })
        .when("/polls/:pollId", {
        //find and show a poll by pollId
        //edit a poll: add new options 
        //delete a poll
            
            templateUrl: "poll.html",
            controller: "EditPollController"
            
        })
        .when("/mypolls/:id", {
        //route for showing polls of logged in user
        //user id in URL parameter generated from $scope.userID from loggedIN user service in MainController
        templateUrl: "mylist.html",
        controller: "MyListController",
        resolve: {
        //controller instantiates only after the login check is done     
            
                loggedin: checkLoggedin   
            
        }
        
            
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
        
        this.getMyPolls = function(id){
        //service for getting all polls of logged in user with GET to mypollslist/:id  
        //id parameter is inserted from MyPollsController using $routeParams.id
      
        var url = "mypollslist/" + id;
        
      
          return $http.get(url);
          //returns a promise to be used in MyPollsController  
          /*
          
            .then(function(response){
                
                return response;
                
            }, function(response){
                
                alert("Error retrieving your polls.");
                
                console.log(response);
                
            });
          
            
            */
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
                
                //alert("Error editing poll");
                
                console.log(response);
                
            });
          
        };
        
        this.votePoll = function(poll) {
         //service for editing a poll. PUT /polls/:pollId
         var url = "/vote/" + poll._id;
         
         return $http.put(url,poll)
         //$http.put(url, data, [config])
            .then(function(response){
                
                alert("Thanks for the vote!");
                
                return response;
                
                
            }, function(response){
                
                //alert("Error editing poll");
                
                console.log(response);
                
            });
          
        };
        
        this.deletePoll = function(pollId){
        //service for deleting a poll. DELETE /polls/:pollId
        
            var url = "/polls/" + pollId;
            
            return $http.delete(url);
            
            
        };
         
        
    })
    .controller('ListController', function(polls, $scope){
    //controller to show all polls   
    //inject the resolved promise 'polls' from route
    //inject scope and attach the polls data to the scope
       $scope.polls = polls.data; 
       
    })
    .controller('MyListController', function(Polls, $scope, $routeParams){
    //uses Polls service to retrieve the polls and binds data to the global scope
    
        Polls.getMyPolls($routeParams.id)
        //call getMyPolls service that sends a GET /mypollslist/:id to retrieve dataa from DB
        
          .then(function(response){
                
                $scope.polls = response.data;
                //attach the data to userID polls to the scope of this myList page
                
            }, function(response){
                
                alert("Error retrieving your polls.");
                
                console.log(response);
                
            });
        
        
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
            
            if($scope.pollForm.$valid){
            //front end form validation
            //pollForm name form is injected in $scope. $valid must be true for createPoll service to run
                
            alert("Thanks for submitting your poll!");
            
                poll.userID = $scope.userID;
                //attach the userID from isLoggedIn from mainController to the poll before save database
                
                poll.displayName = $scope.displayName;
                //attach the displayName from isLoggedIn from mainController to the poll before save database
            
                Polls.createPoll(poll).then(function(doc){
                //call createPoll method from Polls service and return a doc with results
                
                    var pollUrl = "/polls/" + doc.data._id;
                    
                    $location.path(pollUrl);
                    //$location.path() redirects to specified url + path
                    
                }, function(response){
                //second function handles the error       
                    
                    alert(response);
                    
                });
            
            } else {
            //if $valid of pollForm not true, show alert to check form    
            
            alert("Check your form for missing fields!");
            
        }   
            
            
        };
        
       
        
    })
    
    .controller("EditPollController", function($scope,$routeParams,$window,$location,Polls){
    //edit (add new option) and delete a poll  
    
        Polls.getPoll($routeParams.pollId)
        //routeparams.pollId matches whenever :pollId is in the route. Which is .when("/polls/:pollId"..
        //get the poll first using the contactId parameter
            .then(function(doc){
                
               $scope.poll = doc.data; 
               //attach the data to the $scope as poll property
               
               //$scope.poll.vote = $scope.poll.options[0].option;
                //poll.vote in scope holds the selected option
                //set poll.vote to first option in options array to prevent array showing empty first option
                
                /*Chart JS Implementation*/
                
                var chartOptions = [ ];
                
                var chartVotes = [ ];
                
                for(var i = 0; i < $scope.poll.options.length ; i++){
                //loop through poll.options and push option and vote to new arrays
                //only push to new array when votes is not equal to 0
                    if($scope.poll.options[i].votes !== 0){
                    
                    chartOptions.push($scope.poll.options[i].option);
                    chartVotes.push($scope.poll.options[i].votes);
                    
                    }
                    
                }
                                
                var ctx = document.getElementById("myChart").getContext('2d');
                //select myChart canvas in poll.html and add to context
                
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: chartOptions,
                        //use chartOptions from loop $scope.poll.options
                        datasets: [{
                            label: '# of Votes',
                            data: chartVotes,
                            //use chartVotes from loop $scope.poll.options
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255,99,132,1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        legend: {
                            
                            position: 'bottom'
                            
                        },
                        title:{
                            
                            display: true
                            
                        }
                        
                    }
                });

                
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
          //check if key exists in $scope.options. If not add the key as an option + votes = 1
          
          var arrayOptions = [ ];
          //empty array to hold only the options values instead if key:value
          
          for(var i = 0; i < poll.options.length; i++){
          //loop through poll.options array of objects and save all the values in array
          
              arrayOptions.push(poll.options[i].option);
              
          }
          
          if(arrayOptions.indexOf(key) === -1 ){
          //loop array to check if value exists. If no, create new object and push to poll.options
              
              poll.options.push({"option": key, "votes": 1 });
              
              
          } else {
         //If value exists, loop through poll.options again and add the vote       
              
              for(var j=0; j < poll.options.length; j++){
                //loop through poll.options and find the option that matches poll.vote
                 //if so, update the votes by 1
                 
                  if(poll.options[j].option === key ){
                      
                      poll.options[j].votes = poll.options[j].votes + 1;
                      
                  }
              
            }
              
          } //if, else
          
          delete poll.vote;
          //delete poll.vote before saving to database
          
          Polls.votePoll(poll);
          //replace poll by scope.poll
          
          //$scope.poll.vote = $scope.poll.options[0].option;
          //set poll.vote to first option in options array again for re-rendering poll.html    
       
          $window.location.reload();
          //reload page to show updated chart with new vote
       
        };
        
        $scope.deleteThisPoll = function(){
            
          Polls.deletePoll($routeParams.pollId)
          //take the pollID in the route parameter and call deletePoll service that returns a promise
          .then(function(response){
          //response.status === 2xx   
          //A response status code between 200 and 299 is considered a success status and will result in the success callback being called. Any response status code outside of that range is considered an error status and will result in the error callback being called.
                    console.log(response);
                    
                    alert("Poll deleted!");
                        
                    var url = "/mypolls/" + $scope.userID;
                    //redirect to myPolls page after delete
                    
                    $location.path(url);
                    
                }, function(response){
                //response.status === 4xx or 5xx    
                    
                    alert("Error deleting poll");
                    
                    console.log(response);
                    
                });
          
        };
    
            
    })
    .service("Login", function($http){
    //service to send a http get to /checklogin API
    //if a user is logged in it will return a req.user object in JSON format
        
        this.isLoggedIn = function(){
        
            return $http.get("/checklogin");
            //returns a promise that can be resolved from mainController
            
        };
        
        
    })
    .controller("mainController", function($scope, $rootScope, Login){
    //mainController intialized in every page load of index.html
    
        Login.isLoggedIn()
        //call Login Service to see if a user is logged in     
            .then(function(response){
            //when data from isLoggedIn service is ready work with the response
            //response is a JSON req.user object
                
                $scope.displayName = response.data.displayName;
                $scope.userID = response.data.id;
                $scope.loggedIn = true;
                $scope.userlink = "#mypolls/" + response.data.id;
                
                return response;
                
            }, function(response){
                
                console.log("no user logged");
                
                return response;
                
            });
         
    })
    .service('authInterceptor', function($q) {
    //service to intercept a 401 response from Express REST API if user is not authenticated for a protected endPoint  
        
        var service = this;
    
        service.responseError = function(response) {
        //make a authIntercepter.responseError() method that takes a server response   
            
            if (response.status == 401){
            //if response error status is 401 redirect to login URL 
                
                window.location = "/auth/facebook";
            }
            //if the response error status is something other than 401 reject the promise with the response
            
            return $q.reject(response);
            
        };
    
    })
    .config(['$httpProvider', function($httpProvider) {
    //add authInterceptor service to httpProvider so its used in    
        
        $httpProvider.interceptors.push('authInterceptor');
        
    }]);
    
    