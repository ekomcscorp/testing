let table; // Global variable untuk DataTable

document.addEventListener("DOMContentLoaded", () => {
    table = $('#transactionsTable').DataTable({
      processing: true,
      serverSide: true,
      responsive: true,
      scrollX: false,
      autowidth: true,
      info: false,
      language: {
        zeroRecords: "Tidak ada Transaksi yang ditemukan",
        processing: "Memuat..."
      },
      layout: {
         topEnd: {
            features: {
                search: {
                    placeholder: 'Cari Transaksi...'
                }
            }
        },
        bottomEnd: 'paging',
      },
        ajax: {
            url: '/api/transactions/datatables', // Backend endpoint
            type: 'GET',
            dataSrc: function (json) {
                return json.data; // Extract the data array
            }
        },
        columns: [
            {
                data: 'id',
                className: "p-2 border border-b",
                render: function (data, type, row) {
                    // console.log("Data ID:", row); // Debugging log
                    let buttons = `<div class="d-flex gap-2 justify-content-center">`;

                    buttons += `
                        <a href="/detail_transaction/${row.id}">
                            <button class="p-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100">
                                <i class="ph-bold ph-eye text-base"></i>
                            </button>
                        </a>
                    `;

                    // if (row.akses?.edit) {
                    //     buttons += `
                    //          <button
                    //             class="p-1.5 rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
                    //             title="Edit" onclick="editTransaction(${row.id})"><i class="ph-bold ph-pencil-simple text-base"></i>
                    //         </button>`;
                    // }
                    if (row.akses?.delete) {
                        buttons += `
                            <button
                                class="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                                title="Hapus" onclick="deleteTransaction(${row.id})"><i class="ph-bold ph-trash text-base"></i>
                            </button>`;
                    }
                    buttons += `</div>`;
                    return buttons;
                }
            },
            { data: 'transaction_no', title: 'No Transaksi', className: "p-2 border border-b font-bold text-sm text-gray-900 dark:text-gray-400" },
            { data: 'user_id', title: "Jama'ah", className: "p-2 border border-b text-gray-500 dark:text-white", render: function(data, type, row){
              if(!data) return "N/A";if(!data) return "<span class='text-gray-400'>-</span>";
              return `<span>${row.user.fullname}</span>`
            } },
            { data: 'total_price', title: 'Total Harga', className: "p-2 border border-b text-gray-500 dark:text-white", render: function(data, type, row) {
                if(!data) return "Rp 0";
                
                const formattedAmount = new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: "IDR", 
                    minimumFractionDigits: 0
                }).format(data);

                return `<span>${formattedAmount}</span>`;
            } },
            { data: 'payment_method', title: 'Metode Pembayaran', className: "p-2 border border-b text-gray-500 dark:text-white" },
            { data: 'status', title: 'Status', className: "p-2 border border-b", render: function(data) {
                let badgeClass = '';
                let isDot = '';
                
                if (data === "SUCCESS") {
                  badgeClass = 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400';
                  isDot = 'bg-green-600';
                } else if (data === "FAILED") {
                  badgeClass = 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400';
                  isDot = 'bg-red-600';
                } else if (data === "UNPAID") {
                  badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-red-400';
                  isDot = 'bg-amber-600';
                } else {
                  // PENDING
                  badgeClass = 'bg-cyan-500/20 text-cyan-600';
                  isDot = 'bg-cyan-400';
                }
                
                return `
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}">
                <span class="w-1.5 h-1.5 rounded-full ${isDot}"></span>
                ${data}
                </span>
                `
            } },
        ],
        drawCallback: function () {
            // Force redraw untuk sync header & body
            $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
        }
    });

    // Event listener untuk entries select
    $('#entriesSelect').on('change', function () {
      table.page.len($(this).val()).draw();
    });

    // Event listener untuk search input
    document.querySelector('input[placeholder="Cari Transaksi"]').addEventListener('keyup', function() {
      table.search(this.value).draw();
    });

    // Event listener untuk status filter
    const statusSelect = document.querySelector('select[class*="rounded-xl"]');
    if (statusSelect) {
      statusSelect.addEventListener('change', function() {
        filterTransactionByStatus(this.value);
      });
    }

 
function renderPagination() {
    var info = table.page.info();
    var currentPage = info.page;
    var totalPages = info.pages;

    // INFO TEXT
    var start = info.start + 1;
    var end = info.end;
    var total = info.recordsTotal;

    $('#customTableInfo').html(
      `Menampilkan <span class="font-semibold text-gray-900 dark:text-white">${start}-${end}</span> 
       dari <span class="font-semibold text-gray-900 dark:text-white">${total}</span> transaksi`
    );

    // PAGINATION BUTTONS
    var paginationHtml = '';

    // PREV
    paginationHtml += `
      <button 
        ${currentPage === 0 ? 'disabled' : ''}
        onclick="goToPage(${currentPage - 1})"
        class="px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 
        text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 
        disabled:opacity-50 transition-colors">
        Prev
      </button>
    `;

    // NUMBER BUTTONS
    for (let i = 0; i < totalPages; i++) {
      paginationHtml += `
        <button 
          onclick="goToPage(${i})"
          class="w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center
          ${i === currentPage 
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
            : 'border border-gray-200 dark:border-slate-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}">
          ${i + 1}
        </button>
      `;
    }

    // NEXT
    paginationHtml += `
      <button 
        ${currentPage === totalPages - 1 ? 'disabled' : ''}
        onclick="goToPage(${currentPage + 1})"
        class="px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 
        text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 
        disabled:opacity-50 transition-colors">
        Next
      </button>
    `;

    $('#customPagination').html(paginationHtml);
  }

  window.goToPage = function (page) {
    table.page(page).draw('page');
  };

  renderPagination();
  table.on('draw.dt', function () {
    renderPagination();
  });
});

