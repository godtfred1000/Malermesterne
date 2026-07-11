(function () {
  "use strict";

  const members = Array.isArray(window.MEDLEMSBEDRIFTER) ? window.MEDLEMSBEDRIFTER : [];
  const board = Array.isArray(window.STYRET) ? window.STYRET : [];

  const memberGrid = document.getElementById("memberGrid");
  const memberCount = document.getElementById("memberCount");
  const searchInput = document.getElementById("memberSearch");
  const placeFilter = document.getElementById("placeFilter");
  const boardGrid = document.getElementById("boardGrid");
  const noResults = document.getElementById("noResults");

  function safe(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[char]));
  }

  function phoneHref(phone) {
    return "tel:" + String(phone || "").replace(/[^+\d]/g, "");
  }

  function normalizeUrl(url) {
    if (!url) return "#";
    return /^https?:\/\//i.test(url) ? url : "https://" + url;
  }

  function memberCard(member) {
    const areas = Array.isArray(member.fagomrader) ? member.fagomrader : [];
    return `
      <article class="member-card">
        <div class="member-icon" aria-hidden="true">${safe(member.navn).slice(0, 2).toUpperCase()}</div>
        <div class="member-main">
          <p class="member-place">${safe(member.sted)}</p>
          <h3>${safe(member.navn)}</h3>
          <p class="member-address">${safe(member.adresse)}</p>
          <div class="tags">${areas.map(area => `<span>${safe(area)}</span>`).join("")}</div>
        </div>
        <div class="member-actions">
          ${member.telefon ? `<a href="${phoneHref(member.telefon)}">☎ ${safe(member.telefon)}</a>` : ""}
          ${member.epost ? `<a href="mailto:${safe(member.epost)}">✉ Send e-post</a>` : ""}
          ${member.nettside ? `<a href="${safe(normalizeUrl(member.nettside))}" target="_blank" rel="noopener">Besøk nettside ↗</a>` : ""}
        </div>
      </article>`;
  }

  function renderMembers() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const place = placeFilter?.value || "";

    const filtered = [...members]
      .sort((a, b) => String(a.navn).localeCompare(String(b.navn), "nb"))
      .filter(member => {
        const haystack = [member.navn, member.sted, member.adresse, ...(member.fagomrader || [])]
          .join(" ").toLowerCase();
        return (!query || haystack.includes(query)) && (!place || member.sted === place);
      });

    memberGrid.innerHTML = filtered.map(memberCard).join("");
    memberCount.textContent = `${filtered.length} medlemsbedrift${filtered.length === 1 ? "" : "er"}`;
    noResults.hidden = filtered.length !== 0;
  }

  function setupPlaces() {
    const places = [...new Set(members.map(m => m.sted).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "nb"));
    places.forEach(place => {
      const option = document.createElement("option");
      option.value = place;
      option.textContent = place;
      placeFilter.appendChild(option);
    });
  }

  function renderBoard() {
    boardGrid.innerHTML = board.map(person => `
      <article class="board-card">
        <div class="avatar">${safe(person.navn).split(/\s+/).map(v => v[0]).join("").slice(0,2).toUpperCase()}</div>
        <p class="role">${safe(person.rolle)}</p>
        <h3>${safe(person.navn)}</h3>
        <a href="${phoneHref(person.telefon)}">${safe(person.telefon)}</a>
        <a href="mailto:${safe(person.epost)}">${safe(person.epost)}</a>
      </article>`).join("");
  }

  setupPlaces();
  renderMembers();
  renderBoard();

  searchInput?.addEventListener("input", renderMembers);
  placeFilter?.addEventListener("change", renderMembers);

  const menuButton = document.getElementById("menuButton");
  const nav = document.getElementById("mainNav");
  menuButton?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.textContent = open ? "✕" : "☰";
  });
  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.textContent = "☰";
  }));

  document.getElementById("year").textContent = new Date().getFullYear();
})();
