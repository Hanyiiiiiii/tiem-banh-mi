// ============ QUẢN LÝ NHẬP HÀNG QUA FIREBASE ============
// Load/save lịch sử nhập hàng lên Firestore
// Cấu trúc: collection "nhaphang", mỗi document = 1 ngày nhập hàng
// Document ID = "2026-09-07" (dateKey)
// Data: { ngay, matHang: [...], ship, ghiChu, updatedAt }

let purchasesCache = {}; // Cache local
let purchasesLoaded = false;

// Load tất cả lần nhập hàng từ Firebase
async function loadPurchasesFromFirebase() {
  if (!firebaseReady) return null;
  
  try {
    const snapshot = await firestore.collection('nhaphang').get();
    const result = {};
    snapshot.forEach(doc => {
      result[doc.id] = doc.data();
    });
    console.log(`📥 Đã tải ${Object.keys(result).length} lần nhập hàng từ Firebase`);
    purchasesLoaded = true;
    return result;
  } catch (err) {
    console.warn('⚠️ Không load được nhập hàng:', err.message);
    return null;
  }
}

// Lưu 1 lần nhập hàng lên Firebase
async function savePurchaseToFirebase(dateKey, data) {
  if (!firebaseReady) throw new Error('Firebase chưa sẵn sàng');
  
  try {
    await firestore.collection('nhaphang').doc(dateKey).set({
      ngay: dateKey,
      matHang: data.matHang || [],
      ship: data.ship || 0,
      ghiChu: data.ghiChu || '',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    purchasesCache[dateKey] = data;
    console.log('☁️ Đã lưu nhập hàng:', dateKey);
    return true;
  } catch (err) {
    console.error('❌ Lỗi lưu nhập hàng:', err);
    throw err;
  }
}

// Xóa 1 lần nhập hàng
async function deletePurchaseFromFirebase(dateKey) {
  if (!firebaseReady) throw new Error('Firebase chưa sẵn sàng');
  
  try {
    await firestore.collection('nhaphang').doc(dateKey).delete();
    delete purchasesCache[dateKey];
    console.log('🗑️ Đã xóa nhập hàng:', dateKey);
    return true;
  } catch (err) {
    console.error('❌ Lỗi xóa nhập hàng:', err);
    throw err;
  }
}

// Lắng nghe thay đổi realtime
function listenPurchasesFirebase(callback) {
  if (!firebaseReady) return;
  
  firestore.collection('nhaphang').onSnapshot(snapshot => {
    const result = {};
    snapshot.forEach(doc => {
      result[doc.id] = doc.data();
    });
    purchasesCache = result;
    callback(result);
  }, err => {
    console.warn('⚠️ Realtime nhập hàng lỗi:', err.message);
  });
}

// Chuyển dữ liệu từ Firebase → mảng PURCHASES (cho expenses.js tính toán)
function buildPurchasesArray(fbData) {
  if (!fbData) return null;
  
  const arr = [];
  Object.keys(fbData).sort().forEach(key => {
    const item = fbData[key];
    // Tính tổng tiền
    let tong = item.ship || 0;
    (item.matHang || []).forEach(m => {
      tong += (m.soLuong || 0) * (m.donGia || 0);
    });
    
    arr.push({
      id: key,
      ngay: key,
      loai: 'hang',
      ghiChu: item.ghiChu || '',
      matHang: item.matHang || [],
      ship: item.ship || 0,
      _tongTien: tong
    });
  });
  return arr;
}

// Lấy mảng purchases động (ưu tiên Firebase, fallback về file purchases.js)
function getPurchasesArray() {
  if (purchasesLoaded && Object.keys(purchasesCache).length > 0) {
    return buildPurchasesArray(purchasesCache);
  }
  return PURCHASES; // fallback về file tĩnh
}