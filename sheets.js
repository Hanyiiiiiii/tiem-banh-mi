// ============ CẤU HÌNH GOOGLE SHEETS ============
// Bạn sẽ thay URL này sau khi tạo Apps Script
// Hướng dẫn chi tiết sẽ có ở tin sau
const SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbyQEBuOHaMxBW4IZrD9ySnd2ggZXAtrwYNmiNow_wYzMWUvulfNj4cgESiDV4A40UjxFg/exec";

// Hàng đợi ghi Sheets (tránh ghi quá nhiều lần)
let sheetsQueue = [];
let sheetsTimer = null;
let sheetsRetryCount = 0;

// Đẩy 1 ngày lên Sheets (có log lịch sử)
async function pushToSheets(dateKey, dayData) {
  // Thêm vào hàng đợi
  sheetsQueue.push({
    dateKey,
    dayData,
    timestamp: new Date().toISOString(),
    action: 'update'
  });
  
  // Đợi 30 giây gom lại rồi gửi 1 lần
  if (sheetsTimer) clearTimeout(sheetsTimer);
  sheetsTimer = setTimeout(flushSheets, 30000);
  
  console.log(`📋 Đã xếp hàng chờ ghi Sheets (${sheetsQueue.length} mục)`);
}

// Gửi tất cả hàng đợi lên Sheets
async function flushSheets() {
  if (sheetsQueue.length === 0) return;
  
  const batch = [...sheetsQueue];
  sheetsQueue = [];
  
  try {
    const response = await fetch(SHEETS_API_URL, {
      method: 'POST',
      mode: 'no-cors', // Apps Script cần no-cors
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: batch })
    });
    
    console.log(`✅ Đã gửi ${batch.length} mục lên Sheets`);
    sheetsRetryCount = 0;
    updateSyncStatus('sheets', true);
  } catch (err) {
    console.warn('⚠️ Lỗi ghi Sheets, thử lại sau:', err.message);
    // Đưa lại vào hàng đợi để thử lại
    sheetsQueue = [...batch, ...sheetsQueue];
    sheetsRetryCount++;
    
    // Thử lại sau 30s, 60s, 120s... tối đa 5 phút
    const retryDelay = Math.min(30000 * Math.pow(2, sheetsRetryCount), 300000);
    setTimeout(flushSheets, retryDelay);
    updateSyncStatus('sheets', false);
  }
}

// Ghi ngay khi đóng form (không đợi 30s)
async function flushSheetsNow() {
  if (sheetsTimer) clearTimeout(sheetsTimer);
  await flushSheets();
}

// Ghi log lịch sử (khi mẹ sửa dữ liệu cũ)
async function logHistory(dateKey, oldData, newData) {
  try {
    await fetch(SHEETS_API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'log',
        dateKey,
        oldData,
        newData,
        timestamp: new Date().toISOString()
      })
    });
  } catch (err) {
    console.warn('⚠️ Không ghi được log:', err.message);
  }
}
