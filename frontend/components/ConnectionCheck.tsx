// 'use client';

// import { useEffect, useRef } from 'react';
// import api from '@/lib/axios';

// export default function ConnectionCheck() {
//     const hasChecked = useRef(false);

//     useEffect(() => {
//         if (hasChecked.current) return;
//         hasChecked.current = true;

//         const checkConnection = async () => {
//             try {
//                 await api.get('/'); // Assumes root endpoint exists
//                 console.log('%c Backend Connected Successfully! 🚀', 'color: green; font-weight: bold; font-size: 14px;');
//             } catch (error) {
//                 console.error('%c Backend Connection Failed! ❌', 'color: red; font-weight: bold; font-size: 14px;', error);
//             }
//         };

//         checkConnection();
//     }, []);

//     return null; // This component renders nothing
// }a