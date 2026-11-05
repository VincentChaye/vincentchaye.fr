// Rendu des données (expériences, projets, apprentissage). Dépend de i18n.js (t, tr, LANG).

// Fonction pour copier un texte dans le presse-papier
function copyToClipboard(text, element) {
	navigator.clipboard.writeText(text).then(() => {
		const tooltip = element.querySelector('.tooltip');
		const original = tooltip.textContent;
		tooltip.textContent = t('tip.copied');
		setTimeout(() => {
			tooltip.textContent = tooltip.dataset.i18n ? t(tooltip.dataset.i18n) : original;
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
		zone.innerHTML = `<p class="api-error">${t('rm.unavailable')}</p>`;
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
					<span class="stat-label">${t('rm.score')}</span>
					<span class="stat-value">${score} ${t('rm.pts')}</span>
				</div>
				<div class="stat-pill">
					<span class="stat-label">${t('rm.rank')}</span>
					<span class="stat-value">#${rang}</span>
				</div>
				<div class="stat-pill">
					<span class="stat-label">${t('rm.solved')}</span>
					<span class="stat-value">${solved} ${t('rm.challenges')}</span>
				</div>
			</div>
			${catHtml ? `<div class="cat-strip">${catHtml}</div>` : ''}
		</div>
	`;
}

function renderProgressCards(progress, zone) {
	progress.forEach(p => {
		const titre = tr(p, 'titre');
		const progressTxt = tr(p, 'progress');
		const isPercent = typeof progressTxt === 'string' && progressTxt.includes('%');
		const percentVal = isPercent ? parseInt(progressTxt) : null;

		const progressHtml = isPercent
			? `<div class="progress-bar-wrap">
					<div class="progress-bar-fill" style="width: ${percentVal}%"></div>
				</div>
				<span class="progress-label">${progressTxt}</span>`
			: `<span class="progress-text">${progressTxt}</span>`;

		const badgeHtml = p.badgeId
			? `<div class="credly-badge-wrap" data-badge-id="${p.badgeId}" data-badge-titre="${titre}">
					<div class="credly-badge-loading"></div>
				</div>`
			: '';

		const div = document.createElement('div');
		div.className = 'progress-card';
		div.innerHTML = `
			<div class="progress-card-inner ${p.badgeId ? 'has-badge' : ''}">
				<div class="progress-card-header">
					<img src="${p.image}" alt="${titre}" class="progress-card-img" />
					<div>
						<h3>${titre}</h3>
						<p class="progress-date">${tr(p, 'date')}</p>
					</div>
				</div>
				${progressHtml}
				<p class="progress-desc">${tr(p, 'description')}</p>
				${badgeHtml}
			</div>
		`;
		zone.appendChild(div);

		if (p.badgeId) {
			loadCredlyBadge(div.querySelector('.credly-badge-wrap'), p.badgeId, titre);
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
				<img src="${imageUrl}" alt="${t('credly.alt')}${titre}" class="credly-badge-img" />
			</a>`;
	} catch {
		wrap.innerHTML = `
			<a href="https://www.credly.com/badges/${badgeId}" target="_blank" rel="noopener noreferrer" class="credly-badge-link">
				${t('credly.view')}
			</a>`;
	}
}


// ---------- Page index.html : expériences professionnelles ----------

if (document.getElementById("experience-list")) {
	let experiences = [];

	function renderExperiences(instant) {
		const list = document.getElementById("experience-list");
		list.innerHTML = "";

		experiences.forEach(exp => {
			const li = document.createElement("li");
			li.className = `experience ${exp.class} collapsed${instant ? " in" : ""}`;

			const desc = tr(exp, "description");
			const hasDesc = !!desc;
			const titre = tr(exp, "titre");
			const visual = exp.logo
				? `<img src="${exp.logo}" alt="Logo ${exp.class}" class="logo-${exp.class}">`
				: `<span class="monogram" aria-hidden="true">${(exp.adresse || titre).split(' ')[0].slice(0, 2).toUpperCase()}</span>`;

			li.innerHTML = `
				${visual}
				<div class="experience-text">
					<h2>${titre}</h2>
					${exp.adresse ? `<p class="adresse">${exp.adresse}</p>` : ''}
					<p class="date">${tr(exp, "date")}</p>
					${hasDesc ? `<p class="description" style="display: none;">${desc}</p>
					<button class="toggle-button">${t('exp.more')}</button>` : ''}
				</div>
			`;

			// Accordéon
			li.addEventListener('click', () => {
				if (!hasDesc) return;
				const isCollapsed = li.classList.contains("collapsed");

				document.querySelectorAll(".experience").forEach(item => {
					const d = item.querySelector(".description");
					if (!d) return;
					item.classList.remove("expanded");
					item.classList.add("collapsed");
					d.style.display = "none";
					item.querySelector(".toggle-button").textContent = t('exp.more');
				});

				if (isCollapsed) {
					li.classList.remove("collapsed");
					li.classList.add("expanded");
					li.querySelector(".description").style.display = "block";
					li.querySelector(".toggle-button").textContent = t('exp.less');
				}
			});

			list.appendChild(li);
		});
	}

	fetch("public/data/experiences.json")
		.then(response => response.json())
		.then(data => {
			// Trier : d'abord "en cours", puis par date décroissante (tri stable)
			data.sort((a, b) => {
				if (a.dateFin === "en cours") return -1;
				if (b.dateFin === "en cours") return 1;
				return new Date(b.dateFin) - new Date(a.dateFin);
			});
			experiences = data;
			renderExperiences(false);
		});

	document.addEventListener('langchange', () => renderExperiences(true));
}

// ---------- Page index.html : projets ----------

if (document.getElementById("project-list")) {
	let projets = [];

	function renderProjects(instant) {
		const list = document.getElementById("project-list");
		list.innerHTML = "";
		projets.forEach(p => {
			const li = document.createElement("li");
			li.className = `project-card reveal${instant ? " in" : ""}`;
			const statut = tr(p, "statut");
			li.innerHTML = `
				<h3>${p.titre}${statut ? `<span class="badge">${statut}</span>` : ""}</h3>
				<p>${tr(p, "description")}</p>
				<ul class="tags">${p.tags.map(tag => `<li>${tag}</li>`).join("")}</ul>
				<div class="links">
					<a href="${p.lien}" target="_blank" rel="noopener noreferrer">${t('proj.code')}</a>
					${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener noreferrer">${t('proj.site')}</a>` : ""}
				</div>`;
			list.appendChild(li);
		});
	}

	fetch("public/data/projets.json")
		.then(r => r.json())
		.then(data => {
			projets = data;
			renderProjects(false);
		});

	document.addEventListener('langchange', () => renderProjects(true));
}

// ---------- Page learn.html : plateformes + avancement ----------

if (document.getElementById("learn-list")) {
	let sites = [];
	let progress = [];
	// Pré-charger les données Root-Me en parallèle
	const rootMePromise = fetchRootMeData();

	function renderLearn(instant) {
		const list = document.getElementById("learn-list");
		list.innerHTML = "";

		for (const site of sites) {
			const li = document.createElement("li");
			li.className = `experience collapsed platform-${site.id}${instant ? " in" : ""}`;

			// La classe CSS du statut reste basée sur la valeur française d'origine.
			li.innerHTML = `
				<img src="${site.image}" alt="${site.titre}" class="fixed-img" />
				<div class="experience-text">
					<a href="${site.lien}" target="_blank" rel="noopener noreferrer">
						<h2>${site.titre}</h2>
					</a>
					<p>${tr(site, 'description')}</p>
					<span class="statut-badge statut-${site.statut.toLowerCase().replace(' ', '-')}">${tr(site, 'statut')}</span>
					<button class="toggle-button">${t('exp.more')}</button>
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
					if (btn) btn.textContent = t('exp.more');
				});

				if (!alreadyOpen) {
					li.classList.remove("collapsed");
					li.classList.add("expanded");
					li.querySelector(".toggle-button").textContent = t('exp.less');

					const zone = li.querySelector(".progress-zone");
					zone.innerHTML = "";
					zone.style.display = "block";

					if (site.id === "rootme") {
						zone.innerHTML = '<div class="loading-spinner"></div>';
						const rmData = await rootMePromise;
						zone.innerHTML = "";
						renderRootMeStats(rmData, zone);
					} else {
						renderProgressCards(progress.filter(p => p.siteId === site.id), zone);
					}
				}
			});

			list.appendChild(li);
		}
	}

	Promise.all([
		fetch("../data/learnSites.json").then(res => res.json()),
		fetch("../data/learnProgress.json").then(res => res.json())
	]).then(([s, p]) => {
		sites = s;
		progress = p;
		renderLearn(false);
	});

	document.addEventListener('langchange', () => renderLearn(true));
}
