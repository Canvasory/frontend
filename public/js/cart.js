// Redirect ke halaman checkout saat tombol Checkout diklik
document.getElementById("checkoutBtn").addEventListener("click", () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Keranjang masih kosong.");
    return;
  }

  window.location.href = "checkout.html";
});

const cartContainer = document.getElementById("cartItemsContainer");
const cartSummary = document.getElementById("cartSummary");

// Fungsi untuk load isi cart
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartContainer.innerHTML = "";
  cartSummary.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p class='text-gray-600'>Keranjang masih kosong.</p>";
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const itemCard = document.createElement("div");
    itemCard.className = "flex items-center border p-3 bg-white rounded shadow justify-between";

    itemCard.innerHTML = `
      <div class="flex items-center gap-4">
        <img src="${item.image}" class="w-24 h-16 object-contain border" />
        <div>
          <h3 class="font-bold text-sm">${item.title}</h3>
          <p class="text-xs text-gray-500">IDR ${item.price}K <span class="font-bold">x${item.quantity}</span></p>
          <p class="text-xs italic text-gray-500">by ${item.designer?.username || 'Unknown'}</p>
        </div>
      </div>
      <button onclick="removeFromCart(${index})" class="text-red-500 text-sm hover:underline">Hapus</button>
    `;

    cartContainer.appendChild(itemCard);
  });

  cartSummary.innerText = `Total: IDR ${total}K`;
}

// Hapus item dari cart
function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    cart.splice(index, 1);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartCount();
}

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  updateCartCount();
});
