import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
import { HttpsError } from "firebase-functions/lib/providers/https";

firebase.initializeApp();

export const deleteList = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to delete a list!"
      );
    }

    if (!data.id) {
      throw new HttpsError("invalid-argument", "ID is required!");
    }

    const { id } = data;

    const list = await firebase.firestore().doc(`lists/${id}`).get();

    if (!list.exists) {
      throw new HttpsError("not-found", "List not found");
    }

    await list.ref.update({ deleting: true });

    await deleteCollection(`lists/${id}/expenses`, 300);

    await list.ref.delete();
  });

export const joinList = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to join a list!"
      );
    }

    if (!data.code || !data.id) {
      throw new HttpsError("invalid-argument", "Code, ID are required!");
    }

    const { code, id } = data;

    const list = await firebase.firestore().doc(`lists/${id}`).get();

    if (!list.exists || list.data()?.code !== code) {
      throw new HttpsError("not-found", "List not found");
    }

    await list.ref.update({
      users: firebase.firestore.FieldValue.arrayUnion(context.auth.uid),
    });
  });

function deleteCollection(collectionPath: string, batchSize: number) {
  let collectionRef = firebase.firestore().collection(collectionPath);
  let query = collectionRef.orderBy("__name__").limit(batchSize);

  return new Promise<void>((resolve, reject) => {
    deleteQueryBatch(query, batchSize, resolve, reject);
  });
}

function deleteQueryBatch(
  query: firebase.firestore.Query,
  batchSize: number,
  resolve: () => void,
  reject: (error: any) => void
) {
  query
    .get()
    .then((snapshot) => {
      // When there are no documents left, we are done
      if (snapshot.size == 0) {
        return 0;
      }

      // Delete documents in a batch
      let batch = firebase.firestore().batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      return batch.commit().then(() => {
        return snapshot.size;
      });
    })
    .then((numDeleted) => {
      if (numDeleted === 0) {
        resolve();
        return;
      }

      // Recurse on the next process tick, to avoid
      // exploding the stack.
      process.nextTick(() => {
        deleteQueryBatch(query, batchSize, resolve, reject);
      });
    })
    .catch(reject);
}
