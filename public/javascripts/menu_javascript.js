document.addEventListener("DOMContentLoaded", () => {
  // 1. INISIALISASI DATATABLES
  const table = $("#menuTable").DataTable({
    processing: true,
    serverSide: true,
    responsive: true,
    autoWidth: true,
    info:false,
    paginate: true,
    dom: "t",
    lengthMenu: [[
        5, 10, 25, 50, 100, -1],
        [5, 10, 25, 50, 100, "All"]
      ],
    ajax: {
      url: "/api/menu/parent/datatables",
      type: "GET",
      dataSrc: (json) => json.data,
    },
    columns: [
      {
        data: "id_menu",
        className: "p-5 text-center",
        render: function (data, type, row) {
          let buttons = `<div class="flex items-center justify-center gap-2">`;
          
          // Button Edit
          if (row.akses?.edit) {
            buttons += `
              <button onclick="editMenu(${data})" class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors" title="Edit">
                <i class="ph-bold ph-pencil-simple text-lg"></i>
              </button>`;
          }
          
          // Button Delete
          if (row.akses?.delete) {
            buttons += `
              <button onclick="deleteMenu(${data})" class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 transition-colors" title="Hapus">
                <i class="ph-bold ph-trash text-lg"></i>
              </button>`;
          }

          buttons += `</div>`;
          return buttons;
        },
      },
      { data: "nama_menu", className: "p-5 font-semibold text-gray-900 dark:text-white" },
      { 
        data: "link", 
        className: "p-5",
        render: data => `<span class="px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs font-mono">${data}</span>`
      },
      { 
        data: "icon", 
        className: "p-5",
        render: data => `
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <i class="${data} text-lg"></i>
            </div>
            <span class="text-xs text-gray-500 font-mono">${data}</span>
          </div>`
      },
      { data: "urutan", className: "p-5 text-center dark:text-white" },
      { 
        data: "is_active", 
        className: "p-5",
        render: function(data) {
          const isActive = data === 'Y';
          return `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' : 'bg-gray-100 text-gray-500'}">
              <span class="w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-600' : 'bg-gray-400'}"></span>
              ${isActive ? 'Active' : 'Inactive'}
            </span>`;
        }
      }
    ],
    drawCallback: function () {
      $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
      
    }
  });

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
    table.page(page).draw('page');
  };

  renderPagination();
  table.on('draw.dt', function () {
    renderPagination();
  });
  // Custom Search bar logic
  document.querySelector('input[placeholder="Cari menu..."]').addEventListener('keyup', function() {
    table.search(this.value).draw();
  });

  // 2. CREATE ATAU UPDATE LOGIC
  document.getElementById("submitMenuBtn").addEventListener("click", async () => {
    const id = document.getElementById("hidden_id_menu").value;
    const payload = {
      nama_menu: document.getElementById("nama_menu").value,
      link: document.getElementById("link").value,
      icon: document.getElementById("icon").value,
      urutan: parseInt(document.getElementById("urutan").value),
      is_active: document.getElementById("is_active").value
    };

    const isUpdate = id !== "";
    const url = isUpdate ? `/api/menu/${id}` : `/api/menu`;
    const method = isUpdate ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
          swal("Berhasil!", data.message || "Data berhasil disimpan", "success");
          closeMenuModal();
          setTimeout(() => location.reload(), 1500); // Reload page setelah sukses
      } else {
        swal("Gagal!", data.message || "Terjadi kesalahan", "error");
      }
    } catch (err) {
      swal("Error!", "Gagal menghubungi server", "error");
    }
  });
});

// 3. MODAL CONTROLS (Manual Tailwind)
function openMenuModal() {
  document.getElementById("menuForm").reset();
  document.getElementById("hidden_id_menu").value = '';
  document.getElementById("modalTitle").innerText = 'Tambah Menu Baru';
  document.getElementById("menuModal").classList.remove("hidden");
}

function closeMenuModal() {
  document.getElementById("menuModal").classList.add("hidden");
}

// 4. EDIT FUNCTION
async function editMenu(id_menu) {
  console.log("Mencoba ambil data untuk ID:", id_menu);
  try {
    const res = await fetch(`/api/menu/${id_menu}`);
    const json = await res.json();

    if (json.success) {
      const menu = json.data;
      document.getElementById("hidden_id_menu").value = menu.id_menu;
      document.getElementById("nama_menu").value = menu.nama_menu;
      document.getElementById("link").value = menu.link;
      document.getElementById("icon").value = menu.icon;
      document.getElementById("urutan").value = menu.urutan;
      document.getElementById("is_active").value = menu.is_active;

      document.getElementById("modalTitle").innerText = 'Edit Menu';
      document.getElementById("menuModal").classList.remove("hidden");

      console.log("DATA MENU:", menu);
    } else {
      swal("Gagal", "Menu tidak ditemukan", "error");
    }
  } catch (err) {
    swal("Error", "Gagal mengambil data", "error");
  }
}

// 5. DELETE FUNCTION
function deleteMenu(id) {
  swal({
    title: "Yakin ingin menghapus?",
    text: "Data yang dihapus tidak dapat dikembalikan!",
    icon: "warning",
    buttons: ["Batal", "Ya, hapus!"],
    dangerMode: true,
  }).then(async (willDelete) => {
    if (willDelete) {
      try {
        const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
        const data = await res.json();

        if (data.status === "success") {
          swal("Terhapus!", data.message, "success");
          $("#menuTable").DataTable().ajax.reload();
        } else {
          swal("Gagal!", data.message, "error");
        }
      } catch (err) {
        swal("Error!", "Gagal menghubungi server", "error");
      }
    }
  });
}