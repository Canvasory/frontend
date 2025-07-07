const API_URL = 'https://canvasory-pocketbase.up.railway.app';

// Ambil elemen utama
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const cartCount = document.getElementById('cartCount');
const cartData = JSON.parse(localStorage.getItem("cart") || "[]");

const currentUser = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem("token");

// ==== Modal Login ====
loginBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('loginModal')?.classList.remove('hidden');
});

// ==== Modal Signup ====
signupBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('signupModal')?.classList.remove('hidden');
});

// ==== Tutup Modal ====
function closeModal(id) {
  document.getElementById(id)?.classList.add('hidden');
}

// ==== LOGIN ====
document.getElementById('loginForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${API_URL}/api/collections/users/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: email, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.record));
      alert("Login berhasil!");
      closeModal('loginModal');

      const role = data.record.role;
      if (role === 'designer') {
        window.location.href = '/html/portofolio.html';
      } else if (role === 'admin') {
        window.location.href = '/html/admin-dashboard.html';
      } else {
        location.reload();
      }
    } else {
      alert("Login gagal: " + (data.message || 'Cek email & password.'));
    }
  } catch (err) {
    console.error("Login Error:", err);
    alert("Terjadi kesalahan saat login.");
  }
});

// ==== SIGNUP ====
document.getElementById('signupForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  try {
    const res = await fetch(`${API_URL}/api/collections/users/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        passwordConfirm: password,
        role: 'user',
        emailVisibility: true
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert("Akun berhasil dibuat! Silakan login.");
      closeModal('signupModal');
    } else {
      alert("Signup gagal: " + (data.message || 'Periksa email/password.'));
    }
  } catch (err) {
    console.error("Signup Error:", err);
    alert("Terjadi kesalahan saat signup.");
  }
});

// ==== DOM Loaded ====
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Current role:", currentUser?.role);
  // ==== LOGOUT ====
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    const confirmLogout = confirm("Yakin ingin logout?");
    if (confirmLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/html/index.html';
    }
  });

  // ==== Tampilkan nama dan tombol sesuai role ====
  if (currentUser && token) {
    const displayName = currentUser.full_name || currentUser.username || 'User';

    // Buat link profil
    const profileLink = document.createElement('a');
    profileLink.className = 'px-6 py-[26px] no-underline text-black text-center flex items-center hover:font-bold';
    profileLink.innerHTML = `
      <img class="w-[25px] h-[25px] mr-2" src="../images/profile.png" alt="profile">
      ${displayName}
    `;

    // Arahkan ke halaman sesuai role
    if (currentUser.role === 'designer') {
      profileLink.href = '/html/portofolio.html';
    } else if (currentUser.role === 'admin') {
      profileLink.href = '/html/admin-dashboard.html';
    } else {
      profileLink.href = '/html/profile.html';
    }

    loginBtn?.replaceWith(profileLink);
    signupBtn?.classList.add('hidden');
  }
});

// Opsional: ping koneksi (validasi token aktif)
if (token) {
  fetch(`${API_URL}/api/collections/users/records`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
