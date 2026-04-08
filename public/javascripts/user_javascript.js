document.addEventListener("DOMContentLoaded", () => {

 const table = $("#userTable").DataTable({
    processing: true,
    serverSide: true,
    responsive: false,
    scrollX: false,
    autowidth: true,
    dom: "t",
    info: false,
    paginate: true,
    lengthMenu: [[
        5, 10, 25, 50, 100, -1],
        [5, 10, 25, 50, 100, "All"]
    ],
    ajax: {
      url: "/api/user/datatables", // Backend endpoint
      type: "GET",
      dataSrc: (json) => json.data,
    },
    columns: [
      {
        data: "id",
        className: "p-2 text-center border",
        render: function (data, type, row) {
          //console.log("Data ID:", row); // Debugging log
          let buttons = `<div class="flex items-center justify-center gap-2">`;

          if (row.akses && row.akses.edit) {
            buttons += `
              <button class="userApproval p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 transition-colors" title="Approve" data-id="${row.id}">
                <i class="ph-bold ph-check text-lg"></i>
              </button>
              <button onclick="editUser(${row.id})" class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors" title="Edit">
                <i class="ph-bold ph-pencil-simple text-lg"></i>
              </button>`;
          }
          if (row.akses && row.akses.delete) {
            buttons += `
             <button onclick="deleteUser(${row.id})" class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 transition-colors" title="Hapus">
                <i class="ph-bold ph-trash text-lg"></i>
              </button>`;
          }

          buttons += `</div>`;
          return buttons;
        },
      },
      { data: "fullname", title: "Nama Lengkap", className: "font-semibold text-gray-900 dark:text-white p-2 border" },
      { data: "username", title: "Username", className: "p-2 border", render: data => `<span class="px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs font-mono">${data}</span>` },
      { data: "level.nama_level",
        title: "ID Level", className: "p-2 border font-semibold text-gray-900 dark:text-white",
        render: function (data, type, row) {
          if (!data) return '';
          return data.charAt(0).toUpperCase() + data.slice(1);
        }
      },
      { data: "is_active", 
        title: "Status",
        className: "p-2 border",
        render: function (data) {
          const isActive = data === 'Y';
          return `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' : 'bg-gray-100 text-gray-500'}">
              <span class="w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-600' : 'bg-gray-400'}"></span>
              ${isActive ? 'Active' : 'Inactive'}
            </span>`;
        }
      },
    ],
    columnDefs: [
      // { responsivePriority: 1, targets: 0 }, // Title
      // { responsivePriority: 2, targets: 1 }, // Image URL
      // { responsivePriority: 3, targets: 5 },  // Action
      // { targets: 0, width: '20%' }, // Set width for the first column (Title)
      // { targets: 1, width: '15%' }, // Set width for the second column (Image URL)
      // { targets: 2, width: '25%' }, // Set width for the third column (Description)
      // { targets: 3, width: '40%' }, // Set width for the fourth column (Category ID)
      // { targets: 4, width: '15%' }, // Set width for the fifth column (Created At)
      // { targets: 5, width: '30%' }  // Set width for the sixth column (Action)
    ],
    drawCallback: function () {
      // Force redraw untuk sync header & body
      $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
    },
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
    document.querySelector('input[placeholder="Cari user..."]').addEventListener('keyup', function() {
      table.search(this.value).draw();
    });
});

    // CREATE OR UPDATE
    document.getElementById("submitUserBtn").addEventListener("click", async () => {
      const id = document.getElementById("hidden_id_user").value;
      const fullname = document.getElementById("fullname").value;
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const id_level = document.getElementById("id_level").value;
      const is_active = document.getElementById("is_active").value;
      const app = document.getElementById("app").value;
  
    // Tentukan URL dan method berdasarkan id
    const isUpdate = id !== "";
    const url = isUpdate ? `/api/user/${id}` : `/api/user`;
    const method = isUpdate ? "PUT" : "POST";

    const body = {
      fullname,
      username,
      id_level: parseInt(id_level),
      is_active,
      app
    };

    if (!isUpdate) {
      body.password = password; // Hanya kirim password saat update
    }

      try {
        const res = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
  
        const data = await res.json();
  
        if (res.ok) {
          swal("Berhasil!", data.message || "User berhasil ditambahkan", "success");
          setTimeout(() => location.reload(), 1500);
        } else {
          swal("Gagal!", data.message || "Terjadi kesalahan saat menyimpan data", "error");
        }
      } catch (err) {
        swal("Error!", "Gagal menghubungi server", "error");
      }
    });

    

    document.getElementById("addUserBtn").addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("userFormModal").reset();
      document.getElementById("hidden_id_user").value = '';
      document.getElementById("modalTitle").innerText = "Tambah User Baru";

      document.getElementById("userFormModal").classList.remove("hidden");

      document.getElementById("password").style.display = "block"; // Tampilkan password field
      document.getElementById("passwordDiv").style.display = "block"; // Tampilkan password field
    });


    // APPROVAL USER
    document.getElementById("userTable").addEventListener("click", async (e) => {
      if (e.target.closest(".userApproval")) {
      e.preventDefault();
      const btn = e.target.closest(".userApproval");
      const id = btn.getAttribute("data-id");
    
      swal({
        title: "Apakah anda mau menyetujui pengguna ini?",
        icon: "warning",
        buttons: ["Batal", "Ya!"],
        dangerMode: true,
      }).then(async (willDelete) => {
        if (willDelete) {
        try {
          const res = await fetch(`/api/user/${id}/approve`, {
          method: "PUT",
          });
    
          const data = await res.json();
    
          if (data.status === "success") {
          swal({
            icon: "success",
            title: "Disetujui!",
            text: data.message,
            timer: 1500,
            buttons: false,
          }).then(() => {
            location.reload();
          });
          } else {
          swal("Gagal!", data.message || "Terjadi kesalahan", "error");
          }
        } catch (err) {
          swal("Error!", "Gagal menghubungi server", "error");
        }
        }
      });
      }
    });

