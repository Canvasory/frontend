  const viewButtons = document.querySelectorAll('.viewBtn');
  const modal = document.getElementById('productModal');
  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesigner = document.getElementById('modalDesigner');
  const modalPrice = document.getElementById('modalPrice');
  const customizeBtn = document.getElementById('customizeBtn');
  const addToCartBtn = document.getElementById('addToCartBtn');

  let currentProduct = null;

  viewButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = btn.dataset.title;
      const designer = btn.dataset.designer;
      const price = btn.dataset.price;
      const image = btn.dataset.image;

      currentProduct = { title, designer, price: parseInt(price), image };

      // Isi modal
      modalImage.src = image;
      modalTitle.textContent = title;
      modalDesigner.textContent = "by " + designer;
      modalPrice.textContent = "IDR " + price + "K";
      customizeBtn.href = `https://wa.me/6281234567890?text=${encodeURIComponent("Saya ingin custom desain " + title + " oleh " + designer + ".")}`;

      modal.classList.remove("hidden");
    });
  });

  function closeProductModal() {
    modal.classList.add("hidden");
  }

addToCartBtn.addEventListener('click', () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Cek login
  if (!user || !token) {
    alert("Silakan login terlebih dahulu untuk menambahkan ke cart.");
    closeModal();
    return;
  }

  // Tambahkan ke cart
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(currentProduct);
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update badge cartCount jika ada
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    cartCount.textContent = cart.length;
    cartCount.classList.remove("hidden"); // pastikan terlihat
  }

  alert("Berhasil ditambahkan ke cart!");
  closeModal();
});
