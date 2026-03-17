// FieldOps Pro — Firebase Configuration
// Replace with your own Firebase project config if needed
window._embeddedFirebaseConfig = {
  apiKey: "AIzaSyCgRSws8fOvssYsqED4QSkzIw2mwxk2XVs",
  authDomain: "fieldopspro-e47cd.firebaseapp.com",
  projectId: "fieldopspro-e47cd",
  storageBucket: "fieldopspro-e47cd.firebasestorage.app",
  messagingSenderId: "130089981211",
  appId: "1:130089981211:web:200b400a16c4cfd838afbe"
};
// Also save to localStorage so it's available even if script order changes
try { localStorage.setItem('fop_firebase_cfg', JSON.stringify(window._embeddedFirebaseConfig)); } catch(e) {}
