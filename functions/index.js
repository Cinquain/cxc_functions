
const functions = require("firebase-functions");

//Initialize Firebase Admin SDK
const admin = require('firebase-admin');
admin.initializeApp()
const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

exports.newStamp = functions.firestore
    .document('/locations/{locationId}/history/{userId}')
    .onCreate(async (snapshot, context) => {
        const postId = context.params.locationId;


        const data = snapshot.data()
        const userId = context.params.userId;
        const username = data.displayName;
        const imageUrl = data.ownerImageUrl;
        const spotName = data.spotName;

        const spotSnapshot = await db.collection("locations").doc(postId).get();
        const spotData = spotSnapshot.data();
        const ownerId = spotData.ownerId;

        const ownerData = await db.collection("users").doc(ownerId).get();
        const fcmToken = ownerData.data().fcmToken;

        const payload = {
            notification: {
                title: "You've earned 1 StreetCred",
                body: username + "has checked in" + spotName,
            },
            data: {
                userId: userId,
                profileUrl: imageUrl,
                username: username,
            },
        };

       await admin.messaging().sendToDevice(fcmToken, payload);
    })
