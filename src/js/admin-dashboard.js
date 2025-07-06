const API_URL = 'http://localhost:8090';
const token = localStorage.getItem('token');
const currentUser = JSON.parse(localStorage.getItem('user'));

if (!currentUser || currentUser.role !== "admin") {
  alert("Hanya admin yang dapat mengakses halaman ini.");
  window.location.href = "/public/index.html";
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "/public/admin-login.html";
});

document.addEventListener("DOMContentLoaded",() => {
  loadUsers();
  loadStats();
  loadOrders();
  loadAllDesigns();
  loadDesignersToSelect();
});

document.getElementById("editUserForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const id = document.getElementById("editUserId").value;
  const username = document.getElementById("editUsername").value;
  const email = document.getElementById("editEmail").value;
  const role = document.getElementById("editRole").value;

  try {
    const res = await fetch(`${API_URL}/api/collections/users/records/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, email, role })
    });

    if (res.ok) {
      alert("User berhasil diperbarui.");
      closeEditUserModal();
      loadUsers(); // refresh tabel
    } else {
      const error = await res.json();
      alert("Gagal update user: " + error.message);
    }
  } catch (err) {
    console.error("Gagal update user:", err);
    alert("Terjadi kesalahan saat update.");
  }
});

document.getElementById("adminAddDesignForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const title = document.getElementById("designTitle").value;
  const description = document.getElementById("designDescription").value;
  const price = document.getElementById("designPrice").value;
  const category = document.getElementById("designCategory").value;
  const designer = document.getElementById("designDesigner").value;
  const image = document.getElementById("designImage").files[0];

  if (!title || !price || !category || !designer || !image || !description) {
    return alert("Semua field wajib diisi.");
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("category", category);
  formData.append("designer", designer);
  formData.append("image", image);
  formData.append("published", "true");

  try {
    const res = await fetch(`${API_URL}/api/collections/designs/records`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      alert("Desain berhasil ditambahkan.");
      closeModal();
      loadAllDesigns();
    } else {
      const err = await res.json();
      alert("Gagal tambah: " + err.message);
    }
  } catch (err) {
    console.error("Error saat tambah:", err);
    alert("Gagal tambah desain.");
  }
});

document.getElementById("editDesignForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editDesignId").value;
  const title = document.getElementById("editDesignTitle").value;
  const description = document.getElementById("editDesignDescription").value;
  const price = document.getElementById("editDesignPrice").value;
  const category = document.getElementById("editDesignCategory").value;
  const image = document.getElementById("editDesignImage").files[0];

  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("category", category);
  if (image) formData.append("image", image);

  try {
    const res = await fetch(`${API_URL}/api/collections/designs/records/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      alert("Desain berhasil diperbarui.");
      closeEditModal();
      loadAllDesigns();
    } else {
      const err = await res.json();
      alert("Gagal update: " + err.message);
    }
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan.");
  }
});

