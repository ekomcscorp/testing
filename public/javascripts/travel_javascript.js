// Email validation helper - Global scope
const isValidEmail = (email) => {
  if (!email || typeof email !== "string") {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidFormat = emailRegex.test(email.trim());

  if (!isValidFormat) {
    return false;
  }

  if (email.length > 254) {
    return false;
  }

  const parts = email.trim().split("@");
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domain] = parts;

  if (!localPart || localPart.length > 64) {
    return false;
  }

  if (email.includes("..")) {
    return false;
  }

  if (!domain || !domain.includes(".")) {
    return false;
  }

  return true;
};

const getEmailErrorMessage = (email) => {
  if (!email) {
    return "Email tidak boleh kosong";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Format email tidak valid (contoh: user@domain.com)";
  }

  if (email.length > 254) {
    return "Email terlalu panjang (maksimal 254 karakter)";
  }

  const parts = email.trim().split("@");
  const [localPart, domain] = parts;

  if (!localPart || localPart.length > 64) {
    return "Bagian sebelum @ terlalu panjang (maksimal 64 karakter)";
  }

  if (email.includes("..")) {
    return "Email tidak boleh mengandung titik berturut-turut (..)";
  }

  if (!domain || !domain.includes(".")) {
    return "Domain email harus mengandung titik (.)";
  }

  return "Email tidak valid";
};

