// ============ PARSE TIN NHẮN BÁO CÁO DOANH THU ============
// Format mẫu:
// • Số bánh nhập: 30+11 (cũ)
// • Bánh bán ra trong ngày: 31
// • Số bánh 20k: 07
// • Nước: 20
// • Tổng tiền thu được: 530
// • Tiền tồn: 260
// • Tiền lấy hàng: 75
// • Tiền cất đi: 400

function parseMessage(text) {
  if (!text) return null;
  
  // Chuẩn hóa: bỏ dấu bullet, chuyển về lowercase để so sánh
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  const result = {
    tonDau: 0,
    nhapMoi: 0,
    banhKhong: 0,
    banh15: 0,
    banh20: 0,
    nuoc: 0,
    tienLeDau: 0,
    tienCat: 0,
    chiPhi: [],
    ghiChu: '',
    _raw: text
  };
  
  let totalBanh = 0;
  let parsed = {};
  
  for (const line of lines) {
    // Bỏ ký tự bullet đầu dòng
    const clean = line.replace(/^[•\-*·]\s*/, '').trim();
    if (!clean) continue;
    
    // Tách key: value
    const match = clean.match(/^(.+?):\s*(.+)$/);
    if (!match) continue;
    
    const key = match[1].toLowerCase().trim();
    const value = match[2].trim();
    
    // === Số bánh nhập ===
    // "Số bánh nhập: 30+11 (cũ)" hoặc "Số bánh nhập: 30"
    if (key.includes('bánh nhập') || key.includes('số bánh nhập')) {
      const nums = value.match(/\d+/g);
      if (nums && nums.length >= 2) {
        // "30+11 (cũ)" → nhapMoi=30, tonDau=11
        parsed.nhapMoi = parseInt(nums[0]);
        parsed.tonDau = parseInt(nums[1]);
      } else if (nums && nums.length === 1) {
        parsed.nhapMoi = parseInt(nums[0]);
      }
    }
    
    // === Bánh bán ra ===
    // "Bánh bán ra trong ngày: 31" hoặc "Bánh bán ra trong ngày: 22+1(mì không)"
    if (key.includes('bánh bán ra') || key.includes('bánh bán')) {
      // Tách các phần: "22+1(mì không)" → 22 + 1
      // "32+3(mì không)" → 32 + 3
      // "50+1(mì không)" → 50 + 1
      const mainMatch = value.match(/^(\d+)/);
      if (mainMatch) {
        totalBanh += parseInt(mainMatch[1]);
      }
      
      // Tìm phần "mì không" hoặc "bánh không" trong ngoặc
      const miKhongMatch = value.match(/\+(\d+)\s*\(/);
      if (miKhongMatch) {
        parsed.banhKhong = (parsed.banhKhong || 0) + parseInt(miKhongMatch[1]);
        totalBanh += parseInt(miKhongMatch[1]);
      }
    }
    
    // === Số bánh 20k ===
    // "Số bánh 20k: 07" hoặc "Số bánh 20k: 13 +2(nem)"
    if (key.includes('20k') || key.includes('bánh 20')) {
      const nums = value.match(/\d+/g);
      if (nums) {
        parsed.banh20 = parseInt(nums[0]);
      }
    }
    
    // === Nước ===
    // "Nước: 20" hoặc "Nước: 2nợ1"
    if (key === 'nước' || key.startsWith('nước')) {
      const m = value.match(/^(\d+)/);
      if (m) parsed.nuoc = parseInt(m[1]);
    }
    
    // === Tổng tiền thu được ===
    // "Tổng tiền thu được: 530" hoặc "Tổng tiền thu được: 485+147"
    // Đây là tiền bán + tiền lẻ đầu ngày
    if (key.includes('tổng tiền thu') || key.includes('tiền thu')) {
      // Bỏ phần "(tồn hôm trước)", "(mì không)"... để lấy số chính
      const mainValue = value.split('(')[0].trim();
      const parts = mainValue.match(/\d+/g);
      if (parts && parts.length >= 1) {
        // Số đầu tiên = tiền bán hàng
        parsed.tienBan = parseInt(parts[0]) * 1000;
        // Nếu có số thứ 2 = tiền lẻ đầu ngày
        if (parts.length >= 2) {
          parsed.tienLeDau = parseInt(parts[1]) * 1000;
        }
      }
    }
    
    // === Tiền tồn ===
    if (key.includes('tiền tồn') || key === 'tồn') {
      const m = value.match(/\d+/);
      if (m) parsed.tienTonThuc = parseInt(m[0]) * 1000;
    }
    
    // === Tiền lấy hàng ===
    // "Tiền lấy hàng: 75" hoặc "Tiền lấy hàng: 60(bánh mì)+15(rau mùi)+23(củ cải)+12(dấm)"
    if (key.includes('tiền lấy hàng') || key.includes('lấy hàng')) {
      // Parse các khoản chi phí
      // Pattern: số + (tên)
      const matches = value.matchAll(/(\d+)\s*(?:\(([^)]+)\)|([a-zA-Zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ\s]+))?/gi);
      
      const chiPhi = [];
      let tong = 0;
      
      // Tách theo dấu +
      const parts = value.split('+');
      for (const part of parts) {
        const trimmed = part.trim();
        // Match: "60(bánh mì)" hoặc "60" hoặc "bánh mì 60" 
        const m = trimmed.match(/^(\d+)\s*(?:\(([^)]+)\))?/);
        if (m) {
          const soTien = parseInt(m[1]) * 1000;
          const ten = m[2] ? m[2].trim() : 'Khác';
          chiPhi.push({ ten, soTien });
          tong += soTien;
        } else {
          // "40(bánh mì)" hoặc "90 (bánh mì)"
          const m2 = trimmed.match(/(\d+)/);
          if (m2) {
            const soTien = parseInt(m2[1]) * 1000;
            chiPhi.push({ ten: 'Khác', soTien });
            tong += soTien;
          }
        }
      }
      
      parsed.chiPhi = chiPhi;
      parsed.tongChiPhi = tong;
    }
    
    // === Tiền cất đi ===
    if (key.includes('tiền cất đi') || key.includes('cất đi')) {
      const m = value.match(/\d+/);
      if (m) parsed.tienCat = parseInt(m[0]) * 1000;
    }
  }
  
  // === Tổng hợp ===
  result.tonDau = parsed.tonDau || 0;
  result.nhapMoi = parsed.nhapMoi || 0;
  result.banh20 = parsed.banh20 || 0;
  result.nuoc = parsed.nuoc || 0;
  result.tienCat = parsed.tienCat || 0;
  result.tienLeDau = parsed.tienLeDau || 0;
  result.chiPhi = parsed.chiPhi || [];
  result.tongChiPhi = parsed.tongChiPhi || 0;
  
  // Tổng bánh bán ra
  result.tongBanhBan = totalBanh;
  
  // Bánh không (mì không) đã có trong parsed.banhKhong
  result.banhKhong = parsed.banhKhong || 0;
  
  // Bánh 15k = tổng bánh - bánh không - bánh 20k
  // (mẹ chỉ ghi rõ 20k và mì không, còn lại là 15k)
  result.banh15 = Math.max(0, totalBanh - result.banhKhong - result.banh20);
  
  // Tiền bán hàng (nếu không parse được từ "Tổng tiền thu", tự tính)
  if (parsed.tienBan) {
    result.tienBan = parsed.tienBan;
  } else {
    result.tienBan = result.banhKhong * 4000 + 
                     result.banh15 * 15000 + 
                     result.banh20 * 20000 + 
                     result.nuoc * 15000;
  }
  
  // Tiền tồn = tiền lẻ đầu + tiền bán - chi phí - tiền cất
  result.tienTon = result.tienLeDau + result.tienBan - 
                   result.tongChiPhi - result.tienCat;
  
  // Nếu mẹ ghi rõ "Tiền tồn", dùng số đó
  if (parsed.tienTonThuc !== undefined) {
    result.tienTon = parsed.tienTonThuc;
  }
  
  // Kiểm tra có dữ liệu không
  const hasData = result.nhapMoi > 0 || result.tongBanhBan > 0 || 
                  result.tienCat > 0 || result.tienBan > 0;
  
  if (!hasData) return null;
  
  return result;
}

