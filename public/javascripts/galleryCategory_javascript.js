document.addEventListener("DOMContentLoaded", () => {

   const table = $('#galleryCategories').DataTable({
      processing: true,
      serverSide: true,
      responsive: true,
      scrollX: false,
      autowidth: true,
      info: false,
      paginate: true,
      lengthMenu: [
        [
        10, 25, 50, 100, -1
        ],
        [
          5, 10, 25, 50, 100, "All"
        ]
      ],
      dom: "t",
      ajax: {
        url: '/api/galleries/galleryCategory/datatables', // Backend endpoint
        type: 'GET',
        dataSrc: (json) => json.data
      },
      columns: [
        {
          data: 'id',
          className: "p-3 text-center",
          render: function (data, type, row) {
            let buttons = `<div class="flex items-center justify-center gap-2">`;

            if (row.akses && row.akses.edit) {
              buttons += `
                <button onclick="editCategory(${row.id})"  class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors galleryCategoryEdit"  title="Edit" style="scale: 0.9">
                        <i class="ph-bold ph-pencil-simple text-lg"></i>
                    </button>`;
            }
            if (row.akses && row.akses.delete) {
              buttons += `
                <button onclick="deleteCategory(${row.id})" class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors galleryCategoryDelete"" title="Hapus" style="scale: 0.9">
                        <i class="ph-bold ph-trash text-lg"></i>
                    </button>`;
            }
            buttons += `</div>`;
            return buttons;
          }
        },
        { 
          data: 'name', title: 'Nama Kategori', className: "font-semibold text-gray-900 dark:text-white" 
        },
        { data: 'slug', title: 'Slug',
          render: data => `<span class="px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs font-mono">${data}</span>` 
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
        $($.fn.dataTable.tables(true)).DataTable()
          .columns.adjust();
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
    document.querySelector('input[placeholder="Cari kategori..."]').addEventListener('keyup', function() {
      table.search(this.value).draw();
    });
  });  


   // CREATE OR UPDATE
    document.getElementById("submitCategoryBtn").addEventListener("click", async () => {
      const id = document.getElementById("hidden_id_category").value;
      // const name = document.getElementById("name").value;
      // const slug = document.getElementById("slug").value;
      const payload = {
         name: document.getElementById("name").value,
         slug: document.getElementById("slug").value
      }
     
    // Tentukan URL dan method berdasarkan id
    const isUpdate = id !== "";
    const url = isUpdate ? `/api/galleries/galleryCategory/${id}` : `/api/galleries/galleryCategory`;
    const method = isUpdate ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            payload
          ),
        });
  
        const data = await res.json();
  
        if (res.ok) {
          swal("Berhasil!", data.message || "Category berhasil ditambahkan", "success");
          setTimeout(() => location.reload(), 1500);
        } else {
          swal("Gagal!", data.message || "Terjadi kesalahan saat menyimpan data", "error");
        }
      } catch (err) {
        swal("Error!", "Gagal menghubungi server", "error");
      }
    });
  //FUNCTION ADD
  function openCategoryModal() {
    document.getElementById("categoryForm").reset();
    document.getElementById("hidden_id_category").value = '';
    document.getElementById("modalTitle").innerText = 'Tambah Kategori';
    document.getElementById("categoryModal").classList.remove("hidden");
  }

  function closeCategoryModal() {
    document.getElementById("categoryModal").classList.add("hidden");
  }

  window.editCategory = async function(id) {
    try {
      const res = await fetch(`/api/galleries/galleryCategory/${id}`);
      const json = await res.json();

      if(json.status === "success") {
        const category = json.data;
        document.getElementById("hidden_id_category").value = category.id;
        document.getElementById("name").value = category.name;
        document.getElementById("slug").value = category.slug;

        document.getElementById("modalTitle").innerText = 'Edit Kategori';
        document.getElementById("categoryModal").classList.remove("hidden");
      } else {
        swal("Gagal", "Terjadi kesalahan saat mengambil data", "error");
        console.error("Response JSON:", json); // Debugging log
      }
    } catch (error) {
      console.error("Error fetching category data:", error);
      swal("Error", "Gagal mengambil data", "error");
    }
  }
   // DELETE
  // 5. DELETE FUNCTION

   window.deleteCategory = async function(id) {
  swal({
    title: "Yakin ingin menghapus?",
    text: "Data yang dihapus tidak dapat dikembalikan!",
    icon: "warning",
    buttons: ["Batal", "Ya, hapus!"],
    dangerMode: true,
  }).then(async (willDelete) => {
    if (willDelete) {
      try {
        const res = await fetch(`/api/galleries/galleryCategory/${id}`, { method: "DELETE" });
        const data = await res.json();

        if (data.status === "success") {
          swal("Terhapus!", data.message, "success");
          $("#galleryCategories").DataTable().ajax.reload();
        } else {
          swal("Gagal!", data.message, "error");
        }
      } catch (err) {
        swal("Error!", "Gagal menghubungi server", "error");
      }
    }
  });
}