// ============ QUẢN LÝ AUTO-SAVE 3 TẦNG ============

const STORAGE_KEY = 'tiembanhmie_data_v2';
const SYNC_STATUS = {
  local: false,
  firebase: false,
  sheets: false
};

// Timers
let localTimer = null;
let firebaseTimer = null;

// Đánh dấu có thay đổi chưa lưu
let hasUnsavedChanges = false;

// ============ TẦNG 1: LOCALSTORAGE (1 giây) ============
function scheduleLocalSave(dateKey, dayData) {
  if (localTimer) clearTimeout(localTimer);
  localTimer = setTimeout(() => {
    saveLocal(dateKey, dayData);
  }, 1000);
}

function saveLocal(dateKey, dayData) {
  try {
    const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    allData[dateKey] = dayData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    SYNC_STATUS.local = true;
    updateSyncBadge();
    console.log('💾 Đã lưu localStorage:', dateKey);
  } catch (err) {
    console.error('❌ Lỗi localStorage:', err);
  }
}

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

// ============ TẦNG 2: FIREBASE (3 giây) ============
function scheduleFirebaseSave(dateKey, dayData) {
  if (firebaseTimer) clearTimeout(firebaseTimer);
  firebaseTimer = setTimeout(async () => {
    await saveToFirebase(dateKey, dayData)
      .then(() => {
        SYNC_STATUS.firebase = true;
        updateSyncBadge();
      })
      .catch(() => {
        SYNC_STATUS.firebase = false;
        updateSyncBadge();
        // Đưa vào hàng đợi retry khi có mạng
        queueForRetry('firebase', dateKey, dayData);
      });
  }, 3000);
}

// ============ TẦNG 3: SHEETS (30 giây, đã có trong sheets.js) ============
function scheduleSheetsSave(dateKey, dayData) {
  pushToSheets(dateKey, dayData);
  // updateSyncBadge sẽ được gọi từ sheets.js khi thành công
}

// ============ HÀNG ĐỢI RETRY KHI MẤT MẠNG ============
const retryQueue = {
  firebase: [],
  sheets: []
};

function queueForRetry(type, dateKey, dayData) {
  retryQueue[type].push({ dateKey, dayData });
  localStorage.setItem('retryQueue', JSON.stringify(retryQueue));
}

// Thử lại khi có mạng
window.addEventListener('online', async () => {
  console.log('🌐 Có mạng trở lại, thử gửi lại...');
  
  // Retry Firebase
  for (const item of retryQueue.firebase) {
    try {
      await saveToFirebase(item.dateKey, item.dayData);
      console.log('✅ Retry Firebase thành công:', item.dateKey);
    } catch {
      // Giữ lại trong queue
    }
  }
  retryQueue.firebase = [];
  
  // Retry Sheets
  if (retryQueue.sheets.length > 0) {
    sheetsQueue = [...retryQueue.sheets, ...sheetsQueue];
    retryQueue.sheets = [];
    flushSheets();
  }
  
  localStorage.setItem('retryQueue', JSON.stringify(retryQueue));
});

// ============ LƯU KHI ĐÓNG TRANG ============
window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges) {
    // Lưu localStorage ngay
    if (localTimer) {
      clearTimeout(localTimer);
      // Không có dateKey ở đây, cần lưu từ form hiện tại
      // Sẽ implement trong form handler
    }
    // Gửi Sheets ngay
    flushSheetsNow();
  }
});

// Lưu khi ẩn trang (mẹ chuyển app khác trên iPhone)
document.addEventListener('visibilitychange', () => {
  if (document.hidden && hasUnsavedChanges) {
    // Lưu ngay
    if (localTimer) {
      clearTimeout(localTimer);
    }
    flushSheetsNow();
  }
});

// ============ UI CHỈ BÁO ĐÃ LƯU ============
function updateSyncBadge() {
  const badge = document.getElementById('syncBadge');
  if (!badge) return;
  
  const allOk = SYNC_STATUS.local && SYNC_STATUS.firebase;
  const partial = SYNC_STATUS.local;
  
  if (allOk) {
    badge.textContent = '✓ Đã lưu';
    badge.className = 'sync-badge sync-ok';
  } else if (partial) {
    badge.textContent = '⏳ Đang đồng bộ...';
    badge.className = 'sync-badge sync-pending';
  } else {
    badge.textContent = '⏳ Đang lưu...';
    badge.className = 'sync-badge sync-pending';
  }
}

function updateSyncStatus(layer, ok) {
  SYNC_STATUS[layer] = ok;
  updateSyncBadge();
}

// ============ HÀM CHÍNH: MẸ GÕ XONG ============
function onDataChanged(dateKey, dayData) {
  hasUnsavedChanges = true;
  
  // Hiện chỉ báo "Đang lưu"
  updateSyncBadge();
  
  // Lên lịch lưu 3 tầng
  scheduleLocalSave(dateKey, dayData);
  scheduleFirebaseSave(dateKey, dayData);
  scheduleSheetsSave(dateKey, dayData);
  
  // Sau 3 giây coi như đã lưu xong
  setTimeout(() => {
    hasUnsavedChanges = false;
  }, 3000);
}

// ============ GHI LOG KHI SỬA DỮ LIỆU CŨ ============
async function onEditOldData(dateKey, oldData, newData) {
  // Nếu ngày này đã có dữ liệu cũ, ghi log lịch sử
  if (oldData && JSON.stringify(oldData) !== JSON.stringify(newData)) {
    await logHistory(dateKey, oldData, newData);
    console.log('📝 Đã ghi log lịch sử cho', dateKey);
  }
}