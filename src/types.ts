export interface Chat {
	id: string;
	title: string;
	unreadCount: number;
}

export interface Message {
	id: number;
	chatId?: string; // Để xác định chat khi nhận tin nhắn mới
	text: string;
	sender?: string;
	date: string;
	isOutgoing?: boolean;
}
