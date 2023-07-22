// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics"
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDDeYzLDXDlECE3AYjCfnawmyLE7DdFmH8",
  authDomain: "sant-samagam.firebaseapp.com",
  projectId: "sant-samagam",
  storageBucket: "sant-samagam.appspot.com",
  messagingSenderId: "309152924831",
  appId: "1:309152924831:web:6abf7f2db56ae85db34eaa",
  measurementId: "G-H26JVMM8WM",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const analytics = getAnalytics(app)
export const firestore = getFirestore(app)