import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
import { HttpsError } from "firebase-functions/lib/providers/https";

firebase.initializeApp();

export const joinList = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to join a list!"
      );
    }

    if (!data.code || !data.id || !data.name) {
      throw new HttpsError(
        "invalid-argument",
        "Code, ID and Name are required!"
      );
    }

    const { code, id } = data;

    const list = await firebase
      .firestore()
      .doc(`lists/${id}`)
      .get();

    if (!list.exists || list.data()?.code !== code) {
      throw new HttpsError("not-found", "List not found");
    }

    await list.ref.update({
      users: firebase.firestore.FieldValue.arrayUnion(context.auth.uid)
    });
  });
