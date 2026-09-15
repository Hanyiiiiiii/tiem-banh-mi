// ============ DỮ LIỆU LỊCH SỬ NHẬP HÀNG ============
// Nguồn: File Excel "Chi phí quán bánh mì.xlsx"
// Tổng chi phí lấy hàng: 41,464,000đ (10 lần)
// Tổng bao bì: 3,393,799đ

const PURCHASES = [
  {
    id: "2026-03-25",
    ngay: "2026-03-25",
    loai: "hang",
    ghiChu: "Lấy hàng lần đầu",
    matHang: [
      { ten: "Bơ", soLuong: 3, donGia: 75000 },
      { ten: "Patê", soLuong: 3, donGia: 85000 },
      { ten: "Nem nướng", soLuong: 3, donGia: 95000 },
      { ten: "Xúc xích tỏi cắt", soLuong: 3, donGia: 85000 },
      { ten: "Giò thủ cắt", soLuong: 3, donGia: 85000 },
      { ten: "Giò lụa cắt", soLuong: 3, donGia: 85000 },
      { ten: "Da bao đỏ cắt", soLuong: 3, donGia: 115000 },
      { ten: "Ruốc xù ngọt", soLuong: 5, donGia: 135000 },
      { ten: "Giò bò cắt", soLuong: 3, donGia: 90000 }
    ],
    ship: 0
  },
  {
    id: "2026-03-30",
    ngay: "2026-03-30",
    loai: "hang",
    ghiChu: "Lấy hàng lần 2",
    matHang: [
      { ten: "Bơ", soLuong: 3, donGia: 80000 },
      { ten: "Patê", soLuong: 7, donGia: 82000 },
      { ten: "Nem nướng", soLuong: 6, donGia: 95000 },
      { ten: "Xúc xích tỏi cắt", soLuong: 4, donGia: 85000 },
      { ten: "Giò thủ cắt", soLuong: 4, donGia: 85000 },
      { ten: "Giò lụa cắt", soLuong: 4, donGia: 85000 },
      { ten: "Da bao đỏ cắt", soLuong: 4, donGia: 115000 },
      { ten: "Ruốc xù ngọt", soLuong: 0, donGia: 0 },
      { ten: "Giò bò cắt", soLuong: 4, donGia: 90000 }
    ],
    ship: 120000
  },
  {
    id: "2026-04-10",
    ngay: "2026-04-10",
    loai: "hang",
    ghiChu: "",
    matHang: [
      { ten: "Bơ", soLuong: 3, donGia: 75000 },
      { ten: "Patê", soLuong: 7, donGia: 82000 },
      { ten: "Nem nướng", soLuong: 8, donGia: 95000 },
      { ten: "Xúc xích tỏi cắt", soLuong: 6, donGia: 85000 },
      { ten: "Giò thủ cắt", soLuong: 5, donGia: 85000 },
      { ten: "Giò lụa cắt", soLuong: 4, donGia: 85000 },
      { ten: "Da bao đỏ cắt", soLuong: 4, donGia: 120000 },
      { ten: "Ruốc xù ngọt", soLuong: 2, donGia: 135000 },
      { ten: "Giò bò cắt", soLuong: 4, donGia: 90000 }
    ],
    ship: 150000
  },
  {
    id: "2026-04-24",
    ngay: "2026-04-24",
    loai: "hang",
    ghiChu: "Lấy thêm nem + ruốc",
    matHang: [
      { ten: "Nem nướng", soLuong: 5, donGia: 0, ghiChu: "5kg - tổng 1,150,000đ cả nem + ruốc" },
      { ten: "Ruốc xù ngọt", soLuong: 5, donGia: 0, ghiChu: "5kg" }
    ],
    ship: 0,
    tongTienGhiTay: 1150000
  },
  {
    id: "2026-05-04",
    ngay: "2026-05-04",
    loai: "hang",
    ghiChu: "",
    matHang: [
      { ten: "Bơ", soLuong: 5, donGia: 75000 },
      { ten: "Patê", soLuong: 5, donGia: 82000 },
      { ten: "Nem nướng", soLuong: 8, donGia: 95000 },
      { ten: "Xúc xích tỏi cắt", soLuong: 5, donGia: 85000 },
      { ten: "Giò thủ cắt", soLuong: 5, donGia: 85000 },
      { ten: "Giò lụa cắt", soLuong: 5, donGia: 85000 },
      { ten: "Da bao trắng cắt", soLuong: 5, donGia: 120000 },
      { ten: "Ruốc xù ngọt", soLuong: 5, donGia: 135000 },
      { ten: "Giò bò cắt", soLuong: 5, donGia: 90000 }
    ],
    ship: 150000
  },
  {
    id: "2026-05-22",
    ngay: "2026-05-22",
    loai: "hang",
    ghiChu: "",
    matHang: [
      { ten: "Bơ", soLuong: 0, donGia: 75000 },
      { ten: "Patê", soLuong: 8, donGia: 82000 },
      { ten: "Nem nướng", soLuong: 8, donGia: 95000 },
      { ten: "Xúc xích tỏi cắt", soLuong: 8, donGia: 85000 },
      { ten: "Giò thủ cắt", soLuong: 8, donGia: 85000 },
      { ten: "Giò lụa cắt", soLuong: 9, donGia: 85000 },
      { ten: "Da bao trắng cắt", soLuong: 9, donGia: 120000 },
      { ten: "Ruốc xù ngọt", soLuong: 5, donGia: 135000 },
      { ten: "Giò bò cắt", soLuong: 8, donGia: 90000 }
    ],
    ship: 200000
  },
  {
    id: "2026-06-16",
    ngay: "2026-06-16",
    loai: "hang",
    ghiChu: "",
    matHang: [
      { ten: "Bơ", soLuong: 5, donGia: 75000 },
      { ten: "Patê", soLuong: 10, donGia: 82000 },
      { ten: "Nem nướng", soLuong: 13, donGia: 95000 },
      { ten: "Xúc xích tỏi cắt", soLuong: 6, donGia: 85000 },
      { ten: "Giò thủ cắt", soLuong: 7, donGia: 85000 },
      { ten: "Giò lụa cắt", soLuong: 5, donGia: 85000 },
      { ten: "Da bao trắng cắt", soLuong: 6, donGia: 120000 },
      { ten: "Ruốc xù ngọt", soLuong: 5, donGia: 135000 },
      { ten: "Giò bò cắt", soLuong: 6, donGia: 90000 }
    ],
    ship: 200000
  },
  {
    id: "2026-07-04",
    ngay: "2026-07-04",
    loai: "hang",
    ghiChu: "Chỉ lấy ruốc",
    matHang: [
      { ten: "Ruốc xù ngọt", soLuong: 5, donGia: 135000 }
    ],
    ship: 0
  },
  {
    id: "2026-07-26",
    ngay: "2026-07-26",
    loai: "hang",
    ghiChu: "",
    matHang: [
      { ten: "Bơ", soLuong: 3, donGia: 75000 },
      { ten: "Patê", soLuong: 10, donGia: 82000 },
      { ten: "Nem nướng", soLuong: 15, donGia: 95000 },
      { ten: "Xúc xích tỏi cắt", soLuong: 6, donGia: 85000 },
      { ten: "Giò thủ cắt", soLuong: 7, donGia: 85000 },
      { ten: "Giò lụa cắt", soLuong: 5, donGia: 85000 },
      { ten: "Da bao trắng cắt", soLuong: 6, donGia: 120000 },
      { ten: "Ruốc xù ngọt", soLuong: 5, donGia: 135000 },
      { ten: "Giò bò cắt", soLuong: 6, donGia: 90000 }
    ],
    ship: 200000
  },
  {
    id: "2026-09-07",
    ngay: "2026-09-07",
    loai: "hang",
    ghiChu: "",
    matHang: [
      { ten: "Bơ", soLuong: 6, donGia: 75000 },
      { ten: "Patê", soLuong: 15, donGia: 82000 },
      { ten: "Nem nướng", soLuong: 10, donGia: 95000 },
      { ten: "Xúc xích tỏi cắt", soLuong: 6, donGia: 85000 },
      { ten: "Giò thủ cắt", soLuong: 5, donGia: 85000 },
      { ten: "Giò lụa cắt", soLuong: 6, donGia: 85000 },
      { ten: "Da bao trắng cắt", soLuong: 7, donGia: 120000 },
      { ten: "Ruốc xù ngọt", soLuong: 5, donGia: 135000 },
      { ten: "Giò bò cắt", soLuong: 5, donGia: 90000 }
    ],
    ship: 200000
  }
];

