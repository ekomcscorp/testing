document.addEventListener("DOMContentLoaded", () => {
    window.productTable = $("#productTable").DataTable({
        processing: true,
        serverSide: true,
        responsive: false,
        scrollX: false,
        autowidth: true,
        dom: "t",
        info: false,
        paginate: true,
        order:[],
        lengthMenu: [[
            10, 25, 50, 100, -1],
            [10, 25, 50, 100, "All"]
        ],
         ajax: {
            url: "/api/products/datatables", // Backend endpoint
            type: "GET",
            // dataSrc: (json) => json.data,
        },
        lengthChange: false,
        columns: [
            {
                data: "id",
                className: "pl-5  border border-b",
                render: function (data, type, row) {
                     let buttons = `<div class="flex items-center justify-center gap-2">`;
                     // Paksa munculkan teks untuk debug
                    //  console.log("Row data:", row)
                     if(row.akses?.edit) {
                        buttons += `
                           <button onclick="editProduct(${row.id})" class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors" title="Edit">
                                <i class="ph-bold ph-pencil-simple text-lg"></i>
                            </button>`;
                     }
                     if(row.akses?.delete
                     ) {
                        buttons += `
                           <button onclick="deleteProduct(${row.id})" class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 transition-colors" title="Hapus">
                                <i class="ph-bold ph-trash text-lg"></i>
                            </button>`;
                     }
                     buttons += `</div>`;
                     return buttons;
                }
                },
                {
                    data: "thumbnail_url", title: "Thumbnail", 
                    className: "pl-5 border border-b",
                    render: function(data) {
                        if(data) {
                            const safeUrl = encodeURIComponent(data);
                            return `<img src="/assets/img/products/thumbnails/${safeUrl}" alt="Thumbnail"  class="w-10 h-12 object-cover">`
                        }
                        return "No Image";
                    }
                },
                {
                    data: "nama_produk", title: "Nama Produk", className: "pl-5  font-semibold text-gray-900 dark:text-white border border-b"
                },
                {
                    data: "prices", // Ini akan mengambil seluruh array 'prices'
                    title: "Harga (Tipe Kamar)",
                    className: "p-5  border border-b",
                    render: function(data, type, row) {
                        if (!data || data.length === 0) return "Tidak ada harga";
                        
                        // Melakukan loop untuk setiap tipe kamar
                        return data.map(item => {
                            const formattedPrice = new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR', // Sesuaikan dengan mata uangmu
                                minimumFractionDigits: 0
                            }).format(item.price);
                            
                            return `<span> <strong>${item.room_types}:</strong> ${formattedPrice}</span>`;
                        }).join(''); // Menggabungkan hasil array menjadi string HTML
                    }
                },
                {
                    data: "quota", title: "Stock",
                    className: "pl-5  text-gray-500 dark:text-white border border-b" 
                },
                {
                    data: "status", title: "Status",
                    className: "p-5  border border-b",
                    render: function(data) {
                        const isPublic = data === "publish";
                         return `
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isPublic? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' : 'bg-yellow-500/20 text-yellow-600'}">
                            <span class="w-1.5 h-1.5 rounded-full ${isPublic? 'bg-green-600' : 'bg-yellow-400'}"></span>
                            ${isPublic? 'Publish' : 'Draft'}
                            </span>`;
                    }
                },
            ],
             drawCallback: function () {
                // Force redraw untuk sync header & body
                $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
            },
        });
    
    $('#entriesSelect').on('change', function () {
      window.productTable.page.len($(this).val()).draw();
    });
    // Custom Search bar logic
    document.getElementById('customSearchInput').addEventListener('keyup', function() {
      window.productTable.search(this.value).draw();
    });

          function renderPagination() {
    var info = window.productTable.page.info();
    var currentPage = info.page;
    var totalPages = info.pages;

    // INFO TEXT
    var start = info.start + 1;
    var end = info.end;
    var total = info.recordsTotal;

    $('#customTableInfo').html(
      `Menampilkan <span class="font-semibold text-gray-900 dark:text-white">${start}-${end}</span> 
       dari <span class="font-semibold text-gray-900 dark:text-white">${total}</span> level`
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
    window.productTable.page(page).draw('page');
  };

  // renderPagination();
  window.productTable.on('init.dt draw.dt', function () {
    renderPagination();
  });

});

 

    window.deleteProduct = (id) => {
    swal({
      title: "Yakin ingin menghapus?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      buttons: ["Batal", "Ya, hapus!"],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
        const data = await res.json();

        // UBAH BAGIAN INI:
        if (res.ok) { 
          swal("Terhapus!", data.message, "success");
          $("#productTable").DataTable().ajax.reload(null, false); // null, false agar tetap di halaman yang sama
        } else {
          swal("Gagal!", data.message, "error");
        }
      } catch (err) {
        swal("Error!", "Gagal menghubungi server", "error");
      }
    }
    });
  }

  window.editProduct = (id) => {
    // Alihkan user ke halaman create dengan membawa parameter ID
    window.location.href = `/createProduct?id=${id}`;
};