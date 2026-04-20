const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onDocumentWritten} = require("firebase-functions/v2/firestore");
const {logger} = require("firebase-functions");
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

const UNASSIGNED_VALUES = new Set(["", "Select...", null, undefined]);
const isUnassigned = (v) => UNASSIGNED_VALUES.has(v);

exports.notifyOnServiceCallAssigned = onDocumentWritten(
    "ServiceCalls/{callId}",
    async (event) => {
      const before = event.data && event.data.before &&
        event.data.before.exists ? event.data.before.data() : null;
      const after = event.data && event.data.after &&
        event.data.after.exists ? event.data.after.data() : null;
      if (!after) return;

      const prev = before ? before.takenBy : null;
      const next = after.takenBy;
      if (isUnassigned(next)) return;
      if (prev === next) return;

      const db = admin.firestore();
      const tokenSnap = await db.collection("fcmTokens")
          .where("technicianName", "==", next)
          .get();
      if (tokenSnap.empty) {
        logger.info(`No FCM tokens registered for ${next}`);
        return;
      }

      const tokens = tokenSnap.docs.map((d) => d.id);
      const callId = event.params.callId;
      const location = after.location || "";
      const machine = after.machine || "";
      const problem = after.reportedProblem || "";
      const whoCalled = after.whoCalled || "";

      const bodyParts = [];
      if (location) bodyParts.push(location);
      if (machine) bodyParts.push(machine);
      if (problem) bodyParts.push(problem);
      const body = bodyParts.join(" • ").slice(0, 200) ||
        "Tap to view details";

      const message = {
        notification: {
          title: `New service call: ${whoCalled || location || "assigned"}`,
          body,
        },
        data: {
          serviceCallId: callId,
          url: "/technician",
        },
        webpush: {
          fcmOptions: {
            link: "/technician",
          },
          notification: {
            tag: callId,
            renotify: true,
            icon: "/icons/icon-192.svg",
            badge: "/icons/icon-192.svg",
          },
        },
        tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      logger.info(
          `Sent push to ${next}: ${response.successCount}/${tokens.length} ok`,
      );

      const stale = [];
      response.responses.forEach((r, i) => {
        if (r.success) return;
        const code = r.error && r.error.code;
        if (
          code === "messaging/invalid-registration-token" ||
          code === "messaging/registration-token-not-registered"
        ) {
          stale.push(tokens[i]);
        } else {
          logger.warn(`Push error for ${tokens[i]}:`, r.error);
        }
      });

      if (stale.length) {
        const batch = db.batch();
        stale.forEach((t) =>
          batch.delete(db.collection("fcmTokens").doc(t)));
        await batch.commit();
        logger.info(`Removed ${stale.length} stale token(s)`);
      }
    },
);