// ============ DỮ LIỆU BAO BÌ ============
// CHỈ BAO BÌ — không gồm nước
// Tổng: 3,393,799đ

const PACKAGING = [
  { ngay: "2026-03-17", ten: "Túi đựng bánh mì 1000 cái", tongTien: 242760 },
  { ngay: "2026-03-17", ten: "Túi nilon đựng bánh mì 1kg", tongTien: 57000 },
  { ngay: "2026-03-19", ten: "Khăn ướt 500 cái", tongTien: 50000 },
  { ngay: "2026-03-29", ten: "Túi nilon đựng bánh mì 5kg", tongTien: 281400 },
  { ngay: "2026-04-01", ten: "Khăn ướt 1000 cái", tongTien: 188000 },
  { ngay: "2026-04-12", ten: "Túi đựng bánh mì 2000 cái", tongTien: 468800 },
  { ngay: "2026-04-30", ten: "Khăn ướt 1500 cái", tongTien: 216650 },
  { ngay: "2026-05-21", ten: "Túi đựng bánh mì 2000 cái", tongTien: 484500 },
  { ngay: "2026-06-25", ten: "Khăn ướt 1500 cái", tongTien: 211650 },
  { ngay: "2026-09-07", ten: "Khăn ướt 3500 cái", tongTien: 487900 },
  { ngay: "2026-09-07", ten: "Túi giấy đựng bánh mì 2000 cái", tongTien: 496860 },
  { ngay: "2026-09-07", ten: "Giấy rút 2 thùng", tongTien: 208279 }
];

// ============ TÍNH TOÁN ============
function tinhTongTienPurchase(p) {
  if (p.tongTienGhiTay) return p.tongTienGhiTay;
  let tong = p.ship || 0;
  p.matHang.forEach(m => {
    tong += (m.soLuong || 0) * (m.donGia || 0);
  });
  return tong;
}