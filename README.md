# Gathering Our Voices #

Welcome, this is the whole source for the GOV 2016 Website.

## Why this site? ##

The [BCAAFC](http://www.bcaafc.com/) needed a clean, simple, user friendly event management software for the Gathering Our Voices Youth Conference.

It was decided at the start of the project, back in September 2012 to develop the project in the open, encouraging people to utilize our techniques for dealing with troubles, as well as letting them inspect how it works.

## What does it use? ##

This website is written entirely in Javascript, Handlebars (a templating language), and CSS. It uses the Postgres database to store attendee data.

## How to Use ##

* `git clone git@github.com:BCAAFC/Gathering-Our-Voices.git`
* `grunt build`
* `npm start`

## Backing Up and Restoring ##

There is a `backups` folder containing two scripts which should make backing up and
restoring easier.

To backup, creating a `backups/$DATE.tar.gz` file:

```bash
./backups/backup.sh
```

To restore given a `backups/$DATE.tar.gz`:

```bash
./backups/restore.sh backups/$DATE.tar.gz
```

## How to Deploy ##

There are a number of environment variables to (optionally) define:

* `NODE_ENV` - Generally "production" or "development". (Default `development`)
* `SSL` - Set to `true` to redirect to SSL always. Note: you should use `nginx` or something to actually terminate the SSL. (Default `true`)
* `PORT` - The port to host the service. (Default `8080`)
* `SECRET` - The secret for cookies etc. Should be kept secret.
* `ADMINS` - A list of admins for the website. (Default `["andrew@hoverbear.org"]`)
* `MAX_YOUTH` - The maximum youth at the conference. (Default `2000`, not implemented.)
* `POSTGRES_URL` - The URL of the PostgreSQL server. (Default `"postgres://localhost/test"`)
* `REDIS_URL` - The URL of redis. (Default `"localhost"`)
* `UPLOAD_DIR` - The directory of the uploads. (Default `"./uploads/"`)
* `MANDRILL_APIKEY` - Your API key for Mandrill.
* `FIRSTRUN` - Set to `true` if this is the firstrun, will populate initial tables.
* `TWILIO_ACCOUNT_SID` - Your Twilio SID.
* `TWILIO_AUTH_TOKEN` - Your Twilio Auth.

In order to deploy on Funtoo this script is used in `/etc/init.d/gov2016`:

```bash
#!/sbin/runscript

# Do NOT "set -e"

# PATH should only include /usr/* if it runs after the mountnfs.sh script
PATH=/sbin:/usr/sbin:/bin:/usr/bin
DESC="gov2016"
NAME=gov2016
DIR_ROOT=$FIXME
GROUP=$FIXME
USER=$FIXME
DAEMON=/usr/bin/node
DAEMON_ARGS="index.js"
LOGFILE=/var/log/gov2016
PIDFILE=/var/run/$NAME.pid
SCRIPTNAME=/etc/init.d/$NAME
# Exports for node
export NODE_ENV=production
export PORT=$FIXME
export SECRET=$FIXME
export ADMINS=$FIXME
export POSTGRES_URL=$FIXME
export UPLOAD_DIR=$FIXME
export MANDRILL_APIKEY=$FIXME
export TWILIO_ACCOUNT_SID=$FIXME
export TWILIO_AUTH_TOKEN=$FIXME

extra_commands="firstrun"
#
source /lib64/rc/sh/functions.sh

depend() {
  use logger dns
  need net redis postgresql  
}

start() {
  ebegin "Starting ${DESC}"
  start-stop-daemon --start --quiet \
    --user $USER:$GROUP --chdir $DIR_ROOT --background \
    --stdout $LOGFILE --stderr $LOGFILE \
    --make-pidfile --pidfile $PIDFILE --exec $DAEMON -- $DAEMON_ARGS
  eend $?
}

#
# Function that stops the daemon/service
#
stop() {
  ebegin "Stopping ${DESC}"
  start-stop-daemon --stop --quiet --retry=TERM/30/KILL/5 \
    --pidfile $PIDFILE --exec $DAEMON
  eend $?
}

firstrun() {
  ebegin "Doing FIRSTRUN for ${DESC}"
  export FIRSTRUN=true
  start-stop-daemon --start --quiet \
    --user $USER:$GROUP --chdir $DIR_ROOT --background \
    --stdout $LOGFILE --stderr $LOGFILE \
    --make-pidfile --pidfile $PIDFILE --exec $DAEMON -- $DAEMON_ARGS

  eend $? "failed"
}
```

## Contributors ##

The lead developer, Andrew Hobden ([@Hoverbear](https://github.com/Hoverbear/)), is a dedicated believer in the Free/Open-Source software movement. If you're interested in technology, cyber law, or 'hacking' sub-culture, you're encouraged to read  [Coding Freedom](http://gabriellacoleman.org/Coleman-Coding-Freedom.pdf) by Gabriella Coleman or [The Future of Ideas](http://the-future-of-ideas.com/) by Lawrence Lessig. You're encouraged to share your insights and opinions into these books on our issues page, if you so desire.

Special thanks to those who put up with all the mistakes, bugs, and ill-planned ideas but still managed to totally rock and constantly help improve the application:

Our heroic Youth Conference Coordinator, Della Preston, has helped immensely with development efforts, her time, insights, and constant critical eye have helped drive the quality of the product from beginning to start. Though she has not contributed code her specifications and knowledge of the event have touched virtually every part of the codebase.

The 2016 Youth Conference Coordinators Agnes Wisden, Keana Zamardi, Jennifer Ambers, Holly Brinkman, Julie Robertson, and Shawna Johnson.

The 2015 Youth Conference Coordinators Kathryn Lacerte, Rosy Hartman, Gregory Forsberg, and Tara Skobel.

The 2014 Youth Conference Coordinators, Gregory Forsberg and Nik Richardson.

The 2013 Youth Conference Coordinators, Siku Allooloo and Vanessa Sloan-Morgan.
