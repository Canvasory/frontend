
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".grid"); // Sesuai struktur HTML kamu
  container.innerHTML = "<p>Memuat desainer...</p>";

  try {
    const res = await fetch(`${API_URL}/api/collections/users/records?filter=(role='designer')`);
    const data = await res.json();

    if (data.items.length === 0) {
      container.innerHTML = `<p class="text-gray-600 col-span-full">Belum ada designer terdaftar.</p>`;
      return;
    }

    container.innerHTML = ""; // Kosongkan sebelum render ulang

    data.items.forEach((designer) => {
      const card = document.createElement("div");
      card.className =
        "relative group bg-white border-2 border-black p-6 pt-12 rounded-xl shadow-[6px_6px_0_black] transition hover:-translate-y-2 hover:shadow-[10px_10px_0_black]";

      card.innerHTML = `
        <!-- Avatar Floating -->
        <div class="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <img src="../images/profile.png" alt="Designer Photo" class="w-20 h-20 rounded-full border-4 border-white shadow-lg" />
        </div>

        <!-- Info -->
        <div class="text-center mt-2">
          <h4 class="text-xl font-bold mt-3">${designer.username || "Tanpa Nama"}</h4>
          <p class="text-sm text-gray-500">${designer.bio || "Spesialis Desain"}</p>
          <p class="text-sm mt-3 text-gray-700">${designer.location || "-"}</p>
        </div>

        <!-- Buttons -->
        <div class="mt-4 flex justify-center gap-3">
          <a href="https://wa.me/${designer.phone || '6281234567890'}" target="_blank" class="text-white bg-purple-900 px-4 py-1 rounded hover:bg-purple-800 text-sm transition">
            Contact
          </a>
          <a href="/html/portofolio.html?designerId=${designer.id}" class="text-purple-900 border border-purple-900 px-4 py-1 rounded hover:bg-purple-900 hover:text-white text-sm transition">
            Portofolio
          </a>
        </div>

        <!-- Bottom Accent -->
        <div class="absolute bottom-0 left-0 right-0 h-2 bg-[#FFBF00] rounded-b-xl"></div>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Gagal memuat desainer:", err);
    container.innerHTML = "<p class='text-red-600'>Gagal memuat data desainer.</p>";
  }
});
