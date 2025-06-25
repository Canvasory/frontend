const API_URL = 'http://localhost:8090';
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

// Cek login
if (!user || !token) {
  alert("Silakan login terlebih dahulu.");
  window.location.href = 'index.html';
}

// Menampilkan nama user di greeting
const greetEl = document.getElementById('greetUsername');
if (greetEl) {
  greetEl.textContent = user.username || 'User';
}

// Isi form dengan data user
document.getElementById('inputUsername').value = user.username || '';
document.getElementById('inputPhone').value = user.phone || '';
document.getElementById('inputLocation').value = user.location || '';
document.getElementById('inputEmail').value = user.email || '';  // Tambahan: isi email


// Submit update
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const newUsername = document.getElementById('inputUsername').value;
  const newPhone = document.getElementById('inputPhone').value;
  const newLocation = document.getElementById('inputLocation').value;

  try {
    const res = await fetch(`${API_URL}/api/collections/users/records/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        username: newUsername,
        phone: newPhone,
        location: newLocation
      })
    });

    const updated = await res.json();

    if (res.ok) {
      alert('Data berhasil disimpan.');
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updated));
      updateNavbarName(updated.username);
    } else {
      alert("Gagal menyimpan: " + updated.message);
    }
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat menyimpan data.");
  }
});

// Update nama di navbar
function updateNavbarName(name) {
  const navbarProfile = document.querySelector('.navbar-username');
  if (navbarProfile) navbarProfile.textContent = name;
}
