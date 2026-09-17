// ============ VERCEL SERVERLESS FUNCTION ============
// Nhận webhook từ Telegram, parse tin nhắn, ghi vào Firestore

const admin = require('firebase-admin');
const { parseMessage, formatConfirmation } = require('./parser');

// ============ CẤU HÌNH ============
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8874977011:AAFzNvm70I6NfaETG4bSqnnKlPRbjDD7TyA';
const ALLOWED_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1004491860137';

// ============ FIREBASE ADMIN ============
let firebaseInitialized = false;

function initFirebase() {
  if (firebaseInitialized) return;
  
  try {
    // Dùng service account từ environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    
    if (serviceAccount.project_id) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized');
    } else {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT chưa được set');
    }
  } catch (err) {
    console.error('❌ Firebase init error:', err.message);
  }
}

// ============ TELEGRAM HELPERS ============
async function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  });
  return response.json();
}

// ============ MAIN HANDLER ============
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'Webhook is running' });
  }
  
  try {
    // Khởi tạo Firebase
    initFirebase();
    
    const update = req.body;
    console.log('📨 Nhận update:', JSON.stringify(update).substring(0, 300));
    
    // Chỉ xử lý tin nhắn text
    if (!update.message || !update.message.text) {
      return res.status(200).json({ ok: true, skipped: 'no text' });
    }
    
    const msg = update.message;
    const chatId = msg.chat.id.toString();
    const text = msg.text;
    const messageDate = new Date(msg.date * 1000); // Telegram date là Unix timestamp
    
    // Chỉ xử lý tin nhắn từ nhóm của mẹ
    if (chatId !== ALLOWED_CHAT_ID.toString()) {
      console.log(`⏭️ Bỏ qua tin nhắn từ chat ${chatId} (không phải nhóm cho phép)`);
      return res.status(200).json({ ok: true, skipped: 'wrong chat' });
    }
    
    // Bỏ qua tin nhắn của bot
    if (msg.from && msg.from.is_bot) {
      return res.status(200).json({ ok: true, skipped: 'bot message' });
    }
    
    // Bỏ qua tin nhắn bắt đầu bằng /
    if (text.startsWith('/')) {
      console.log('⏭️ Bỏ qua command');
      return res.status(200).json({ ok: true, skipped: 'command' });
    }
    
    // ============ PARSE TIN NHẮN ============
    const parsed = parseMessage(text);
    
    if (!parsed) {
      console.log('⚠️ Không parse được tin nhắn');
      await sendMessage(chatId, 
        '⚠️ Bot không hiểu tin nhắn này.\n\n' +
        'Vui lòng nhắn theo mẫu:\n' +
        '• Số bánh nhập: 30+11 (cũ)\n' +
        '• Bánh bán ra trong ngày: 31\n' +
        '• Số bánh 20k: 7\n' +
        '• Nước: 3\n' +
        '• Tổng tiền thu được: 530+147\n' +
        '• Tiền tồn: 152\n' +
        '• Tiền lấy hàng: 60(bánh mì)+20(rau mùi)\n' +
        '• Tiền cất đi: 400'
      );
      return res.status(200).json({ ok: true, error: 'parse_failed' });
    }
    
    // ============ TẠO DATE KEY (theo giờ Việt Nam) ============
    // Chuyển sang giờ VN (UTC+7)
    const vnTime = new Date(messageDate.getTime() + 7 * 60 * 60 * 1000);
    const year = vnTime.getUTCFullYear();
    const month = String(vnTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(vnTime.getUTCDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    
    // ============ GHI VÀO FIRESTORE ============
    if (!firebaseInitialized) {
      console.error('❌ Firebase chưa init, không ghi được');
      await sendMessage(chatId, '❌ Lỗi server: Firebase chưa kết nối. Báo admin kiểm tra.');
      return res.status(500).json({ ok: false, error: 'firebase_not_ready' });
    }
    
    const db = admin.firestore();
    const docRef = db.collection('doanhthu').doc(dateKey);
    
    // Lấy dữ liệu cũ (nếu có) để so sánh
    const oldDoc = await docRef.get();
    const oldData = oldDoc.exists ? oldDoc.data() : null;
    
    // Ghi đè (merge)
    const dataToSave = {
      nhapMoi: parsed.nhapMoi,
      tonDau: parsed.tonDau,
      banhKhong: parsed.banhKhong,
      banh15: parsed.banh15,
      banh20: parsed.banh20,
      nuoc: parsed.nuoc,
      tienLeDau: parsed.tienLeDau,
      tienCat: parsed.tienCat,
      chiPhi: parsed.chiPhi,
      ghiChu: '',
      tongBanhBan: parsed.tongBanhBan,
      tienBan: parsed.tienBan,
      tongChiPhi: parsed.tongChiPhi,
      tienTon: parsed.tienTon,
      // Meta
      telegramMessageId: msg.message_id,
      telegramTimestamp: msg.date,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'telegram_bot'
    };
    
    await docRef.set(dataToSave, { merge: true });
    
    console.log(`✅ Đã ghi Firestore: ${dateKey}`);
    
    // ============ GỬI TIN NHẮN XÁC NHẬN ============
    const confirmMsg = formatConfirmation(dateKey, dataToSave);
    await sendMessage(chatId, confirmMsg);
    
    // ============ TRẢ VỀ OK ============
    return res.status(200).json({ 
      ok: true, 
      dateKey, 
      saved: true,
      oldData: oldData ? 'existed' : 'new'
    });
    
  } catch (err) {
    console.error('❌ Lỗi xử lý webhook:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

