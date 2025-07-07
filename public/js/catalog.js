
// Pasang event listener ke tombol kategori
document.addEventListener("DOMContentLoaded", async () => {
  await fetchAverageRatings();
  const buttons = document.querySelectorAll(".filter-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const selected = btn.getAttribute("data-category");
      loadCatalog(selected);

      // Styling aktif
      buttons.forEach(b => b.classList.remove("bg-black", "text-white"));
      buttons.forEach(b => b.classList.add("bg-gray-200", "text-black"));
      btn.classList.remove("bg-gray-200", "text-black");
      btn.classList.add("bg-black", "text-white");
    });
  });

  const params = new URLSearchParams(window.location.search);
  const categoryFromURL = params.get("category");

  setActiveCategoryButton(categoryFromURL); // tandai aktif
  loadCatalog(categoryFromURL); // load data
  loadCatalog(); // initial load
});

async function getAverageRatings() {
  try {
    const res = await fetch(`${API_URL}/api/collections/orders/records?expand=items`);
    const data = await res.json();
    console.log("Raw orders for rating:", data.items);

    // Map: designId => { totalRating, count }
    const ratingMap = {};

    data.items.forEach(order => {
      const items = order.expand?.items;
      if (Array.isArray(items)) {
        items.forEach(design => {
          if (!ratingMap[design.id]) {
            ratingMap[design.id] = { total: 0, count: 0 };
          }
          ratingMap[design.id].total += order.rating;
          ratingMap[design.id].count += 1;
        });
      } else if (items?.id) {
        const design = items;
        if (!ratingMap[design.id]) {
          ratingMap[design.id] = { total: 0, count: 0 };
        }
        ratingMap[design.id].total += order.rating;
        ratingMap[design.id].count += 1;
      }
    });

    // Hasil akhir: designId => averageRating
    const averages = {};
    for (const id in ratingMap) {
      const { total, count } = ratingMap[id];
      averages[id] = (total / count).toFixed(1); // Satu angka desimal
    }

    return averages;
  } catch (err) {
    console.error("Gagal mengambil rating:", err);
    return {};
  }
}

async function loadCatalog(category = "") {
  const catalogContainer = document.getElementById("catalogContainer");
  catalogContainer.innerHTML = "<p>Loading...</p>";

  let filterQuery = `(published=true)`;
  if (category) {
    filterQuery += `&& (category='${category}')`;
  }

  try {
    const res = await fetch(`${API_URL}/api/collections/designs/records?filter=${encodeURIComponent(filterQuery)}&expand=designer`);
    const data = await res.json();
    catalogContainer.innerHTML = "";

    if (data.items.length === 0) {
      catalogContainer.innerHTML = "<p class='text-gray-600'>Tidak ada karya dalam kategori ini.</p>";
      return;
    }

    data.items.forEach((item) => {
      const avgRating = ratingMap[item.id]?.avg || "Belum ada";

      const card = document.createElement("div");
      card.className = "relative bg-white border border-black p-3 rounded-sm";

      card.innerHTML = `
        <div class="absolute right-[-6px] bottom-[-6px] w-full h-full bg-black z-[-1] rounded-sm"></div>
        <img src="${API_URL}/api/files/designs/${item.id}/${item.image}" class="w-[20rem] h-[10rem] object-contain  mx-auto mb-2 rounded-sm" />
        <div>
          <h2 class="font-black text-sm font-akira">${item.title}</h2>
          <p class="text-sm text-gray-600">${item.category}</p>
          <div class="flex justify-between items-center mt-1 text-xs">
            <span class="font-mono text-gray-700">${item.expand?.designer?.username || '<span class="italic text-gray-400">Tidak dikenal</span>'}</span>
            <img class="w-[28px] h-[28px]" src="/assets/images/profile.png" alt="profile">
          </div>
          <div class="mt-2 flex justify-between items-center">
            <span class="text-xs font-bold font-mono">Price<br><span class="text-black text-base">IDR ${item.price}K</span></span>
            <button 
              class="viewBtn bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold px-3 py-1 rounded-full"
              data-title="${item.title}"
              data-designer-id="${item.expand?.designer?.id}"
              data-designer-name="${item.expand?.designer?.username || 'Unknown'}"
              data-price="${item.price}"
              data-image="${API_URL}/api/files/designs/${item.id}/${item.image}"
              data-id="${item.id}"
            >
              View
            </button>
          </div>
        </div>
      `;
      catalogContainer.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    catalogContainer.innerHTML = "<p class='text-red-600'>Gagal memuat katalog.</p>";
  }
}

// document.addEventListener("DOMContentLoaded", async () => { 
//   await fetchAverageRatings();

//   const params = new URLSearchParams(window.location.search);
//   const categoryFromURL = params.get("category");

//   if (categoryFromURL) {
//     loadCatalog(categoryFromURL); // load berdasarkan kategori
//   } else {
//     loadCatalog(); // load semua
//   }
// });

let ratingMap = {};

async function fetchAverageRatings() {
  try {
    const res = await fetch(`${API_URL}/api/collections/orders/records?filter=rating>0&expand=items`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    // Reset map
    ratingMap = {};
    console.log("Fetched rating orders:", data.items);
    data.items.forEach(order => {
      if (!item) return;

      const itemId = Array.isArray(item) ? item[0]?.id : item.id;
      if (!itemId) return;

      if (!ratingMap[itemId]) {
        ratingMap[itemId] = { total: 0, count: 0 };
      }

      ratingMap[itemId].total += order.rating;
      ratingMap[itemId].count += 1;
      
    });
    console.log("Rating Map:", ratingMap);


    // Buat rata-rata
    for (const id in ratingMap) {
      const { total, count } = ratingMap[id];
      ratingMap[id].avg = (total / count).toFixed(1);
    }

  } catch (err) {
    console.error("Gagal memuat rating:", err);
  }
}

function setActiveCategoryButton(selectedCategory) {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(btn => {
    const btnCategory = btn.getAttribute("data-category") || "";
    if (btnCategory === selectedCategory) {
      btn.classList.remove("bg-white", "text-black");
      btn.classList.add("bg-black", "text-white");
    } else {
      btn.classList.remove("bg-black", "text-white");
      btn.classList.add("bg-white", "text-black");
    }
  });
}


