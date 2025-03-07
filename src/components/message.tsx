import React from "react";

interface MessageProps {
	id: number;
	text: string;
	sender?: string;
	date: any;
	isOutgoing?: boolean; // To distinguish sent/received messages
}

const Message: React.FC<MessageProps> = ({ id, text, sender, date, isOutgoing }) => {
	return (
		<div className={`flex ${isOutgoing ? "justify-end" : "justify-start"} mb-2`}>
			<div
				className={`max-w-sm p-4 rounded-xl ${
					isOutgoing
						? "bg-[#DCF8C6] text-gray-800 border-transparent" // Sent messages (green)
						: "bg-white text-gray-800 border-gray-300 shadow-md" // Received messages (white with shadow)
				}`}>
				{/* Display sender's name if the message is incoming */}
				{/* {sender && !isOutgoing && (
					<span className='text-[#0088cc] font-medium block text-sm mb-1'>{sender}</span>
				)} */}
				{/* Message text */}
				<p className='text-xs font-normal break-words'>{text}</p>
				{/* Timestamp (time of message) */}
				<span className='text-xs text-gray-500 block text-right mt-2'>
					{new Date(date).toLocaleTimeString("en-US")}
				</span>
			</div>
		</div>
	);
};

export default Message;
