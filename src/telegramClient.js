
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const apiId = process.env.REACT_APP_TELEGRAM_API_ID;
const apiHash = process.env.REACT_APP_TELEGRAM_API_HASH;

const session = new StringSession(''); // Session sẽ được lưu sau khi đăng nhập

const client = new TelegramClient(session, Number(apiId), apiHash, {
  connectionRetries: 5,
  useWSS: true,

});
// Hàm đăng nhập bằng QR code
async function loginWithQR(callback) {
  console.log('Loading QR login...');
  await client.connect();

  await client.signInUserWithQrCode(
    { apiId: Number(apiId), apiHash },
    {
      // Không cần số điện thoại, chỉ dùng QR code
      phoneNumber: undefined, // Hoặc thay bằng <MY_NUMBER> nếu muốn
      password: async () => undefined, // Không yêu cầu mật khẩu
      phoneCode: async () => undefined, // Không yêu cầu mã xác nhận
      onError: (err) => console.log(`LOGIN ERROR => ${err}`),
      qrCode: async (qrCode) => {
        const url = `tg://login?token=${Buffer.from(qrCode.token).toString('base64')}`;
        console.log('QR Token:', qrCode.token, 'Expires:', qrCode.expires);
        callback(url); // Truyền URL QR lên giao diện
      },
    }
  );

  console.log('You should now be connected.');
  const sessionString = client.session.save();
  console.log('Save this session string to avoid logging in again:', sessionString);
  localStorage.setItem('telegramSession', sessionString); // Lưu session
  await client.sendMessage('me', { message: 'Hello from React with QR!' }); // Gửi tin nhắn thử
  return client;
}

// Hàm kiểm tra và tái sử dụng session
async function getClient() {
  const savedSession = localStorage.getItem('telegramSession');
  if (savedSession) {
    client.session.setDC(2, '149.154.167.50', 443); // Telegram DC mặc định
    client.session.load(savedSession);
    await client.connect();
    if (await client.checkAuthorization()) {
      return client;
    }
  }
  return null;
}

// Hàm lấy danh sách chat
async function getChats() {
  const chats = await client.getDialogs({});
  return chats.map((chat) => ({
    id: chat.id.toString(),
    title: chat.title,
    unreadCount: chat.unreadCount,
  }));
}

module.exports = { loginWithQR, getClient, getChats, client };