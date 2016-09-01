Welcome to Votely: a Voting App build with the MEAN stack + Chart JS 

Live app at https://myvotely.herokuapp.com/

## User Stories:

1) As an authenticated user, I can keep my polls and come back later to access them

2) As an authenticated user, I can share my polls with friends

3) As an authenticated user, I can see the aggregate results of my polls

4) As an authenticated user, I can delete polls that I decide I don't want anymore

5) As an authenticated user, I can create a poll with any number of possible items

6) As an unauthenticated or authenticated user I can see and vote on everyone's polls

7) As an unauthenticated or authenticated user, I can see the results of polls in chart form (using ChartJS)

8) A an authenticated user, if I don't like the options on a poll, I can create a new option

##A few key functions highlighted

a) Poll form: client side form validation using AngularJS: instant user feedback and in controller before calling createPoll service (that interacts with REST API)

b) Poll form: server side input validation using Express Validator (before saving to MongoDB)

c) Chart implementation using ChartJS

d) User Authentication with Passport JS

e) RESTful API endpoints protected server side and URL's protected Angular JS front end side

