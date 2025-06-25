// ==== FUNGSI: Simpan ke PocketBase ====
async function saveCartToPocketBase(cartItems) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token || !user) return;

  for (const item of cartItems) {
    try {
      await fetch("http://localhost:8090/api/collections/orders/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: user.id,
          title: item.title,
          designer: item.designer,
          price: item.price,
          image: item.image,
        }),
      });
    } catch (err) {
      console.error("Gagal simpan ke PocketBase:", err);
    }
  }
}

// ==== FUNGSI: Tambah ke cart lokal + backend ====
function addToCart(item) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));
  saveCartToPocketBase([item]);
  alert("Item ditambahkan ke keranjang!");
}

document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  // ===== Navbar Cart Logic =====
  const cartBtn = document.getElementById("cartBtn");
  const cartCount = document.getElementById("cartCount");

  if (user && token) {
    if (cartBtn) {
      cartBtn.classList.remove("hidden");
      const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
      cartCount.textContent = cartItems.length;
    }
  }

  // ===== Page Cart Logic =====
  const cartItemsContainer = document.getElementById("cartItems");
  const totalPriceEl = document.getElementById("totalPrice");
  const waLink = document.getElementById("waLink");

  // Jika tidak di halaman cart, hentikan di sini
  if (!cartItemsContainer) return;

  const cartData = JSON.parse(localStorage.getItem("cart")) || [];
  let total = 0;
  let waMessage = "Halo, saya ingin memesan desain:\n";

  if (cartData.length === 0) {
    cartItemsContainer.innerHTML = `<p class="text-center text-gray-500">Keranjang masih kosong.</p>`;
    if (waLink) waLink.style.display = "none";
  } else {
    cartData.forEach((item, index) => {
      total += item.price;
      waMessage += `- ${item.title} (IDR ${item.price}K) oleh ${item.designer}\n`;

      const div = document.createElement("div");
      div.className = "flex items-center border border-black bg-white shadow p-4 gap-4";

      div.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="w-32 h-20 object-cover border border-black">
        <div class="flex-1">
          <h3 class="text-xl font-bold">${item.title}</h3>
          <p class="text-sm text-gray-600">by ${item.designer}</p>
          <p class="text-md font-bold mt-2">IDR ${item.price}K</p>
        </div>
        <button onclick="removeItem(${index})" class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Hapus</button>
      `;
      cartItemsContainer.appendChild(div);
    });

    totalPriceEl.textContent = `IDR ${total}K`;
    waLink.href = `https://wa.me/6281234567890?text=${encodeURIComponent(waMessage + "\nTotal: IDR " + total + "K")}`;
  }
});

// Fungsi global agar bisa dipanggil dari tombol onclick di HTML
function removeItem(index) {
  const cartData = JSON.parse(localStorage.getItem("cart")) || [];
  cartData.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cartData));
  location.reload();
}
