

// Fonction pour copier un texte dans le presse-papier
function copyToClipboard(text, element) {
	navigator.clipboard.writeText(text).then(() => {
		const tooltip = element.querySelector('.tooltip');
		const original = tooltip.textContent;
		tooltip.textContent = 'Copié !';
		setTimeout(() => {
			tooltip.textContent = original;
		}, 2000);
	});
}

// ---------- Root-Me (cache local mis à jour par GitHub Actions) ----------

async function fetchRootMeData() {
	try {
		const res = await fetch('../data/rootme-cache.json');
		if (!res.ok) return null;
		const data = await res.json();
		// Fichier vide = pas encore de données
		if (!data || Object.keys(data).length === 0) return null;
		return data;
	} catch {
		return null;
	}
}

function renderRootMeStats(data, zone) {
	if (!data) {
		zone.innerHTML = '<p class="api-error">Données Root-Me indisponibles (CORS ou réseau).</p>';
		return;
	}

	const score = data.score ?? data.Score ?? '—';
	const rang = data.rang ?? data.Rang ?? '—';
	const validations = data.validations ?? data.Validations ?? [];
	const solved = Array.isArray(validations) ? validations.length : '—';

	// Regrouper par catégorie si les validations ont la propriété rubrique
	const categories = {};
	if (Array.isArray(validations)) {
		validations.forEach(v => {
			const cat = v.rubrique ?? v.category ?? 'Autre';
			categories[cat] = (categories[cat] || 0) + 1;
		});
	}

	const catHtml = Object.entries(categories)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 6)
		.map(([cat, count]) => `<span class="cat-badge">${cat} <strong>${count}</strong></span>`)
		.join('');

	zone.innerHTML = `
		<div class="rootme-live">
			<div class="live-badge"><span class="live-dot"></span>Live</div>
			<div class="stats-strip">
				<div class="stat-pill">
					<span class="stat-label">Score</span>
					<span class="stat-value">${score} pts</span>
				</div>
				<div class="stat-pill">
					<span class="stat-label">Rang</span>
					<span class="stat-value">#${rang}</span>
				</div>
				<div class="stat-pill">
					<span class="stat-label">Résolus</span>
					<span class="stat-value">${solved} défis</span>
				</div>
			</div>
			${catHtml ? `<div class="cat-strip">${catHtml}</div>` : ''}
		</div>
	`;
}

function renderProgressCards(progress, zone) {
	progress.forEach(p => {
		const isPercent = typeof p.progress === 'string' && p.progress.includes('%');
		const percentVal = isPercent ? parseInt(p.progress) : null;

		const progressHtml = isPercent
			? `<div class="progress-bar-wrap">
					<div class="progress-bar-fill" style="width: ${percentVal}%"></div>
				</div>
				<span class="progress-label">${p.progress}</span>`
			: `<span class="progress-text">${p.progress}</span>`;

		const badgeHtml = p.badgeId
			? `<div class="credly-badge-wrap" data-badge-id="${p.badgeId}" data-badge-titre="${p.titre}">
					<div class="credly-badge-loading"></div>
				</div>`
			: '';

		const div = document.createElement('div');
		div.className = 'progress-card';
		div.innerHTML = `
			<div class="progress-card-inner ${p.badgeId ? 'has-badge' : ''}">
				<div class="progress-card-header">
					<img src="${p.image}" alt="${p.titre}" class="progress-card-img" />
					<div>
						<h3>${p.titre}</h3>
						<p class="progress-date">${p.date}</p>
					</div>
				</div>
				${progressHtml}
				<p class="progress-desc">${p.description}</p>
				${badgeHtml}
			</div>
		`;
		zone.appendChild(div);

		if (p.badgeId) {
			loadCredlyBadge(div.querySelector('.credly-badge-wrap'), p.badgeId, p.titre);
		}
	});
}

async function loadCredlyBadge(wrap, badgeId, titre) {
	try {
		const res = await fetch(`https://www.credly.com/badges/${badgeId}.json`);
		if (!res.ok) throw new Error('fetch failed');
		const data = await res.json();
		const imageUrl = data.data?.image_url
			|| data.data?.badge_template?.image_url
			|| data.data?.badge_template?.image?.url;
		if (!imageUrl) throw new Error('no image');
		wrap.innerHTML = `
			<a href="https://www.credly.com/badges/${badgeId}" target="_blank" rel="noopener noreferrer" class="credly-badge-img-link">
				<img src="${imageUrl}" alt="Badge Credly : ${titre}" class="credly-badge-img" />
			</a>`;
	} catch {
		wrap.innerHTML = `
			<a href="https://www.credly.com/badges/${badgeId}" target="_blank" rel="noopener noreferrer" class="credly-badge-link">
				Voir le badge Credly ↗
			</a>`;
	}
}


// ---------- Page index.html : expériences professionnelles ----------


