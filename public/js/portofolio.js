const designer = JSON.parse(localStorage.getItem('user'));
const urlParams = new URLSearchParams(window.location.search);
const viewedId = urlParams.get('id');
const profileId = viewedId || (designer?.id || null);
let allDesigns = [];

// Validasi login
if (!designer || !token) {
  alert("Silakan login terlebih dahulu.");
  window.location.href = '/public/index.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch(`${API_URL}/api/collections/users/records/${profileId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const profile = await res.json();

    // Tampilkan data biodata
    document.getElementById('designerName').innerText = profile.username || 'Designer';
    document.getElementById('designerBio').innerText = profile.bio || 'Designer di Collexta';
    document.getElementById('designerEmail').innerText = profile.email || 'email@domain.com';
    document.getElementById('designerRating').innerText = profile.rating || '8.7';
    document.getElementById('designerWebsite').innerText = profile.website || 'https://collexta.com';
    document.getElementById('designerLocation').innerText = profile.location || 'Indonesia';

    // Hanya tampilkan tombol aksi jika yang login adalah designer dan dia melihat profilnya sendiri
    if (designer.role === 'designer' && profileId === designer.id) {
      document.getElementById('actionButtons')?.classList.remove('hidden');

      // Edit Biodata
      document.getElementById("editProfileBtn").addEventListener("click", () => {
        document.getElementById("editUsername").value = profile.username || "";
        document.getElementById("editBio").value = profile.bio || "";
        document.getElementById("editLocation").value = profile.location || "";
        document.getElementById("editWebsite").value = profile.website || "";
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

      // Event tambah karya
      document.getElementById("addDesignBtn").addEventListener("click", () => {
        resetForm();
        document.getElementById("modalTitle").textContent = "Tambah Karya";
        document.getElementById("modalDesign").classList.remove("hidden");
      });

      document.getElementById("cancelDesign").addEventListener("click", () => {
        document.getElementById("modalDesign").classList.add("hidden");
      });

      document.getElementById("formDesign").addEventListener("submit", async (e) => {
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

        if (!image && !id) {
          alert("Mohon upload gambar desain.");
          return;
        }
        if (image) formData.append("image", image);

        let url = `${API_URL}/api/collections/designs/records`;
        let method = "POST";
        if (id) {
          url = `${API_URL}/api/collections/designs/records/${id}`;
          method = "PATCH";
        }

        try {
          const res = await fetch(url, {
            method,
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          });

          const data = await res.json();
          if (res.ok) {
            alert(id ? "Karya berhasil diperbarui!" : "Karya berhasil ditambahkan!");
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
    }

    loadDesigns();

  } catch (err) {
    console.error("Gagal memuat biodata:", err);
    alert("Gagal memuat data.");
  }
});

function resetForm() {
  document.getElementById("formDesign").reset();
  document.getElementById("designId").value = "";
}

async function loadDesigns() {
  const container = document.getElementById('designList');
  container.innerHTML = `<p>Memuat karya...</p>`;

  try {
    const res = await fetch(`${API_URL}/api/collections/designs/records?filter=(designer='${profileId}')`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    allDesigns = data.items;
    container.innerHTML = "";

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
        ${
          designer.role === 'designer' && profileId === designer.id
            ? `<div class="flex justify-between mt-2">
                <button class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-800" onclick="editDesign('${design.id}')">Edit</button>
                <button class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800" onclick="deleteDesign('${design.id}')">Hapus</button>
              </div>`
            : ""
        }
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Gagal memuat karya:', err);
    container.innerHTML = '<p class="text-red-500">Terjadi kesalahan saat memuat karya.</p>';
  }
}

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

async function deleteDesign(id) {
  if (!confirm("Yakin ingin menghapus karya ini?")) return;

  try {
    const res = await fetch(`${API_URL}/api/collections/designs/records/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
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
