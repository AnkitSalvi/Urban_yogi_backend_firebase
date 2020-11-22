var admin = require("firebase-admin");


var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://urbanyogistudio.firebaseio.com"
});

var db = admin.firestore();

module.exports =  db;
