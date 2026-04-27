document.addEventListener("DOMContentLoaded", () => {
    const accessModal = document.getElementById('access-modal');
    const accessBackdrop = document.getElementById('access-modal-backdrop');
    const accessPanel = document.getElementById('access-modal-panel');
    const submitAksesBtn = document.getElementById("submitAksesBtn");

    // 1. Inisialisasi DataTable secara Aman
    const tableElement = document.getElementById("userlevelDetail");
    if (!tableElement) return; 

    const table = $(tableElement).DataTable({
        processing: true,
        serverSide: true,
        responsive: true,
        ajax: {
            url: "/api/userlevel/datatables",
            type: "GET",
            dataSrc: (json) => json.data,
        },
        language: {
            zeroRecords: "Tidak ada Userlevel yang ditemukan",
            processing: "Memuat..."
        },
        layout: {
            topEnd: {
                features: {
                    search: {
                        placeholder: 'Cari Userlevel...'
                    }
                }
            },
            bottomEnd: 'paging',
        },
        columns: [
            {
                data: "id_level",
                className: "p-2 border",
                orderable: false,
                render: function (data, type, row) {
                    let buttons = `<div class="flex items-center justify-center gap-2">`;
                    
                    // Tombol Akses
                    buttons += `
                        <button onclick="openAccessModal('${data}', '${row.nama_level}')"
                            class="open-access-btn p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 transition-colors"
                            title="Atur Akses" style="transform: scale(0.9)">
                            <i class="ph-bold ph-key text-lg"></i>
                        </button>`;

                    // Tombol Edit
                    if (row.akses?.edit) {
                        buttons += `
                            <button onclick="editUserLevel('${data}')"
                                class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors"
                                title="Edit" style="transform: scale(0.9)">
                                <i class="ph-bold ph-pencil-simple text-lg"></i>
                            </button>`;
                    }

                    // Tombol Delete
                    if (row.akses?.delete) {
                        buttons += `
                            <button onclick="deleteUserLevel('${data}')"
                                class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 transition-colors"
                                title="Hapus" style="transform: scale(0.9)">
                                <i class="ph-bold ph-trash text-lg"></i>
                            </button>`;
                    }

                    buttons += `</div>`;
                    return buttons;
                },
            },
            {
                data: "id_level",
                className: "p-2 text-center border",
                render: (data) =>
                    `<span class="inline-block px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded font-mono text-xs font-bold">${data}</span>`,
            },
            {
                data: "nama_level",
                className: "p-2 border",
                render: (data) =>
                    `<span class="font-semibold text-gray-900 dark:text-white">${data}</span>`,
            },
        ],
    });

    // 2. Pagination & Info Custom
    table.on("draw.dt", function () {
        renderPagination();
    });

    function renderPagination() {
        const info = table.page.info();
        const currentPage = info.page;
        const totalPages = info.pages;
        const start = info.start + 1;
        const end = info.end;
        const total = info.recordsTotal;

        const infoEl = document.getElementById("customTableInfo");
        if (infoEl) {
            infoEl.innerHTML = `Menampilkan <span class="font-semibold text-gray-900 dark:text-white">${start}-${end}</span> 
                                dari <span class="font-semibold text-gray-900 dark:text-white">${total}</span> level`;
        }

        const paginationEl = document.getElementById("customPagination");
        if (paginationEl) {
            let paginationHtml = `
                <button ${currentPage === 0 ? "disabled" : ""} onclick="goToPage(${currentPage - 1})"
                    class="px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 
                    hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">
                    Prev
                </button>`;

            for (let i = 0; i < totalPages; i++) {
                paginationHtml += `
                    <button onclick="goToPage(${i})"
                        class="w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center
                        ${i === currentPage
                            ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30"
                            : "border border-gray-200 dark:border-slate-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700"}">
                        ${i + 1}
                    </button>`;
            }

            paginationHtml += `
                <button ${currentPage === totalPages - 1 ? "disabled" : ""} onclick="goToPage(${currentPage + 1})"
                    class="px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 
                    hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">
                    Next
                </button>`;

            paginationEl.innerHTML = paginationHtml;
        }
    }


    window.goToPage = function (page) {
        table.page(page).draw("page");
    };

    const searchInput = document.getElementById("customSearch");
    if (searchInput) {
        searchInput.addEventListener("keyup", function () {
            table.search(this.value).draw();
        });
    }

    const entriesSelect = document.getElementById("entriesSelect");
    if (entriesSelect) {
        entriesSelect.addEventListener("change", function () {
            table.page.len(parseInt(this.value)).draw();
        });
    }

    // 5. Submit Create / Update Level
    const submitUserlevel = document.getElementById("submitUserlevel");
    if (submitUserlevel) {
        submitUserlevel.addEventListener("click", async function() {
            try {
                const hidden_id = document.getElementById("hidden_id_userlevel")?.value || "";
                const levelName = document.getElementById("level-name")?.value || "";

                if (!levelName.trim()) {
                    swal("Error", "Nama level tidak boleh kosong", "error");
                    return;
                }

                const method = hidden_id ? "PUT" : "POST";
                const url = hidden_id ? `/api/userlevel/${hidden_id}` : "/api/userlevel";

                this.disabled = true;
                this.innerHTML = `<i class="ph ph-circle-notch animate-spin"></i> Menyimpan...`;

                const res = await fetch(url, {
                    method: method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        id_level: hidden_id || undefined,
                        nama_level: levelName 
                    }),
                });

                const result = await res.json();
                
                if (res.ok) {
                    swal("Berhasil!", hidden_id ? "Level diperbarui" : "Level ditambahkan", "success").then(() => {
                        window.closeAddLevelModal();
                        table.ajax.reload(null, false);
                    });
                } else {
                    swal("Error", result.message || "Gagal menyimpan", "error");
                }
            } catch (err) {
                console.error('Error:', err);
                swal("Error", err.message, "error");
            } finally {
                this.disabled = false;
                this.innerText = "Simpan";
            }
        });
    }
    

    function renderMenuRows(menus, akses, parentId, level, tbody) {
        menus
            .filter(m => m.parent_id == parentId)
            .forEach(menu => {
                const aksesMenu = akses.find(a => a.id_menu == menu.id_menu) || {
                    view_level: "N", add_level: "N", edit_level: "N", 
                    delete_level: "N", print_level: "N", upload_level: "N"
                };

                const tr = document.createElement("tr");
                tr.className = level === 0 
                    ? "bg-primary-50/10 dark:bg-primary-900/5 hover:bg-gray-50 transition-colors" 
                    : "hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors";

                tr.innerHTML = `
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white" style="padding-left: ${level * 1.5 + 1}rem">
                        <div class="flex items-center gap-2">
                            <i class="ph ${level === 0 ? 'ph-squares-four' : 'ph-arrow-elbow-down-right'} text-lg text-gray-400"></i>
                            ${menu.nama_menu}
                        </div>
                    </td>
                    ${renderCheckboxTd(menu.id_menu, "view_level", aksesMenu)}
                    ${renderCheckboxTd(menu.id_menu, "add_level", aksesMenu)}
                    ${renderCheckboxTd(menu.id_menu, "edit_level", aksesMenu)}
                    ${renderCheckboxTd(menu.id_menu, "delete_level", aksesMenu)}
                    ${renderCheckboxTd(menu.id_menu, "print_level", aksesMenu)}
                    ${renderCheckboxTd(menu.id_menu, "upload_level", aksesMenu)}
                `;
                tbody.appendChild(tr);
                
                renderMenuRows(menus, akses, menu.id_menu, level + 1, tbody);
            });
    }

    function renderCheckboxTd(menuId, field, currentAkses) {
        const isChecked = currentAkses[field] === "Y" ? "checked" : "";
        return `
            <td class="whitespace-nowrap px-3 py-4 text-center">
                <input type="checkbox" ${isChecked} 
                    class="checkbox-access accent-primary-600 w-4 h-4 cursor-pointer"
                    data-id_menu="${menuId}" 
                    data-field="${field}">
            </td>`;
    }

    window.toggleModal = (modalId, isOpen) => {
        const modal = document.getElementById(modalId);
        const backdrop = document.getElementById(modalId.replace("-modal", "-backdrop"));
        const panel = document.getElementById(modalId.replace("-modal", "-panel"));

        if (!modal) return;

        if (isOpen) {
            modal.classList.remove("hidden");
            setTimeout(() => {
                if (backdrop) {
                    backdrop.classList.remove("opacity-0");
                    backdrop.classList.add("opacity-100");
                }
                if (panel) {
                    panel.classList.remove("opacity-0", "scale-95");
                    panel.classList.add("opacity-100", "scale-100");
                }
            }, 10);
        } else {
            if (panel) {
                panel.classList.remove("opacity-100", "scale-100");
                panel.classList.add("opacity-0", "scale-95");
            }
            if (backdrop) {
                backdrop.classList.remove("opacity-100");
                backdrop.classList.add("opacity-0");
            }
            setTimeout(() => modal.classList.add("hidden"), 300);
        }
    };

    window.openAddLevelModal = () => {
        try {
            const hiddenId = document.getElementById("hidden_id_userlevel");
            const levelName = document.getElementById("level-name");
            const titleEl = document.querySelector("#add-level-panel h3");

            if (hiddenId) hiddenId.value = "";
            if (levelName) levelName.value = "";
            if (titleEl) titleEl.innerText = "Tambah Level Baru";
            
            window.toggleModal("add-level-modal", true);
        } catch (err) {
            console.error('Error in openAddLevelModal:', err);
            swal("Error", "Gagal membuka form tambah level", "error");
        }
    };

    window.closeAddLevelModal = () => {
        try {
            window.toggleModal("add-level-modal", false);
        } catch (err) {
            console.error('Error in closeAddLevelModal:', err);
        }
    };

    window.editUserLevel = async (id_level) => {
        try {
            const res = await fetch(`/api/userlevel/${id_level}`);
            if (!res.ok) throw new Error("Gagal mengambil data");
            
            const json = await res.json();
            const data = json.data || json;

            const hiddenId = document.getElementById("hidden_id_userlevel");
            const levelName = document.getElementById("level-name");
            const titleEl = document.querySelector("#add-level-panel h3");

            if (hiddenId) hiddenId.value = data.id_level;
            if (levelName) levelName.value = data.nama_level;
            if (titleEl) titleEl.innerText = "Edit User Level";

            window.toggleModal("add-level-modal", true);
        } catch (err) {
            console.error('Error in editUserLevel:', err);
            swal("Error", err.message, "error");
        }
    };

    window.deleteUserLevel = (id_level) => {
        swal({
            title: "Yakin ingin menghapus?",
            text: "Data ini akan dihapus secara permanen.",
            icon: "warning",
            buttons: ["Batal", "Ya, hapus!"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (!willDelete) return;
            try {
                const res = await fetch(`/api/userlevel/${id_level}`, { method: "DELETE" });
                const data = await res.json();
                if (res.ok) {
                    swal("Terhapus!", "Data berhasil dihapus", "success").then(() => {
                        table.ajax.reload(null, false);
                    });
                } else {
                    swal("Gagal!", data.message || "Gagal menghapus", "error");
                }
            } catch (err) {
                console.error('Error in deleteUserLevel:', err);
                swal("Error!", "Server error atau koneksi terputus", "error");
            }
        });
    };


    window.openAccessModal = async (idLevel, levelName) => {
        try {
            const accessLevelName = document.getElementById("modal-level-name");
            if (accessLevelName) accessLevelName.textContent = levelName;

            const res = await fetch(`/api/userlevel/by-level/${idLevel}`);
            const response = await res.json();

            if (!res.ok) throw new Error(response.message);

            const menus = response.data.menus;
            const akses = response.data.akses;

            if (submitAksesBtn) {
                submitAksesBtn.dataset.current_id_level = idLevel;
            }

            const tbody = document.querySelector("#access-modal tbody");
            if (tbody) {
                tbody.innerHTML = "";
                renderMenuRows(menus, akses, null, 0, tbody);
            }

            if (accessModal && accessBackdrop && accessPanel) {
                accessModal.classList.remove('hidden');
                setTimeout(() => {
                    accessBackdrop.classList.remove('opacity-0');
                    accessBackdrop.classList.add('opacity-100');
                    accessBackdrop.classList.remove('pointer-events-none');
                    accessPanel.classList.remove('opacity-0');
                    accessPanel.classList.add('opacity-100');
                    accessPanel.classList.remove('scale-95');
                    accessPanel.classList.add('scale-100');
                }, 10);
            }
        } catch (err) {
            console.error('Error in openAccessModal:', err);
            swal("Error", "Gagal memuat hak akses: " + err.message, "error");
        }
    };

    window.closeAccessModal = () => {
        try {
            window.toggleModal("access-modal", false);
        } catch (err) {
            console.error('Error in closeAccessModal:', err);
        }
    };


    if (submitAksesBtn) {
        submitAksesBtn.addEventListener("click", async function() {
            try {
                const idLevel = this.dataset.current_id_level;
                if (!idLevel) {
                    swal("Error", "ID Level tidak ditemukan", "error");
                    return;
                }

                const checkboxes = document.querySelectorAll(".checkbox-access");
                const aksesList = {};

                checkboxes.forEach(cb => {
                    const menuId = cb.dataset.id_menu;
                    const field = cb.dataset.field;
                    
                    if (!aksesList[menuId]) {
                        aksesList[menuId] = {
                            id_level: parseInt(idLevel),
                            id_menu: parseInt(menuId),
                            view_level: "N", 
                            add_level: "N", 
                            edit_level: "N", 
                            delete_level: "N", 
                            print_level: "N", 
                            upload_level: "N"
                        };
                    }
                    
                    aksesList[menuId][field] = cb.checked ? "Y" : "N";
                });

                const payload = Object.values(aksesList);
                console.log("Payload yang dikirim ke backend:", payload);

                this.disabled = true;
                this.innerHTML = `<i class="ph ph-circle-notch animate-spin"></i> Menyimpan...`;

                const res = await fetch("/api/userlevel/upsert-access", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        id_level: parseInt(idLevel),
                        akses: payload
                    })
                });
                
                const result = await res.json();

                if (res.ok && (result.status === "success" || result.success)) {
                    swal("Berhasil!", "Hak akses telah diperbarui", "success").then(() => {
                        location.reload(); 
                    });
                } else {
                    throw new Error(result.message || "Gagal menyimpan ke database");
                }
            } catch (err) {
                console.error("Save Error:", err);
                swal("Error", err.message, "error");
            } finally {
                this.disabled = false;
                this.innerText = "Simpan Perubahan";
            }
        });

        // Attach backdrop click event
        if (accessBackdrop) {
            accessBackdrop.addEventListener('click', () => {
                window.closeAccessModal();
            });
        }
    }
});