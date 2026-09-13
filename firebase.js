// ============ CẤU HÌNH FIREBASE ============
const FIREBASE_CONFIG = {
  apiKey: "PASTE_API_KEY_VÀO_ĐÂY",
  authDomain: "tiem-banh-mi-42883.firebaseapp.com",
  projectId: "tiem-banh-mi-42883",
  storageBucket: "tiem-banh-mi-42883.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID_VÀO_ĐÂY",
  appId: "PASTE_APP_ID_VÀO_ĐÂY"
};

// Load Firebase SDK
const firebaseScripts = [
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"
];

let firebaseApp = null;
let firestore = null;
let firebaseReady = false;

async function initFirebase() {
  try {
    for (const src of firebaseScripts) {
      await loadScript(src);
    }
    firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    firestore = firebase.firestore();
    firebaseReady = true;
    console.log('✅ Firebase đã sẵn sàng');
    return true;
  } catch (err) {
    console.warn('⚠️ Firebase không khởi tạo được:', err.message);
    firebaseReady = false;
    return false;
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function saveToFirebase(dateKey, dayData) {
  if (!firebaseReady) {
    throw new Error('Firebase chưa sẵn sàng');
  }
  try {
    await firestore.collection('doanhthu').doc(dateKey).set({
      ...dayData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('☁️ Đã lưu Firebase:', dateKey);
    return true;
  } catch (err) {
    console.error('❌ Lỗi Firebase:', err);
    throw err;
  }
}

async function loadFromFirebase() {
  if (!firebaseReady) return null;
  try {
    const snapshot = await firestore.collection('doanhthu').get();
    const result = {};
    snapshot.forEach(doc => {
      result[doc.id] = doc.data();
    });
    console.log(`📥 Đã tải ${Object.keys(result).length} ngày từ Firebase`);
    return result;
  } catch (err) {
    console.error('❌ Lỗi đọc Firebase:', err);
    return null;
  }
}

function listenFirebase(callback) {
  if (!firebaseReady) return;
  firestore.collection('doanhthu').onSnapshot(snapshot => {
    const result = {};
    snapshot.forEach(doc => {
      result[doc.id] = doc.data();
    });
    callback(result);
  }, err => {
    console.warn('⚠️ Realtime listener lỗi:', err.message);
  });
}
