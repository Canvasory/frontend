const searchInput = document.getElementById("simple-search");
const searchForm = searchInput.closest("form");

const bestProductContainer = document.getElementById("bestProductContainer");
const catalogContainer = document.getElementById("catalogContainer");

// ==== Form Search Manual ====
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  searchByKeyword(keyword);
});

// ==== Search by keyword (kategori/designer) ====
async function searchByKeyword(keyword) {
  try {
    const res = await fetch(`${API_URL}/api/collections/designs/records?expand=designer`);
    const data = await res.json();

    const filtered = data.items.filter((item) => {
      const categoryMatch = item.category.toLowerCase().includes(keyword);
      const designerMatch = item.expand?.designer?.username?.toLowerCase().includes(keyword);
      return categoryMatch || designerMatch;
    });

    bestProductContainer.classList.add("hidden");
    catalogContainer.classList.remove("hidden");

    renderSearchResults(filtered, catalogContainer);
  } catch (error) {
    console.error("Search error:", error);
    catalogContainer.innerHTML = `<p class="text-center text-red-600">Terjadi kesalahan saat mencari data.</p>`;
  }
}

// ==== Search by category from link ====
document.querySelectorAll('.category-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const category = e.target.dataset.category;

    if (category === 'popular') {
      // Tampilkan best product
      bestProductContainer.classList.remove("hidden");
      catalogContainer.classList.add("hidden");
    } else {
      // Filter by category langsung
      searchByKeyword(category.toLowerCase());
    }
  });
});

// ==== Render Cards ====
function renderSearchResults(products, container) {
  if (products.length === 0) {
    container.innerHTML = `<p class="text-center text-gray-700 font-bold">Produk tidak ditemukan.</p>`;
    return;
  }

  container.innerHTML = products.slice(0, 6).map(product => `
    <div class="w-[20rem] h-[22rem] bg-white border border-black rounded-xl shadow-[8px_8px_0px_black] hover:shadow-[4px_4px_0px_black] transition">
      <img class="w-[20rem] h-[10rem] object-contain mx-auto mb-2 rounded-sm" 
        src="${API_URL}/api/files/designs/${product.id}/${product.image}" 
        alt="${product.title}" />
      <div class="px-2">
        <div class="flex-1 px-4 py-3 flex flex-col justify-between">
          <div class="mb-2">
            <h5 class="text-xl font-black font-akira leading-tight">${product.title}</h5>
            <div class="flex items-center justify-between mt-1">
              <span class="text-xs bg-gray-200 px-2 py-[4px] rounded-full text-gray-700">${product.category}</span>
              <div class="flex items-center space-x-1">
                <img class="w-[32px] h-[32px] rounded-full" src="/assets/images/profile.png" alt="designer" />
                <span class="text-xs text-gray-700">${product.expand?.designer?.username || 'Unknown'}</span>
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center mt-4">
            <div>
              <p class="text-sm text-gray-500">Price</p>
              <span class="text-[2rem] font-bold text-black">IDR ${product.price}K</span>
            </div>
            <button 
              class="viewBtn bg-purple-900 hover:bg-purple-800 text-white rounded-lg py-1 px-4 text-sm"
              data-id="${product.id}">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  setupViewButtons();
}

// ==== Tombol View Produk ====
function setupViewButtons() {
  const viewButtons = document.querySelectorAll(".viewBtn");

  viewButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = btn.dataset.id;
      window.location.href = `catalog.html?product=${productId}`;
    });
  });
}

// ==== Tutup Modal Produk ====
function closeProductModal() {
  document.getElementById("productModal").classList.add("hidden");
}
