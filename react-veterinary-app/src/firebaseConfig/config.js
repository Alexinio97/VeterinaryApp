import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/firebase-storage";
import "firebase/messaging";

var firebaseConfig = {
    apiKey: "AIzaSyCkAWg2p5G7FIV4WFFRNWdhopm15LALxUQ",
    authDomain: "final-year-project-748be.firebaseapp.com",
    databaseURL: "https://final-year-project-748be.firebaseio.com",
    projectId: "final-year-project-748be",
    storageBucket: "final-year-project-748be.appspot.com",
    messagingSenderId: "1007783445768",
    appId: "1:1007783445768:web:e1b873c5de25a8e0cd18bd",
    measurementId: "G-1TLB441458"
};
// Initialize Firebase
export const myFirebase = firebase.initializeApp(firebaseConfig);
export const storage = myFirebase.storage();
const baseDb = myFirebase.firestore();
export const messaging = myFirebase.messaging();

export const db = baseDb;

