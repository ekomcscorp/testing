document.addEventListener("DOMContentLoaded", () => {
  // 1. Inisialisasi DataTable
  const table = $("#userlevelDetail").DataTable({
    processing: true,
    serverSide: true,
    responsive: true,
    dom: "t",
    info: false,
    paginate: true,
    ajax: {
      url: "/api/userlevel/datatables",
      type: "GET",
      dataSrc: (json) => json.data,
    },
    lengthMenu: [[
        5, 10, 25, 50, 100, -1],
        [5, 10, 25, 50, 100, "All"]
    ],
    // Urutkan berdasarkan ID Level (kolom index 1), bukan kolom Action
    order: [[1, 'asc']], 
    columns: [
      {
        data: "id_level",
        className: "p-2 border",
        orderable: false, // Matikan sorting di kolom Action agar tidak error SQL
        render: function (data, type, row) {
          let buttons = `<div class="flex items-center justify-center gap-2">`;

          // Button Akses
          buttons += `
            <button onclick="openAccessModal('${data}', '${row.nama_level}')"
                class="open-access-btn p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 transition-colors"
                title="Atur Akses" style="scale: 0.9">
                <i class="ph-bold ph-key text-lg"></i>
            </button>`;
          
          // Button Edit
          if (row.akses?.edit) {
            buttons += `
              <button onclick="editUserLevel('${data}')"
                  class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors"
                  title="Edit" style="scale: 0.9">
                  <i class="ph-bold ph-pencil-simple text-lg"></i>
              </button>`;
          }

          // Button Delete
          if (row.akses?.delete) {
            buttons += `
              <button onclick="deleteUserLevel('${data}')"
                  class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 transition-colors"
                  title="Hapus" style="scale: 0.9">
                  <i class="ph-bold ph-trash text-lg"></i>
              </button>`;
          }

          buttons += `</div>`;
          return buttons;
        }
      },
      { 
        data: "id_level", 
        className: "p-2 text-center border",
        render: data => `<span class="inline-block px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded font-mono text-xs font-bold">${data}</span>`
      },
      {
        data: "nama_level",
        className: "p-2 border",
        render: data => `<span class="font-semibold text-gray-900 dark:text-white">${data}</span>`
      }
    ],
    
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

  // 2. Custom Search Logic (Sesuaikan placeholder dengan HTML-mu)
  const searchInput = document.querySelector('input[placeholder="Cari nama level..."]');
  if (searchInput) {
    searchInput.addEventListener('keyup', function() {
      table.search(this.value).draw();
    });
  }

  // 3. Logic Simpan (Create/Update)
  document.getElementById("submitUserlevel").addEventListener("click", async () => {
    const id = document.getElementById("hidden_id_userlevel").value;
    const nama_level = document.getElementById("level-name").value;

    const isUpdate = id !== "";
    const url = isUpdate ? `/api/userlevel/${id}` : `/api/userlevel`;
    const method = isUpdate ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_level }),
      });

      const data = await res.json();
      if (res.ok) {
        swal("Berhasil!", data.message || "Data disimpan", "success").then(() => location.reload());
      } else {
        swal("Gagal!", data.message || "Gagal menyimpan", "error");
      }
    } catch (err) {
      swal("Error!", "Server error", "error");
    }
  });
});

