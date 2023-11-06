
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
                body: username + " has checked in" + spotName,
            },
            data: {
                userId: userId,
                profileUrl: imageUrl,
                username: username,
            },
        };

       await admin.messaging().sendToDevice(fcmToken, payload);
    })


exports.newWave = functions.firestore
    .document('/users_private/{userId}/waves/{requestId}')
    .onCreate(async (snapshot, context) => {
        const uid = context.params.requestId;
        const data = snapshot.data();
        const username = data.displayName;
        const profileUrl = data.profileUrl;
        const receiverId = data.toId;

        const receiverData = await db.collection('users').doc(receiverId).get();
        const fcmToken = receiverData.data().fcmToken;

        const payload = {
            notification: {
                title: "You got a new connection",
                body: username + " wants to connect with you"
             },
             data: {
                userId: uid,
                profileUrl: profileUrl,
                username: username
             }
        };
    
        await admin.messaging().sendToDevice(fcmToken, payload);
    })

exports.newLike = functions.firestore
    .document('/locations/{spotId}/likes/{userId}')
    .onCreate(async (snapshot, context) => {
        const uid = context.params.userId;
        const spotId = context.params.spotId;
        
        const data = snapshot.data();
        const username = data.username;

        const spotData = await db.collection('locations').doc(spotId).get();
        const ownerId = spotData.data().ownerId;
        const spotName = spotData.data().name;

        const ownerData = await db.collection('users').doc(ownerId).get();
        const fcmToken = ownerData.data().fcmToken;

        const payload = {
            notification: {
                title: "Your location got a new like",
                body: username + ' liked ' + spotName
            },
            data: {
                spotId: spotId,
                userId: uid
            }
        };

        await admin.messaging().sendToDevice(fcmToken, payload);

    })


exports.newSave = functions.firestore
    .document('locations/{spotId}/saves/{userId}')
    .onCreate(async (snapshot, context) => {
        const uid = context.params.userId;
        const data = snapshot.data();
        const username = data.username;
        const profileUrl = data.imageUrl;

        const spotId = context.params.spotId;

        const spotData = await db.collection('locations').doc(spotId).get();
        const ownerId = spotData.data().ownerId;
        const spotName = spotData.data().name;

        const ownerData = await db.collection('users').doc(ownerId).get();
        const fcmToken = ownerData.data().fcmToken;

        const payload = {
            notification: {
                title: 'You earned 1 StreetCred',
                body: username + ' saved ' + spotName
            },
            data: {
                userId: uid,
                profileUrl: profileUrl,
                username: username
            }
        };

        await admin.messaging().sendToDevice(fcmToken, payload);
        
    })

exports.newCheckin = functions.firestore
    .document('locations/{spotId}/checkins/{userId}')
    .onCreate(async (snapshot, context) => {
        const uid = context.params.userId;
        const spotId = context.params.spotId;

        const data = snapshot.data();
        const username = data.displayName;
        const profileUrl = data.profileUrl;
        const spotName = data.location;

        const users = await db.collection('locations').doc(spotId).collection('checkins').get();
        
        users.forEach(async (doc) => {
            const userId = doc.id;


            const userData = await db.collection('users').doc(userId).get();
            const fcmToken = userData.data().fcmToken;
    
            var payload = {
                notification: {
                    title: 'Someone new checked in' + spotName,
                    body: username + ' checked in ' + spotName
                },
                data: {
                    userId: uid,
                    profileUrl: profileUrl,
                    username: username
                }
            };
    
            await admin.messaging().sendToDevice(fcmToken, payload);
        });


       

    })