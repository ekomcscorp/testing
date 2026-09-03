document.addEventListener("DOMContentLoaded", () => {
    window.resolveThumbnailUrl = (thumbnail) => {
        if (!thumbnail) return null;
        if (/^(https?:)?\/\//.test(thumbnail)) {
            return thumbnail;
        }
        return `/assets/img/products/thumbnails/${encodeURIComponent(thumbnail)}`;
    };

    const fetchThumbnailForRow = async (productId, rowElement, rowData) => {
        try {
            const res = await fetch(`/api/products/${productId}`);
            if (!res.ok) return;
            const json = await res.json();
            if (!json.success || !json.data || !json.data.thumbnail_url) return;

            const thumbnailUrl = resolveThumbnailUrl(json.data.thumbnail_url);
            const td = rowElement.querySelectorAll('td')[1];
            if (!td) return;

            td.innerHTML = `
                <div class="flex items-center gap-3 min-w-0">
                    <img src="${thumbnailUrl}" alt="Thumbnail" class="w-10 h-12 object-cover rounded flex-shrink-0">
                    <span class="grow text-gray-900 dark:text-white break-words whitespace-normal">${rowData.nama_produk}</span>
                </div>
            `;
        } catch (err) {
            console.warn('Unable to fetch thumbnail for product', productId, err);
        }
    };

    window.productTable = $("#productTable").DataTable({
        processing: true,
        serverSide: true,
        responsive: false,
        scrollX: false,
        autowidth: true,
        language: {
          zeroRecords: "Tidak ada Produk yang ditemukan",
          processing: "Memuat..."
        },
        layout: {
          topEnd: {
              features: {
                  search: {
                      placeholder: 'Cari Produk...'
                  }
              }
          },
          bottomEnd: 'paging',
        },
         ajax: {
            url: "/api/products/datatables", // Backend endpoint
            type: "GET",
            // dataSrc: (json) => json.data,
        },

        columns: [
            {
                data: "id",
                className: "p-2  border-b dark:text-white",
                render: function (data, type, row) {
                   let buttons = `<div class="flex items-center justify-center gap-2">`;
                   console.log("Row akses data:", row.akses);
                    buttons += `
                    <button onclick="viewDetail(${row.id})" class="p-2 rounded-lg text-orange-600 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100" title="Lihat">
                      <i class="ph-bold ph-eye text-base"></i>
                    </button>
                  `;

                   if(row.akses?.edit) {
                    buttons += `
                       <button onclick="editProduct(${row.id})" class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors" title="Edit">
                        <i class="ph-bold ph-pencil-simple text-lg"></i>
                      </button>`;
                   }
                   if(row.akses?.delete) {
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
                    data: null,
                    title: "Produk", 
                    className: "p-2 border-b dark:text-white",
                    render: function(data, type, row) {
                        const thumbnail = row.thumbnail_url;
                        const nama = row.nama_produk;
                        
                        let imgHtml = "No Image";
                        if(thumbnail) {
                            const safeUrl = resolveThumbnailUrl(thumbnail);
                            imgHtml = `<img src="${safeUrl}" alt="Thumbnail" class="w-10 h-12 object-cover rounded flex-shrink-0">`;
                        }
                        
                        return `
                            <div class="flex items-center gap-3 min-w-0">
                                ${imgHtml}
                                <span class="grow text-gray-900 dark:text-white break-words whitespace-normal">${nama}</span>
                            </div>
                        `;
                    }
                },

                {
                  data: "user_id",
                  title: "Added By",
                  className: "pl-2  text-gray-500 dark:text-white border-b",
                  render: function(data, type,row,){
                    if(!data) return "<span class='text-gray-400'>-</span>";
                    return `<span>${row.creator.fullname}</span>`;
                  }
                },
                {
                    data: "prices", // Ini akan mengambil seluruh array 'prices'
                    title: "Harga (Tipe Kamar)",
                    className: "p-2  border-b dark:text-white",
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
                    data: "status", title: "Status",
                    className: "p-2  border-b dark:text-white",
                    render: function(data) {
                        // const isPublic = data === "publish";
                        let badgeClass = "";
                        let isDot = "";

                        if(data === "publish") {
                          badgeClass = "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400";
                          isDot = "bg-green-600";
                        } else if( data === "closed") {
                          badgeClass = 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400';
                           isDot = 'bg-red-600';
                        } else {
                          badgeClass = 'bg-yellow-500/20 text-yellow-600';
                          isDot = 'bg-yellow-400';
                        }
                         return `
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}">
                            <span class="w-1.5 h-1.5 rounded-full ${isDot}"></span>
                            ${data}
                            </span>`;
                    }
                },
            ],
            createdRow: function(rowElement, rowData) {
                if (!rowData.thumbnail_url && rowData.id) {
                    fetchThumbnailForRow(rowData.id, rowElement, rowData);
                }
            },
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

     window.productTable.on('init.dt draw.dt', function () {
        renderPagination();
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
        class="px-3 py-1 rounded-lg border-gray-200 dark:border-slate-700 
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
            : 'border-gray-200 dark:border-slate-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}">
          ${i + 1}
        </button>
      `;
    }

    // NEXT
    paginationHtml += `
      <button 
        ${currentPage === totalPages - 1 ? 'disabled' : ''}
        onclick="goToPage(${currentPage + 1})"
        class="px-3 py-1 rounded-lg border-gray-200 dark:border-slate-700 
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

  window.viewDetail = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if(!res.ok) throw new Error("Failed to fetch product details");

      const resJson = await res.json();
      if (!resJson.success || !resJson.data) return;
      const item = resJson.data;

      // Thumbnail
      const thumbEl = document.getElementById('md-thumbnail');
      if (item.thumbnail_url) {
        thumbEl.src = resolveThumbnailUrl(item.thumbnail_url); 
        thumbEl.classList.remove('hidden');
      } else {
        thumbEl.src = '';
        thumbEl.classList.add('hidden');
      }

      // Status badge
      const statusEl = document.getElementById('md-status');
      if (statusEl) {
        const st = item.status || 'draft';
        let badgeClass = '';
        let dotClass = '';
        if (st === 'publish') { badgeClass = 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400'; dotClass = 'bg-green-600'; }
        else if (st === 'closed') { badgeClass = 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'; dotClass = 'bg-red-600'; }
        else { badgeClass = 'bg-yellow-500/20 text-yellow-600'; dotClass = 'bg-yellow-400'; }

        statusEl.innerHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}"><span class="w-1.5 h-1.5 rounded-full ${dotClass}"></span>${st}</span>`;
      }

      // Basic fields
      document.getElementById('md-nama').innerText = item.nama_produk || '-';
      document.getElementById('md-creator').innerText = item.creator?.fullname || '-';

      // Prices & quotas
      const prices = Array.isArray(item.prices) ? item.prices : [];
      const pricesList = document.getElementById('md-prices-list');
      if (pricesList) {
        pricesList.innerHTML = prices.map(p => {
          const formatted = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(p.price || 0);
          const q = p.quota || 0;
          return `<div class="p-3 flex items-center justify-between"><div><div class=\"font-semibold\">${p.room_types}</div><div class=\"text-sm text-gray-500\">${formatted}</div></div><div class=\"text-sm text-gray-700 dark:text-gray-200\">${q} Seat</div></div>`;
        }).join('');
      }

      // Update summary room counts
      const getQuotaFor = (type) => {
        const it = prices.find(x => x.room_types === type);
        return it ? (it.quota || 0) : 0;
      }
      const quadCount = document.getElementById('md-room-count-quad');
      const tripleCount = document.getElementById('md-room-count-triple');
      const doubleCount = document.getElementById('md-room-count-double');
      if (quadCount) quadCount.innerText = `${getQuotaFor('Quad')} Seat`;
      if (tripleCount) tripleCount.innerText = `${getQuotaFor('Triple')} Seat`;
      if (doubleCount) doubleCount.innerText = `${getQuotaFor('Double')} Seat`;

      // Flights
      const dep = (item.flights || []).find(f => f.type === 'Departure');
      const ret = (item.flights || []).find(f => f.type === 'Return');
      document.getElementById('md-flight-airline').innerText = `${dep?.airline_name || '-'} `;
      document.getElementById('md-flight-airline-return').innerText = `${ret?.airline_name || '-'} `;
      document.getElementById('md-flight-departure-airport').innerText = item.tmp_keberangkatan || '-';
     

      const date = new Date(item.tgl_keberangkatan).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'
      });
      document.getElementById('md-flight-arrival-time').innerText = date || "-";

      // show modal
      document.getElementById('detailProductModal').classList.remove('hidden');
    } catch (err) {
      console.error('Error loading product detail', err);
      swal('Error', 'Gagal mengambil detail produk', 'error');
    }
  }

    window.closeDetailModal = () => {
    const el = document.getElementById('detailProductModal');
    if (el) el.classList.add('hidden');
    }

  window.editProduct = (id) => {
    // Alihkan user ke halaman create dengan membawa parameter ID
    window.location.href = `/createProduct?id=${id}`;
};