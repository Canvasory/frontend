const user = JSON.parse(localStorage.getItem('user'));
let currentOrderId = null;

// Cek login
if (!user || !token) {
  alert("Silakan login terlebih dahulu.");
  window.location.href = 'index.html';
}

// Tab switching
const tabProfile = document.getElementById("tabProfile");
const tabHistory = document.getElementById("tabHistory");
const btnProfile = document.getElementById("viewProfile");
const btnHistory = document.getElementById("viewHistory");

btnProfile.addEventListener("click", () => {
  tabProfile.classList.remove("hidden");
  tabHistory.classList.add("hidden");
});

btnHistory.addEventListener("click", () => {
  tabProfile.classList.add("hidden");
  tabHistory.classList.remove("hidden");
  loadUserOrderHistory(); // Load saat HISTORY diklik
});

// Menampilkan nama user
const greetEl = document.getElementById('greetUsername');
if (greetEl) greetEl.textContent = user.username || 'User';

// Isi form dengan data user
document.getElementById('inputUsername').value = user.username || '';
document.getElementById('inputPhone').value = user.phone || '';
document.getElementById('inputLocation').value = user.location || '';
document.getElementById('inputEmail').value = user.email || '';

// Submit update profil
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

function updateNavbarName(name) {
  const navbarProfile = document.querySelector('.navbar-username');
  if (navbarProfile) navbarProfile.textContent = name;
}

// Fungsi load history pemesanan user
async function loadUserOrderHistory() {
  const historyContainer = document.getElementById("historyContainer");
  historyContainer.innerHTML = "<p class='text-gray-500'>Memuat...</p>";

  try {
    const res = await fetch(`${API_URL}/api/collections/orders/records?filter=user="${user.id}"`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    historyContainer.innerHTML = '';

    if (data.items.length === 0) {
      historyContainer.innerHTML = "<p class='text-gray-500'>Belum ada riwayat pesanan.</p>";
      return;
    }

    for (const order of data.items) {
      let itemHTML = "";

      // Konversi ke array jika hanya satu
      const itemIds = Array.isArray(order.items) ? order.items : [order.items];

      for (const itemId of itemIds) {
        try {
          const itemRes = await fetch(`${API_URL}/api/collections/designs/records/${itemId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (itemRes.ok) {
            const itemData = await itemRes.json();
            itemHTML += `<li>${itemData.title}</li>`;
          } else {
            itemHTML += `<li>ID: ${itemId}</li>`;
          }
        } catch {
          itemHTML += `<li>ID: ${itemId}</li>`;
        }
      }

      const reviewBtn = (order.status === 'paid' && !order.review)
        ? `<button onclick="openReviewModal('${order.id}')" class="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
            Tulis Review
          </button>`
        : '';

      historyContainer.innerHTML += `
        <div class="border border-black bg-white p-4 rounded shadow mb-4">
          <p><strong>Email:</strong> ${order.email}</p>
          <p><strong>Total:</strong> Rp ${order.total}K</p>
          <p><strong>Status:</strong> 
            <span class="font-semibold ${order.status === 'paid' ? 'text-green-600' : 'text-orange-600'}">
              ${order.status}
            </span>
          </p>
          <p><strong>Item:</strong></p>
          <ul class="list-disc pl-4 mb-2">${itemHTML}</ul>
          
          <p><strong>Bukti Transfer:</strong><br>
            ${order.bukti_transfer 
              ? `<a href="${API_URL}/api/files/orders/${order.id}/${order.bukti_transfer}" target="_blank" class="text-blue-600 underline">Lihat Bukti</a>` 
              : `<span class="text-red-500">Belum ada</span>`}
          </p>
          ${reviewBtn}
        </div>
      `;
    }
  } catch (err) {
    console.error("Gagal memuat riwayat:", err);
    historyContainer.innerHTML = "<p class='text-red-600'>Terjadi kesalahan saat memuat data.</p>";
  }
}

function openReviewModal(orderId) {
  currentOrderId = orderId;
  document.getElementById("reviewText").value = "";
  document.getElementById("reviewRating").value = "";
  document.getElementById("reviewModal").classList.remove("hidden");
}

function closeReviewModal() {
  document.getElementById("reviewModal").classList.add("hidden");
}

async function submitReview() {
  const review = document.getElementById("reviewText").value.trim();
  const rating = parseInt(document.getElementById("reviewRating").value);

  if (!review || isNaN(rating) || rating < 1 || rating > 5) {
    alert("Review dan rating (1–5) wajib diisi.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/collections/orders/records/${currentOrderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        review: review,
        rating: rating
      })
    });

    const result = await res.json();
    if (res.ok) {
      alert("Review berhasil dikirim.");
      closeReviewModal();
      loadUserOrderHistory(); // refresh list
    } else {
      alert("Gagal mengirim review: " + (result.message || "Unknown error"));
    }

  } catch (err) {
    console.error("Submit review error:", err);
    alert("Terjadi kesalahan saat mengirim review.");
  }
}



