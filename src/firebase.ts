import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";

const config = {
  apiKey: "AIzaSyCVZbMS0btXLArUKy25dFCr3exCI-DJEtA",
  authDomain: "expenses-1389b.firebaseapp.com",
  databaseURL: "https://expenses-1389b.firebaseio.com",
  projectId: "expenses-1389b",
  storageBucket: "expenses-1389b.appspot.com",
  messagingSenderId: "568691193087",
  appId: "1:568691193087:web:194149369f7ac7bcc988ca"
};

firebase.initializeApp(config);
