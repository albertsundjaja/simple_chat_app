# Simple Chat App

## Overview

This project is a simple group chat app that support multi users.

This app make use of:
1. React
2. Socket.io
3. Node with Express

Feature of the app:
* When user first open the app, user will be asked to enter a username
* Users can see up to 20 last messages
* User will be notified when a new user is connected/disconnected

![demo](https://github.com/albertsundjaja/simple_chat_app/blob/master/docs/demo.gif)

## How to run the app

#### Install Docker and Docker Compose

To make it easier to deploy, docker and docker-compose is the preferred method of running this app

#### Spin up the containers

Simply run in the cloned folder

```
docker-compose up -d
```

#### Open chrome/firefox/edge

The react app runs on port `3000` while the websocket server runs on `8080`

Open `localhost:3000` and have fun with the app

## Further Improvement

#### UI improvement

The UI is *ugly* at the moment, and it is important to make it look sleek to users!

#### Make use of Redis or other DB

The app currently uses in-memory to store the messages and connected users, it will be better to make use of external DB for persistency.

#### Better cleanup

There might be some data that gets stuck (e.g. disconnected username is still registered). An app cleanup is needed to sync the data.

#### Better checking and validation

Currently, the ws connection is assumed to be always connected. However, this is not reliable. A better check on the ws connection is needed for example if there is a connection error or the server does not respond.

#### Duplicate username checking

User can enter duplicate username. This is not ideal for a chat app. A check for registered usernames will be needed.