// --- HELPER MODAL ---
window.toggleModal = (modalId, isOpen) => {
  try {
    const modal = document.getElementById(modalId);
    const backdrop = document.getElementById(modalId.replace('-modal', '-backdrop'));
    const panel = document.getElementById(modalId.replace('-modal', '-panel'));
    
    if (!modal || !backdrop || !panel) {
      console.error('Modal elements not found for:', modalId);
      return;
    }

    if (isOpen) {
      modal.classList.remove('hidden');
      setTimeout(() => {
        backdrop.classList.remove('opacity-0');
        backdrop.classList.add('opacity-100');
        backdrop.classList.remove('pointer-events-none');
        panel.classList.remove('opacity-0');
        panel.classList.add('opacity-100');
        panel.classList.remove('scale-95');
        panel.classList.add('scale-100');
      }, 10);
    } else {
      panel.classList.remove('opacity-100');
      panel.classList.add('opacity-0');
      panel.classList.remove('scale-100');
      panel.classList.add('scale-95');
      backdrop.classList.remove('opacity-100');
      backdrop.classList.add('opacity-0');
      backdrop.classList.add('pointer-events-none');
      setTimeout(() => modal.classList.add('hidden'), 300);
    }
  } catch (err) {
    console.error('Error in toggleModal:', err);
  }
};
// window.toggleModal = (modalId, isOpen) => {
//   const modal = document.getElementById(modalId);
//   const backdrop = document.getElementById(modalId.replace('-modal', '-backdrop'));
//   const panel = document.getElementById(modalId.replace('-modal', '-panel'));

//   if (!modal) return;

//   if (isOpen) {
//     modal.classList.remove('hidden');

//     backdrop.classList.remove('pointer-events-none');
//     backdrop.classList.replace('opacity-0', 'opacity-100');

//     panel.classList.replace('opacity-0', 'opacity-100');
//     panel.classList.replace('scale-95', 'scale-100');

//   } else {
//     backdrop.classList.add('pointer-events-none');
//     backdrop.classList.replace('opacity-100', 'opacity-0');

//     panel.classList.replace('opacity-100', 'opacity-0');
//     panel.classList.replace('scale-100', 'scale-95');

//     setTimeout(() => {
//       modal.classList.add('hidden');
//     }, 300);
//   }
// };

window.openAddLevelModal = () => {
  try {
    const hiddenId = document.getElementById("hidden_id_userlevel");
    const levelName = document.getElementById("level-name");
    const title = document.querySelector('#add-level-panel h3');

    if (hiddenId) hiddenId.value = "";
    if (levelName) levelName.value = "";
    if (title) title.innerText = 'Tambah Level Baru';

    toggleModal('add-level-modal', true);
  } catch (err) {
    console.error('Error in openAddLevelModal:', err);
    alert('Terjadi kesalahan saat membuka form tambah level');
  }
};

window.closeAddLevelModal = () => toggleModal('add-level-modal', false);

// --- EDIT ---
window.editUserLevel = async (id_level) => {
  try {
    const res = await fetch(`/api/userlevel/${id_level}`);
    const json = await res.json();

    // Sesuaikan dengan struktur response backend kamu (data.data)
    const userlevel = json.data || json;

    if (userlevel) {
      const hiddenId = document.getElementById("hidden_id_userlevel");
      const levelName = document.getElementById("level-name");
      const title = document.querySelector('#add-level-panel h3');

      if (hiddenId) hiddenId.value = userlevel.id_level;
      if (levelName) levelName.value = userlevel.nama_level;
      if (title) title.innerText = 'Edit User Level';
      
      toggleModal('add-level-modal', true);
    }
  } catch (err) {
    console.error('Error in editUserLevel:', err);
    swal("Error", "Gagal mengambil data", "error");
  }
};

// --- DELETE ---
window.deleteUserLevel = (id_level) => {
  swal({
    title: "Yakin ingin menghapus?",
    text: "Data ini akan dihapus secara permanen.",
    icon: "warning",
    buttons: ["Batal", "Ya, hapus!"],
    dangerMode: true,
  }).then(async (willDelete) => {
    if (willDelete) {
      try {
        const res = await fetch(`/api/userlevel/${id_level}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok) {
          swal("Terhapus!", "Data berhasil dihapus", "success").then(() => location.reload());
        } else {
          swal("Gagal!", data.message, "error");
        }
      } catch (err) {
        swal("Error!", "Server error", "error");
      }
    }
  });
};

// --- ACCESS MODAL ---
window.openAccessModal = (id_level, nama_level) => {
  document.getElementById("modal-level-name").innerText = nama_level;
  document.getElementById("hidden_id_userlevel").value = id_level;
  toggleModal('access-modal', true);
};

window.closeAccessModal = () => toggleModal('access-modal', false);