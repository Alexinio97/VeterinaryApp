import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/firebase-storage";
import "firebase/messaging";

var firebaseConfig = {
    <config_here>
};
// Initialize Firebase
export const myFirebase = firebase.initializeApp(firebaseConfig);
export const storage = myFirebase.storage();
const baseDb = myFirebase.firestore();
export const messaging = myFirebase.messaging();

export const db = baseDb;

