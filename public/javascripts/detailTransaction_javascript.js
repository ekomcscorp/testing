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
            },
            body: JSON.stringify({ status: 'SUCCESS' })
        });
        
        const data = await res.json();

        if (res.ok) {
            swal("Berhasil!", data.message, "success").then(() => {
                location.reload();
            });
        } else {
            swal("Gagal!", data.message || "Terjadi kesalahan", "error");
            btn.disabled = false;
            btn.innerHTML = '<i class="ph-bold ph-check"></i> Ya, Approve';
        }
    } catch (err) {
        swal("Error!", "Koneksi ke server terputus", "error");
        btn.disabled = false;
        btn.innerHTML = '<i class="ph-bold ph-check"></i> Ya, Approve';
    }
}

window.rejectApproveBtn = async function(id) {
    const btn = document.getElementById('rejectApproveBtn');
    if (!btn) return;

    btn.disabled = true;
    btn.innerHTML = '<i class="ph-bold ph-circle-notch animate-spin"></i> Processing...';

    try {
        const res = await fetch(`/api/transactions/${id}`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'FAILED' })
        });

        const data = await res.json();

        if (res.ok) {
            swal("Ditolak!", data.message || "Bukti transfer ditolak.", "warning").then(() => {
                location.reload();
            });
        } else {
            swal("Gagal!", data.message || "Terjadi kesalahan saat menolak bukti", "error");
            btn.disabled = false;
            btn.innerHTML = '<i class="ph-bold ph-x"></i> Tolak Bukti';
        }
    } catch (err) {
        swal("Error!", "Koneksi ke server terputus", "error");
        btn.disabled = false;
        btn.innerHTML = '<i class="ph-bold ph-x"></i> Tolak Bukti';
    }
}

window.closeApproveModal = function() {
    document.getElementById('approvePaymentModal').classList.add('hidden');
}

window.confirmApproveInstallmentBtn = async function(installmentId) {
    return window.updateInstallmentProofStatus(installmentId, 'SUCCESS');
};

window.rejectInstallmentBtn = async function(installmentId) {
    return window.updateInstallmentProofStatus(installmentId, 'FAILED');
};

window.updateInstallmentProofStatus = async function(installmentId, status) {
    const btn = status === 'SUCCESS'
        ? document.getElementById('btnApproveInstallment')
        : document.getElementById('btnRejectInstallment');

    const showAlert = (title, message, icon) => {
        if (typeof Swal !== 'undefined') {
            return Swal.fire({
                title: title,
                text: message,
                icon: icon,
                confirmButtonText: "OK"
            });
        } else if (typeof swal !== 'undefined') {
            return swal(title, message, icon);
        } else {
            alert(`${title}: ${message}`);
            return Promise.resolve();
        }
    };

    if (!installmentId) {
        showAlert('Error!', 'ID cicilan tidak ditemukan.', 'error');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = status === 'SUCCESS'
            ? '<i class="ph-bold ph-circle-notch animate-spin"></i> Processing...'
            : '<i class="ph-bold ph-circle-notch animate-spin"></i> Processing...';
    }

    try {
        const res = await fetch(`/api/transactions/installments/${installmentId}/status`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        const data = await res.json();

        if (res.ok && (data.success || data.status === 'success')) {
            const title = status === 'SUCCESS' ? 'Berhasil!' : 'Ditolak!';
            const message = status === 'SUCCESS'
                ? (data.message || 'Pembayaran cicilan berhasil disetujui.')
                : (data.message || 'Bukti pembayaran cicilan berhasil ditolak.');
            showAlert(title, message, status === 'SUCCESS' ? 'success' : 'warning').then(() => {
                location.reload();
            });
        } else {
            showAlert("Gagal!", data.message || "Terjadi kesalahan pada server", "error");
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = status === 'SUCCESS'
                    ? '<i class="ph-bold ph-check"></i> Ya, Approve'
                    : '<i class="ph-bold ph-x"></i> Tolak Bukti';
            }
        }
    } catch (err) {
        console.error('Approval Error:', err);
        showAlert("Error!", "Koneksi ke server terputus", "error");

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = status === 'SUCCESS'
                ? '<i class="ph-bold ph-check"></i> Ya, Approve'
                : '<i class="ph-bold ph-x"></i> Tolak Bukti';
        }
    }
};