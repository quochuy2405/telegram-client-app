import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TelegramClient } from "telegram";
import { Chat, Message } from "./types";

interface AppState {
	isLoggedIn: boolean;
	session: string | null;
	chats: Chat[];
	selectedChat: Chat | null;
	messages: Message[];
	setLoggedIn: (loggedIn: boolean) => void;
	setSession: (session: string) => void;
	setChats: (chats: Chat[]) => void;
	setSelectedChat: (chat: Chat | null) => void;
	setMessages: (messages: Message[]) => void;
	addMessage: (message: Message) => void;
	clearSession: () => void;
}

export const useStore = create<AppState>()(
	persist(
		(set) => ({
			isLoggedIn: false,
			session: null,
			chats: [],
			selectedChat: null,
			messages: [],
			setLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
			setSession: (session) => set({ session, isLoggedIn: true }),
			setChats: (chats) => set({ chats }),
			setSelectedChat: (chat) => set({ selectedChat: chat, messages: [] }),
			setMessages: (messages) => set({ messages }),
			addMessage: (message) =>
				set((state) => ({
					messages:
						state.selectedChat?.id === message.chatId
							? [...state.messages, message]
							: state.messages,
					chats: state.chats.map((chat) =>
						chat.id === message.chatId && !message.isOutgoing
							? { ...chat, unreadCount: chat.unreadCount + 1 }
							: chat
					),
				})),
			clearSession: () =>
				set({ session: null, isLoggedIn: false, chats: [], messages: [], selectedChat: null }),
		}),
		{
			name: "telegramSession",
			partialize: (state) => ({ session: state.session }), // Save only session to localStorage
		}
	)
);

// Function to initialize the Telegram client and load the session
export const initializeClient = async (client: TelegramClient): Promise<boolean> => {
	// First, wait until Zustand is fully hydrated
	const { session } = useStore.getState(); // Get session from Zustand state

	// If session is null, try to load the session from localStorage manually
	if (session === null) {
		const localStorageSession = localStorage.getItem("telegramSession");
		if (localStorageSession) {
			useStore.getState().setSession(localStorageSession);
		}
	}

	const updatedSession = useStore.getState().session;
	console.log("Updated session from Zustand state:", updatedSession);

	if (updatedSession) {
		try {
			await client.session.load(); // Load the session from storage
			await client.connect(); // Connect to Telegram
			const isAuthorized = await client.checkAuthorization(); // Check if client is authorized

			if (isAuthorized) {
				useStore.getState().setLoggedIn(true); // Mark user as logged in
				return true;
			}
		} catch (error) {
			console.error("Failed to initialize client:", error);
			return false;
		}
	}

	return false;
};