if (document.getElementById("experience-list")) {
	fetch("public/data/experiences.json")
		.then(response => response.json())
		.then(data => {
			const list = document.getElementById("experience-list");

			// Trier : d'abord "en cours", puis par date décroissante
			data.sort((a, b) => {
				if (a.dateFin === "en cours") return -1;
				if (b.dateFin === "en cours") return 1;
				return new Date(b.dateFin) - new Date(a.dateFin);
			});

			data.forEach(exp => {
				const li = document.createElement("li");
				li.className = `experience ${exp.class} collapsed`;

				li.innerHTML = `
					<img src="${exp.logo}" alt="Logo ${exp.class}" class="logo-${exp.class}">
					<div class="experience-text">
						<h2>${exp.titre}</h2>
						<p class="adresse">${exp.adresse}</p>
						<p class="date">Date : ${exp.date}</p>
						<p class="description" style="display: none;">${exp.description}</p>
						<button class="toggle-button">Voir plus</button>
					</div>
				`;

				// Accordéon
				li.addEventListener('click', () => {
					const isCollapsed = li.classList.contains("collapsed");

					document.querySelectorAll(".experience").forEach(item => {
						item.classList.remove("expanded");
						item.classList.add("collapsed");
						item.querySelector(".description").style.display = "none";
						item.querySelector(".toggle-button").textContent = "Voir plus";
					});

					if (isCollapsed) {
						li.classList.remove("collapsed");
						li.classList.add("expanded");
						li.querySelector(".description").style.display = "block";
						li.querySelector(".toggle-button").textContent = "Voir moins";
					}
				});

				list.appendChild(li);
			});
		});
}

// ---------- Page learn.html : plateformes + avancement ----------


if (document.getElementById("learn-list")) {
	Promise.all([
		fetch("../data/learnSites.json").then(res => res.json()),
		fetch("../data/learnProgress.json").then(res => res.json())
	])
		.then(async ([sites, progress]) => {
			const list = document.getElementById("learn-list");

			// Pré-charger les données Root-Me en parallèle
			const rootMePromise = fetchRootMeData();

			for (const site of sites) {
				const li = document.createElement("li");
				li.className = "experience collapsed";

				const platformClass = `platform-${site.id}`;
				li.classList.add(platformClass);

				li.innerHTML = `
					<img src="${site.image}" alt="${site.titre}" class="fixed-img" />
					<div class="experience-text">
						<a href="${site.lien}" target="_blank" rel="noopener noreferrer">
							<h2>${site.titre}</h2>
						</a>
						<p>${site.description}</p>
						<span class="statut-badge statut-${site.statut.toLowerCase().replace(' ', '-')}">${site.statut}</span>
						<button class="toggle-button">Voir plus</button>
						<div class="progress-zone" style="display: none;"></div>
					</div>
				`;

				li.addEventListener("click", async () => {
					const alreadyOpen = li.classList.contains("expanded");

					document.querySelectorAll(".experience").forEach(other => {
						other.classList.remove("expanded");
						other.classList.add("collapsed");
						const zone = other.querySelector(".progress-zone");
						if (zone) zone.style.display = "none";
						const btn = other.querySelector(".toggle-button");
						if (btn) btn.textContent = "Voir plus";
					});

					if (!alreadyOpen) {
						li.classList.remove("collapsed");
						li.classList.add("expanded");
						li.querySelector(".toggle-button").textContent = "Voir moins";

						const zone = li.querySelector(".progress-zone");
						zone.innerHTML = "";
						zone.style.display = "block";

						if (site.id === "rootme") {
							// Afficher le spinner pendant le chargement
							zone.innerHTML = '<div class="loading-spinner"></div>';
							const rmData = await rootMePromise;
							zone.innerHTML = "";
							renderRootMeStats(rmData, zone);
						} else {
							const related = progress.filter(p => p.siteId === site.id);
							renderProgressCards(related, zone);
						}
					}
				});

				list.appendChild(li);
			}
		});
}


// ---------- Mobile menu toggle ----------

document.addEventListener("DOMContentLoaded", function () {
	const toggle = document.getElementById("mobile-menu");
	const navList = document.querySelector(".nav-list");

	toggle.addEventListener("click", () => {
		navList.classList.toggle("active");
	});
});

function mergeAsideIconsOnMobile() {
	const isMobile = window.innerWidth <= 678;
	const leftAside = document.querySelector('.left-aside ul.wrapper');
	const rightAside = document.querySelector('.right-aside ul.wrapper');

	if (!leftAside || !rightAside) return;

	if (isMobile && leftAside.children.length > 0) {
		while (leftAside.children.length > 0) {
			rightAside.appendChild(leftAside.children[0]);
		}
		document.querySelector('.left-aside').style.display = 'none';
	}

	if (!isMobile && leftAside.children.length === 0) {
		const allIcons = [...rightAside.querySelectorAll('li.icon')];
		const leftIcons = allIcons.filter(icon => icon.classList.contains('mail') || icon.classList.contains('tel'));
		leftIcons.forEach(icon => leftAside.appendChild(icon));
		document.querySelector('.left-aside').style.display = '';
	}
}

window.addEventListener('DOMContentLoaded', mergeAsideIconsOnMobile);
window.addEventListener('resize', mergeAsideIconsOnMobile);
