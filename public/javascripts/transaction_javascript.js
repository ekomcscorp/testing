document.addEventListener("DOMContentLoaded", () => {
    $('#transactionsTable').DataTable({
        processing: true,
        serverSide: true,
        responsive: false,
        scrollX: false,
        autowidth: true,
        ajax: {
            url: '/api/transaction/datatables', // Backend endpoint
            type: 'GET',
            dataSrc: function (json) {
                // console.log("DataTables response:", json); // Debugging log
                return json.data; // Extract the data array
            }
        },
        columns: [
            {
                data: 'id',
                render: function (data, type, row) {
                    // console.log("Data ID:", row); // Debugging log
                    let buttons = `<div class="d-flex gap-2 justify-content-center">`;

                    if (row.akses && row.akses.edit) {
                        buttons += `
                            <a href="#" class="btn btn-sm btn-warning transactionEdit" data-id="${row.id}">
                                <i class="fa fa-edit"></i>
                            </a>`;
                    }
                    if (row.akses && row.akses.delete) {
                        buttons += `
                            <a href="#" class="btn btn-sm btn-danger transactionDelete" data-id="${row.id}">
                                <i class="fa fa-times"></i>
                            </a>`;
                    }
                    buttons += `<a href="#" class="btn btn-sm btn-info transactionDetail" data-id="${row.id}">
                    Details
                    </a>`;
                    buttons += `</div>`;
                    return buttons;
                }
            },
            { data: 'name', title: 'Nama' },
            { data: 'created_at', title: 'Tanggal' },
            { data: 'transaction_no', title: 'No Transaksi' },
            { data: 'amount', title: 'Amount' },
            { data: 'status', title: 'Status' },
        ],
        drawCallback: function () {
            // Force redraw untuk sync header & body
            $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
        },
        // "columnDefs": [
        //     {
        //         "targets": [1,2,3,4,5],
        //         "className": 'dt-body-nowrap'
        //     }, {
        //         "targets": [0, 1],
        //         "orderable": false
        //     }
        // ]
    });
    // CREATE OR UPDATE
    document.getElementById("submitTransactionBtn").addEventListener("click", async () => {
        const id = document.getElementById("hidden_id").value;
        const name = document.getElementById("name").value;
        const transaction_date = document.getElementById("created_at").value;
        const transaction_no = document.getElementById("transaction_no").value;
        const amount = document.getElementById("amount").value;
        const status = document.getElementById("status").value;

        const isUpdate = id !== "";
        const url = isUpdate ? `/api/transaction/${id}` : '/api/transaction';
        const method = isUpdate ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    transaction_date,
                    transaction_no,
                    amount,
                    status
                })
            });

            const data = await res.json();
            if(res.ok){
                swal("Berhasil", data.message || "Transaksi berhasil ditambahkan", "success");
                setTimeout(() => location.reload(), 1500);
            } else {
                swal("Gagal", data.error || "Terjadi kesalahan", "error");
            }
        } catch (error) {
            swal("Gagal", error.message || "Terjadi kesalahan", "error");
        }
    });

    // MENGISI VALUE FORM
    document.getElementById('transactionsTable').addEventListener("click", async (e) => {
        if(e.target.closest(".transactionEdit")){
            e.preventDefault();
            const id = e.target.closest(".transactionEdit").getAttribute("data-id");

            try {
                const res = await fetch(`/api/transaction/${id}`);
                const data = await res.json();

                if(data.status === "success"){
                    const transaction = data.data;
                    

                    document.getElementById("hidden_id").value = transaction.id;
                    document.getElementById("name").value = transaction.name;
                    document.getElementById("created_at").value;
                    document.getElementById("transaction_no").value = transaction.transaction_no;
                    document.getElementById("amount").value = transaction.amount;
                    document.getElementById("status").value = transaction.status;

                    const modal = new bootstrap.Modal(document.getElementById("transactionFormModal"));
                    modal.show();
                } else {
                    swal("Gagal", data.message || "Terjadi kesalahan", "error");
                }
            } catch (error) {
                swal("Gagal", error.message || "Terjadi kesalahan", "error");
            }
        }
    });

    // RESET SAAT MENUTUP MODAL
    document.getElementById('transactionFormModal').addEventListener('hidden.bs.modal', function () {
        document.getElementById("transactionForm").reset();
        document.getElementById("hidden_id").value = '';
    });

    // DELETE
    document.getElementById("transactionsTable").addEventListener("click", async (e) => {
        if(e.target.closest(".transactionDelete")){
            e.preventDefault();
            const id = e.target.closest(".transactionDelete").getAttribute("data-id");

            swal({
                title: "Yakin ingin menghapus?",
                text: "Data yang dihapus tidak dapat dikembalikan!",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
            .then(async (willDelete) => {
                if (willDelete) {
                    try {
                        const res = await fetch(`/api/transaction/${id}`, {
                            method: 'DELETE'
                        });
                        const data = await res.json();

                        if(res.ok){
                            swal("Berhasil", data.message || "Transaksi berhasil dihapus", "success");
                            setTimeout(() => location.reload(), 1500);
                        } else {
                            swal("Gagal", data.error || "Terjadi kesalahan", "error");
                        }
                    } catch (error) {
                        swal("Gagal", error.message || "Terjadi kesalahan", "error");
                    }
                }
            });
        }
    })
})