async function loadUsers() {
  const container = document.getElementById("userList");
  container.innerHTML = "Memuat data...";

  try {
    const res = await fetch(`${API_URL}/api/collections/users/records`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (data.items.length === 0) {
      container.innerHTML = "Tidak ada data pengguna.";
      return;
    }

    let html = `
      <table class="min-w-full text-sm border">
        <thead>
          <tr class="bg-gray-200 text-left">
            <th class="px-4 py-2 border">Nama</th>
            <th class="px-4 py-2 border">Email</th>
            <th class="px-4 py-2 border">Role</th>
            <th class="px-4 py-2 border">Aksi</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.items.forEach(user => {
      html += `
        <tr class="hover:bg-gray-100">
          <td class="px-4 py-2 border">${user.username}</td>
          <td class="px-4 py-2 border">${user.email}</td>
          <td class="px-4 py-2 border">${user.role}</td>
          <td class="px-4 py-2 border text-center">
            <button onclick="editUser('${user.id}')" class="text-blue-600 hover:underline">Edit</button>
            <button onclick="deleteUser('${user.id}')" class="text-red-600 hover:underline ml-2">Hapus</button>
          </td>
        </tr>
      `;
    });

    html += "</tbody></table>";
    container.innerHTML = html;
  } catch (err) {
    console.error("Gagal mengambil data user:", err);
    container.innerHTML = "Terjadi kesalahan saat memuat data.";
  }
}

async function loadDesignersToSelect() {
  const res = await fetch(`${API_URL}/api/collections/users/records?filter=(role='designer')`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  const select = document.getElementById("designDesigner");
  select.innerHTML = '<option value="">Pilih Designer</option>';

  data.items.forEach(user => {
    const opt = document.createElement("option");
    opt.value = user.id;
    opt.textContent = user.username;
    select.appendChild(opt);
  });
}

async function deleteUser(id) {
  if (!confirm("Yakin ingin menghapus user ini?")) return;
  try {
    const res = await fetch(`${API_URL}/api/collections/users/records/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      alert("User berhasil dihapus.");
      loadUsers(); // reload tabel
    } else {
      alert("Gagal menghapus user.");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Terjadi kesalahan.");
  }
}

// Tampilkan modal edit user
function editUser(id) {
  fetch(`${API_URL}/api/collections/users/records/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(user => {
    document.getElementById("editUserId").value = user.id;
    document.getElementById("editUsername").value = user.username;
    document.getElementById("editEmail").value = user.email;
    document.getElementById("editRole").value = user.role;

    document.getElementById("editUserModal").classList.remove("hidden");
  })
  .catch(err => {
    console.error("Gagal ambil data user:", err);
    alert("Tidak bisa memuat data user.");
  });
}

// Sembunyikan modal
function closeEditUserModal() {
  document.getElementById("editUserModal").classList.add("hidden");
}

function openModal() {
  document.getElementById("addDesignModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("adminAddDesignForm").reset();
  document.getElementById("addDesignModal").classList.add("hidden");
}

async function deleteDesign(id) {
  if (!confirm("Hapus desain ini?")) return;
  const res = await fetch(`${API_URL}/api/collections/designs/records/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.ok) {
    alert("Desain berhasil dihapus.");
    loadAllDesigns();
  } else {
    alert("Gagal menghapus desain.");
  }
}

async function loadStats() {
  const headers = { Authorization: `Bearer ${token}` };
  const [users, designs, orders] = await Promise.all([
    fetch(`${API_URL}/api/collections/users/records?perPage=1`, { headers }).then(res => res.json()),
    fetch(`${API_URL}/api/collections/designs/records?perPage=1`, { headers }).then(res => res.json()),
    fetch(`${API_URL}/api/collections/orders/records?perPage=1`, { headers }).then(res => res.json()),
  ]);

  document.getElementById("totalUsers").innerText = users.totalItems || 0;
  document.getElementById("totalDesigns").innerText = designs.totalItems || 0;
  document.getElementById("totalOrders").innerText = orders.totalItems || 0;

  // Hitung jumlah yang sudah dibayar
  const paid = orders.items?.filter(order => order.status === "paid").length || 0;
  document.getElementById("totalPaid").innerText = paid;
}

async function loadOrders() {
  const res = await fetch(`${API_URL}/api/collections/orders/records?expand=user,items,custom`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  const container = document.getElementById("adminOrders");
  container.innerHTML = '';

  if (data.items.length === 0) {
    container.innerHTML = "<p class='text-gray-500'>Belum ada pesanan.</p>";
    return;
  }

  data.items.forEach(order => {
    const itemHTML = order.items?.map(i => `<li>${i}</li>`).join("") || "";
    container.innerHTML += `
      <div class="border p-4 rounded shadow">
        <p><strong>Nama:</strong> ${order.full_name}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>Total:</strong> Rp ${order.total}K</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Item:</strong> <ul class="list-disc pl-4">${itemHTML}</ul></p>
        <p><strong>Bukti Transfer:</strong><br>
          ${order.bukti_transfer ? `<a href="${API_URL}/api/files/orders/${order.id}/${order.bukti_transfer}" target="_blank" class="text-blue-600 underline">Lihat Bukti</a>` : `<span class="text-red-500">Belum ada</span>`}
        </p>
        ${order.status !== 'paid' ? `<button onclick="markAsPaid('${order.id}')" class="bg-green-600 text-white px-4 py-1 mt-2 rounded">Tandai Lunas</button>` : ''}
      </div>
    `;
  });
}

async function markAsPaid(id) {
  if (!confirm("Tandai pesanan ini sebagai lunas?")) return;
  const res = await fetch(`${API_URL}/api/collections/orders/records/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status: "paid" })
  });

  if (res.ok) {
    alert("Status diperbarui.");
    loadOrders();
    loadStats();
  } else {
    alert("Gagal memperbarui status.");
  }
}

async function loadAllDesigns() {
  const res = await fetch(`${API_URL}/api/collections/designs/records?expand=designer`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  const container = document.getElementById("adminDesigns");
  container.innerHTML = '';

  data.items.forEach(design => {
    container.innerHTML += `
      <div class="border p-4 rounded shadow">
        <img src="${API_URL}/api/files/designs/${design.id}/${design.image}" class="w-full h-32 object-contain mb-2 rounded" />
        <h4 class="font-bold">${design.title}</h4>
        <p class="text-sm text-gray-600">${design.category}</p>
        <p class="text-sm">IDR ${design.price}K</p>
        <p class="text-xs text-gray-500 mt-1">Designer: ${design.expand?.designer?.username || '-'}</p>
        <div class="mt-2 flex gap-2">
          <button onclick="openEditModal('${design.id}')" class="text-sm text-blue-600 underline">Edit</button>
          <button onclick="deleteDesign('${design.id}')" class="text-sm text-red-600 underline">Hapus</button>
        </div>
      </div>
    `;
  });
}

async function openEditModal(id) {
  try {
    const res = await fetch(`${API_URL}/api/collections/designs/records/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    // Isi form modal
    document.getElementById("editDesignId").value = data.id;
    document.getElementById("editDesignTitle").value = data.title;
    document.getElementById("editDesignDescription").value = data.description || "";
    document.getElementById("editDesignPrice").value = data.price;
    document.getElementById("editDesignCategory").value = data.category;

    document.getElementById("editDesignModal").classList.remove("hidden");
  } catch (err) {
    alert("Gagal membuka form edit.");
  }
}

function closeEditModal() {
  document.getElementById("editDesignModal").classList.add("hidden");
}
