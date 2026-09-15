// ============ CẤU HÌNH ============
// Bắt đầu tính chi phí từ 10/4 (bỏ qua 2 lần nhập đầu 25/3, 30/3)
const NGAY_BAT_DAU = new Date(2026, 3, 10); // 10/4/2026

// ============ CHI PHÍ CỐ ĐỊNH HÀNG THÁNG ============
const TIEN_DIEN_NUOC = 700000; // Tiền điện + nước hàng tháng

// ============ HELPERS ============
function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(d1, d2) {
  const ms = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// ============ ĐẾM SỐ NGÀY CÓ DOANH THU ============
function demSoNgayCoDoanhThu(data, tuNgay, denNgay) {
  let count = 0;
  let cur = new Date(tuNgay);
  cur.setHours(0, 0, 0, 0);
  const den = new Date(denNgay);
  den.setHours(0, 0, 0, 0);
  
  while (cur <= den) {
    const y = cur.getFullYear();
    const m = cur.getMonth();
    const d = cur.getDate();
    const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    const dayData = data[key];
    if (dayData && ((dayData.tienCat || 0) > 0 || (dayData.tongBanhBan || 0) > 0)) {
      count++;
    }
    
    cur = new Date(y, m, d + 1);
  }
  
  return count;
}

// ============ PHÂN BỔ THEO NGÀY CÓ DOANH THU ============
function phanBoTheoNgayCoDoanhThu(danhSachNhap, data) {
  if (!danhSachNhap || danhSachNhap.length === 0) return {};
  
  // Tổng chi phí vận hành
  let tongChiPhi = 0;
  danhSachNhap.forEach(p => {
    tongChiPhi += p.tongTien;
  });
  
  if (tongChiPhi === 0) return {};
  
  const homNay = new Date();
  homNay.setHours(0, 0, 0, 0);
  
  let ngayBatDau = new Date(NGAY_BAT_DAU);
  let ngayKetThuc = new Date(homNay);
  
  const tongSoNgayCoDoanhThu = demSoNgayCoDoanhThu(data, ngayBatDau, ngayKetThuc);
  
  if (tongSoNgayCoDoanhThu === 0) return {};
  
  const chiPhiMoiNgay = tongChiPhi / tongSoNgayCoDoanhThu;
  
  const result = {};
  
  let cur = new Date(ngayBatDau);
  while (cur <= ngayKetThuc) {
    const y = cur.getFullYear();
    const m = cur.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    
    const ngayDauThang = new Date(y, m, 1);
    const ngayCuoiThang = new Date(y, m + 1, 0);
    
    let thangBatDau = ngayDauThang < ngayBatDau ? ngayBatDau : ngayDauThang;
    let thangKetThuc = ngayCuoiThang > ngayKetThuc ? ngayKetThuc : ngayCuoiThang;
    
    const soNgayCoDoanhThuThang = demSoNgayCoDoanhThu(data, thangBatDau, thangKetThuc);
    
    result[key] = Math.round(chiPhiMoiNgay * soNgayCoDoanhThuThang);
    
    cur = new Date(y, m + 1, 1);
  }
  
  return result;
}

// ============ CHI PHÍ LẤY HÀNG ============
function tinhChiPhiLayHangTheoThang(purchases, data) {
  // ⭐ Nếu purchases null/undefined → dùng dữ liệu động từ Firebase
  if (!purchases && typeof getPurchasesArray === 'function') {
    purchases = getPurchasesArray();
  }
  
  if (!purchases || purchases.length === 0) return {};
  
  // Lọc bỏ 2 lần nhập đầu (25/3, 30/3)
  const danhSach = purchases
    .filter(p => parseDate(p.ngay) >= NGAY_BAT_DAU)
    .map(p => ({
      ngay: p.ngay,
      tongTien: tinhTongTienPurchase(p)
    }));
  
  return phanBoTheoNgayCoDoanhThu(danhSach, data);
}

// ============ BAO BÌ ============
function tinhBaoBiTheoThang(packaging, data) {
  if (!packaging || packaging.length === 0) return {};
  
  // Lọc bao bì từ 10/4 trở đi
  const danhSach = packaging
    .filter(p => parseDate(p.ngay) >= NGAY_BAT_DAU)
    .map(p => ({
      ngay: p.ngay,
      tongTien: p.tongTien || 0
    }));
  
  return phanBoTheoNgayCoDoanhThu(danhSach, data);
}

// ============ CHI PHÍ KHAI TRƯƠNG ============
function tinhChiPhiKhaiTruong(purchases, packaging) {
  return 0;
}