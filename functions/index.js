const {onSchedule} = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const {Timestamp} = require("firebase-admin/firestore");
admin.initializeApp();

exports.updateOverDueDocs = onSchedule("every day 12:15", async (event) => {
  try {
    const db = admin.firestore();
    const fiveDaysAgo = Timestamp.fromMillis(Date.now()-5*24*60*60*1000);
    const collectionRef = db.collection("ServiceCalls");


    const snapshot = await collectionRef
        .where("date", "<", fiveDaysAgo)
        .get();

    if (snapshot.empty) {
      console.log("No documents found that are older than 5 days.");
      return;
    }


    const filteredDocs = snapshot.docs.filter((doc) => doc.data()
        .status !== "DONE");

    if (filteredDocs.length === 0) {
      console.log("No documents found with status not equal to 'DONE'.");
      return;
    }


    const batch = db.batch();
    filteredDocs.forEach((doc) => {
      const docRef = doc.ref;
      batch.update(docRef, {
        overDue: true,
      });
    });


    await batch.commit();
    console.log(`${filteredDocs.length} documents updated successfully.`);
  } catch (error) {
    console.error("Error updating documents:", error);
  }
});

