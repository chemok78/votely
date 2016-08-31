
##Routes
##1)Protect REST endpoints with passport middleware funciton 'auth' > A user is logged in
##2) protect URL's from Angular Routeprovider (use resolves so that controller loads only when the loggedin check is done)
##3) Hide links (new poll form + mypolls) in html when user is not logged in with loggedin == true
##4) Hide add option and delete poll buttons when poll doesnt belong to user with userID === poll.userID


Passport JS Auth middleware function: 

    Not loggedin: sends a 401 response
    Loggedin: calls next() middleware function

##RESTFUL API Routes:

GET /polls (get all polls)

    Database: sends 500 when error, res.status(200).json(docs); when success

GET /mypollslist/:id (get my polls) (SECURE)

    Not loggedin: sends a 401 response
    Database: sends 500 when error, res.status(200).json(docs); when success

Endpoints to protect:

POST /polls (submit a new poll) (SECURE)

    Not loggedin: sends a 401 response
    res.send('Check your form again', 400) in case of validation errors
    Database: sends 500 when error, res.status(201).json(docs); when success 

GET /polls/:id (get a poll)

    Database: sends 500 when error, res.status(200).json(docs); when success 

PUT /polls/:id (edit a poll) (SECURE)

    Not loggedin: sends a 401 response
    Database: sends 500 when error, res.status(204).end(); when success 
    
PUT /vote/:id (vote for a poll) 

    Not loggedin: sends a 401 response
    Database: sends 500 when error, res.status(204).end(); when success 

DELETE /polls/:id (delete a poll)

    Not loggedin: sends a 401 response
    Database: sends 500 when error, res.status(204).end(); when success 

##Angular Routes by RouteProvider

All routes:

    MainController via index.html <html lang="en" ng-app="pollsApp" ng-controller="mainController">
    Calls Login service Login.isLoggedin()
    All templates have access to:

    $scope.displayName = response.data.displayName
    $scope.userID = response.data.id;
    $scope.loggedIn = true;
    $scope.userlink = "#mypolls/" + response.data.id;

'/' root Route

    Template: list.html
    Controller: ListController
    Resolves polls: Polls.getPolls() from Polls service
        $scope.polls = polls.data;

'/newpoll' > form to create a new poll

    Template: form.html
    Form is hidden in navbar if user is not logged in
    Controller: NewPollController
    binds a $scope.savePoll method > calls createPoll service > return $http.post("/polls", poll)
    Uses $scope.userID and $scope.displayName from MainController
    ng-model form local scope 'poll':
        poll.title
        poll.options
    Call ng-click="savePoll(poll)" with poll as parameter

'/polls/:polId' > shows a poll + vote + add option + delete

    Template: poll.html
    Controller: EditPollController
    Add option and delete buttons are hidden when poll doesnt belong to user
    calls Polls.getPoll service >  $http.get(/polls/pollId) > attaches $scope.poll to scope
    binds a $scope.savePoll method > calls editPoll service > return $http.put(url,poll)
    binds a $scope.votePoll method > calls votePoll service > return $http.put(url,poll)
    binds a $scope.deleteThisPoll method > calls deletePoll method > return $http.delete(url)
    ng-model form local scope 'poll':
        poll.vote
    Call ng-click="savePoll(poll)" with poll as parameter

'/mypolls/:id' > shows all polls beloging to userID

    Template: mylist.html
    Controller: MyListController
    Mypolls link is hidden when user is not logged in
    calls Polls.getMyPolls service > return $http.get( "mypollslist/" + id;);
    binds $scope.polls to scope