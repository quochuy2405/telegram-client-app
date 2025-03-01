import React from "react";
import { QRCodeCanvas } from "qrcode.react";

interface LoginProps {
	qrUrl: string;
	onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ qrUrl }) => {
	return (
		<div className='flex w-full items-center justify-center min-h-screen bg-[#F0F2F5]'>
			<div className='text-center bg-white p-8 rounded-2xl shadow-lg w-full max-w-md'>
				{/* Logo Telegram */}
				<div className='mb-6'>
					<svg className='w-16 h-16 mx-auto text-[#0088cc]' viewBox='0 0 24 24' fill='currentColor'>
						<path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.589 6.182l-1.842 8.682c-.124.583-.477.728-.81.455l-2.682-1.973-1.29 1.24c-.143.143-.265.265-.59.265l.19-2.682 4.873-4.41c.214-.19-.047-.298-.324-.108L8.682 10.91l-2.59-.81c-.573-.19-.59-.636.119-.895l10.182-3.91c.477-.19.895.119.895.887z' />
					</svg>
				</div>

				{/* Tiêu đề */}
				<h1 className='text-2xl font-bold text-gray-800 mb-4'>Log in to Telegram</h1>

				{/* Mô tả và QR code */}
				{qrUrl ? (
					<div>
						<p className='text-gray-600 mb-6'>Scan this QR code with your Telegram app to log in</p>
						<div className='flex justify-center'>
							<QRCodeCanvas
								value={qrUrl}
								size={200}
								bgColor='#ffffff'
								fgColor='#000000'
								className='p-4 bg-white rounded-lg shadow-md'
							/>
						</div>
					</div>
				) : (
					<p className='text-gray-600'>Loading QR code...</p>
				)}

				{/* Hướng dẫn thêm */}
				<p className='text-sm text-gray-500 mt-6'>Open Telegram on your phone and scan the code</p>
			</div>
		</div>
	);
};

export default Login;
