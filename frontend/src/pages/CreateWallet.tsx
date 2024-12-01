// import { useState } from 'react';
// import axios from 'axios';
// import Player from 'lottie-react';
// import { motion } from 'framer-motion';
// import { FiCreditCard } from 'react-icons/fi'; // Changed from FaWallet to FiCreditCard
// import { useToast } from '@/components/ui/use-toast';
// import { toastConfig } from '@/utils/toast';
// import walletImage from '../assets/wallet.json';
// import bgwallet from '../assets/bg_wallet.json';
// import { useNavigate } from 'react-router-dom';
// import { FiCheck, FiCopy } from 'react-icons/fi';
// interface WalletResponse {
//   address: string;
//   private_key: string;
// }

// const CreateWallet = () => {
//   const navigate = useNavigate();
//   const [isLoading, setIsLoading] = useState(false);
//   const { toast } = useToast();

//   const handleCreateWallet = async () => {
//     setIsLoading(true);
//     try {
//       const token = localStorage.getItem('access_token');
//       if (!token) {
//         toast(toastConfig.error('Authentication required. Please login.'));
//         navigate('/login');
//         return;
//       }
//       const user_id = localStorage.getItem('user_id');
//       const response = await axios.post<WalletResponse>(
//         'http://127.0.0.1:8000/api/wallets?user_id=' + user_id,
//         {},  // Empty body since using query params
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           }
//         }
//       );

//       if (response.data.address && response.data.private_key) {
//         toast(toastConfig.success('Your wallet has been created successfully!'));

//         setTimeout(() => {
//           navigate('/');

//           const { address, private_key } = response.data;

//           // Create modal element with ARIA attributes
//           const modal = document.createElement('div');
//           modal.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';
//           modal.setAttribute('role', 'dialog');
//           modal.setAttribute('aria-labelledby', 'modal-title');
//           modal.setAttribute('aria-describedby', 'modal-description');

//           // Modal content container
//           const modalContent = document.createElement('div');
//           modalContent.className = 'bg-white p-8 rounded-3xl border-8 border-gradient-to-r from-red-700 via-red-500 to-red-300 transform transition-all duration-300 scale-95 opacity-0 max-w-3xl w-full shadow-xl';
//           modalContent.setAttribute('role', 'document');

//           // Add animation for modal appearance
//           setTimeout(() => {
//             modalContent.classList.remove('scale-95', 'opacity-0');
//             modalContent.classList.add('scale-100', 'opacity-100');
//           }, 10);

//           // Modal title
//           const title = document.createElement('h2');
//           title.id = 'modal-title';
//           title.className = 'text-3xl font-extrabold text-gray-800 mb-6';
//           title.innerText = 'Wallet Details';

//           // Create a function for creating a copyable element with a button
//           const createCopyableElement = (label, value, isPrivateKey = false) => {
//             const element = document.createElement('p');
//             element.className = 'text-lg text-gray-700 mb-4';
//             element.innerHTML = `${label}: <span class="font-semibold text-red-500 break-words">${value}</span>`;

//             const copyButton = document.createElement('button');
//             copyButton.className = 'text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-200';

//             // Using Heroicons clipboard-copy icon
//             copyButton.innerHTML = `
//               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
//                 <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6z" clip-rule="evenodd" />
//               </svg>
//             `;

//             copyButton.addEventListener('click', () => {
//               navigator.clipboard.writeText(value);
//               toast(toastConfig.success(`${isPrivateKey ? 'Private key' : 'Address'} copied to clipboard`));
//             });

//             element.appendChild(copyButton);
//             return element;
//           };

//           // Create copyable address and private key elements
//           const addressElement = createCopyableElement('Wallet Address', address);
//           const privateKeyElement = createCopyableElement('Private Key', private_key, true);

//           // Instruction message
//           const instruction = document.createElement('p');
//           instruction.className = 'text-sm text-gray-600 mb-6';
//           instruction.innerText = 'Important: Please keep your wallet details in a secure place. Do not share your private key with anyone.';

//           // Countdown timer element
//           const countdownElement = document.createElement('p');
//           countdownElement.className = 'text-sm text-gray-500 mt-4';
//           let countdown = 30;
//           countdownElement.innerText = `This modal will close in ${countdown} seconds.`;

//           // Close button
//           const closeButton = document.createElement('button');
//           closeButton.className = 'mt-6 px-8 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-200';
//           closeButton.innerText = 'Close';

//           // Append elements to modal content
//           modalContent.appendChild(title);
//           modalContent.appendChild(addressElement);
//           modalContent.appendChild(privateKeyElement);
//           modalContent.appendChild(instruction);
//           modalContent.appendChild(countdownElement);
//           modalContent.appendChild(closeButton);

//           // Append modal to the body
//           modal.appendChild(modalContent);
//           document.body.appendChild(modal);

//           // Countdown function
//           const countdownInterval = setInterval(() => {
//             countdown--;
//             countdownElement.innerText = `This modal will close in ${countdown} seconds.`;
//             if (countdown <= 0) {
//               clearInterval(countdownInterval); // Stop the countdown
//               closeModal(); // Close the modal after countdown
//             }
//           }, 1000);

//           // Function to close modal
//           const closeModal = () => {
//             modalContent.classList.remove('scale-100', 'opacity-100');
//             modalContent.classList.add('scale-95', 'opacity-0');
//             setTimeout(() => modal.remove(), 300); // Remove after animation ends
//           };

//           // Close modal on button click
//           closeButton.addEventListener('click', () => {
//             clearInterval(countdownInterval); // Clear the countdown when the modal is closed manually
//             closeModal(); // Close the modal
//           });

//           // Close modal on 'Esc' key press
//           document.addEventListener('keydown', (e) => {
//             if (e.key === 'Escape') {
//               clearInterval(countdownInterval); // Clear the countdown when 'Esc' is pressed
//               closeModal(); // Close the modal
//             }
//           });


//         }, 3500);

//       }

//     } catch (error: any) {
//       console.error('Wallet creation error:', error);
//       toast(toastConfig.error(
//         error.response?.data?.message || 'Failed to create wallet'
//       ));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className='flex items-center justify-center min-h-screen bg-[#0D0D1F] p-8'
//     >
//       <div className="flex flex-col items-center justify-center w-full max-w-lg space-y-6">
//         <Player
//           autoplay
//           loop
//           animationData={walletImage}
//           className="w-40 mb-8"
//         />

//         <motion.div
//           className='relative space-y-6 w-full rounded-xl shadow-lg p-10 backdrop-blur-sm bg-black/40 border border-white/10'
//         >
//           <div className="absolute inset-0">
//             <Player
//               autoplay
//               loop
//               animationData={bgwallet}
//               style={{
//                 position: 'absolute',
//                 inset: 0,
//                 zIndex: -1,
//                 opacity: 0.5,
//               }}
//             />
//           </div>

//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={handleCreateWallet}
//             disabled={isLoading}
//             className='w-full px-6 py-4 relative group'
//           >
//             <div className='absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-lg' />
//             <div className='relative bg-[#0D0D1F] rounded-lg px-6 py-3 text-white group-hover:bg-opacity-90 transition-all'>
//               {isLoading ? (
//                 <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mx-auto" />
//               ) : (
//                 <div className="flex items-center justify-center">
//                   <FiCreditCard className='mr-2' /> {/* Changed from FaWallet to FiCreditCard */}
//                   Create New Wallet
//                 </div>
//               )}
//             </div>
//           </motion.button>
//         </motion.div>
//       </div>
//     </motion.div>
//   );
// };

// export default CreateWallet;