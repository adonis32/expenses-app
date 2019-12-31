import React from "react";
import styles from "./LoginScreen.module.scss";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "firebase/app";

const uiConfig: firebaseui.auth.Config = {
  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
  callbacks: {
    signInSuccessWithAuthResult: () => false
  }
};

function LoginScreen() {
  return (
    <div className={styles.loginScreen}>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </div>
  );
}

export default LoginScreen;
