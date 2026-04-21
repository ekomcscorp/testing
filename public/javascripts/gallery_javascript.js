document.addEventListener("DOMContentLoaded", async () => {
  //    const tableEl = document.getElementById("galleryCategories");
  // if (!tableEl) return;

  // try {
  //   const res = await fetch("/api/category/datatables");
  //   const json = await res.json();

  //   const rows = json.data || [];

  //   const data = rows.map((row) => {
  //     let buttons = `<div class="flex justify-center gap-2">`;

  //     if (row.akses?.edit) {
  //       buttons += `
  //         <button onclick="editCategory(${row.id})"
  //           class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
  //           <i class="ph-bold ph-pencil-simple"></i>
  //         </button>`;
  //     }

  //     if (row.akses?.delete) {
  //       buttons += `
  //         <button onclick="deleteCategory(${row.id})"
  //           class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
  //           <i class="ph-bold ph-trash"></i>
  //         </button>`;
  //     }

  //     buttons += `</div>`;

  //     return [
  //       buttons,
  //       `<span class="font-semibold text-gray-900 dark:text-white">${row.name}</span>`,
  //       `<span class="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded">${row.slug}</span>`
  //     ];
  //   });

  //   new DataTable(tableEl, {
  //     data: {
  //       headings: ["Action", "Nama", "Slug"],
  //       data: data
  //     },
  //     searchable: true,
  //     sortable: true,
  //     paging: true,
  //     perPage: 5,
  //     perPageSelect: [5, 10, 15, 20],
  //     columns: [
  //       { select: 0, sortable: false } // disable sort di action
  //     ]
  //   });

  // } catch (err) {
  //   console.error("Gagal load data:", err);
  // }

   const table = $('#gallery').DataTable({
      processing: true,
      serverSide: true,
      responsive: true,
      scrollX: false,
      autowidth: true,
      info: false,
      paginate: true,
      //optimasi
      lengthMenu: [
      [5, 10, 50],
      [5, 10, 50]
      ],
      dom: "t",
      ajax: {
        url: '/api/gallery/datatables', // Backend endpoint
        type: 'GET',
        dataSrc: (json) => json.data
      },
      columns: [
        {
          data: 'id',
          className: "p-2 text-center border",
          render: function (data, type, row) {
            let buttons = `<div class="flex items-center justify-center gap-2">`;

            if (row.akses && row.akses.edit) {
              buttons += `
                <button onclick="editGallery(${row.id})"  class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors galleryGalleryEdit"  title="Edit" style="scale: 0.9">
                        <i class="ph-bold ph-pencil-simple text-lg"></i>
                    </button>`;
            }
            if (row.akses && row.akses.delete) {
              buttons += `
                <button onclick="deleteGallery(${row.id})" class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors galleryGalleryDelete"" title="Hapus" style="scale: 0.9">
                        <i class="ph-bold ph-trash text-lg"></i>
                    </button>`;
            }
            buttons += `</div>`;
            return buttons;
          }
        },
        { 
          data: 'title', title: 'Title', className: "p-2 font-semibold text-gray-900 dark:text-white border" 
        },
        { data: 'file_name', title: 'Path',
          className: "p-2 border",
          render: data => `<span class="px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs font-mono">public/assets/img/gallery/${data}</span>` 
        },
        { 
          data: 'file_name', 
          title: 'Gambar',
          className: "p-2 border",
          render: data => `
            <button onclick="showImage('${data}')" 
              class="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 
              dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 transition-colors"
              title="Lihat Gambar" style="scale: 0.9">
              
              <i class="ph-bold ph-eye text-lg"></i>&nbsp;Lihat Gambar
            </button>
          `
        },
        {
          data: 'created_at',
          title: 'Dibuat Pada',
          className: "p-2 border",
          render: function (data) {

            if (!data) return '-';

            const date = new Date(data);

            const dd = String(date.getDate()).padStart(2, '0');
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const yyyy = date.getFullYear();

            const hh = String(date.getHours()).padStart(2, '0');
            const min = String(date.getMinutes()).padStart(2, '0');
            const ss = String(date.getSeconds()).padStart(2, '0');

            return `${dd}-${mm}-${yyyy} | ${hh}:${min}:${ss}`;
          }
        }
      ],
      columnDefs: [
        // { responsivePriority: 1, targets: 0 }, // Title
        // { responsivePriority: 2, targets: 1 }, // Image URL
        // { responsivePriority: 3, targets: 5 },  // Action
        { targets: 0, width: '10%' },
        { targets: 1, width: '25%' },
        { targets: 2, width: '20%' },
        { targets: 3, width: '22%' },
        { targets: 4, width: '23%' }
      ],
      drawCallback: function () {
        // Force redraw untuk sync header & body
        $($.fn.dataTable.tables(true)).DataTable()
          .columns.adjust();
      }
    });
    
    window.showImage = function(fileName) {
      const modal = document.getElementById('imageModal');
      const img = document.getElementById('modalImage');

      img.src = 'assets/img/gallery/' + fileName;

      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    window.closeModal = function() {
      const modal = document.getElementById('imageModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    document.getElementById('imageModal').addEventListener('click', function(e) {
      if (e.target.id === 'imageModal') {
        closeModal();
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
    document.querySelector('input[placeholder="Cari Gallery..."]').addEventListener('keyup', function() {
      table.search(this.value).draw();
    });
  });  

   // CREATE OR UPDATE
  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("submitGalleryBtn").addEventListener("click", async () => {

      const id = document.getElementById("hidden_id_gallery").value;
      const title = document.getElementById("title").value;
      const imageInput = document.getElementById("imageInput");

      // pakai FormData
      const formData = new FormData();
      formData.append("title", title);

      // ambil file
      if (imageInput.files[0]) {
        formData.append("image", imageInput.files[0]);
      }

      const isUpdate = id && id !== "";
      const url = isUpdate ? `/api/gallery/${id}` : `/api/gallery`;
      const method = isUpdate ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method: method,
          body: formData,
        });

        const data = await res.json();

        if (res.ok) {
          swal("Berhasil!", data.message || "Gallery berhasil disimpan", "success");
          setTimeout(() => location.reload(), 1500);
        } else {
          swal("Gagal!", data.message || "Terjadi kesalahan", "error");
        }

      } catch (err) {
        swal("Error!", "Gagal menghubungi server", "error");
      }
    });
  });

  //FUNCTION ADD
  function openGalleryModal() {
    document.getElementById("galleryForm").reset();
    document.getElementById("hidden_id_gallery").value = '';
    document.getElementById("modalTitle").innerText = 'Tambah Gallery';
    document.getElementById("galleryModal").classList.remove("hidden");
  }

  function closeGalleryModal() {
    document.getElementById("galleryModal").classList.add("hidden");
  }

  window.editGallery = async function(id) {
    try {
      const res = await fetch(`/api/gallery/${id}`);
      const json = await res.json();

      if (json.success) {
        const gallery = json.data;

        document.getElementById("hidden_id_gallery").value = gallery.id;
        document.getElementById("title").value = gallery.title;

        // JANGAN SET VALUE INPUT FILE
        const imageInput = document.getElementById("imageInput");
        imageInput.value = ""; // kalau mau reset, ini boleh

        // tampilkan preview gambar lama
        const preview = document.getElementById("previewImage");
        if (preview) {
          preview.src = `/assets/img/gallery/${gallery.file_name}`;
          preview.style.display = "block";
        }

        document.getElementById("modalTitle").innerText = 'Edit Gallery';
        document.getElementById("galleryModal").classList.remove("hidden");

      } else {
        swal("Gagal", "Terjadi kesalahan saat mengambil data", "error");
        console.error("Response JSON:", json);
      }
    } catch (error) {
      console.error("Error fetching gallery data:", error);
      swal("Error", "Gagal mengambil data", "error");
    }
  }

  const uploadBox = document.getElementById('uploadBox');
  const imageInput = document.getElementById('imageInput');
  const previewImage = document.getElementById('previewImage');

  // klik → buka file
  uploadBox.addEventListener('click', () => {
    imageInput.click();
  });

  // preview dari input
  imageInput.addEventListener('change', function () {
    handleFile(this.files[0]);
  });

  // DRAG OVER (biar bisa drop)
  uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('border-primary-500', 'bg-primary-50');
  });

  // DRAG LEAVE
  uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('border-primary-500', 'bg-primary-50');
  });

  // DROP FILE
  uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('border-primary-500', 'bg-primary-50');

    const file = e.dataTransfer.files[0];
    handleFile(file);
  });

  // FUNCTION HANDLE FILE
  function handleFile(file) {
    if (!file) return;

    // validasi image
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar!');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
      previewImage.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }

   // DELETE
  // 5. DELETE FUNCTION

  window.deleteGallery = async function(id) {
    swal({
      title: "Yakin ingin menghapus?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      buttons: ["Batal", "Ya, hapus!"],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
          const data = await res.json();

          if (data.success) {
            swal("Terhapus!", data.message, "success");
            $("#gallery").DataTable().ajax.reload();
          } else {
            swal("Gagal!", data.message, "error");
          }
        } catch (err) {
          swal("Error!", "Gagal menghubungi server", "error");
        }
      }
    });
  }