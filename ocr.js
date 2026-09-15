// ============ OCR HÓA ĐƠN VỚI TESSERACT.JS ============

// Mapping tên món trên hóa đơn → tên món trong app
const OCR_MAPPING = {
  // Bơ
  'sốt bơ trứng': 'Bơ',
  'sốt bơ': 'Bơ',
  'bơ': 'Bơ',
  'bo': 'Bơ',
  'sot bo trung': 'Bơ',
  
  // Patê
  'pate sg ht': 'Patê',
  'pate': 'Patê',
  'patê': 'Patê',
  'pate sg': 'Patê',
  
  // Nem nướng
  'nem nướng': 'Nem nướng',
  'nem nuong': 'Nem nướng',
  'nem': 'Nem nướng',
  
  // Xúc xích tỏi
  'xúc xích tỏi cắt sẵn': 'Xúc xích tỏi cắt',
  'xúc xích tỏi': 'Xúc xích tỏi cắt',
  'xuc xich toi': 'Xúc xích tỏi cắt',
  'xúc xích': 'Xúc xích tỏi cắt',
  
  // Giò thủ
  'thủ ht cắt miếng': 'Giò thủ cắt',
  'thủ ht': 'Giò thủ cắt',
  'giò thủ cắt': 'Giò thủ cắt',
  'giò thủ': 'Giò thủ cắt',
  'gio thu': 'Giò thủ cắt',
  
  // Giò lụa
  'giò lụa l2 cắt sẵn': 'Giò lụa cắt',
  'giò lụa cắt': 'Giò lụa cắt',
  'giò lụa': 'Giò lụa cắt',
  'gio lua': 'Giò lụa cắt',
  
  // Da bao
  'dabao ht cắt sẵn': 'Da bao',
  'da bao cắt': 'Da bao',
  'da bao': 'Da bao',
  'dabao': 'Da bao',
  
  // Ruốc
  'ruốc xù ngọt': 'Ruốc xù ngọt',
  'ruốc xù': 'Ruốc xù ngọt',
  'ruốc': 'Ruốc xù ngọt',
  'ruoc xu ngot': 'Ruốc xù ngọt',
  'ruoc': 'Ruốc xù ngọt',
  
  // Giò bò
  'giò bò ht cắt sẵn': 'Giò bò cắt',
  'giò bò cắt': 'Giò bò cắt',
  'giò bò': 'Giò bò cắt',
  'gio bo': 'Giò bò cắt'
};

// Load mapping bổ sung từ localStorage
function getCustomMapping() {
  try {
    return JSON.parse(localStorage.getItem('ocrCustomMapping') || '{}');
  } catch {
    return {};
  }
}

function saveCustomMapping(map) {
  localStorage.setItem('ocrCustomMapping', JSON.stringify(map));
}

// Chuẩn hóa tên món (bỏ dấu, lowercase, xóa khoảng trắng thừa)
function normalizeName(name) {
  return name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}

// Tìm tên món chuẩn từ tên OCR
function mapTenMon(tenOCR) {
  const norm = normalizeName(tenOCR);
  const customMap = getCustomMapping();
  
  // Kiểm tra custom mapping trước
  if (customMap[norm]) return customMap[norm];
  
  // Kiểm tra mapping có sẵn
  for (const [key, value] of Object.entries(OCR_MAPPING)) {
    if (norm.includes(key)) return value;
  }
  
  // Không tìm thấy → trả về tên gốc
  return tenOCR.trim();
}

// ============ OCR VỚI TESSERACT.JS ============
let tesseractWorker = null;

async function initTesseract() {
  if (tesseractWorker) return tesseractWorker;
  
  if (typeof Tesseract === 'undefined') {
    // Load Tesseract.js
    await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
  }
  
  console.log('⏳ Đang khởi tạo Tesseract...');
  tesseractWorker = await Tesseract.createWorker('vie');
  console.log('✅ Tesseract sẵn sàng');
  return tesseractWorker;
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

// Đọc text từ ảnh
async function ocrImage(imageFile) {
  const worker = await initTesseract();
  const result = await worker.recognize(imageFile);
  return result.data.text;
}

// ============ PARSE TEXT HÓA ĐƠN ============
// Input: text OCR (đã đọc từ ảnh)
// Output: mảng mặt hàng [{ten, soLuong, donGia}]
function parseHoaDonText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const matHang = [];
  
  // Regex tìm pattern: tên món → đơn giá SL thành tiền
  // Hóa đơn bmtuankhang có layout:
  // [Tên món]
  // [Đơn giá]   [SL]   [Thành tiền]
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Tìm dòng có 3 số: đơn giá, SL, thành tiền
    // VD: "75,000    5    375,000" hoặc "75000 5 375000"
    const match = line.match(/^([\d,\.]+)\s+(\d+)\s+([\d,\.]+)$/);
    
    if (match) {
      // Dòng trước đó là tên món
      const tenMon = lines[i - 1] || '';
      
      // Bỏ qua nếu tên món không hợp lệ
      if (tenMon && !tenMon.match(/^[\d,\.\s]+$/)) {
        const donGia = parseInt(match[1].replace(/[,\.]/g, ''));
        const soLuong = parseInt(match[2]);
        const thanhTien = parseInt(match[3].replace(/[,\.]/g, ''));
        
        // Verify: donGia × SL = thanhTien (cho phép sai số 1%)
        const check = donGia * soLuong;
        if (Math.abs(check - thanhTien) / thanhTien < 0.05) {
          matHang.push({
            ten: mapTenMon(tenMon),
            tenGoc: tenMon,
            soLuong: soLuong,
            donGia: donGia
          });
        }
      }
    }
    i++;
  }
  
  // Tìm tổng tiền cuối
  let tongTien = 0;
  for (const line of lines) {
    const m = line.match(/tổng cộng[:\s]*([\d,\.]+)/i);
    if (m) {
      tongTien = parseInt(m[1].replace(/[,\.]/g, ''));
      break;
    }
  }
  
  return { matHang, tongTien };
}

// ============ XỬ LÝ KHI MẸ UPLOAD ẢNH ============
async function processHoaDonImage(imageFile) {
  try {
    console.log('📷 Bắt đầu OCR...');
    const text = await ocrImage(imageFile);
    console.log('📝 Text OCR:', text.substring(0, 500));
    
    const parsed = parseHoaDonText(text);
    console.log('✅ Đã parse', parsed.matHang.length, 'mặt hàng');
    
    return parsed;
  } catch (err) {
    console.error('❌ OCR lỗi:', err);
    throw err;
  }
}