import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';

// Định nghĩa các interface cho dữ liệu
interface Chat {
  id: string;
  title: string;
  unreadCount: number;
}

interface Message {
  id: number;
  chatId: string;
  text: string;
  date: Date;
  isOutgoing: boolean;
  senderId?: string;
  media?: {
    type: string;
    photo?: {
      id: string;
    };
  } | null;
}

interface SendResult {
  success: boolean;
  messageId?: number;
  date?: number;
  error?: any;
}

interface QRCodeData {
  token: Buffer;
  expires: number;
}

const apiId = process.env.REACT_APP_TELEGRAM_API_ID
	? parseInt(process.env.REACT_APP_TELEGRAM_API_ID, 10)
	: 0;
const apiHash = process.env.REACT_APP_TELEGRAM_API_HASH
	? process.env.REACT_APP_TELEGRAM_API_HASH
	: "";
const client_options = {
	systemLanguage: "en",
	systemVersion: "Windows 11",
	deviceType: "Desktop",
	appVersion: "2.7.1",
};
const session = new StringSession("");
let client = new TelegramClient(session, apiId, apiHash, {
	connectionRetries: 5,
	useWSS: true,
	...client_options,
});

// Hàm đăng nhập bằng QR code
async function loginWithQR(callback: (url: string) => void): Promise<TelegramClient> {
	console.log("Loading QR login...");
	await client.connect();

	await client.signInUserWithQrCode(
		{ apiId, apiHash },
		{
			onError: (err: any) => console.log(`LOGIN ERROR => ${err}`),
			qrCode: async (qrCode: QRCodeData) => {
				const url = `tg://login?token=${Buffer.from(qrCode.token).toString("base64")}`;
				console.log("QR Token:", qrCode.token, "Expires:", qrCode.expires);
				callback(url);
			},
		}
	);

	console.log("You should now be connected.");
	const sessionString: any = client.session.save();
	console.log("Save this session string:", sessionString);
	localStorage.setItem("telegramSession", sessionString);
	await client.sendMessage("me", { message: "Hello from React with QR!" });
	return client;
}

// Hàm kiểm tra và tái sử dụng session
// Hàm kiểm tra và tái sử dụng session
async function getClient(): Promise<TelegramClient | null> {
	const savedSession = localStorage.getItem("telegramSession");
	console.log("Checking saved session:", savedSession);

	if (savedSession) {
		try {
			const session = new StringSession(savedSession); // Tạo session từ chuỗi đã lưu
			client = new TelegramClient(session, apiId, apiHash, {
				connectionRetries: 5,
				useWSS: true,
				...client_options,
			});

			console.log("Setting DC for session...");
			// client.session.setDC(2, "149.154.167.50", 443);

			console.log("Connecting to Telegram...");
			await client.connect();

			console.log("Checking authorization...");
			const isAuthorized = await client.checkAuthorization();
			console.log("Is authorized:", isAuthorized);

			if (isAuthorized) {
				console.log("Session is valid, auto-login successful");
				return client;
			} else {
				console.log("Session invalid, removing from localStorage");
				localStorage.removeItem("telegramSession");
			}
		} catch (error) {
			console.error("Error during session check:", error);
			localStorage.removeItem("telegramSession"); // Xóa session nếu có lỗi
		}
	} else {
		console.log("No session found in localStorage");
	}
	console.log("Returning null, need to login");
	return null;
}

// Hàm lấy danh sách chat
async function getChats(): Promise<Chat[]> {
  await client.connect();
  const chats = await client.getDialogs({});
  return chats.map((chat:any) => ({
    id: chat?.id.toString(),
    title: chat.title,
    unreadCount: chat.unreadCount,
  }));
}

// Hàm gửi tin nhắn văn bản
async function sendMessage(chatId: string, message: string): Promise<SendResult> {
  try {
    await client.connect();
    const result = await client.sendMessage(chatId, { message });
    return {
      success: true,
      messageId: result.id,
      date: result.date,
    };
  } catch (error) {
    console.error('Send message error:', error);
    return { success: false, error };
  }
}

// Hàm gửi tin nhắn với ảnh
async function sendPhoto(chatId: string, photoPath: string, caption: string = ''): Promise<SendResult> {
  try {
    await client.connect();
    const result = await client.sendFile(chatId, {
      file: photoPath,
      caption,
      forceDocument: false,
    });
    return {
      success: true,
      messageId: result.id,
      date: result.date,
    };
  } catch (error) {
    console.error('Send photo error:', error);
    return { success: false, error };
  }
}

// Hàm lắng nghe tin nhắn mới
function listenNewMessages(callback: (message: Message) => void): void {
  client.addEventHandler((update) => {
    if (update.className === 'UpdateNewMessage' || update.className === 'UpdateNewChannelMessage') {
      const message = update.message;
      const chatId = message.peerId.chatId || message.peerId.userId || message.peerId.channelId;

      const newMessage: Message = {
        id: message.id,
        chatId: chatId.toString(),
        text: message.message,
        date: new Date(message.date * 1000),
        isOutgoing: message.out,
        senderId: message.fromId?.userId?.toString(),
      };

      if (!message.out) {
        showNotification({
          chatId: chatId.toString(),
          text: message.message,
          sender: message.fromId?.userId?.toString(),
        });
      }

      callback(newMessage);
    }
  });
}

// Hàm hiển thị thông báo
function showNotification({ chatId, text, sender }: { chatId: string; text: string; sender?: string }): void {
  if (Notification.permission === 'granted') {
    new Notification('New Telegram Message', {
      body: `${sender}: ${text}`,
      tag: chatId,
      icon: '/telegram-icon.png',
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showNotification({ chatId, text, sender });
      }
    });
  }
}

// Hàm lấy lịch sử tin nhắn
async function getMessages(chatId: string, limit: number = 50) {
  try {
    await client.connect();
    const messages = await client.getMessages(chatId, { limit });
    return messages?.map((msg:any) => ({
      id: msg?.id,
      chatId: chatId.toString(),
      text: msg?.message,
      date: new Date(msg?.date * 1000),
      isOutgoing: !!msg?.out,
      senderId: msg?.fromId?.userId?.toString(),
      media: msg?.media ? {
        type: msg?.media.className,
        photo: msg.media.photo ? {
          id: msg.media.photo.id.toString(),
        } : null,
      } : null,
    }));
  } catch (error) {
    console.error('Get messages error:', error);
    return [];
  }
}

// Hàm đánh dấu tin nhắn đã đọc
async function markAsRead(chatId: string): Promise<{ success: boolean; error?: any }> {
  try {
    await client.connect();
    // await client.invoke(new Api.messages.MarkDialogUnread({
    //   peer: chatId,
    // }));
    return { success: true };
  } catch (error) {
    console.error('Mark as read error:', error);
    return { success: false, error };
  }
}

export {
  loginWithQR,
  getClient,
  getChats,
  sendMessage,
  sendPhoto,
  listenNewMessages,
  getMessages,
  markAsRead,
  client,
};