document.addEventListener("DOMContentLoaded", () => {

 const table = $("#userTable").DataTable({
    processing: true,
    serverSide: true,
    responsive: false,
    scrollX: false,
    autowidth: true,
    language: {
        zeroRecords: "Tidak ada User yang ditemukan",
        processing: "Memuat..."
      },
      layout: {
         topEnd: {
            features: {
                search: {
                    placeholder: 'Cari User...'
                }
            }
        },
        bottomEnd: 'paging',
      },
    ajax: {
      url: "/api/user/datatables", // Backend endpoint
      type: "GET",
      data: { id_level: 4 }, // only fetch travels
      dataSrc: (json) => json.data,
    },
    columns: [
      {
        data: "id",
        className: "p-2 text-center border-b dark:text-white",
        render: function (data, type, row) {
          //console.log("Data ID:", row); // Debugging log
          let buttons = `<div class="flex items-center justify-center gap-2">`;

          if (row.akses?.edit) {
            buttons += `
           
              <button onclick="editUser(${row.id})" class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors" title="Edit">
                <i class="ph-bold ph-pencil-simple text-lg"></i>
              </button>`;
          }
          if (row.akses?.delete) {
            buttons += `
             <button onclick="deleteUser(${row.id})" class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 transition-colors" title="Hapus">
                <i class="ph-bold ph-trash text-lg"></i>
              </button>`;
          }

          buttons += `</div>`;
          return buttons;
        },
      },
      { data: "fullname", title: "fullname", className: "font-semibold text-gray-900 dark:text-white p-2 border-b" },
      { data: "username", title: "Username", className: "p-2 border-b dark:text-white", render: data => `<span class="px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs font-mono">${data}</span>` },
      { data: "email", title: "Email", className: "font-semibold text-gray-900 dark:text-white p-2 border-b" },
      { data: "level.nama_level",
        title: "ID Level", className: "p-2 border-b font-semibold text-gray-900 dark:text-white",
        render: function (data, type, row) {
          if (!data) return '';
          return data.charAt(0).toUpperCase() + data.slice(1);
        }
      },
      { data: "is_active", 
        title: "Status",
        className: "p-2 border-b dark:text-white",
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
        class="px-3 py-1 rounded-lg border-b border-b-gray-200 dark:border-b-slate-700 
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
            : 'border-b border-b-gray-200 dark:border-b-slate-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}">
          ${i + 1}
        </button>
      `;
    }

    // NEXT
    paginationHtml += `
      <button 
        ${currentPage === totalPages - 1 ? 'disabled' : ''}
        onclick="goToPage(${currentPage + 1})"
        class="px-3 py-1 rounded-lg border-b border-b-gray-200 dark:border-b-slate-700 
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
    const submitUserBtn = document.getElementById("submitUserBtn");
    
    // Remove previous event listener jika ada
    const newSubmitBtn = submitUserBtn.cloneNode(true);
    submitUserBtn.parentNode.replaceChild(newSubmitBtn, submitUserBtn);
    
    document.getElementById("submitUserBtn").addEventListener("click", async function(e) {
      e.preventDefault();
      
      const id = document.getElementById("hidden_id_user").value;
      const fullname = document.getElementById("fullname").value;
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const id_level_input = document.getElementById("id_level").value;
      const is_active = document.getElementById("is_active").value;
      const no_wa = document.getElementById("no_wa").value;

      // For travel page, force id_level to 4
      const id_level = 4;

      if(!fullname || !username || !email || !is_active ) {
        swal("Peringatan", "Semua field harus diisi dengan benar sebelum submit", "warning");
        return;
      }

      // Validate email format
      if (!isValidEmail(email)) {
        swal("Email Tidak Valid", getEmailErrorMessage(email), "error");
        return;
      }
  
      // Tentukan URL dan method berdasarkan id
      const isUpdate = id !== "";
      const url = isUpdate ? `/api/user/${id}` : `/api/user`;
      const method = isUpdate ? "PUT" : "POST";

      const body = {
        fullname: String(fullname).trim(),
        username: String(username).trim(),
        email: String(email).trim(),
        no_wa: String(no_wa).trim(),
        id_level: id_level,
        is_active: String(is_active).trim(),
      };

      if (!isUpdate) {
        body.password = password; // Hanya kirim password saat create
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
          swal("Berhasil!", data.message || "User berhasil disimpan", "success");
          setTimeout(() => {
            document.getElementById("userFormModal").classList.add("hidden");
            // Reload dengan filter id_level=4
            const table = $("#userTable").DataTable();
            table.ajax.url("/api/user/datatables?id_level=4").load();
          }, 1500);
        } else {
          swal("Gagal!", data.message || "Terjadi kesalahan saat menyimpan data", "error");
        }
      } catch (err) {
        swal("Error!", "Gagal menghubungi server", "error");
      }
    });

    

    document.getElementById("addUserBtn").addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("userForm").reset();
      document.getElementById("hidden_id_user").value = '';
      document.getElementById("modalTitle").innerText = "Tambah User Baru";

      document.getElementById("userFormModal").classList.remove("hidden");

      document.getElementById("password").style.display = "block"; // Tampilkan password field
      document.getElementById("passwordDiv").style.display = "block"; // Tampilkan password field
    });

    // Real-time email validation on input
    const emailInput = document.getElementById("email");
    if (emailInput) {
      emailInput.addEventListener("blur", function() {
        const email = this.value.trim();
        if (email && !isValidEmail(email)) {
          // Add error styling
          this.classList.add("border-red-500", "border-2");
          
          // Show error message if element exists
          let errorMsg = document.getElementById("emailError");
          if (!errorMsg) {
            errorMsg = document.createElement("p");
            errorMsg.id = "emailError";
            errorMsg.className = "text-red-500 text-sm mt-1";
            this.parentNode.appendChild(errorMsg);
          }
          errorMsg.textContent = getEmailErrorMessage(email);
        } else {
          // Remove error styling
          this.classList.remove("border-red-500", "border-2");
          const errorMsg = document.getElementById("emailError");
          if (errorMsg) {
            errorMsg.remove();
          }
        }
      });

      emailInput.addEventListener("focus", function() {
        this.classList.remove("border-red-500", "border-2");
        const errorMsg = document.getElementById("emailError");
        if (errorMsg) {
          errorMsg.remove();
        }
      });
    }


    

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
  try {
    const res = await fetch(`/api/user/${id}`);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const json = await res.json();

    if (json && json.status === "success" && json.data) {
      const user = json.data;
      document.getElementById("hidden_id_user").value = user.id;
      document.getElementById("fullname").value = user.fullname;
      document.getElementById("username").value = user.username;
      document.getElementById("email").value = user.email;
      document.getElementById("no_wa").value = user.no_wa || '';
      document.getElementById("id_level").value = user.id_level;
      document.getElementById("is_active").value = user.is_active;

      document.getElementById("modalTitle").innerHTML = 'Edit User';
      document.getElementById("userFormModal").classList.remove("hidden");
      document.getElementById("password").style.display = "none";
      document.getElementById("passwordDiv").style.display = "none";
    } else {
      console.error("Invalid response structure:", json);
      swal("Gagal", json?.message || "User tidak ditemukan", "error");
    }
  } catch (error) {
    console.error("editUser error:", error);
    swal("Error", error.message || "Gagal mengambil data", "error");
  }
}

window.deleteUser = function(id) {
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
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();

        if (data && data.status === "success") {
          swal("Terhapus!", data.message || "User berhasil dihapus", "success");
          // Reload dengan filter id_level=4
          const table = $("#userTable").DataTable();
          table.ajax.url("/api/user/datatables?id_level=4").load();
        } else {
          console.error("Delete failed:", data);
          swal("Gagal!", data?.message || "Gagal menghapus user", "error");
        }
      } catch (err) {
        console.error("deleteUser error:", err);
        swal("Error!", err.message || "Gagal menghubungi server", "error");
      }
    }
  });
};