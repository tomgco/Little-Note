# Little Note

Little Note is a web application which uses dropbox as it's storage component. This means that Little Note can be run as a standalone application anywhere.

# Requirements
* Node.js 0.6+
* Redis

# Installation

    git clone git@github.com:tomgallacher/Little-Note.git LittleNote
    cd LittleNote
    git checkout develop
    npm install
    brew install redis
    redis-server /usr/local/etc/redis.conf
    node app.js
    visit http://localhost:3000