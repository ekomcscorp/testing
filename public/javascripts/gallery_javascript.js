document.addEventListener("DOMContentLoaded", () => {

    $('#galleries').DataTable({
      processing: true,
      serverSide: true,
      responsive: false,
      scrollX: false,
      autowidth: true,
      ajax: {
        url: '/api/galleries/gallery/datatables', // Backend endpoint
        type: 'GET',
        dataSrc: function (json) {
          console.log("DataTables response:", json); // Debugging log
          return json.data; // Extract the data array
        }
      },
      columns: [
        {
          data: 'id',
          render: function (data, type, row) {
            console.log("Data ID:", row); // Debugging log
            let buttons = `<div class="d-flex gap-2 justify-content-center">`;

            if (row.akses && row.akses.edit) {
              buttons += `
                <a href="#" class="btn btn-sm btn-warning galleryEdit" data-id="${row.id}">
                  <i class="fa fa-edit"></i>
                </a>`;
            }
            if (row.akses && row.akses.delete) {
              buttons += `
                <a href="#" class="btn btn-sm btn-danger galleryDelete" data-id="${row.id}">
                  <i class="fa fa-times"></i>
                </a>`;
            }

            buttons += `</div>`;
            return buttons;
          }
        },
        { data: 'title', title: 'Judul' },
        { data: 'image_url', title: 'URL Gambar' },
        { data: 'description', title: 'Deskripsi' },
        { data: 'category_id', title: 'ID Kategori' },
        { data: 'created_at', title: 'Dibuat Pada' }
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
  
  

    // CREATE OR UPDATE
    document.getElementById("submitGalleryBtn").addEventListener("click", async () => {
      const id = document.getElementById("hidden_id").value;
      const title = document.getElementById("title").value;
      const image_url = document.getElementById("image_url").value;
      const description = document.getElementById("description").value;
      const category_id = document.getElementById("category_id").value;
  
    // Tentukan URL dan method berdasarkan id
    const isUpdate = id !== "";
    const url = isUpdate ? `/api/galleries/gallery/${id}` : `/api/galleries/gallery`;
    const method = isUpdate ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            image_url,
            description,
            category_id: parseInt(category_id),
          }),
        });
  
        const data = await res.json();
  
        if (res.ok) {
          swal("Berhasil!", data.message || "Gallery berhasil ditambahkan", "success");
          setTimeout(() => location.reload(), 1500);
        } else {
          swal("Gagal!", data.message || "Terjadi kesalahan saat menyimpan data", "error");
        }
      } catch (err) {
        swal("Error!", "Gagal menghubungi server", "error");
      }
    });
  
    // MENGISI VALUE FORM (EDIT)
    document.addEventListener("click", async (e) => {
      if (e.target.closest(".galleryEdit")) {
        e.preventDefault();
        const btn = e.target.closest(".galleryEdit");
        const id = btn.getAttribute("data-id");
    
        try {
          const res = await fetch(`/api/galleries/gallery/${id}`);
          const data = await res.json();
    
          if (data.status === "success") {
            const gallery = data.data;
    
            document.getElementById("hidden_id").value = gallery.id;
            document.getElementById("title").value = gallery.title;
            document.getElementById("image_url").value = gallery.image_url;
            document.getElementById("description").value = gallery.description;
            document.getElementById("category_id").value = gallery.category_id;
    
            const modal = new bootstrap.Modal(document.getElementById("galleryFormModal"));
            modal.show();
          } else {
            swal("Gagal", "Gallery tidak ditemukan", "error");
          }
        } catch (err) {
          swal("Error", "Gagal menghubungi server", "error");
        }
      }
    });

    // RESET SAAT MENUTUP MODAL
    document.getElementById('galleryFormModal').addEventListener('hidden.bs.modal', function () {
        document.getElementById("galleryForm").reset();
        document.getElementById("hidden_id").value = '';
    });
      
  
    // DELETE
    document.addEventListener("click", (e) => {
      if (e.target.closest(".galleryDelete")) {
        e.preventDefault();
        const btn = e.target.closest(".galleryDelete");
        const id = btn.getAttribute("data-id");
    
        swal({
          title: "Yakin ingin menghapus?",
          icon: "warning",
          buttons: ["Batal", "Ya, hapus!"],
          dangerMode: true,
        }).then(async (willDelete) => {
          if (willDelete) {
            try {
              const res = await fetch(`/api/galleries/gallery/${id}`, {
                method: "DELETE",
              });
    
              const data = await res.json();
    
              if (data.status === "success") {
                swal({
                  icon: "success",
                  title: "Terhapus!",
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
  });