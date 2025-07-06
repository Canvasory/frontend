
// Pasang event listener ke tombol kategori
document.addEventListener("DOMContentLoaded", () => {
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

  loadCatalog(); // initial load
});

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
      const card = document.createElement("div");
      card.className = "relative bg-white border border-black p-3 rounded-sm";

      card.innerHTML = `
        <div class="absolute right-[-6px] bottom-[-6px] w-full h-full bg-black z-[-1] rounded-sm"></div>
        <img src="${API_URL}/api/files/designs/${item.id}/${item.image}" class="w-[20rem] h-[10rem] object-contain mx-auto mb-2 rounded-sm" />
        <div>
          <h2 class="font-black text-sm font-akira">${item.title}</h2>
          <p class="text-sm text-gray-600">${item.category}</p>
          <div class="flex justify-between items-center mt-1 text-xs">
            <span class="font-mono text-gray-700">${item.expand?.designer?.username || '<span class="italic text-gray-400">Tidak dikenal</span>'}</span>
            <img class="w-[28px] h-[28px]" src="/assets/images/profile.png" alt="profile">
          </div>
          <div class="mt-2 flex justify-between items-center">
            <span class="text-xs font-bold font-mono">Price<br><span class="text-black text-base">IDR ${item.price}K</span></span>
            <button class="bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold px-3 py-1 rounded-full">
              Customize
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

document.addEventListener("DOMContentLoaded", loadCatalog);
