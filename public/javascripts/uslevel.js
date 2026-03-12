document.addEventListener("DOMContentLoaded", () => {

  $("#userlevelTable").DataTable({
    processing: true,
    serverSide: true,
    responsive: false,
    scrollX: false,
    autoWidth: true,
    ajax: {
      url: "/api/userlevel/datatables",
      type: "GET",
      xhrFields:{
        withCredentials:true
      },
      dataSrc: function (json) {
        console.log("DataTables response:", json); // Debugging log        
        return json.data;
      },
    },
    columns: [
      { data: "id_level", title: "ID Level" },
      { data: "nama_level", title: "Nama Level" },
      {
        data: "id_level",
        title: "Aksi",
        orderable: false,
        render: function (data, type, row) {
  
          let buttons = `<div class="d-flex gap-2 justify-content-center">`;

          // console.log("Data ID:", row); // Debugging log
  
          if (row.akses && row.akses.edit) {
            buttons += `
              <a href="#" class="btn btn-sm btn-warning userlevelEdit" data-id="${row.id_level}">
                <i class="fa fa-edit"></i>
              </a>`;
          }
  
          if (row.akses && row.akses.delete) {
            buttons += `
              <a href="#" class="btn btn-sm btn-danger userlevelDelete" data-id="${row.id_level}">
                <i class="fa fa-times"></i>
              </a>`;
          }
          
            buttons += `
            <a href="#" class="btn btn-sm btn-success userlevelDetail" data-id="${row.id_level}">
              Akses
            </a>`;
  
          buttons += `</div>`;
          return buttons;
        },
      },
    ],
    drawCallback: function () {
      $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
    },
  });
  
  

  // CREATE OR UPDATE
  document.getElementById("submitUserlevel").addEventListener("click", async () => {
    const id = document.getElementById("hidden_id_userlevel").value;
    const nama_level = document.getElementById("nama_level").value;

  // Tentukan URL dan method berdasarkan id
  const isUpdate = id !== "";
  const url = isUpdate ? `/api/userlevel/${id}` : `/api/userlevel`;
  const method = isUpdate ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama_level,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        swal("Berhasil!", data.message || "Userlevel berhasil ditambahkan", "success");
        setTimeout(() => location.reload(), 1500);
      } else {
        swal("Gagal!", data.message || "Terjadi kesalahan saat menyimpan data", "error");
      }
    } catch (err) {
      swal("Error!", "Gagal menghubungi server", "error");
    }
  });

  // MENGISI VALUE FORM (EDIT)
  document.getElementById("userlevelTable").addEventListener("click", async (e) => {
    if (e.target.closest(".userlevelEdit")) {
      e.preventDefault();
      const btn = e.target.closest(".userlevelEdit");
      const id = btn.getAttribute("data-id");

      try {
        const res = await fetch(`/api/userlevel/${id}`);
        const data = await res.json();

        if (data.status === "success") {
          const userlevel = data.data;

          document.getElementById("hidden_id_userlevel").value = userlevel.id_level;
          document.getElementById("nama_level").value = userlevel.nama_level;

          const modal = new bootstrap.Modal(document.getElementById("userlevelModal"));
          modal.show();
        } else {
          swal("Gagal", "Userlevel tidak ditemukan", "error");
        }
      } catch (err) {
        swal("Error", "Gagal menghubungi server", "error");
      }
    }
  });

  // RESET SAAT MENUTUP MODAL
  document.getElementById('userlevelModal').addEventListener('hidden.bs.modal', function () {
      document.getElementById("userlevelForm").reset();
      document.getElementById("hidden_id_userlevel").value = '';
  });
    

  // DELETE
  document.getElementById("userlevelTable").addEventListener("click", async (e) => {
    if (e.target.closest(".userlevelDelete")) {
      e.preventDefault();
      const btn = e.target.closest(".userlevelDelete");
      const id = btn.getAttribute("data-id");

      swal({
        title: "Yakin ingin menghapus?",
        icon: "warning",
        buttons: ["Batal", "Ya, hapus!"],
        dangerMode: true,
      }).then(async (willDelete) => {
        if (willDelete) {
          try {
            const res = await fetch(`/api/userlevel/${id}`, {
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
