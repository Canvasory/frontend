
async function loadBestProduct() {
  const section = document.getElementById("bestProductContainer");
  section.innerHTML = "<p class='text-gray-600'>Memuat...</p>";

  try {
    // Fetch orders yang punya rating > 0 dan paid
    const orderRes = await fetch(`${API_URL}/api/collections/orders/records?filter=status='paid' && rating>0`);
    const orders = await orderRes.json();

    // Hitung rata-rata rating per design.id
    const ratingMap = {};
    orders.items.forEach(order => {
      const items = Array.isArray(order.items) ? order.items : [order.items];
      items.forEach(itemId => {
        if (!ratingMap[itemId]) ratingMap[itemId] = { total: 0, count: 0 };
        ratingMap[itemId].total += order.rating;
        ratingMap[itemId].count += 1;
      });
    });

    const avgRatings = Object.entries(ratingMap)
      .map(([id, { total, count }]) => ({ id, avg: total / count }))
      .filter(item => item.avg > 4);

    // Ambil detail design yang ratingnya > 4
    const topRatedDesigns = [];

    for (const item of avgRatings.slice(0, 3)) {
      const res = await fetch(`${API_URL}/api/collections/designs/records/${item.id}?expand=designer`);
      if (res.ok) {
        const design = await res.json();
        topRatedDesigns.push(design);
      }
    }

    // Jika kurang dari 3, ambil sisanya dari semua design
    if (topRatedDesigns.length < 3) {
      const designRes = await fetch(`${API_URL}/api/collections/designs/records?filter=published=true&expand=designer`);
      const allDesigns = await designRes.json();

      for (const d of allDesigns.items) {
        if (!topRatedDesigns.find(p => p.id === d.id) && topRatedDesigns.length < 3) {
          topRatedDesigns.push(d);
        }
      }
    }

    // Render 3 card
    section.innerHTML = "";
    topRatedDesigns.slice(0, 3).forEach(product => {
      section.innerHTML += `
        <div class="w-[20rem] h-[23rem] bg-white border border-black rounded-xl shadow-[6px_6px_0px_black] overflow-hidden flex flex-col hover:shadow-[4px_4px_0px_black] transition">
            <img 
                class="w-full h-[11rem] object-contain bg-gray-100 border-b border-black" 
                src="${API_URL}/api/files/designs/${product.id}/${product.image}" 
                alt="${product.title}" 
            />

            <div class="flex-1 px-4 py-3 flex flex-col justify-between">
                <!-- Title & Designer -->
                <div class="mb-2">
                <h5 class="text-xl font-black font-akira leading-tight">${product.title}</h5>
                <div class="flex items-center justify-between mt-1">
                    <span class="text-xs bg-gray-200 px-2 py-[4px] rounded-full text-gray-700">${product.category}</span>
                    <div class="flex items-center space-x-1">
                    <img class="w-[32px] h-[32px] rounded-full" src="../images/profile.png" alt="designer" />
                    <span class="text-xs text-gray-700">${product.expand?.designer?.username || 'Unknown'}</span>
                    </div>
                </div>
                </div>

                <!-- Price & View -->
                <div class="flex justify-between items-center mt-4">
                <div>
                    <p class="text-sm text-gray-500">Price</p>
                    <span class="text-[2rem] font-bold text-black">IDR ${product.price}K</span>
                </div>
                <a href="../html/catalog.html" 
                    class="viewBtn bg-purple-800 hover:bg-purple-900 text-white text-sm font-bold px-4 py-1.5 rounded-full transition"
                    data-category="${product.category}">
                    View
                </a>
                </div>
            </div>
        </div>
      `;
    });

  } catch (err) {
    console.error("Gagal load best product:", err);
    section.innerHTML = "<p class='text-red-600'>Gagal memuat produk terbaik.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadBestProduct);

function setupViewButtons() {
  const viewButtons = document.querySelectorAll(".viewBtn");

  viewButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const category = btn.dataset.category;

      // Redirect ke catalog.html dengan query kategori
      window.location.href = `catalog.html?category=${encodeURIComponent(category)}`;
    });
  });
}