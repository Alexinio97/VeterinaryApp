import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/firebase-storage";
import "firebase/messaging";

var firebaseConfig = {

};
// Initialize Firebase
export const firebaseApiKey = "";
export const myFirebase = firebase.initializeApp(firebaseConfig);
export const storage = myFirebase.storage();
const baseDb = myFirebase.firestore();
export const messaging = myFirebase.messaging();
export const sendGridMailKey = "";
export const db = baseDb;