// ============ FORMAT TIN NHẮN XÁC NHẬN ============
function formatConfirmation(dateKey, data) {
  const fmt = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';
  
  let msg = `✅ Đã ghi dữ liệu ngày ${dateKey}\n\n`;
  msg += `🍞 Bánh mì:\n`;
  msg += `  • Tồn đầu: ${data.tonDau} cái\n`;
  msg += `  • Nhập mới: ${data.nhapMoi} cái\n`;
  msg += `  • Bán ra: ${data.tongBanhBan} cái\n`;
  msg += `  • (20k: ${data.banh20}, 15k: ${data.banh15}, mì không: ${data.banhKhong})\n`;
  msg += `  • Nước: ${data.nuoc} cốc\n\n`;
  
  if (data.chiPhi && data.chiPhi.length > 0) {
    msg += `💵 Chi phí:\n`;
    data.chiPhi.forEach(c => {
      msg += `  • ${c.ten}: ${fmt(c.soTien)}\n`;
    });
    msg += `  • Tổng: ${fmt(data.tongChiPhi)}\n\n`;
  }
  
  msg += `💰 Tiền:\n`;
  msg += `  • Tiền bán: ${fmt(data.tienBan)}\n`;
  msg += `  • Tiền cất đi: ${fmt(data.tienCat)}\n`;
  msg += `  • Tiền tồn: ${fmt(data.tienTon)}\n`;
  
  return msg;
}

module.exports = { parseMessage, formatConfirmation };
