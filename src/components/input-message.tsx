import React, { useState } from 'react'
interface InputMessageProps {
	handleSendMessage: (value:string, onClear?: () => void) => void
}
const InputMessage = ({handleSendMessage}:InputMessageProps) => {
  	const [inputText, setInputText] = useState<string>("");
  return (
		<div className='bg-white p-4 border-t border-gray-200 flex items-center'>
			<input
				type='text'
				placeholder='Type a message'
				value={inputText}
				onChange={(e) => setInputText(e.target.value)}
				onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputText, () => setInputText(""))} // Gửi khi nhấn Enter
				className='flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#0088cc]'
			/>
			<button
				onClick={() => handleSendMessage(inputText, () => setInputText(""))}
				className='ml-2 bg-[#0088cc] text-white p-2 rounded-full hover:bg-[#0077b3]'>
				<svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
					<path d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' />
				</svg>
			</button>
		</div>
	);
}

export default InputMessage