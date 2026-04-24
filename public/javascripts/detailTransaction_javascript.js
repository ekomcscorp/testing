// $(document).ready(function($) {
//     $(document).on("click", "#btnPrint", function(event) {
//         event.preventDefault();

//         try {
//             const element = document.getElementById('invoicePrintArea');
//             if (!element) {
//                 console.error('Invoice element not found');
//                 alert('Gagal: Elemen invoice tidak ditemukan');
//                 return;
//             }

//             // Get invoice ID from data attribute
//             const invoiceId = $(this).data('invoice-id') || 'invoice';
            
//             const opt = {
//                 margin: [10, 10, 10, 10],
//                 filename: `invoice-${invoiceId}.pdf`,
//                 image: { type: 'jpeg', quality: 0.98 },
//                 html2canvas: { 
//                     scale: 2, 
//                     useCORS: true,
//                     allowTaint: true,
//                     logging: false,
//                     backgroundColor: '#ffffff',
//                     dpi: 300,
//                     letterRendering: true
//                 },
//                 jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
//             };

//             // Check if html2pdf is available
//             if (typeof html2pdf === 'undefined') {
//                 console.error('html2pdf library not loaded');
//                 alert('Gagal: Library html2pdf belum termuat');
//                 return;
//             }

//             html2pdf().set(opt).from(element).save().catch(err => {
//                 console.error('PDF generation error:', err);
//                 // Handle color-related errors gracefully
//                 if (err.message.includes('oklab') || err.message.includes('color')) {
//                     console.warn('Color parsing issue detected, retrying with simpler settings...');
//                     // Retry dengan setting yang lebih sederhana
//                     const simpleOpt = {
//                         margin: [10, 10, 10, 10],
//                         filename: `invoice-${invoiceId}.pdf`,
//                         image: { type: 'png', quality: 0.98 },
//                         html2canvas: { 
//                             scale: 1, 
//                             useCORS: true,
//                             allowTaint: true,
//                             logging: false,
//                             backgroundColor: '#ffffff'
//                         },
//                         jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
//                     };
//                     html2pdf().set(simpleOpt).from(element).save().catch(retryErr => {
//                         console.error('Retry failed:', retryErr);
//                         alert('Gagal menghasilkan PDF. Silahkan coba lagi.');
//                     });
//                 } else {
//                     alert('Gagal menghasilkan PDF: ' + err.message);
//                 }
//             });
//         } catch (error) {
//             console.error('Error:', error);
//             alert('Terjadi kesalahan: ' + error.message);
//         }
//     });
// }); 