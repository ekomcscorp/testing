const accessModal = document.getElementById('access-modal');
const accessBackdrop = document.getElementById('access-modal-backdrop');
const accessPanel = document.getElementById('access-modal-panel');
// const accessLevelName = document.getElementById('modal-level-name');
 document.addEventListener('DOMContentLoaded', () => {
    window.openAccessModal = async (idLevel, levelName) => {
                // 1. Set Nama Level di UI
                const accessLevelName = document.getElementById("modal-level-name");
                if (accessLevelName) accessLevelName.textContent = levelName;

                // 2. Fetch Data dari API
                try {
                    const res = await fetch(`/api/userlevel/by-level/${idLevel}`);
                    const response = await res.json();

                    if (!res.ok) throw new Error(response.message);

                    const menus = response.data.menus;
                    const akses = response.data.akses;

                    // Simpan ID Level ke tombol simpan
                    document.getElementById("submitAksesBtn").dataset.current_id_level = idLevel;

                    // Ambil container tbody
                    const tbody = document.querySelector("#access-modal tbody");
                    tbody.innerHTML = ""; // Bersihkan data lama

                    // 3. Jalankan Fungsi Rekursif Render
                    renderMenuRows(menus, akses, null, 0, tbody);

                    // 4. Tampilkan Modal (Animasi Tailwind)
                    const modal = document.getElementById('access-modal');
                    const backdrop = document.getElementById('access-modal-backdrop');
                    const panel = document.getElementById('access-modal-panel');

                    modal.classList.remove('hidden');
                    setTimeout(() => {
                        backdrop.classList.replace('opacity-0', 'opacity-100');
                        backdrop.classList.remove('pointer-events-none');
                        panel.classList.replace('opacity-0', 'opacity-100');
                        panel.classList.replace('scale-95', 'scale-100');
                    }, 10);

                } catch (err) {
                    console.error(err);
                    swal("Error", "Gagal memuat hak akses: " + err.message, "error");
                }
      }
 })
                 
  function renderMenuRows(menus, akses, parentId, level, tbody) {
                menus
                    .filter(m => m.parent_id == parentId) // Gunakan == untuk handle null/string
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
                        
                        // Panggil anak menu
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

    // document.getElementById("submitAksesBtn").addEventListener("click", async function() {
    //           const idLevel = this.dataset.current_id_level;
    //           const checkboxes = document.querySelectorAll(".checkbox-access");
    //           const aksesList = {};

    //           checkboxes.forEach(cb => {
    //               const menuId = cb.dataset.id_menu;
    //               const field = cb.dataset.field;
    //               const status = cb.checked ? "Y" : "N";

    //               if (!aksesList[menuId]) {
    //                   aksesList[menuId] = {
    //                       id_level: idLevel,
    //                       id_menu: menuId,
    //                       // Inisialisasi semua field agar tidak undefined
    //                       view_level: "N", add_level: "N", edit_level: "N", 
    //                       delete_level: "N", print_level: "N", upload_level: "N"
    //                   };
    //               }
    //               aksesList[menuId][field] = status;
    //           });
    //           const payload = Array.from(aksesList);
    //          console.log("Payload yang dikirim:", payload);
    //           try {
    //               this.disabled = true;
    //               this.innerHTML = `<i class="ph ph-circle-notch animate-spin"></i> Menyimpan...`;

    //               const res = await fetch("/api/userlevel/upsert-access", {
    //                   method: "POST",
    //                   headers: { "Content-Type": "application/json" },
    //                   body: JSON.stringify({ 
    //                       id_level: idLevel,
    //                       akses: Object.values(aksesList) // Pastikan ini dikirim sebagai Array
    //                   })
    //               });
                  
    //               const result = await res.json();

    //               if (res.ok) {
    //                   swal("Berhasil!", "Hak akses telah diperbarui", "success").then(() => {
    //                       // BUG FIX: Otomatis Refresh Halaman
    //                       location.reload(); 
    //                   });
    //               } else {
    //                   throw new Error(result.message || "Gagal menyimpan ke database");
    //               }
    //           } catch (err) {
    //               swal("Error", err.message, "error");
    //           } finally {
    //               this.disabled = false;
    //               this.innerText = "Simpan Perubahan";
    //           }
    // });      
document.getElementById("submitAksesBtn").addEventListener("click", async function() {
    const idLevel = this.dataset.current_id_level;
    const checkboxes = document.querySelectorAll(".checkbox-access");
    
    // Kita gunakan Object biasa saja agar lebih mudah di-convert ke Array values
    const aksesList = {};

    checkboxes.forEach(cb => {
        const menuId = cb.dataset.id_menu;
        const field = cb.dataset.field;
        const status = cb.checked ? "Y" : "N";

        // Jika menuId belum ada di object, inisialisasi
        if (!aksesList[menuId]) {
            aksesList[menuId] = {
                id_level: parseInt(idLevel), // Pastikan Integer
                id_menu: parseInt(menuId),   // Pastikan Integer
                view_level: "N", 
                add_level: "N", 
                edit_level: "N", 
                delete_level: "N", 
                print_level: "N", 
                upload_level: "N"
            };
        }
        
        // Update field spesifik (view_level, add_level, dll)
        aksesList[menuId][field] = status;
    });

    // Ubah Object menjadi Array of Objects
    const payload = Object.values(aksesList);
    
    // DEBUG: Pastikan di console muncul array berisi data lengkap
    console.log("Payload yang dikirim ke backend:", payload);

    try {
        this.disabled = true;
        this.innerHTML = `<i class="ph ph-circle-notch animate-spin"></i> Menyimpan...`;

        const res = await fetch("/api/userlevel/upsert-access", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                id_level: parseInt(idLevel),
                akses: payload // Kirim array hasil Object.values
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
  function closeAccessModal() {
      accessBackdrop.classList.remove('opacity-100');
      accessBackdrop.classList.add('opacity-0');
      accessBackdrop.style.pointerEvents = 'none';
      accessPanel.classList.remove('opacity-100', 'scale-100');
      accessPanel.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            accessModal.classList.add('hidden');
        }, 300);
  }

           accessBackdrop.addEventListener('click', closeAccessModal);


 // ==========================================
// LOGIC: MODAL TAMBAH LEVEL (ADD LEVEL MODAL)
//  ==========================================       
  function openAddLevelModal() {
      document.getElementById("hidden_id_userlevel").value = "";
      document.getElementById("level-name").value = "";
      document.querySelector('#add-level-panel h3').innerText = 'Tambah Level Baru';
      // Panggil fungsi toggleModal (Pastikan fungsi ini terjangkau secara scope)
      const modal = document.getElementById('add-level-modal');
      modal.classList.remove('hidden');
    }        

  function closeAddLevelModal() {
      const modal = document.getElementById('add-level-modal');
      modal.classList.add('hidden');
  }
            
