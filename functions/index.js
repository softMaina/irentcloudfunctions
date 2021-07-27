const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });

  const db = admin.firestore();



// listen on bids made and send a notification
exports.sendBidNotification = functions.firestore.document('bids/{bidId}').onCreate((snap, context) => {

    
    let bid_by = snap.get('bid_by');
    let post_id = snap.get('post_id');
    console.log('post id', post_id);
    let posted_by = null;
    let title = null;
    // notification payload
    let payload = {
        notification: {
            title: "You A New Bid" + title,
            body: "A New Bid Has Been Placed On Your Product"
        }
    };
    let deviceToken = null;
    
    db.collection('uploads').where('post_id', '==' ,post_id).limit(1).get().then((snapshot) => {
        // posted_by = snapshot.get('posted_by');
        // title = snapshot.get('title');
        // console.log("Product title", title)

        snapshot.forEach((doc)=>{
            posted_by = doc.data().posted_by;   
            title = doc.data().title;
            console.log("posted_by",posted_by);
        })

        db.collection('tokens').where('user', '==', posted_by).limit(1).get().then((snapshot) => {
            snapshot.forEach((doc) => {
                
                deviceToken = doc.data().token;
   
            });
            console.log("Sent to device", deviceToken)
            admin.messaging().sendToDevice(deviceToken, payload).then(function (response){
                console.log('Notification Was Successfully Sent');
            }).catch(function (error){
                console.log('There was an error sending the notification', error);
            })
           
        });

    });
});


// listen on rented items and notify the person who has been rewarded an item
exports.sendRewardNotification = functions.firestore.document('rented/{rentedId}').onCreate((snap, context)=>{
      
    
    let deviceToken = null;
    let posted_by = snap.get('rented_to');
    let renter = snap.get('rented_by')
    let title = snap.get('title');

    // notification payload
    let payload = {
        notification: {
            title: "Your on" + title + "Bid Won!!",
            body: "Your Bid Has Been Accepted"
        }
    };

    db.collection('tokens').where('user', '==', posted_by).limit(1).get().then((snapshot) => {
        snapshot.forEach((doc) => {
            
            deviceToken = doc.data().token;

        });
        console.log("Sent to device", deviceToken)
        admin.messaging().sendToDevice(deviceToken, payload).then(function (response){
            console.log('Notification Was Successfully Sent');
        }).catch(function (error){
            console.log('There was an error sending the notification', error);
        })
       
    });

    db.collection('tokens').where('user', '==', renter).limit(1).get().then((snapshot) => {
        snapshot.forEach((doc) => {
            
            deviceToken = doc.data().token;

        });
        console.log("Sent to device", deviceToken)
        admin.messaging().sendToDevice(deviceToken, payload).then(function (response){
            console.log('Notification Was Successfully Sent');
        }).catch(function (error){
            console.log('There was an error sending the notification', error);
        })
       
    });


});