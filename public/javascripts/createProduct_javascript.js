document.addEventListener("DOMContentLoaded", async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // --- STATES ---
    const ProductState = {
        category_id: null,
        nama_produk: "",
        tgl_keberangkatan: "",
        quota: 0,
        duration: 0,
        tmp_keberangkatan: "",
        thumbnail_url: "",
        description: "",
        status: "draft"
    };

    const ProductPriceState = [
        { type: "Quad", price: 0 },
        { type: "Double", price: 0 },
        { type: "Triple", price: 0 }
    ];

    const ProductFlightState = {
        Departure: { airline_name: "" },
        Return: { airline_name: "" }
    };

    const ProductHotelState = {
        Mekkah: { name: "", rating: null, jarak: "", facilities: "" },
        Madinah: { name: "", rating: null, jarak: "", facilities: "" }
    };

    const ProductFacilityState = { INCLUDE: [], EXCLUDE: [] };
    const ProductSnKState = [];
    const ProductNoteState = [];
    const ProductItineraryState = [];

    let thumbnail_file = null;
    let hotelImageFiles = { Mekkah: null, Madinah: null };

     function fillFormData(data) {
    // --- 1. Field Utama Produk ---
    $('#nama_produk').val(data.nama_produk);
    ProductState.nama_produk = data.nama_produk;

    $('#category_id').val(data.category_id);
    ProductState.category_id = data.category_id

    $('#status').val(data.status);
    ProductState.status = data.status;

    $('#quota').val(data.quota);
    ProductState.quota = Number(data.quota);

    $('#duration').val(data.duration);
    ProductState.duration = Number(data.duration);

    $('#tmp_keberangkatan').val(data.tmp_keberangkatan);
    ProductState.tmp_keberangkatan = data.tmp_keberangkatan;

    $('#date').val(data.tgl_keberangkatan);
    ProductState.tgl_keberangkatan = data.tgl_keberangkatan;

    $('#description').val(data.description);
    ProductState.description = data.description;
    // --- 2. Thumbnail Preview ---
    if (data.thumbnail_url) {
        // You may need to add an <img id="thumbnailPreview"> in your EJS if not present
        $('#thumbnailPreview').attr('src', `/assets/img/products/thumbnails/${data.thumbnail_url}`).show();
        ProductState.thumbnail_url = data.thumbnail_url;
    }

    // --- 3. Data Relasi: Prices (Tipe Kamar & Harga) ---
    if (data.prices && data.prices.length > 0) {
        // Reset state
        ProductPriceState.forEach(ps => ps.price = 0);
        data.prices.forEach(p => {
            if (p.type === "Quad") {
                $("input[name='price_quad']").val(p.price);
                ProductPriceState.find(ps => ps.type === "Quad").price = p.price;
            } else if (p.type === "Triple") {
                $("input[name='price_triple']").val(p.price);
                ProductPriceState.find(ps => ps.type === "Triple").price = p.price;
            } else if (p.type === "Double") {
                $("input[name='price_double']").val(p.price);
                ProductPriceState.find(ps => ps.type === "Double").price = p.price;
            }
        });
    }

    // --- 4. Data Relasi: Flights ---
    if (data.flights && data.flights.length > 0) {
        data.flights.forEach(f => {
            if (f.type === "Departure") {
                $('#flight_kbrkt').val(f.airline_name);
                ProductFlightState.Departure.airline_name = f.airline_name;
            } else if (f.type === "Return") {
                $('#flight_kplg').val(f.airline_name);
                ProductFlightState.Return.airline_name = f.airline_name;
            }
        });
    }

    // --- 5. Data Relasi: Hotels ---
    if (data.hotels && data.hotels.length > 0) {
        data.hotels.forEach(h => {
            if (h.city === "Mekkah") {
                // Hotel Mekkah
                $("#hotel_mekkah input[name='include']").val(h.name);
                $("#hotel_mekkah select").val(h.rating);
                $("#hotel_mekkah input[placeholder='50m']").val(h.jarak);
                $('#mekkah_fclty').val(h.facilities);
                // Preview image if needed
                ProductHotelState.Mekkah = { name: h.name, rating: h.rating, jarak: h.jarak, facilities: h.facilities };
                if(h.image) $('#preview_mekkah').attr('src', `/assets/img/products/hotels/${h.image}`);
            } else if (h.city === "Madinah") {
                // Hotel Madinah
                $("#hotel_madinah input[name='exclude']").val(h.name);
                $("#hotel_madinah select").val(h.rating);
                $("#hotel_madinah input[placeholder='100m']").val(h.jarak);
                $('#madinah_fclty').val(h.facilities);
                ProductHotelState.Madinah = { name: h.name, rating: h.rating, jarak: h.jarak, facilities: h.facilities };
                if(h.image) $('#preview_madinah').attr('src', `/assets/img/products/hotels/${h.image}`);
            }
        });
    }

    // --- 6. Data Relasi: Itinerary ---
    if (data.itinerary && data.itinerary.length > 0) {
        $('#roadmap_option').empty();
        ProductItineraryState.length = 0;
        data.itinerary.sort((a, b) => a.day_order - b.day_order).forEach(i => {
            const item = { day_order: i.day_order, title: i.title, description: i.description };
            ProductItineraryState.push(item);
            if (typeof addItineraryRow === 'function') {
                addItineraryRow(i.day_order, i.title, i.description);
            } else {
                // Fallback: Render itinerary item directly
                const container = document.getElementById('roadmap_option');
                const div = document.createElement('div');
                div.className = "relative group itinerary-item mb-4";
                div.innerHTML = `
                    <span class="absolute -left-[2.1rem] top-4 w-4 h-4 rounded-full bg-primary-600 border-4 border-white dark:border-dark-card"></span>
                    <div class="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div class="md:col-span-2">
                                <label class="block text-xs font-semibold text-gray-500 uppercase">Hari</label>
                                <input type="text" value="${item.day_order}" readonly class="itinerary-day w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 font-bold text-center" required>
                            </div>
                            <div class="md:col-span-3">
                                <label class="block text-xs font-semibold text-gray-500 uppercase">Lokasi</label>
                                <input type="text" value="${item.title}" placeholder="Lokasi" class="itinerary-title w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 outline-none focus:border-primary-500">
                            </div>
                            <div class="md:col-span-6">
                                <label class="block text-xs font-semibold text-gray-500 uppercase">Aktivitas</label>
                                <input type="text" value="${item.description}" placeholder="Aktivitas" class="itinerary-desc w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 outline-none focus:border-primary-500" required>
                            </div>
                            <div class="md:col-span-1 flex items-end justify-end">
                                <button type="button" class="p-2 text-red-500 hover:bg-red-50 rounded-lg btn-remove-roadmap">
                                    <i class="ph-bold ph-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                div.querySelector('.itinerary-title').addEventListener('input', (e) => item.title = e.target.value);
                div.querySelector('.itinerary-desc').addEventListener('input', (e) => item.description = e.target.value);
                div.querySelector('.btn-remove-roadmap').addEventListener('click', () => {
                    const idx = ProductItineraryState.indexOf(item);
                    if (idx > -1) ProductItineraryState.splice(idx, 1);
                    div.remove();
                    updateRoadmapOrder();
                });
                container.appendChild(div);
            }
        });
    }

    // --- 7. Data Relasi: Fasilitas, SnK, & Notes ---
    if (data.facility) {
        $('#include-container').empty();
        $('#exclude-container').empty();
        ProductFacilityState.INCLUDE.length = 0;
        ProductFacilityState.EXCLUDE.length = 0;
        data.facility.forEach(f => {
            if (f.type === "INCLUDE") {
                ProductFacilityState.INCLUDE.push(f.facility);
                createListItem(f.facility, 'include-container', ProductFacilityState.INCLUDE, 'bg-green-50/50');
            } else if (f.type === "EXCLUDE") {
                ProductFacilityState.EXCLUDE.push(f.facility);
                createListItem(f.facility, 'exclude-container', ProductFacilityState.EXCLUDE, 'bg-red-50/50');
            }
        });
    }
    if (data.snk) {
        $('#snk-container').empty();
        ProductSnKState.length = 0;
        data.snk.forEach(s => {
            ProductSnKState.push(s.name);
            createListItem(s.name, 'snk-container', ProductSnKState, 'bg-gray-50');
        });
    }
    if (data.notes) {
        $('#note-container').empty();
        ProductNoteState.length = 0;
        data.notes.forEach(n => {
            ProductNoteState.push(n.note);
            createListItem(n.note, 'note-container', ProductNoteState, 'bg-blue-50/50');
        });
    }
}



     if (productId) {
        try {
            const response = await fetch(`/api/products/products/${productId}`);
            
            // Cek apakah response-nya oke (status 200)
            if (!response.ok) {
                const text = await response.text(); // Ambil teks error jika bukan JSON
                console.error("Server Error Response:", text);
                throw new Error(`Server returned status ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                fillFormData(result.data);
            }
        } catch (error) {
            console.error("Error fetching product data:", error);
            swal("Gagal!", "Gagal mengambil data produk. Cek koneksi atau URL.", "error");
        }
    }
    // --- INITIALIZATION ---
    loadCategory();
    // --- UI HELPERS (TAILWIND STYLE) ---

    // Helper untuk membuat List Item (Note, SnK, Facility)
    function createListItem(text, containerId, stateArray, colorClass = "bg-gray-50") {
        const container = document.getElementById(containerId);
        const li = document.createElement('li');
        li.className = `flex justify-between items-center ${colorClass} dark:bg-slate-800/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700 transition-all group`;
        
        li.innerHTML = `
            <span class="text-sm text-gray-700 dark:text-gray-300">${text}</span>
            <button type="button" class="text-gray-400 hover:text-red-500 transition-colors">
                <i class="ph-bold ph-x"></i>
            </button>
        `;

        li.querySelector('button').addEventListener('click', () => {
            const index = stateArray.indexOf(text);
            if (index > -1) stateArray.splice(index, 1);
            li.remove();
        });

        container.appendChild(li);
    }

    // --- EVENT LISTENERS ---

    // Input Utama
    document.getElementById("nama_produk").addEventListener("input", (e) => ProductState.nama_produk = e.target.value);
    document.getElementById("date").addEventListener("input", (e) => ProductState.tgl_keberangkatan = e.target.value);
    document.getElementById("tmp_keberangkatan").addEventListener("input", (e) => ProductState.tmp_keberangkatan = e.target.value);
    document.getElementById("duration").addEventListener("input", (e) => ProductState.duration = e.target.value);
    document.getElementById("quota").addEventListener("input", (e) => ProductState.quota = Number(e.target.value));
    document.getElementById("description").addEventListener("input", (e) => ProductState.description = e.target.value);
    document.getElementById("status").addEventListener("change", (e) => ProductState.status = e.target.value);
    
    // Maskapai
    document.getElementById("flight_kbrkt").addEventListener("input", (e) => ProductFlightState.Departure.airline_name = e.target.value);
    document.getElementById("flight_kplg").addEventListener("input", (e) => ProductFlightState.Return.airline_name = e.target.value);

    // Kategori (Select2)
    $('#category_id').on('change', function () {
        ProductState.category_id = $(this).val() ? Number($(this).val()) : null;
    });

    // File Uploads
    document.getElementById("thumbnail").addEventListener("change", (e) => {
        thumbnail_file = e.target.files[0];
        if (thumbnail_file) ProductState.thumbnail_url = thumbnail_file.name;
    });

    document.getElementById("hotel_mekkah_image").addEventListener("change", (e) => hotelImageFiles.Mekkah = e.target.files[0]);
    document.getElementById("hotel_madinah_image").addEventListener("change", (e) => hotelImageFiles.Madinah = e.target.files[0]);

    // Price Inputs (Mapping dari ID partials)
    // ['price_quad', 'price_triple', 'price_double'].forEach(id => {
    //     const el = document.getElementById(id);
    //     if (el) {
    //         el.addEventListener("input", (e) => {
    //             const type = id.replace('price_', '').charAt(0).toUpperCase() + id.replace('price_', '').slice(1);
    //             const item = ProductPriceState.find(p => p.type === type);
    //             if (item) item.price = Number(e.target.value);
    //         });
    //     }
    // });
    document.querySelectorAll("[data-type]").forEach(input => {
    input.addEventListener("input", (e) => {
        const type = e.target.dataset.type;
        const item = ProductPriceState.find(p => p.type === type);

        if (item) {
            // Simpan nilai asli (dengan titik) ke state sementara 
            // atau biarkan saja, karena nanti dibersihkan saat SUBMIT
            item.price = e.target.value; 
        }
        
        // Opsional: Tambahkan auto-format titik saat user mengetik
        let rawValue = e.target.value.replace(/\D/g, "");
        e.target.value = new Intl.NumberFormat('id-ID').format(rawValue);
    });
});

    // Dynamic Lists (Enter Keys)
    const setupListInput = (inputId, containerId, stateArray, color) => {
        document.getElementById(inputId).addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const val = e.target.value.trim();
                if (val && !stateArray.includes(val)) {
                    stateArray.push(val);
                    createListItem(val, containerId, stateArray, color);
                    e.target.value = "";
                }
            }
        });
    };

    setupListInput("include-fclty", "include-container", ProductFacilityState.INCLUDE, "bg-green-50/50");
    setupListInput("exclude-fclty", "exclude-container", ProductFacilityState.EXCLUDE, "bg-red-50/50");
    setupListInput("snk", "snk-container", ProductSnKState, "bg-gray-50");
    setupListInput("note", "note-container", ProductNoteState, "bg-blue-50/50");

    // --- ITINERARY LOGIC (TAILWIND UI) ---
    document.getElementById('addRoadmap').addEventListener('click', () => {
        const container = document.getElementById('roadmap_option');
        const index = ProductItineraryState.length;

        const item = { day_order: index + 1, title: "", description: "" };
        ProductItineraryState.push(item);

        const div = document.createElement('div');
        div.className = "relative group itinerary-item mb-4";
        div.innerHTML = `
            <span class="absolute -left-[2.1rem] top-4 w-4 h-4 rounded-full bg-primary-600 border-4 border-white dark:border-dark-card"></span>
            <div class="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div class="md:col-span-2">
                        <label class="block text-xs font-semibold text-gray-500 uppercase">Hari</label>
                        <input type="text" value="${item.day_order}" readonly class="itinerary-day w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 font-bold text-center" required>
                    </div>
                    <div class="md:col-span-3">
                        <label class="block text-xs font-semibold text-gray-500 uppercase">Lokasi</label>
                        <input type="text" placeholder="Lokasi" class="itinerary-title w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 outline-none focus:border-primary-500">
                    </div>
                    <div class="md:col-span-6">
                        <label class="block text-xs font-semibold text-gray-500 uppercase">Aktivitas</label>
                        <input type="text" placeholder="Aktivitas" class="itinerary-desc w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 outline-none focus:border-primary-500" required>
                    </div>
                    <div class="md:col-span-1 flex items-end justify-end">
                        <button type="button" class="p-2 text-red-500 hover:bg-red-50 rounded-lg btn-remove-roadmap">
                            <i class="ph-bold ph-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Sync inputs with state
        div.querySelector('.itinerary-title').addEventListener('input', (e) => item.title = e.target.value);
        div.querySelector('.itinerary-desc').addEventListener('input', (e) => item.description = e.target.value);
        div.querySelector('.btn-remove-roadmap').addEventListener('click', () => {
            const idx = ProductItineraryState.indexOf(item);
            if (idx > -1) ProductItineraryState.splice(idx, 1);
            div.remove();
            updateRoadmapOrder();
        });

        container.appendChild(div);
    });

    function updateRoadmapOrder() {
        document.querySelectorAll('.itinerary-item').forEach((el, idx) => {
            const newDay = idx + 1;
            el.querySelector('.itinerary-day').value = newDay;
            ProductItineraryState[idx].day_order = newDay;
        });
    }

    // --- SUBMIT LOGIC ---
    function collectHotelData() {
        // Mekkah
        const mekkahRoot = document.getElementById("hotel_mekkah");
        ProductHotelState.Mekkah.name = mekkahRoot.querySelector("input[name='include']").value;
        ProductHotelState.Mekkah.rating = mekkahRoot.querySelector("select").value;
        ProductHotelState.Mekkah.jarak = mekkahRoot.querySelector("input[placeholder='50m']").value;
        ProductHotelState.Mekkah.facilities = document.getElementById("mekkah_fclty").value;

        // Madinah
        const madinahRoot = document.getElementById("hotel_madinah");
        ProductHotelState.Madinah.name = madinahRoot.querySelector("input[name='exclude']").value;
        ProductHotelState.Madinah.rating = madinahRoot.querySelector("select").value;
        ProductHotelState.Madinah.jarak = madinahRoot.querySelector("input[placeholder='100m']").value;
        ProductHotelState.Madinah.facilities = document.getElementById("madinah_fclty").value;
    }

    document.getElementById("formProduct").addEventListener("submit", async (e) => {
        e.preventDefault();
        collectHotelData();

        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        const url = productId ? `/api/products/products/${productId}` : '/api/products/products';
         const method = productId ? 'PUT' : 'POST';

        if (!ProductState.category_id) return swal("Oops!", "Kategori belum dipilih", "warning");

        const getCleanNumber = (value) => {
            if (!value) return 0;
            // Mengubah "30.000.000" (string) menjadi 30000000 (number)
            const cleanValue = value.toString().replace(/\D/g, '');
            return parseInt(cleanValue, 10) || 0;
        } 

        ProductPriceState.forEach(p => {
          // Ambil value langsung dari input HTML agar mendapatkan data terbaru yang ada titiknya
            const inputElement = document.querySelector(`[data-type="${p.type}"]`);
            if (inputElement) {
                p.price = getCleanNumber(inputElement.val || inputElement.value);
            } else {
                // Fallback jika input tidak ketemu, bersihkan data yang ada di state
                p.price = getCleanNumber(p.price);
            }
        });
        const formData = new FormData();

        // Append Data Utama
        Object.entries(ProductState).forEach(([key, val]) => formData.append(key, val));

        // Append Complex Data as Strings (Agar sinkron dengan Controller Backend kamu)
        formData.append("prices", JSON.stringify(ProductPriceState));
        formData.append("flights", JSON.stringify([
            { type: "Departure", airline_name: ProductFlightState.Departure.airline_name },
            { type: "Return", airline_name: ProductFlightState.Return.airline_name }
        ]));
        formData.append("hotels", JSON.stringify([
            { city: "Mekkah", ...ProductHotelState.Mekkah },
            { city: "Madinah", ...ProductHotelState.Madinah }
        ]));
        formData.append("facilities", JSON.stringify([
            ...ProductFacilityState.INCLUDE.map(f => ({ type: "INCLUDE", facility: f })),
            ...ProductFacilityState.EXCLUDE.map(f => ({ type: "EXCLUDE", facility: f }))
        ]));
        formData.append("itineraries", JSON.stringify(ProductItineraryState));
        formData.append("snks", JSON.stringify(ProductSnKState.map(s => ({ name: s }))));
        formData.append("notes", JSON.stringify(ProductNoteState.map(n => ({ note: n }))));

        // Append Files
        if (thumbnail_file) formData.append("thumbnail", thumbnail_file);
        if (hotelImageFiles.Mekkah) formData.append("hotel_image_mekkah", hotelImageFiles.Mekkah);
        if (hotelImageFiles.Madinah) formData.append("hotel_image_madinah", hotelImageFiles.Madinah);

        try {
            const res = await fetch(url, { 
                method: method, 
                body: formData 
            });
            const data = await res.json();
            if (res.ok) {
                swal("Berhasil", "Produk berhasil disimpan", "success").then(() => window.location.href = "/products");
            } else {
                swal("Gagal", data.message || "Terjadi kesalahan", "error");
            }
        } catch (err) {
            swal("Error", "Gagal menghubungi server", "error");
        }
    });

    
});

async function loadCategory() {
    try {
        const res = await fetch('/api/galleries/galleryCategory/');
        const result = await res.json();

        if (result.status !== "success") {
            throw new Error("Gagal mengambil data kategori");
        }
        
        const selectElements = document.getElementById("category_id");
        
        if(selectElements) {
            // Reset content
            selectElements.innerHTML = "<option value='' disabled selected>Pilih kategori</option>";

            // Isi data dari API
            result.data.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                selectElements.appendChild(option);
            });

            selectElements.addEventListener('change', function (e) {
                const val = e.target.value;
                // Pastikan variabel 'ProductState' sudah terdefinisi secara global
                if (typeof ProductState !== 'undefined') {
                    ProductState.category_id = val ? Number(val) : null;
                }
                console.log("Kategori dipilih:", ProductState.category_id);
            });
            console.log("Kategori berhasil dimuat.");
        } else {
            console.error("Elemen ID 'category_id' tidak ditemukan!");
        };


    } catch (error) {
        console.error(error);
    }
}