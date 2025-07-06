const user = JSON.parse(localStorage.getItem('user'));

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

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const greet = document.getElementById("greetUsername");
  greet.textContent = user?.username || "User";

  const profileSection = document.getElementById("profileSection");
  const historySection = document.getElementById("historySection");
  const orderList = document.getElementById("orderList");

  
  function setActiveTab(tabId) {
    const tabs = ['viewProfile', 'viewHistory'];
    tabs.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.classList.remove('active-tab');
    });
    const activeBtn = document.getElementById(tabId);
    if (activeBtn) activeBtn.classList.add('active-tab');
  }

  // Tombol toggle view
  document.getElementById("viewProfile")?.addEventListener("click", () => {
    profileSection.classList.remove("hidden");
    historySection.classList.add("hidden");
    setActiveTab("viewProfile");
  });

//   document.getElementById("viewHistory")?.addEventListener("click", async () => {
//     profileSection.classList.add("hidden");
//     historySection.classList.remove("hidden");
//     setActiveTab("viewHistory");

//     orderList.innerHTML = "<p>Loading...</p>";

//     try {
//       console.log("User ID yang digunakan:", user.id);
//       const res = await fetch(`${API_URL}/api/collections/orders/records?filter=(user="${user.id}")`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       const data = await res.json();
//       console.log("Data order yang ditemukan:", data);

//       if (data.items.length === 0) {
//         orderList.innerHTML = "<p class='text-sm text-gray-700'>Belum ada pesanan.</p>";
//         return;
//       }

//       orderList.innerHTML = ""; // Kosongkan

//       data.items.forEach(order => {
//         const orderDate = new Date(order.created).toLocaleDateString('en-US', {
//           year: 'numeric', month: 'long', day: 'numeric'
//         });

//         let orderStatusColor = "bg-gray-500";
//         if (order.status === "done") {
//           orderStatusColor = "bg-green-600";
//         } else if (order.status === "pending") {
//           orderStatusColor = "bg-purple-700";
//         } else if (order.status === "rejected") {
//           orderStatusColor = "bg-red-700";
//         }

//         const item = order.items[0]; // Ambil satu item utama saja

//         const div = document.createElement("div");
//         div.className = "flex items-center bg-[#f0eac0] border border-black shadow-xl rounded-xl px-4 py-3 gap-4";

//         div.innerHTML = `
//           <img src="${item.image}" alt="design" class="w-16 h-16 object-cover rounded-lg border border-black" />

//           <div class="flex-1">
//             <div class="flex justify-between items-center">
//               <h3 class="text-lg font-bold text-black tracking-wider">${item.title.toUpperCase()}</h3>
//               <span class="text-2xl font-black text-orange-600 tracking-wider">IDR ${order.total}K</span>
//             </div>
//             <div class="flex flex-wrap items-center gap-3 text-xs mt-1 text-black/80">
//               <span>📅 ${orderDate}</span>
//               <span class="text-purple-800">🔖 Order : ${order.id.slice(0, 5).toUpperCase()}</span>
//               <span>👤 ${order.full_name}</span>
//             </div>
//             <div class="flex justify-between items-center mt-1">
//               <div class="flex gap-1 text-yellow-500 text-lg">★ ★ ★ ☆ ☆</div>
//               <span class="${orderStatusColor} text-white px-3 py-0.5 rounded-full text-xs font-semibold capitalize">
//                 ${order.status}
//               </span>
//             </div>
//           </div>
//         `;
//         orderList.appendChild(div);
//       });

//     } catch (err) {
//       orderList.innerHTML = "<p class='text-red-500'>Gagal memuat riwayat pesanan.</p>";
//     }
//   });
});

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


