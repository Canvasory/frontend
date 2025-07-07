const productModal = {
  open(item) {
    document.getElementById("modalTitle").innerText = item.title;
    document.getElementById("modalDesigner").innerText = "By " + item.designer.username;
    document.getElementById("modalPrice").innerText = "IDR " + item.price + "K";
    document.getElementById("modalImage").src = item.image;
    document.getElementById("customizeBtn").href = `https://wa.me/6281234567890?text=Hai,%20saya%20ingin%20kustomisasi%20desain%20*${item.title}*`;

    const btn = document.getElementById("addToCartBtn");
    btn.dataset.id = item.id;
    btn.dataset.title = item.title;
    btn.dataset.price = item.price;
    btn.dataset.image = item.image;
    btn.dataset.designerId = item.designer.id;
    btn.dataset.designerName = item.designer.username;

    document.getElementById("productModal").classList.remove("hidden");
  },

  close() {
    document.getElementById("productModal").classList.add("hidden");
  },

  handleViewButtons() {
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("viewBtn")) {
        const btn = e.target;
        const item = {
            id: btn.dataset.id,
            title: btn.dataset.title,
            price: btn.dataset.price,
            image: btn.dataset.image,
            designer: {
                id: btn.dataset.designerId,
                username: btn.dataset.designerName
            }
        };
        productModal.open(item);
      }
    });
  },

  initCartAdd() {
    document.getElementById("addToCartBtn").addEventListener("click", () => {
      const item = {
        id: addToCartBtn.dataset.id,
        title: addToCartBtn.dataset.title,
        price: Number(addToCartBtn.dataset.price),
        image: addToCartBtn.dataset.image,
        quantity: 1,
        designer: {
            id: addToCartBtn.dataset.designerId,
            username: addToCartBtn.dataset.designerName
        }
      };

      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existing = cart.find(i => i.id === item.id);

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push(item);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount(); 
      alert("Ditambahkan ke keranjang!");
      productModal.close();
    });
  }
};

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = document.getElementById("cartCount");

  if (cartCount) {
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (totalQuantity > 0) {
      cartCount.textContent = totalQuantity;
      cartCount.classList.remove("hidden");
    } else {
      cartCount.classList.add("hidden");
    }
  }
}
    
  document.addEventListener("DOMContentLoaded", updateCartCount);

// Export default jika pakai module
// export default productModal;
