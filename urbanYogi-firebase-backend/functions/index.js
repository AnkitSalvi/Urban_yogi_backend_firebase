const functions = require('firebase-functions');
var admin = require("firebase-admin");


const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const uuid = require("uuid").v4;
const stripe = require("stripe")("sk_test_51HRJmAIhCbNFquFZscXrf3n7usTYKbAaUBxx4GqTeYq8t7Jr2PhGgqiyhAi7ZxEHoUdJhQcIHJyfmFGkqnIPP00B00fzlitGti");


const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors({ origin: true }));

require("./app.js")(app);

var db = admin.firestore(); 

exports.app = functions.https.onRequest(app);



// app.listen(port, () => {
//     console.log(`Server listening on port ${port}`);
//   });
