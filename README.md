# Messing app server

## Express api-rest for users and messages handling. Includes socket connection for listening to real-time requests

### Made with

NodeJS, Express, MongoDB & Socket-io

### Made by: Agustin Gutierrez

### Includes

- User authorization and authentication with JWT
- User email validation and account confirmation
- Email messaging service via nodemailer
- Users avatar image upload with Cloudinary
- Messages handling for web-chat application
- Real time messaging via websockets using Socket-io
- Real time notifications via websockets using Socket-io

## Scripts

```json
"scripts": {
  "test": "NODE_ENV=test jest --verbose",
  "dev": "NODE_ENV=development nodemon index.js",
  "start": "NODE_ENV=production node index.js"
},
```
Any additional socket connection could be added in file: ```models/sockets.js``` 
Any additional express middleware could be added in file: ```models/server.js```

### Demo
[messingapp-server](https://messing-app-server.onrender.com)