// ═════════════════════════════════════════════════════
// FILTER FUNCTIONS
// ═════════════════════════════════════════════════════

window.filterTransactionByStatus = function(status) {
  if (!status || status === '') {
    // Tampilkan semua
    table.search('').draw();
  } else {
    // Filter berdasarkan status - cari status di column 5
    // Gunakan regex atau custom search
    table.column(5).search(status, true, false).draw();
  }
}

// FUNCTION VIEW DETAIL
window.viewTransactionDetail = async function(id) {
  try {
    const res = await fetch(`/api/transactions/${id}`);
    const json = await res.json();

    if(json.success) {
      // TODO: Buka modal/page untuk menampilkan detail transaksi
      console.log("Transaction detail:", json.data);
      swal("Info", "Fitur detail transaksi belum diimplementasikan", "info");
    } else {
      swal("Gagal", json.message || "Terjadi kesalahan saat mengambil data", "error");
    }
  } catch (error) {
    console.error("Error fetching transaction detail:", error);
    swal("Error", "Gagal mengambil data", "error");
  }
}

// FUNCTION EDIT
// window.editTransaction = async function(id) {
//   try {
//     const res = await fetch(`/api/transactions/${id}`);
//     const json = await res.json();

//     if(json.success) {
//       const transaction = json.data;
      
//       // Populate form
//       document.getElementById("hidden_id").value = transaction.id;
//       document.getElementById("transaction_no").value = transaction.transaction_no;
//       document.getElementById("name").value = transaction.name;
//       document.getElementById("total_price").value = transaction.total_price;
//       document.getElementById("payment_method").value = transaction.payment_method || '';
//       document.getElementById("status").value = transaction.status;
      
//       document.getElementById("modalTitle").innerText = 'Edit Transaksi';
//       openTransactionModal();
//     } else {
//       swal("Gagal", json.message || "Terjadi kesalahan saat mengambil data", "error");
//     }
//   } catch (error) {
//     console.error("Error fetching transaction data:", error);
//     swal("Error", "Gagal mengambil data", "error");
//   }
// }

// FUNCTION DELETE
window.deleteTransaction = async function(id) {
  swal({
    title: "Yakin ingin menghapus?",
    text: "Data yang dihapus tidak dapat dikembalikan!",
    icon: "warning",
    buttons: ["Batal", "Ya, hapus!"],
    dangerMode: true,
  }).then(async (willDelete) => {
    if (willDelete) {
      try {
        const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
        const data = await res.json();

        if (data.success) {
          swal("Terhapus!", data.message || "Transaksi berhasil dihapus", "success");
          setTimeout(() => location.reload(), 1500);
        } else {
          swal("Gagal!", data.message || "Terjadi kesalahan saat menghapus data", "error");
        }
      } catch (err) {
        swal("Error!", "Gagal menghubungi server", "error");
      }
    }
  });
}

// ═════════════════════════════════════════════════════
// MODAL FUNCTIONS
// ═════════════════════════════════════════════════════

window.openTransactionModal = function() {
  document.getElementById("transactionModal").classList.remove("hidden");
}

window.closeTransactionModal = function() {
  document.getElementById("transactionModal").classList.add("hidden");
  document.getElementById("transactionForm").reset();
  document.getElementById("hidden_id").value = '';
}

// Close modal when clicking backdrop
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('transactionModal');
  const backdrop = document.getElementById('transactionModalBackdrop');
  
  if (backdrop) {
    backdrop.addEventListener('click', function() {
      closeTransactionModal();
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeTransactionModal();
    }
  });

  // Handle form submit
  const submitBtn = document.getElementById('submitTransactionBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleTransactionSubmit);
  }
});

// FUNCTION SUBMIT/SAVE TRANSACTION
async function handleTransactionSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById("hidden_id").value;
  const payload = {
    name: document.getElementById("name").value,
    total_price: document.getElementById("total_price").value,
    payment_method: document.getElementById("payment_method").value,
    status: document.getElementById("status").value
  };

  // Validasi
  if (!payload.name || !payload.total_price) {
    swal("Validasi", "Nama dan Jumlah harus diisi!", "warning");
    return;
  }

   const isUpdate = id !== "";
    const url = isUpdate ? `/api/transactions/${id}` : `/api/transactions`;
    const method = isUpdate ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      swal("Berhasil!", data.message || "Transaksi berhasil disimpan", "success");
      setTimeout(() => location.reload(), 1500);
    } else {
      swal("Gagal!", data.message || "Terjadi kesalahan saat menyimpan data", "error");
    }
  } catch (err) {
    console.error("Error:", err);
    swal("Error!", "Gagal menghubungi server", "error");
  }
}

function openApproveModal() {
    document.getElementById('approvePaymentModal').classList.remove('hidden');
}

function closeApproveModal() {
    document.getElementById('approvePaymentModal').classList.add('hidden');
}

// Tambahkan event listener untuk tombol Konfirmasi
document.getElementById('confirmApproveBtn').addEventListener('click', async function() {
    this.disabled = true;
    this.innerHTML = "Processing...";
    
    try {
        // Panggil API approve kamu di sini
        // const response = await fetch(`/api/transactions/approve/${id}`, { method: 'POST' });
        
       swal("Berhasil!", "Pembayaran berhasil diapprove", "success");
       setTimeout(() => location.reload(), 1500); // Refresh halaman untuk update status
    } catch (error) {
        swal("Gagal!", "Terjadi kesalahan saat mengapprove pembayaran", "error");
        this.disabled = false;
        this.innerHTML = "Ya, Approve";
    }
});