// function openUserModal() {
//   document.getElementById("userFormModal").reset();
//   document.getElementById("hidden_id_user").value = '';
//   document.getElementById("modalTitle").innerText = "Tambah Menu Baru";
//   document.getElementById("userFormModal").classList.add("hidden");
// }

window.closeUserModal = function() {
  document.getElementById("userFormModal").classList.add("hidden");
}

window.editUser = async function(id) {
  
  try{
      const res = await fetch(`/api/user/${id}`);
      const json = await res.json();

      if(json.status === "success"){
        const user = json.data;
        document.getElementById("hidden_id_user").value = user.id;
        document.getElementById("fullname").value = user.fullname;
        document.getElementById("username").value = user.username;
        document.getElementById("id_level").value = user.id_level;
        document.getElementById("is_active").value = user.is_active;
        document.getElementById("app").value = user.app;

        document.getElementById("modalTitle").innerHTML = 'Edit User';
        document.getElementById("userFormModal").classList.remove("hidden");
        document.getElementById("password").style.display = "none";
        document.getElementById("passwordDiv").style.display = "none";
      } else {
        swal("Gagal", "User tidak ditemukan", "error");
      }
  } catch (error) {
    swal("Error", "Gagal mengambil data", "error");
  }
}

function deleteUser(id) {
  swal({
    title: "Yakin ingin menghapus?",
    text: "Data yang dihapus tidak dapat dikembalikan!",
    icon: "warning",
    buttons: ["Batal", "Ya, hapus!"],
    dangerMode: true,
  }).then(async (willDelete) => {
    if (willDelete) {
      try {
        const res = await fetch(`/api/user/${id}`, { method: "DELETE" });
        const data = await res.json();

        if (data.status === "success") {
          swal("Terhapus!", data.message, "success");
          $("#userTable").DataTable().ajax.reload();
        } else {
          swal("Gagal!", data.message, "error");
        }
      } catch (err) {
        swal("Error!", "Gagal menghubungi server", "error");
      }
    }
  });
}