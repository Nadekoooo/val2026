import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDgy7KffVMQSuJWXXbK-PIf0H-r3U7ssLE",
  authDomain: "bingo-valentin.firebaseapp.com",
  databaseURL: "https://bingo-valentin-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bingo-valentin",
  storageBucket: "bingo-valentin.firebasestorage.app",
  messagingSenderId: "637941597500",
  appId: "1:637941597500:web:5cf0d85ea0ef5e77fcca39"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
