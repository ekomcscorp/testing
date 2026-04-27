window.confirmApproveBtn = async function(id) {
    const btn = document.getElementById('confirmApproveBtn');
    
    // Disable tombol & tampilkan loading
    btn.disabled = true;
    btn.innerHTML = '<i class="ph-bold ph-circle-notch animate-spin"></i> Processing...';

    try {
        const res = await fetch(`/api/transactions/${id}`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await res.json();

        if (res.ok) {
            swal("Berhasil!", data.message, "success").then(() => {
                location.reload();
            });
        } else {
            swal("Gagal!", data.message || "Terjadi kesalahan", "error");
            // Kembalikan tombol jika gagal
            btn.disabled = false;
            btn.innerHTML = '<i class="ph-bold ph-check"></i> Ya, Approve';
        }
    } catch (err) {
        swal("Error!", "Koneksi ke server terputus", "error");
        btn.disabled = false;
        btn.innerHTML = '<i class="ph-bold ph-check"></i> Ya, Approve';
    }
}

window.closeApproveModal = function() {
    document.getElementById('approvePaymentModal').classList.add('hidden');
}