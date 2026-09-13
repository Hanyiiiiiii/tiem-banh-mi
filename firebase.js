// ============ CẤU HÌNH FIREBASE ============
// Bạn sẽ thay các giá trị này sau khi tạo Firebase project
// Hướng dẫn chi tiết sẽ có ở tin sau
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tiem-banh-mi-saigon.firebaseapp.com",
  projectId: "tiem-banh-mi-saigon",
  storageBucket: "tiem-banh-mi-saigon.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Load Firebase SDK
const firebaseScripts = [
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"
];

// Biến toàn cục
let firebaseApp = null;
let firestore = null;
let firebaseReady = false;

// Khởi tạo Firebase
async function initFirebase() {
  try {
    // Load scripts
    for (const src of firebaseScripts) {
      await loadScript(src);
    }
    
    // Khởi tạo
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

// Helper load script
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// Lưu 1 ngày lên Firebase
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

// Đọc tất cả dữ liệu từ Firebase
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

// Lắng nghe thay đổi realtime (cả nhà cùng xem)
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