import {
	ChatContainer,
	MainContainer,
	MessageInput,
	MessageList,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import React from "react";
import { sendMessage } from "../telegramClient"; // Import sendMessage
import InputMessage from "./input-message";
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
	date: any;
	isOutgoing?: boolean;
}

interface MessageAreaProps {
	selectedChat: Chat | null;
	refScroll: React.RefObject<HTMLDivElement | null>;
	messages: MessageData[];
	onNewMessage: (message: MessageData) => void; // Callback để cập nhật tin nhắn mới
}

const MessageArea: React.FC<MessageAreaProps> = ({
	selectedChat,
	refScroll,
	messages,
	onNewMessage,
}) => {
	const handleSendMessage = async (inputText: string, onClear?: () => void) => {
		if (!selectedChat || !inputText.trim()) return;

		try {
			const result = await sendMessage(selectedChat.id, inputText);
			if (result.success) {
				const newMessage: MessageData = {
					id: result.messageId!,
					text: inputText,
					date: Date.now(),
					isOutgoing: true,
				};
				onNewMessage(newMessage); // Thêm tin nhắn vừa gửi vào danh sách
				onClear?.();
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
					<div style={{ position: "relative", height: "calc(100% - 56px)" }}>
						<MainContainer>
							<ChatContainer>
								<MessageList ref={refScroll}>
									{messages
										.sort((a, b) => a.id - b.id)
										.map((message) => (
											<Message
												key={message.id}
												id={message.id}
												text={message.text}
												sender={message.sender}
												date={message.date}
												isOutgoing={message.isOutgoing}
											/>
										))}
								</MessageList>
								<MessageInput
									onSend={(_, textContent) => handleSendMessage(textContent, () => {})}
									placeholder='Type message here'
								/>
							</ChatContainer>
						</MainContainer>
					</div>

					{/* Input */}
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
