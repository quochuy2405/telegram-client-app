import React from "react";

interface Chat {
	id: string;
	title: string;
	unreadCount: number;
	avatar?: string; // Optional avatar URL
}

interface ChatListProps {
	chats: Chat[];
	selectedChat: Chat | null;
	onChatSelect: (chat: Chat) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChat, onChatSelect }) => {
	// Function to generate a fallback avatar with initials
	const getAvatar = (title: string) => {
		if (!title) return null;
		const initials = title
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase())
			.join(""); // Use initials as fallback
		return initials;
	};

	return (
		<div className='w-1/5 border-r border-gray-200 h-screen overflow-y-auto'>
			<h1 className='flex items-center justify-center font-semibold text-gray-700 p-4 border-b border-gray-200 text-sm'>Chats</h1>
			<ul className='divide-y divide-gray-200'>
				{chats.map((chat) => (
					<li
						key={chat.id}
						onClick={() => onChatSelect(chat)}
						className={`p-4 flex items-center cursor-pointer transition-colors duration-200 ${
							selectedChat?.id === chat.id ? "bg-[#E5F2FF]" : "hover:bg-[#F2F4F8]"
						}`}>
						{/* Avatar */}
						<div className='flex items-center'>
							{/* Avatar Image or Placeholder */}
							<div className='w-10 h-10 rounded-full overflow-hidden mr-4'>
								{chat.avatar ? (
									<img src={chat.avatar} alt={chat.title} className='w-full h-full object-cover' />
								) : (
									<div className='w-full h-full bg-blue-500 text-white flex items-center justify-center'>
										<span className='text-xs font-semibold'>{getAvatar(chat.title)}</span>
									</div>
								)}
							</div>

							{/* Chat Title */}
							<p className='text-gray-800 font-medium truncate flex-1 text-xs line-clamp-1 w-[200px] overflow-ellipsis'>
								{chat.title}
							</p>
						</div>

						{/* Unread Count */}
						{chat.unreadCount > 0 && (
							<span className='bg-[#0088cc] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ml-3'>
								{chat.unreadCount}
							</span>
						)}
					</li>
				))}
			</ul>
		</div>
	);
};

export default ChatList;
