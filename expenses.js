// ============ CẤU HÌNH ============
// Bắt đầu tính chi phí từ 10/4 (bỏ qua 2 lần nhập đầu 25/3, 30/3)
const NGAY_BAT_DAU = new Date(2026, 3, 10); // 10/4/2026

// ============ CHI PHÍ CỐ ĐỊNH HÀNG THÁNG ============
const TIEN_DIEN_NUOC = 1000000; // Tiền điện + nước hàng tháng

// ============ HELPERS ============
function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// ============ CHI PHÍ LẤY HÀNG (TÍNH THEO GIÁ COST) ============
function tinhChiPhiLayHangTheoThang(purchases, data) {
  const result = {};
  
  // Giá cost (chi phí nguyên vật liệu) cho từng loại
  const COST_BANH_KHONG = 2500;
  const COST_BANH_15 = 10768;
  const COST_BANH_20 = 13088;
  const COST_BANH_25 = 16356;
  const COST_BANH_30 = 16356;
  const COST_NUOC = 10000;

  if (!data) return result;

  for (const dateKey in data) {
    const dayData = data[dateKey];
    // Kiểm tra hàm isDayEmpty có tồn tại không (hàm này nằm ở index.html)
    if (!dayData || (typeof isDayEmpty === 'function' && isDayEmpty(dayData))) continue;

    const thangKey = dateKey.substring(0, 7); // Lấy YYYY-MM
    
    // Tính chi phí theo số lượng bán ra của từng loại
    const chiPhiHangNgay = 
      (dayData.banhKhong || 0) * COST_BANH_KHONG +
      (dayData.banh15 || 0) * COST_BANH_15 +
      (dayData.banh20 || 0) * COST_BANH_20 +
      (dayData.banh25 || 0) * COST_BANH_25 +
      (dayData.banh30 || 0) * COST_BANH_30 +
      (dayData.nuoc || 0) * COST_NUOC;

    // Cộng dồn vào tháng
    if (!result[thangKey]) result[thangKey] = 0;
    result[thangKey] += chiPhiHangNgay;
  }

  return result;
}

// ============ BAO BÌ (TÍNH THEO SỐ LƯỢNG BÁNH) ============
function tinhBaoBiTheoThang(packaging, data) {
  const result = {};
  
  // Chi phí bao bì cho mỗi cái bánh
  const COST_BAO_BI = 500;

  if (!data) return result;

  for (const dateKey in data) {
    const dayData = data[dateKey];
    if (!dayData || (typeof isDayEmpty === 'function' && isDayEmpty(dayData))) continue;

    const thangKey = dateKey.substring(0, 7); // Lấy YYYY-MM
    
    // Tính chi phí bao bì = 500 * tổng số bánh bán ra (không tính nước)
    const tongBanh = 
      (dayData.banhKhong || 0) +
      (dayData.banh15 || 0) +
      (dayData.banh20 || 0) +
      (dayData.banh25 || 0) +
      (dayData.banh30 || 0);
      
    const chiPhiBaoBiNgay = tongBanh * COST_BAO_BI;

    // Cộng dồn vào tháng
    if (!result[thangKey]) result[thangKey] = 0;
    result[thangKey] += chiPhiBaoBiNgay;
  }

  return result;
}

// ============ CHI PHÍ KHAI TRƯƠNG (ĐẦU TƯ BAN ĐẦU) ============
function tinhChiPhiKhaiTruong(purchases, packaging) {
  // Nếu có danh sách chi phí đầu tư ban đầu (investList) từ index.html truyền vào hoặc từ Firebase
  // thì tính tổng. Nếu không có thì trả về 0.
  let investList = [];
  
  if (typeof window !== 'undefined' && window.investList) {
    investList = window.investList;
  } else if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('investList');
      if (saved) investList = JSON.parse(saved);
    } catch (e) {}
  }

  if (!investList || investList.length === 0) return 0;
  
  return investList.reduce((sum, item) => sum + (Number(item.tongTien) || 0), 0);
}
