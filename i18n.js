// Internationalisation : français (défaut), anglais, espagnol.
// - Textes statiques : attributs data-i18n / data-i18n-html / data-i18n-attr sur les éléments.
// - Données JSON : champ optionnel "i18n": { "en": {...}, "es": {...} } par entrée (voir tr()).
// - La langue est mémorisée dans localStorage et, à défaut, déduite de la langue du navigateur.

const I18N = {
	fr: {
		'title.home': 'Vincent Chaye — Élève-ingénieur cybersécurité',
		'title.learn': 'Apprentissage — Vincent Chaye',
		'meta.desc': "Portfolio de Vincent Chaye, élève-ingénieur en cybersécurité à l'ESIEA et alternant chez Thales Alenia Space.",
		'intro.enter': 'Entrer',
		'aria.menu': 'Menu',
		'aria.cv': 'Télécharger le CV',
		'aria.lang': 'Choisir la langue',
		'nav.home': 'Accueil', 'nav.about': 'À propos', 'nav.exp': 'Expériences', 'nav.projects': 'Projets',
		'nav.edu': 'Formation', 'nav.skills': 'Compétences', 'nav.learn': 'Apprentissage', 'nav.climb': 'Escalade',
		'chapter.1': 'Chapitre un', 'chapter.2': 'Chapitre deux', 'chapter.3': 'Chapitre trois', 'chapter.4': 'Chapitre quatre',
		'chapter.5': 'Chapitre cinq', 'chapter.6': 'Chapitre six', 'chapter.7': 'Chapitre sept', 'chapter.contact': 'Contact',
		'hero.subtitle': 'Élève-ingénieur cybersécurité · ESIEA<br>Alternant chez Thales Alenia Space',
		'hero.cv': 'Télécharger le CV',
		'about.em': 'À', 'about.span': 'PROPOS',
		'about.p1': "Élève-ingénieur en cybersécurité à l'ESIEA (2026-2029) et alternant chez Thales Alenia Space, je suis passionné par les réseaux et par la cybersécurité, côté Blue Team comme Red Team, avec un fort appétit pour la gouvernance.",
		'about.p2': "Je m'entraîne sur Root-Me, Hack The Box et pwn.college, je suis membre du Sophia-Hack-Lab, et je prépare la certification Cisco CCST Cybersecurity.",
		'facts.lang': 'Langues', 'facts.lang.v': 'Anglais (B2) · Allemand (A1)',
		'facts.sport': 'Sport', 'facts.sport.v': 'Escalade · Échecs · Ninja Warrior',
		'facts.creative': 'Créatif', 'facts.creative.v': 'Trompette · Pâtisserie',
		'facts.diplomas': 'Diplômes', 'facts.diplomas.v': 'BAFA · Initiateur SAE · PSC1 · Permis B',
		'video.title': 'Ninja Warrior : ma participation',
		'video.caption': 'Ma participation à Ninja Warrior · 2025',
		'exp.em': 'Les', 'exp.span': 'EXPÉRIENCES', 'exp.more': 'Voir plus', 'exp.less': 'Voir moins',
		'proj.em': 'Les', 'proj.span': 'PROJETS', 'proj.all': 'Tous mes projets sur GitHub', 'proj.code': 'Code', 'proj.site': 'Voir le site',
		'edu.em': 'La', 'edu.span': 'FORMATION',
		'edu.esiea': "Diplôme d'ingénieur, spécialité cybersécurité (alternance)",
		'edu.but': "BUT Informatique, réalisation d'applications (alternance)",
		'edu.lycee': 'Baccalauréat général, mention Bien (Maths, NSI, Maths expertes)',
		'skills.em': 'Les', 'skills.span': 'COMPÉTENCES',
		'skills.def.h': 'Défense & analyse',
		'skills.def.p': 'Wireshark · Cisco Packet Tracer · Bases SIEM / SOC · Threat intelligence · OSINT · Linux (hardening) · Windows',
		'skills.off.h': 'Audit & offensif',
		'skills.off.p': "Utilisation courante de Kali Linux Purple avec son jeu d'outils complet, en particulier pour l'audit de points d'accès sans fil (Wi-Fi) · Nmap · Burp Suite · Hydra · Hashcat · John the Ripper · x64dbg · IDA",
		'skills.dev.h': 'Développement',
		'skills.dev.p': 'Python · Bash · Rust · C/C++ · Assembleur x86 · JavaScript (React, Express, Vue) · TypeScript · HTML/CSS',
		'skills.sec.h': 'DevSecOps & IA',
		'skills.sec.p': 'CI/CD · Docker · Pipelines RAG (LangChain, Ollama)',
		'skills.certs': 'Certifications Cisco : Networking Basics · Networking Devices and Initial Configuration · Endpoint Security · CCST Cybersecurity (en cours)',
		'contact.em': 'Me', 'contact.span': 'CONTACTER',
		'tip.mail': 'Mail', 'tip.copied': 'Copié !',
		'learn.em': "L'", 'learn.span': 'APPRENTISSAGE', 'learn.subtitle': 'En cours…',
		'rm.unavailable': 'Données Root-Me indisponibles (CORS ou réseau).',
		'rm.score': 'Score', 'rm.rank': 'Rang', 'rm.solved': 'Résolus', 'rm.pts': 'pts', 'rm.challenges': 'défis',
		'credly.view': 'Voir le badge Credly ↗', 'credly.alt': 'Badge Credly : '
	},
	en: {
		'title.home': 'Vincent Chaye — Cybersecurity Engineering Student',
		'title.learn': 'Learning — Vincent Chaye',
		'meta.desc': 'Portfolio of Vincent Chaye, cybersecurity engineering student at ESIEA and work-study apprentice at Thales Alenia Space.',
		'intro.enter': 'Enter',
		'aria.menu': 'Menu',
		'aria.cv': 'Download my CV',
		'aria.lang': 'Choose language',
		'nav.home': 'Home', 'nav.about': 'About', 'nav.exp': 'Experience', 'nav.projects': 'Projects',
		'nav.edu': 'Education', 'nav.skills': 'Skills', 'nav.learn': 'Learning', 'nav.climb': 'Climbing',
		'chapter.1': 'Chapter one', 'chapter.2': 'Chapter two', 'chapter.3': 'Chapter three', 'chapter.4': 'Chapter four',
		'chapter.5': 'Chapter five', 'chapter.6': 'Chapter six', 'chapter.7': 'Chapter seven', 'chapter.contact': 'Contact',
		'hero.subtitle': 'Cybersecurity engineering student · ESIEA<br>Work-study at Thales Alenia Space',
		'hero.cv': 'Download my CV',
		'about.em': 'About', 'about.span': 'ME',
		'about.p1': 'Cybersecurity engineering student at ESIEA (2026-2029) and work-study apprentice at Thales Alenia Space, I am passionate about networks and cybersecurity, on both the Blue Team and Red Team sides, with a strong appetite for governance.',
		'about.p2': 'I train on Root-Me, Hack The Box and pwn.college, I am a member of Sophia-Hack-Lab, and I am preparing the Cisco CCST Cybersecurity certification.',
		'facts.lang': 'Languages', 'facts.lang.v': 'English (B2) · German (A1)',
		'facts.sport': 'Sports', 'facts.sport.v': 'Climbing · Chess · Ninja Warrior',
		'facts.creative': 'Creative', 'facts.creative.v': 'Trumpet · Pastry-making',
		'facts.diplomas': 'Qualifications', 'facts.diplomas.v': 'BAFA (youth leader) · Climbing instructor (SAE) · First aid (PSC1) · Driving licence',
		'video.title': 'Ninja Warrior: my appearance',
		'video.caption': 'My appearance on Ninja Warrior · 2025',
		'exp.em': 'My', 'exp.span': 'EXPERIENCE', 'exp.more': 'See more', 'exp.less': 'See less',
		'proj.em': 'My', 'proj.span': 'PROJECTS', 'proj.all': 'All my projects on GitHub', 'proj.code': 'Code', 'proj.site': 'View the site',
		'edu.em': 'My', 'edu.span': 'EDUCATION',
		'edu.esiea': 'Engineering degree, cybersecurity specialisation (work-study)',
		'edu.but': "Bachelor's degree in Computer Science (BUT), application development (work-study)",
		'edu.lycee': 'French general baccalaureate, with honours (Maths, Computer Science, Advanced Maths)',
		'skills.em': 'My', 'skills.span': 'SKILLS',
		'skills.def.h': 'Defence & analysis',
		'skills.def.p': 'Wireshark · Cisco Packet Tracer · SIEM / SOC basics · Threat intelligence · OSINT · Linux (hardening) · Windows',
		'skills.off.h': 'Auditing & offensive security',
		'skills.off.p': 'Regular use of Kali Linux Purple with its full toolset, particularly for auditing wireless access points (Wi-Fi) · Nmap · Burp Suite · Hydra · Hashcat · John the Ripper · x64dbg · IDA',
		'skills.dev.h': 'Development',
		'skills.dev.p': 'Python · Bash · Rust · C/C++ · x86 Assembly · JavaScript (React, Express, Vue) · TypeScript · HTML/CSS',
		'skills.sec.h': 'DevSecOps & AI',
		'skills.sec.p': 'CI/CD · Docker · RAG pipelines (LangChain, Ollama)',
		'skills.certs': 'Cisco certifications: Networking Basics · Networking Devices and Initial Configuration · Endpoint Security · CCST Cybersecurity (in progress)',
		'contact.em': 'Get in', 'contact.span': 'TOUCH',
		'tip.mail': 'Email', 'tip.copied': 'Copied!',
		'learn.em': 'My', 'learn.span': 'LEARNING', 'learn.subtitle': 'In progress…',
		'rm.unavailable': 'Root-Me data unavailable (CORS or network).',
		'rm.score': 'Score', 'rm.rank': 'Rank', 'rm.solved': 'Solved', 'rm.pts': 'pts', 'rm.challenges': 'challenges',
		'credly.view': 'View Credly badge ↗', 'credly.alt': 'Credly badge: '
	},
	es: {
		'title.home': 'Vincent Chaye — Estudiante de ingeniería en ciberseguridad',
		'title.learn': 'Aprendizaje — Vincent Chaye',
		'meta.desc': 'Portfolio de Vincent Chaye, estudiante de ingeniería en ciberseguridad en la ESIEA y alternante en Thales Alenia Space.',
		'intro.enter': 'Entrar',
		'aria.menu': 'Menú',
		'aria.cv': 'Descargar mi CV',
		'aria.lang': 'Elegir idioma',
		'nav.home': 'Inicio', 'nav.about': 'Sobre mí', 'nav.exp': 'Experiencia', 'nav.projects': 'Proyectos',
		'nav.edu': 'Formación', 'nav.skills': 'Competencias', 'nav.learn': 'Aprendizaje', 'nav.climb': 'Escalada',
		'chapter.1': 'Capítulo uno', 'chapter.2': 'Capítulo dos', 'chapter.3': 'Capítulo tres', 'chapter.4': 'Capítulo cuatro',
		'chapter.5': 'Capítulo cinco', 'chapter.6': 'Capítulo seis', 'chapter.7': 'Capítulo siete', 'chapter.contact': 'Contacto',
		'hero.subtitle': 'Estudiante de ingeniería en ciberseguridad · ESIEA<br>En alternancia en Thales Alenia Space',
		'hero.cv': 'Descargar mi CV',
		'about.em': 'Sobre', 'about.span': 'MÍ',
		'about.p1': 'Estudiante de ingeniería en ciberseguridad en la ESIEA (2026-2029) y alternante en Thales Alenia Space, me apasionan las redes y la ciberseguridad, tanto en el lado Blue Team como en el Red Team, con un gran interés por la gobernanza.',
		'about.p2': 'Entreno en Root-Me, Hack The Box y pwn.college, soy miembro de Sophia-Hack-Lab y preparo la certificación Cisco CCST Cybersecurity.',
		'facts.lang': 'Idiomas', 'facts.lang.v': 'Inglés (B2) · Alemán (A1)',
		'facts.sport': 'Deporte', 'facts.sport.v': 'Escalada · Ajedrez · Ninja Warrior',
		'facts.creative': 'Creatividad', 'facts.creative.v': 'Trompeta · Repostería',
		'facts.diplomas': 'Titulaciones', 'facts.diplomas.v': 'BAFA (monitor de ocio) · Instructor de escalada (SAE) · Primeros auxilios (PSC1) · Carnet de conducir',
		'video.title': 'Ninja Warrior: mi participación',
		'video.caption': 'Mi participación en Ninja Warrior · 2025',
		'exp.em': 'Mi', 'exp.span': 'EXPERIENCIA', 'exp.more': 'Ver más', 'exp.less': 'Ver menos',
		'proj.em': 'Mis', 'proj.span': 'PROYECTOS', 'proj.all': 'Todos mis proyectos en GitHub', 'proj.code': 'Código', 'proj.site': 'Ver el sitio',
		'edu.em': 'Mi', 'edu.span': 'FORMACIÓN',
		'edu.esiea': 'Título de ingeniero, especialidad en ciberseguridad (alternancia)',
		'edu.but': 'Grado universitario tecnológico (BUT) en Informática, desarrollo de aplicaciones (alternancia)',
		'edu.lycee': 'Bachillerato general francés, con mención Bien (Matemáticas, Informática, Matemáticas expertas)',
		'skills.em': 'Mis', 'skills.span': 'COMPETENCIAS',
		'skills.def.h': 'Defensa y análisis',
		'skills.def.p': 'Wireshark · Cisco Packet Tracer · Fundamentos de SIEM / SOC · Inteligencia de amenazas · OSINT · Linux (bastionado) · Windows',
		'skills.off.h': 'Auditoría y seguridad ofensiva',
		'skills.off.p': 'Uso habitual de Kali Linux Purple con su conjunto completo de herramientas, en particular para la auditoría de puntos de acceso inalámbricos (Wi-Fi) · Nmap · Burp Suite · Hydra · Hashcat · John the Ripper · x64dbg · IDA',
		'skills.dev.h': 'Desarrollo',
		'skills.dev.p': 'Python · Bash · Rust · C/C++ · Ensamblador x86 · JavaScript (React, Express, Vue) · TypeScript · HTML/CSS',
		'skills.sec.h': 'DevSecOps e IA',
		'skills.sec.p': 'CI/CD · Docker · Pipelines RAG (LangChain, Ollama)',
		'skills.certs': 'Certificaciones Cisco: Networking Basics · Networking Devices and Initial Configuration · Endpoint Security · CCST Cybersecurity (en curso)',
		'contact.em': 'Ponte en', 'contact.span': 'CONTACTO',
		'tip.mail': 'Correo', 'tip.copied': '¡Copiado!',
		'learn.em': 'Mi', 'learn.span': 'APRENDIZAJE', 'learn.subtitle': 'En curso…',
		'rm.unavailable': 'Datos de Root-Me no disponibles (CORS o red).',
		'rm.score': 'Puntuación', 'rm.rank': 'Rango', 'rm.solved': 'Resueltos', 'rm.pts': 'pts', 'rm.challenges': 'retos',
		'credly.view': 'Ver insignia de Credly ↗', 'credly.alt': 'Insignia de Credly: '
	}
};

