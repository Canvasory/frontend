const designer = JSON.parse(localStorage.getItem('user'));
let allDesigns = [];

// Redirect jika tidak login atau bukan designer
if (!designer || !token || designer.role !== 'designer') {
  alert("Akses hanya untuk designer.");
  window.location.href = '/index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:8090';
  // Biodata
  document.getElementById('designerName').innerText = designer.username || 'Designer';
  document.getElementById('designerBio').innerText = designer.bio || 'Designer di Collexta';
  document.getElementById('designerEmail').innerText = designer.email || 'email@domain.com';
  document.getElementById('designerRating').innerText = designer.rating || '8.7';
  document.getElementById('designerWebsite').innerText = designer.website || 'https://collexta.com';
  document.getElementById('designerLocation').innerText = designer.location || 'Indonesia';

  // Tampilkan tombol aksi
  document.getElementById('actionButtons')?.classList.remove('hidden');

  // Event tombol tambah
  document.getElementById("addDesignBtn")?.addEventListener("click", () => {
    resetForm();
    document.getElementById("modalTitle").textContent = "Tambah Karya";
    document.getElementById("modalDesign").classList.remove("hidden");
  });

  // Event tombol batal
  document.getElementById("cancelDesign")?.addEventListener("click", () => {
    document.getElementById("modalDesign").classList.add("hidden");
  });

  // Submit form tambah/edit karya
  document.getElementById("formDesign")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("designId").value;
    const title = document.getElementById("designTitle").value;
    const price = document.getElementById("designPrice").value;
    const category = document.getElementById("designCategory").value;
    const image = document.getElementById("designImage").files[0];

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("designer", designer.id);
    formData.append("published", "true");
    if (!image) {
      alert("Mohon upload gambar desain.");
      return;
    }
    formData.append("image", image);

    let url = `${API_URL}/api/collections/designs/records`;
    let method = "POST";

    if (id) {
      url = `${API_URL}/api/collections/designs/records/${id}`;
      method = "PATCH";
    }
    for (let pair of formData.entries()) {
      console.log(pair[0]+ ':', pair[1]);
    }
    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        alert(id ? "Karya berhasil diupdate!" : "Karya berhasil ditambahkan!");
        document.getElementById("modalDesign").classList.add("hidden");
        resetForm();
        loadDesigns();
      } else {
        alert("Gagal menyimpan:\n" + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  });

  loadDesigns();

  // === ⬇ Tambahkan di sini (EDIT BIODATA) ===
  document.getElementById("editProfileBtn")?.addEventListener("click", () => {
    document.getElementById("editUsername").value = designer.username || "";
    document.getElementById("editBio").value = designer.bio || "";
    document.getElementById("editLocation").value = designer.location || "";
    document.getElementById("editWebsite").value = designer.website || "";
    document.getElementById("modalProfile").classList.remove("hidden");
  });

  document.getElementById("cancelProfile").addEventListener("click", () => {
    document.getElementById("modalProfile").classList.add("hidden");
  });

  document.getElementById("formProfile").addEventListener("submit", async (e) => {
    e.preventDefault();
    const updated = {
      username: document.getElementById("editUsername").value,
      bio: document.getElementById("editBio").value,
      location: document.getElementById("editLocation").value,
      website: document.getElementById("editWebsite").value
    };

    try {
      const res = await fetch(`${API_URL}/api/collections/users/records/${designer.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updated)
      });

      const data = await res.json();
      if (res.ok) {
        alert("Profil berhasil diperbarui!");
        localStorage.setItem("user", JSON.stringify(data));
        location.reload();
      } else {
        alert("Gagal memperbarui profil.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memperbarui profil.");
    }
  });
});


// Reset Form
function resetForm() {
  document.getElementById("formDesign").reset();
  document.getElementById("designId").value = "";
}

// Load semua karya
async function loadDesigns() {
  const container = document.getElementById('designList');
  container.innerHTML = `<p>Memuat karya...</p>`;

  try {
    const res = await fetch(`${API_URL}/api/collections/designs/records?filter=(designer='${designer.id}')`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    allDesigns = data.items;
    container.innerHTML = '';

    if (!data.items.length) {
      container.innerHTML = '<p class="text-gray-500">Belum ada karya.</p>';
      return;
    }

    data.items.forEach(design => {
      const card = document.createElement('div');
      card.className = "border border-black rounded p-3 bg-white shadow";
      card.innerHTML = `
        <img src="${API_URL}/api/files/designs/${design.id}/${design.image}" class="w-full h-40 object-contain mb-2 rounded" />
        <h3 class="font-bold text-lg">${design.title}</h3>
        <p class="text-sm text-gray-600">${design.category}</p>
        <p class="text-sm font-mono">IDR ${design.price}K</p>
        <div class="flex justify-between mt-2">
          <button class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-800" onclick="editDesign('${design.id}')">Edit</button>
          <button class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800" onclick="deleteDesign('${design.id}')">Hapus</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Gagal memuat karya:', err);
    container.innerHTML = '<p class="text-red-500">Terjadi kesalahan saat memuat karya.</p>';
  }
}

// Edit Karya
function editDesign(id) {
  const design = allDesigns.find(d => d.id === id);
  if (!design) return alert("Karya tidak ditemukan.");

  document.getElementById("modalTitle").textContent = "Edit Karya";
  document.getElementById("designId").value = design.id;
  document.getElementById("designTitle").value = design.title;
  document.getElementById("designPrice").value = design.price;
  document.getElementById("designCategory").value = design.category;
  document.getElementById("modalDesign").classList.remove("hidden");
}

// Hapus Karya
async function deleteDesign(id) {
  if (!confirm("Yakin ingin menghapus karya ini?")) return;

  try {
    const res = await fetch(`${API_URL}/api/collections/designs/records/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      alert("Karya berhasil dihapus.");
      loadDesigns();
    } else {
      alert("Gagal menghapus karya.");
    }
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat menghapus.");
  }
}
