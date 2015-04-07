# Gathering Our Voices #

[![Build Status](https://travis-ci.org/BCAAFC/Gathering-Our-Voices.png?branch=master)](https://travis-ci.org/BCAAFC/Gathering-Our-Voices )

Welcome, this is the whole source for the GOV 2014 Website. First of all, we'd like to thank Github for providing this source repository, Heroku for hosting our application, and Travis-CI for unit testing.

## Why this site? ##
The [BCAAFC](http://www.bcaafc.com/) needed a clean, simple, user friendly event management software for the Gathering Our Voices Youth Conference.

It was decided at the start of the project, back in September 2012 to develop the project in the open, encouraging people to utilize our techniques for dealing with troubles, as well as letting them inspect how it works.

## What does it use? ##
Gathering Our Voices is mostly composed in Javascript, a simple.

The server runs on [Node.js](http://nodejs.org/) and serves up [Jade](https://github.com/visionmedia/jade) templates. It uses:
* [Mongoose](http://mongoosejs.com/) to utilize MongoDB as a datastore.
* Unit testing is done via [CasperJS](http://casperjs.org/) via [Travis-CI](https://travis-ci.org/)
* Deployment to [Heroku](https://www.heroku.com/)

## How to Use ##
To create a clone of this site, you'll probably want to have the following installed:

* [Node.js](http://nodejs.org/)
* Git [Linux](http://git-scm.com/download/linux), [Mac](http://mac.github.com/), [Windows](http://windows.github.com/)
* [MongoDB](http://www.mongodb.org/)

Now you can just clone this repo (Or fork it if you want to modify it!)

Finally, in the repo directory:
```shell
npm install
npm test    # To verify it works! Failing tests means you probably have not set up/started your DB
npm start
```

Now you can visit `http://localhost:8080`. Enjoy!

## How to Deploy ##
GOV is set up to use [Heroku](http://www.heroku.com/) for hosting.
```
heroku create MY_APP
heroku addons:add mongolab:sandbox
heroku addons:add rediscloud:20
git push heroku master
heroku ps:scale web=1
```
Then, visit `MY_APP.herokuapp.com`.



## Contributors ##
Our heroic Youth Conference Coordinator, Della Preston, has helped immensely with development efforts, her time, insights, and constant critical eye have helped drive the quality of the product from beginning to start. Though she has not contributed code her specifications and knowledge of the event have touched virtually every part of the codebase.

The lead developer, Andrew Hobden ([@Hoverbear](https://github.com/Hoverbear/)), is a dedicated believer in the Free/Open-Source software movement. If you're interested in technology, cyber law, or 'hacking' sub-culture, you're encouraged to read  [Coding Freedom](http://codingfreedom.com/) by Gabriella Coleman, [The Future of Ideas](http://the-future-of-ideas.com/) by Lawrence Lessig, as well as [The Cathedral and Bazaar](http://www.catb.org/esr/writings/homesteading/) by Eric S. Raymond. You're encouraged to share your insights and opinions into these books on our issues page, if you so desire.

The 2015 Youth Conference Coordinators Della Preston, Kathryn Lacerte, Rosy Hartman, Gregory Forsberg, and Tara Skobel.

The 2014 Youth Conference Coordinators, Gregory Forsberg and Nik Richardson, who helped further the site.

The 2013 Youth Conference Coordinators, Siku Allooloo and Vanessa Sloan-Morgan, who put up with all the mistakes, bugs, and ill-planned ideas but still managed to totally rock and constantly improve the application.
