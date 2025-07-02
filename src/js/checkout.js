const API_URL = 'http://localhost:8090';
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const note = document.getElementById('note').value;
  const fileInput = document.getElementById('buktiTransfer');
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

  if (!fileInput.files[0]) return alert('Mohon upload bukti transfer.');

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const formData = new FormData();
  formData.append('user', user.id);
  formData.append('full_name', fullName);
  formData.append('email', email);
  formData.append('note', note);
  formData.append('items', JSON.stringify(cartItems));
  formData.append('total', total);
  formData.append('status', 'pending');
  formData.append('custom', 'false');
  formData.append('bukti_transfer', fileInput.files[0]);

  try {
    const res = await fetch(`${API_URL}/api/collections/orders/records`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      alert('Checkout berhasil! Tunggu konfirmasi admin.');
      localStorage.removeItem('cart');
      window.location.href = 'profile.html';
    } else {
      alert('Gagal checkout: ' + data.message);
    }
  } catch (err) {
    console.error(err);
    alert('Gagal mengirim data checkout.');
  }
});
