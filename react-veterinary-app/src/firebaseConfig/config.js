import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";


var firebaseConfig = {
 
};
// Initialize Firebase
export const myFirebase = firebase.initializeApp(firebaseConfig);
const baseDb = myFirebase.firestore();

export const db = baseDb;