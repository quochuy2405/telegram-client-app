import React, { useState, useEffect } from "react";
import { loginWithQR, getClient, getChats, client, listenNewMessages } from "./telegramClient";
import "./styles/globals.css";
import { ChatList, Login, MessageArea } from "./components";

interface Chat {
	id: string;
	title: string;
	unreadCount: number;
}

interface Message {
	id: number;
	text: string;
	sender?: string;
	date: any;
	isOutgoing?: boolean;
}

const App: React.FC = () => {
	const [qrUrl, setQrUrl] = useState<string>("");
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [chats, setChats] = useState<Chat[]>([]);
	const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true); // Thêm state để kiểm tra loading
	const refScroll = React.useRef<any>(null);
	// Kiểm tra session và tự động đăng nhập
	useEffect(() => {
		const initializeApp = async () => {
			setIsLoading(true);
			const existingClient = await getClient();
			if (existingClient) {
				// Nếu có session hợp lệ, tự động đăng nhập
				setIsLoggedIn(true);
				const chatList = await getChats();
				setChats(chatList);
				setupMessageListener();
			} else {
				// Nếu không có session, yêu cầu đăng nhập bằng QR
				handleLogin();
			}
			setIsLoading(false);
		};
		initializeApp();
	}, []);

	// Đăng nhập bằng QR code
	const handleLogin = async () => {
		await loginWithQR((url: string) => setQrUrl(url));
		setIsLoggedIn(true);
		const chatList = await getChats();
		setChats(chatList);
		setupMessageListener();
	};

	// Lắng nghe tin nhắn mới
	const setupMessageListener = () => {
		listenNewMessages((newMessage) => {
			if (newMessage.chatId === selectedChat?.id) {
				console.log("newMessage", newMessage);
				setMessages((prevMessages) => [
					...prevMessages,
					{
						...newMessage,
						chatId: newMessage.chatId || selectedChat?.id,
					},
				]);
			}

			setTimeout(() => {
				refScroll.current?.scrollIntoView({ behavior: "smooth", block: "end" });
			}, 300);
			// Cập nhật unreadCount nếu tin nhắn đến từ chat khác
			setChats((prevChats) =>
				prevChats.map((chat) =>
					chat.id === newMessage?.chatId && !newMessage.isOutgoing
						? { ...chat, unreadCount: chat.unreadCount + 1 }
						: chat
				)
			);
		});
	};

	// Chọn chat và lấy tin nhắn
	const handleChatSelect = async (chat: Chat) => {
		setSelectedChat(chat);
		try {
			const chatMessages = await client.getMessages(chat.id, { limit: 30 });
			setMessages(
				chatMessages.map((msg: any) => ({
					id: msg.id,
					text: msg.message,
					sender: msg.senderId?.toString(),
					date: msg.date,
					isOutgoing: msg.out,
				}))
			);
			refScroll.current?.scrollToBottom();
		} catch (err) {
			console.error("Error fetching messages:", err);
		}
	};

	// Xử lý tin nhắn mới từ MessageArea
	const handleNewMessage = (newMessage: Message) => {
		console.log("refScroll.current", refScroll.current);
		setMessages((prevMessages) => [newMessage, ...prevMessages]);
		refScroll.current?.scrollToBottom();
	};

	// Hiển thị loading khi đang kiểm tra session
	if (isLoading) {
		return (
			<div className='h-screen w-full flex flex-col items-center justify-center bg-white'>
				<img
					src='https://www.svgrepo.com/show/452115/telegram.svg'
					alt='telegram'
					className='w-40 h-40 animate-pulse'
				/>
			</div>
		);
	}
	console.log("messages", messages);
	return (
		<div className='h-screen w-full flex'>
			{!isLoggedIn ? (
				<Login qrUrl={qrUrl} onLogin={handleLogin} />
			) : (
				<>
					<ChatList chats={chats} selectedChat={selectedChat} onChatSelect={handleChatSelect} />
					<MessageArea
						refScroll={refScroll}
						selectedChat={selectedChat}
						messages={messages}
						onNewMessage={handleNewMessage}
					/>
				</>
			)}
		</div>
	);
};

export default App;
