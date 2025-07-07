const API_URL = 'https://collexta-production.up.railway.app';
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');
const cart = JSON.parse(localStorage.getItem('cart')) || [];

// Redirect jika belum login
if (!user || !token) {
  alert("Silakan login terlebih dahulu.");
  window.location.href = "../html/index.html";
}

// Hitung total
const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
document.getElementById("totalAmount").innerText = `Rp ${total}K`;

document.getElementById("checkoutForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const full_name = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const address = document.getElementById("address").value.trim();
  const payment_method = document.getElementById("paymentMethod").value;
  const buktiFile = document.getElementById("buktiTransfer").files[0];
  const custom = document.getElementById("customCheckbox").checked;

  if (!buktiFile) {
    alert("Silakan upload bukti transfer.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("user", user.id);
    formData.append("full_name", full_name);
    formData.append("email", email);
    formData.append("address", address);
    formData.append("payment_method", payment_method);
    formData.append("bukti_transfer", buktiFile);
    formData.append("status", "pending");
    formData.append("custom", custom);
    formData.append("total", total);

    // Simpan daftar item (id saja, array of string)
    const itemIds = cart.map(item => item.id);
    itemIds.forEach(id => formData.append("items", id)); // field `items` multiple

    const res = await fetch(`${API_URL}/api/collections/orders/records`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      alert("Checkout berhasil! Pesanan Anda sedang diproses.");
      localStorage.removeItem("cart");
      window.location.href = "../html/profile.html";
    } else {
      const err = await res.json();
      alert("Checkout gagal:\n" + (err.message || "Terjadi kesalahan."));
    }
  } catch (err) {
    console.error("Checkout error:", err);
    alert("Terjadi kesalahan saat checkout.");
  }
});
