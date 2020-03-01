import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/firebase-storage";

var firebaseConfig = {
  
};
// Initialize Firebase
export const myFirebase = firebase.initializeApp(firebaseConfig);
export const storage = myFirebase.storage();
const baseDb = myFirebase.firestore();

export const db = baseDb;

