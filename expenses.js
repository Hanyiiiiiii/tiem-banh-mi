// ============ CẤU HÌNH ============
const NGAY_BAT_DAU = new Date(2026, 3, 10); // 10/4/2026
const TIEN_DIEN_NUOC = 1000000; // Tiền điện + nước hàng tháng

// ============ HELPERS ============
function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

function parseDate(dateStr) {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Kiểm tra ngày trống nội bộ (để không phụ thuộc vào file index.html)
function checkDayEmpty(d) {
  if (!d) return true;
  if ((d.tongBanhBan || 0) > 0) return false;
  if ((d.nhapMoi || 0) > 0) return false;
  if ((d.tonDau || 0) > 0) return false;
  if ((d.nuoc || 0) > 0) return false;
  if ((d.banh25 || 0) > 0) return false;
  if ((d.banh30 || 0) > 0) return false;
  if ((d.tienLeDau || 0) > 0) return false;
  if ((d.tienCat || 0) > 0) return false;
  if (d.chiPhi && d.chiPhi.some(c => (c.soTien || 0) > 0 || (c.ten || '').trim() !== '')) return false;
  if (d.ghiChu && d.ghiChu.trim() !== '') return false;
  return true;
}

// ============ CHI PHÍ LẤY HÀNG (TÍNH THEO GIÁ COST) ============
function tinhChiPhiLayHangTheoThang(purchases, data) {
  const result = {};
  
  const COST_BANH_KHONG = 2500;
  const COST_BANH_15 = 10768;
  const COST_BANH_20 = 13088;
  const COST_BANH_25 = 16356;
  const COST_BANH_30 = 16356;
  const COST_NUOC = 10000;

  if (!data) return result;

  for (const dateKey in data) {
    const dayData = data[dateKey];
    if (!dayData || checkDayEmpty(dayData)) continue;

    const thangKey = dateKey.substring(0, 7); // Lấy YYYY-MM
    
    const chiPhiHangNgay = 
      (dayData.banhKhong || 0) * COST_BANH_KHONG +
      (dayData.banh15 || 0) * COST_BANH_15 +
      (dayData.banh20 || 0) * COST_BANH_20 +
      (dayData.banh25 || 0) * COST_BANH_25 +
      (dayData.banh30 || 0) * COST_BANH_30 +
      (dayData.nuoc || 0) * COST_NUOC;

    if (!result[thangKey]) result[thangKey] = 0;
    result[thangKey] += chiPhiHangNgay;
  }

  return result;
}

// ============ BAO BÌ (TÍNH THEO SỐ LƯỢNG BÁNH) ============
function tinhBaoBiTheoThang(packaging, data) {
  const result = {};
  const COST_BAO_BI = 500;

  if (!data) return result;

  for (const dateKey in data) {
    const dayData = data[dateKey];
    if (!dayData || checkDayEmpty(dayData)) continue;

    const thangKey = dateKey.substring(0, 7); 
    
    const tongBanh = 
      (dayData.banhKhong || 0) +
      (dayData.banh15 || 0) +
      (dayData.banh20 || 0) +
      (dayData.banh25 || 0) +
      (dayData.banh30 || 0);
      
    const chiPhiBaoBiNgay = tongBanh * COST_BAO_BI;

    if (!result[thangKey]) result[thangKey] = 0;
    result[thangKey] += chiPhiBaoBiNgay;
  }

  return result;
}

// ============ CHI PHÍ KHAI TRƯƠNG (ĐẦU TƯ BAN ĐẦU) ============
function tinhChiPhiKhaiTruong(purchases, packaging) {
  // Sử dụng biến investList toàn cục nếu có
  if (typeof investList !== 'undefined' && Array.isArray(investList)) {
    return investList.reduce((sum, item) => sum + (Number(item.tongTien) || 0), 0);
  }
  return 0;
}
