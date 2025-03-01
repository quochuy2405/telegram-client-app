import React, { useState } from "react";
import { sendMessage } from "../telegramClient"; // Import sendMessage
import Message from "./message";

interface Chat {
	id: string;
	title: string;
  unreadCount: number;
  
}

interface MessageData {
	id: number;
	text: string;
	sender?: string;
	date: string;
	isOutgoing?: boolean;
}

interface MessageAreaProps {
	selectedChat: Chat | null;
	messages: MessageData[];
	onNewMessage: (message: MessageData) => void; // Callback để cập nhật tin nhắn mới
}

const MessageArea: React.FC<MessageAreaProps> = ({ selectedChat, messages, onNewMessage }) => {
	const [inputText, setInputText] = useState<string>("");

	const handleSendMessage = async () => {
		if (!selectedChat || !inputText.trim()) return;

		try {
			const result = await sendMessage(selectedChat.id, inputText);
			if (result.success) {
				const newMessage: MessageData = {
					id: result.messageId!,
					text: inputText,
					date: new Date().toLocaleTimeString(),
					isOutgoing: true,
				};
				onNewMessage(newMessage); // Thêm tin nhắn vừa gửi vào danh sách
				setInputText(""); // Xóa input sau khi gửi
			}
		} catch (error) {
			console.error("Error sending message:", error);
		}
	};
	const getAvatar = (title: string) => {
		if (!title) return "T";
		const initials = title
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase())
			.join(""); // Use initials as fallback
		return initials;
	};

	return (
		<div className='flex-1 h-screen flex flex-col bg-[url(https://i.pinimg.com/736x/57/98/2b/57982b5a0be074961ef9299d00c46d65.jpg)] bg-contain'>
			{selectedChat ? (
				<>
					{/* Header */}
					<div className='bg-white p-2 px-4 text-gray-800 flex items-center shadow-md'>
						{/* Avatar */}
						<div className='w-10 h-10 rounded-full overflow-hidden mr-4'>
							<div className='w-full h-full bg-blue-500 text-white flex items-center justify-center'>
								<span className='text-xs font-semibold'>{getAvatar(selectedChat.title)}</span>
							</div>
						</div>
						{/* Chat title */}
						<h2 className='text-base font-semibold flex-1'>{selectedChat.title}</h2>
						{/* Unread count */}
						<span className='text-sm'>
							{selectedChat.unreadCount > 0 ? `${selectedChat.unreadCount} unread` : ""}
						</span>
					</div>

					{/* Messages */}
					<div className='flex-1 p-4 overflow-y-auto'>
						{messages.reverse().map((msg) => (
							<Message
								key={msg.id}
								id={msg.id}
								text={msg.text}
								sender={msg.sender}
								date={msg.date}
								isOutgoing={msg.isOutgoing}
							/>
						))}
					</div>

					{/* Input */}
					<div className='bg-white p-4 border-t border-gray-200 flex items-center'>
						<input
							type='text'
							placeholder='Type a message'
							value={inputText}
							onChange={(e) => setInputText(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && handleSendMessage()} // Gửi khi nhấn Enter
							className='flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#0088cc]'
						/>
						<button
							onClick={handleSendMessage}
							className='ml-2 bg-[#0088cc] text-white p-2 rounded-full hover:bg-[#0077b3]'>
							<svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
								<path d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' />
							</svg>
						</button>
					</div>
				</>
			) : (
				<div className='flex-1 flex items-center font-semibold justify-center text-white'>
					<p>Select a chat to start messaging</p>
				</div>
			)}
		</div>
	);
};

export default MessageArea;
