// Comportements de la page d'accueil : intro, menu, fond animé, révélation au scroll.

(() => {
	const intro = document.getElementById('intro');
	const enterBtn = document.getElementById('enter-btn');
	const menuBtn = document.getElementById('mobile-menu');
	const navPanel = document.getElementById('nav-panel');

	// ----- Intro -----
	function enter() {
		intro.classList.add('hide');
		document.body.classList.remove('is-locked');
		revealHero();
	}
	if (intro && enterBtn) {
		enterBtn.addEventListener('click', enter);
	} else {
		// Pages sans écran d'intro
		document.body.classList.remove('is-locked');
		setTimeout(revealHero, 200);
	}

	// ----- Menu -----
	menuBtn.addEventListener('click', () => {
		const open = navPanel.classList.toggle('open');
		menuBtn.setAttribute('aria-expanded', open);
	});
	document.addEventListener('click', e => {
		if (!navPanel.contains(e.target) && !menuBtn.contains(e.target)) {
			navPanel.classList.remove('open');
			menuBtn.setAttribute('aria-expanded', 'false');
		}
	});

	// ----- Révélation au scroll -----
	const io = new IntersectionObserver(entries => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add('in');
				io.unobserve(entry.target);
			}
		});
	}, { threshold: 0.15 });

	function observe(root = document) {
		root.querySelectorAll('.reveal:not(.in), li.experience:not(.in)').forEach(el => io.observe(el));
	}

	function revealHero() {
		document.querySelectorAll('.hero .reveal').forEach((el, i) => {
			setTimeout(() => el.classList.add('in'), 500 + i * 220);
		});
	}

	observe();
	// Les expériences sont injectées par script.js après le fetch
	const list = document.getElementById('experience-list') || document.getElementById('learn-list');
	if (list) new MutationObserver(() => observe(list)).observe(list, { childList: true });
	const plist = document.getElementById('project-list');
	if (plist) new MutationObserver(() => observe(plist)).observe(plist, { childList: true });

	// ----- Fond : courbes de niveau qui ondulent (esprit "glaciers") -----
	const canvas = document.getElementById('bg-canvas');
	const ctx = canvas.getContext('2d');
	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	let w, h, dpr, mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5;

	function resize() {
		dpr = Math.min(devicePixelRatio || 1, 2);
		w = canvas.width = innerWidth * dpr;
		h = canvas.height = innerHeight * dpr;
	}
	resize();
	addEventListener('resize', resize);
	addEventListener('pointermove', e => { tx = e.clientX / innerWidth; ty = e.clientY / innerHeight; });

	const LINES = 44;

	function draw(t) {
		mx += (tx - mx) * 0.04;
		my += (ty - my) * 0.04;

		ctx.clearRect(0, 0, w, h);

		// lueur douce
		const g = ctx.createRadialGradient(w * mx, h * (0.35 + my * 0.2), 0, w * mx, h * 0.5, w * 0.7);
		g.addColorStop(0, 'rgba(120, 100, 80, 0.22)');
		g.addColorStop(1, 'rgba(0, 0, 0, 0)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, w, h);

		const scroll = scrollY / innerHeight;
		ctx.lineWidth = 1 * dpr;

		for (let i = 0; i < LINES; i++) {
			const k = i / LINES;
			const baseY = h * (0.15 + k * 0.95) - scroll * 80 * dpr * (0.3 + k);
			ctx.beginPath();
			for (let x = 0; x <= w; x += 16 * dpr) {
				const nx = x / w;
				const bump = Math.exp(-Math.pow((nx - mx) * 3, 2)) * 60 * dpr * (1 - k * 0.5);
				const y = baseY
					+ Math.sin(nx * 4 + t * 0.00018 + k * 5) * 38 * dpr
					+ Math.sin(nx * 9 - t * 0.00026 + k * 2) * 14 * dpr
					- bump;
				x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
			}
			const warm = i % 11 === 0;
			ctx.strokeStyle = warm
				? `rgba(184, 117, 74, ${0.25 + k * 0.2})`
				: `rgba(233, 226, 214, ${0.035 + k * 0.07})`;
			ctx.stroke();
		}

		if (!reduce) requestAnimationFrame(draw);
	}
	requestAnimationFrame(draw);
})();
