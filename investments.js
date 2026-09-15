// ============ DỮ LIỆU CHI PHÍ ĐẦU TƯ BAN ĐẦU ============
// Gộp các mục giống nhau theo yêu cầu
// Tổng: ~28,120,428đ

const DEFAULT_INVESTMENTS = [
  { id: 1, ten: "Xe đẩy", soLuong: "1", tongTien: 3500000 },
  { id: 2, ten: "Ổ cắm điện Deli", soLuong: "2", tongTien: 157000 },
  { id: 3, ten: "Tủ lạnh Toshiba 555 lít", soLuong: "1", tongTien: 10472000 },
  { id: 4, ten: "Thùng rác Hiro Inochi", soLuong: "1", tongTien: 140000 },
  { id: 5, ten: "Loa bluetooth", soLuong: "1", tongTien: 91000 },
  { id: 6, ten: "Ghế thư giãn màu vàng", soLuong: "1", tongTien: 1528000 },
  { id: 7, ten: "Máy thái lát rau củ", soLuong: "1", tongTien: 445000 },
  { id: 8, ten: "Thùng đá vuông giữ nhiệt 45L", soLuong: "1", tongTien: 419000 },
  { id: 9, ten: "Nồi chiên không dầu", soLuong: "2", tongTien: 1600000 },
  { id: 10, ten: "Bộ khay inox trưng bày", soLuong: "3", tongTien: 1513500 },
  { id: 11, ten: "Mèo thần tài", soLuong: "1", tongTien: 260000 },
  { id: 12, ten: "Bình nước rửa tay", soLuong: "1", tongTien: 246000 },
  { id: 13, ten: "Keo ốp lát kiêm chít mạch gạch", soLuong: "8kg", tongTien: 174000 },
  { id: 14, ten: "Gạch mosaic gốm sứ", soLuong: "2m2", tongTien: 1100000 },
  { id: 15, ten: "Kệ lavabo sắt mỹ thuật", soLuong: "1", tongTien: 648000 },
  { id: 16, ten: "Bồn rửa mặt, vòi, xả đồng", soLuong: "1", tongTien: 1578000 },
  { id: 17, ten: "Công thợ lắp bồn rửa và làm dốc", soLuong: "1", tongTien: 1500000 },
  { id: 18, ten: "Chai đựng nước sốt", soLuong: "2", tongTien: 94408 },
  { id: 19, ten: "Ghế đôn sắt", soLuong: "6", tongTien: 770260 },
  { id: 20, ten: "Ly thuỷ tinh", soLuong: "11", tongTien: 272520 },
  { id: 21, ten: "Trọn bộ phun sương làm mát", soLuong: "1", tongTien: 737410 },
  { id: 22, ten: "Giấy gỗ dán tường", soLuong: "80m", tongTien: 475180 }
];

// Lưu lên Firebase
async function saveInvestmentsToFirebase(list) {
  if (!firebaseReady) throw new Error('Firebase chưa sẵn sàng');
  await firestore.collection('dautu').doc('danhsach').set({
    list: list,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  console.log('☁️ Đã lưu chi phí đầu tư lên Firebase');
}

// Load từ Firebase
async function loadInvestmentsFromFirebase() {
  if (!firebaseReady) return null;
  try {
    const doc = await firestore.collection('dautu').doc('danhsach').get();
    if (doc.exists && doc.data().list) {
      console.log(`📥 Đã tải ${doc.data().list.length} mục đầu tư`);
      return doc.data().list;
    }
    return null;
  } catch (err) {
    console.warn('⚠️ Không load được đầu tư:', err.message);
    return null;
  }
}

// Format tiền
function fmtTien(n) {
  return (n || 0).toLocaleString('vi-VN') + 'đ';
}