// Firebase imports and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, update, set, get } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9aL9DBbbEok_lL_iXwB-FOAXLC3ofj7M",
  authDomain: "art-audit-1bd5e.firebaseapp.com",
  databaseURL: "https://art-audit-1bd5e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "art-audit-1bd5e",
  storageBucket: "art-audit-1bd5e.firebasestorage.app",
  messagingSenderId: "451635643908",
  appId: "1:451635643908:web:44f92905e2f2a5cb379751"
};


const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, push, onValue, update, set, get  }; 