const LANGS = ['fr', 'en', 'es'];
const LANG_NAMES = { fr: 'Français', en: 'English', es: 'Español' };

function detectLang() {
	try {
		const saved = localStorage.getItem('lang');
		if (LANGS.includes(saved)) return saved;
	} catch { /* stockage indisponible */ }
	const nav = (navigator.language || 'fr').slice(0, 2).toLowerCase();
	return LANGS.includes(nav) ? nav : 'fr';
}

let LANG = detectLang();

/** Texte traduit pour une clé (repli : français, puis la clé elle-même). */
function t(key) {
	return I18N[LANG][key] ?? I18N.fr[key] ?? key;
}

/** Champ d'un objet de données, traduit si une entrée i18n existe pour la langue courante. */
function tr(obj, field) {
	const v = obj.i18n && obj.i18n[LANG] && obj.i18n[LANG][field];
	return v !== undefined ? v : obj[field];
}

/** Applique la langue courante au DOM statique de la page. */
function applyLang() {
	document.documentElement.lang = LANG;

	document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
	document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
	document.querySelectorAll('[data-i18n-attr]').forEach(el => {
		// format : "attribut:clé" (plusieurs séparés par « ; »)
		el.dataset.i18nAttr.split(';').forEach(pair => {
			const [attr, key] = pair.split(':').map(s => s.trim());
			if (attr && key) el.setAttribute(attr, t(key));
		});
	});

	const titleKey = document.documentElement.dataset.titleKey;
	if (titleKey) document.title = t(titleKey);
	const meta = document.querySelector('meta[name="description"]');
	if (meta) meta.setAttribute('content', t('meta.desc'));

	// Documents du site : le CV existe dans chaque langue.
	document.querySelectorAll('[data-cv]').forEach(a => {
		const suffix = LANG === 'fr' ? '' : '-' + LANG.toUpperCase();
		a.setAttribute('href', `${a.dataset.cv}CV-VincentChaye-2026${suffix}.pdf`);
	});

	const code = document.getElementById('lang-code');
	if (code) code.textContent = LANG.toUpperCase();
	document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-current', String(b.dataset.lang === LANG)));
}

function setLang(lang) {
	if (!LANGS.includes(lang) || lang === LANG) return;
	LANG = lang;
	try { localStorage.setItem('lang', lang); } catch { /* ignoré */ }
	applyLang();
	document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

document.addEventListener('DOMContentLoaded', () => {
	applyLang();

	const btn = document.getElementById('lang-btn');
	const menu = document.getElementById('lang-menu');
	if (!btn || !menu) return;

	const close = () => { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); };
	btn.addEventListener('click', e => {
		e.stopPropagation();
		const open = menu.classList.toggle('open');
		btn.setAttribute('aria-expanded', String(open));
	});
	menu.addEventListener('click', e => {
		const b = e.target.closest('[data-lang]');
		if (!b) return;
		setLang(b.dataset.lang);
		close();
	});
	document.addEventListener('click', close);
	document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
});
