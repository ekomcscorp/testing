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
      url: "/api/transactions/jamaah/datatables", // Backend endpoint
      type: "GET",
      dataSrc: (json) => json.data,
    },
    columns: [
      { data: "fullname", title: "fullname", className: "font-semibold text-gray-900 dark:text-white p-2 border-b" },
      { data: "email", title: "Email", className: "font-semibold text-gray-900 dark:text-white p-2 border-b" },
      { data: "phone", title: "Phone", className: "font-semibold text-gray-900 dark:text-white p-2 border-b" },
      { data: "status", title: "Status", className: "font-semibold text-gray-900 dark:text-white p-2 border-b" },
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
    }
  });