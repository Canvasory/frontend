// Buka Modal
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const currentUser = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem("token");

loginBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('loginModal').classList.remove('hidden');
});

signupBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('signupModal').classList.remove('hidden');
});

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

// LOGIN 
document.getElementById('loginForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const res = await fetch('http://localhost:8090/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({identity: email, password: password})
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.record));
    alert("Login berhasil!");
    closeModal('loginModal');
    location.reload(); // atau redirect ke halaman dashboard
  } else {
    alert("Login gagal: " + (data.message || 'Cek email & password.'));
  }
});

// SIGNUP 
document.getElementById('signupForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  const res = await fetch('http://localhost:8090/api/collections/users/records', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, password, passwordConfirm: password})
  });

  const data = await res.json();
  if (res.ok) {
    alert("Akun berhasil dibuat! Silakan login.");
    closeModal('signupModal');
  } else {
    alert("Signup gagal: " + (data.message || 'Periksa email/password.'));
    console.log("Signup error response:", data);
  }
});

// Tampilan setelah login
if (loginBtn) {
  if (currentUser && token) {
    // Buat elemen <a> baru
    const profileLink = document.createElement('a');
    profileLink.href = '../public/profile.html';
    profileLink.className = 'flex items-center no-underline text-black hover:font-bold pr-5 gap-2';
    profileLink.innerHTML = `
      <img src="/assets/images/profile.png" alt="avatar" class="w-5 h-5 rounded-full" />
      <span>${currentUser.username || 'User'}</span>
    `;
    
    // Ganti elemen loginBtn dengan <a>
    loginBtn.replaceWith(profileLink);
  } else {
    // Belum login → buka modal saat diklik
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('loginModal')?.classList.remove('hidden');
    });
  }
}

// Sign Up jadi Logout
if (signupBtn) {
  if (currentUser && token) {
    signupBtn.innerText = 'Logout';
    signupBtn.addEventListener('click', () => {
      localStorage.clear();
      location.reload();
    });
  }
}

// Endpoint
fetch("http://localhost:8090/api/collections/orders/records", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`
  }
});
