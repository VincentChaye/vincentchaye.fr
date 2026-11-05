// Effet « eau que l'on touche » sur la photo de fond.
// - Simulation d'ondes (équation d'onde amortie) dans une texture flottante, avec ping-pong GPU.
// - Le curseur injecte des gouttes le long de son trajet ; un clic / un toucher crée une onde plus grande.
// - Le rendu déforme la photo (réfraction), ajoute des reflets spéculaires et éclaircit la zone autour de la souris.
// Repli : si WebGL2 n'est pas disponible ou si l'utilisateur préfère moins d'animations, la photo CSS reste affichée.

(() => {
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	const bg = document.querySelector('.bg-photo');
	if (!bg) return;

	const wrap = document.createElement('div');
	wrap.className = 'water-wrap';
	wrap.setAttribute('aria-hidden', 'true');
	const canvas = document.createElement('canvas');
	const shade = document.createElement('div');
	shade.className = 'water-shade';
	wrap.append(canvas, shade);
	bg.after(wrap);

	const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' });
	if (!gl || !gl.getExtension('EXT_color_buffer_float')) { wrap.remove(); return; }

	// ---------- Shaders ----------
	const VERT = `#version 300 es
	out vec2 vUv;
	void main() {
		vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
		vUv = p;
		gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
	}`;

	// Étape de propagation : h'' = c² Δh avec amortissement.
	const SIM = `#version 300 es
	precision highp float;
	uniform sampler2D uState;
	uniform vec2 uTexel;
	in vec2 vUv;
	out vec4 o;
	void main() {
		vec2 s = texture(uState, vUv).rg;
		float h = s.r, v = s.g;
		float avg = (texture(uState, vUv + vec2(uTexel.x, 0.0)).r + texture(uState, vUv - vec2(uTexel.x, 0.0)).r
		           + texture(uState, vUv + vec2(0.0, uTexel.y)).r + texture(uState, vUv - vec2(0.0, uTexel.y)).r) * 0.25;
		v += (avg - h) * 2.0;
		v *= 0.9935;
		h += v;
		o = vec4(h, v, 0.0, 1.0);
	}`;

	// Injection d'une goutte (bosse en cosinus).
	const DROP = `#version 300 es
	precision highp float;
	uniform sampler2D uState;
	uniform vec2 uCenter;
	uniform float uRadius, uStrength, uAspect;
	in vec2 vUv;
	out vec4 o;
	void main() {
		vec4 s = texture(uState, vUv);
		vec2 d = (vUv - uCenter) * vec2(uAspect, 1.0);
		float k = max(0.0, 1.0 - length(d) / uRadius);
		k = 0.5 - cos(k * 3.14159265) * 0.5;
		o = vec4(s.r + k * uStrength, s.g, 0.0, 1.0);
	}`;

	// Rendu : réfraction de la photo + reflets + halo autour de la souris.
	const RENDER = `#version 300 es
	precision highp float;
	uniform sampler2D uState, uPhoto;
	uniform vec2 uTexel, uCover, uMouse;
	uniform float uAspect, uGlow, uTime;
	in vec2 vUv;
	out vec4 o;

	vec2 cover(vec2 uv) { return (uv - 0.5) * uCover + 0.5; }

	void main() {
		float h  = texture(uState, vUv).r;
		float hx = texture(uState, vUv + vec2(uTexel.x, 0.0)).r - texture(uState, vUv - vec2(uTexel.x, 0.0)).r;
		float hy = texture(uState, vUv + vec2(0.0, uTexel.y)).r - texture(uState, vUv - vec2(0.0, uTexel.y)).r;

		// Réfraction : la photo est vue à travers la surface déformée (léger écart par canal = dispersion).
		vec2 off = vec2(hx, hy) * 0.10;
		vec3 col;
		col.r = texture(uPhoto, cover(vUv + off * 1.06)).r;
		col.g = texture(uPhoto, cover(vUv + off)).g;
		col.b = texture(uPhoto, cover(vUv + off * 0.94)).b;

		// Normale de la surface et éclairage.
		vec3 N = normalize(vec3(-hx * 3.5, -hy * 3.5, 1.0));
		vec3 L = normalize(vec3(-0.35, 0.55, 0.75));
		vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
		float spec = pow(max(dot(N, H), 0.0), 90.0);
		float slope = clamp(length(vec2(hx, hy)) * 3.5, 0.0, 1.0);
		float sheen = pow(1.0 - N.z, 1.5);

		// Halo clair autour de la souris, teinté eau.
		vec2 dm = (vUv - uMouse) * vec2(uAspect, 1.0);
		float g = exp(-dot(dm, dm) / (2.0 * 0.2 * 0.2)) * uGlow;
		col *= 1.0 + g * 0.8;
		col += g * vec3(0.045, 0.075, 0.095);

		// Légères variations de luminosité selon la hauteur de l'eau.
		col *= 1.0 + h * 0.5;
		col += vec3(0.85, 0.95, 1.0) * (spec * 0.55 + sheen * 0.2 * slope);

		o = vec4(col, 1.0);
	}`;

	function program(fs) {
		const mk = (type, src) => {
			const s = gl.createShader(type);
			gl.shaderSource(s, src);
			gl.compileShader(s);
			if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
			return s;
		};
		const p = gl.createProgram();
		gl.attachShader(p, mk(gl.VERTEX_SHADER, VERT));
		gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
		gl.linkProgram(p);
		if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
		const u = {};
		const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
		for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name; u[name] = gl.getUniformLocation(p, name); }
		return { p, u };
	}

	let simP, dropP, renP;
	try { simP = program(SIM); dropP = program(DROP); renP = program(RENDER); }
	catch (e) { console.warn('water.js :', e); wrap.remove(); return; }

	gl.bindVertexArray(gl.createVertexArray());

	// ---------- Textures ----------
	function tex(w, h, internal, format, type, filter, data) {
		const t = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, t);
		gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, data);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		return t;
	}

	let sim = []; // [{tex, fbo}, {tex, fbo}]
	let simW = 0, simH = 0, cur = 0;

	function initSim() {
		sim.forEach(s => { gl.deleteTexture(s.tex); gl.deleteFramebuffer(s.fbo); });
		const aspect = innerWidth / innerHeight;
		simW = 420;
		simH = Math.max(64, Math.round(simW / aspect));
		sim = [0, 1].map(() => {
			const t = tex(simW, simH, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR, null);
			const f = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, f);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
			gl.clearColor(0, 0, 0, 1);
			gl.clear(gl.COLOR_BUFFER_BIT);
			return { tex: t, fbo: f };
		});
		cur = 0;
	}

	let photo = null, photoAspect = 4 / 3, photoReady = false;
	const img = new Image();
	img.onload = () => {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		photo = tex(img.width, img.height, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR, img);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		photoAspect = img.width / img.height;
		photoReady = true;
	};
	img.src = 'public/img/paysage.jpg'.replace(/^/, location.pathname.includes('/public/html/') ? '../../' : '');

	// ---------- Taille ----------
	let dpr = 1;
	function resize() {
		dpr = Math.min(devicePixelRatio || 1, 1.5);
		canvas.width = Math.round(innerWidth * dpr);
		canvas.height = Math.round(innerHeight * dpr);
		initSim();
	}
	let rt;
	addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
	resize();

	// ---------- Entrées ----------
	const drops = [];
	let last = null, tx = -1, ty = -1, mx = -1, my = -1, glow = 0, lastMove = -1e9;

	function toUv(e) { return [e.clientX / innerWidth, 1 - e.clientY / innerHeight]; }

	addEventListener('pointermove', e => {
		const [x, y] = toUv(e);
		tx = x; ty = y;
		if (mx < 0) { mx = x; my = y; }
		lastMove = performance.now();
		if (last) {
			const dx = (x - last[0]) * (innerWidth / innerHeight), dy = y - last[1];
			const dist = Math.hypot(dx, dy);
			const steps = Math.max(1, Math.min(10, Math.ceil(dist / 0.012)));
			for (let i = 1; i <= steps; i++) {
				const k = i / steps;
				drops.push({ x: last[0] + (x - last[0]) * k, y: last[1] + (y - last[1]) * k, r: 0.034, s: Math.min(0.5, 0.08 + dist * 3) / steps * 1.7 });
			}
		}
		last = [x, y];
	}, { passive: true });
	addEventListener('pointerdown', e => {
		const [x, y] = toUv(e);
		tx = x; ty = y; if (mx < 0) { mx = x; my = y; }
		lastMove = performance.now();
		last = [x, y];
		drops.push({ x, y, r: 0.06, s: 1.1 });
	}, { passive: true });
	document.addEventListener('pointerleave', () => { last = null; });

	// ---------- Boucle ----------
	function pass(prog, target) {
		gl.useProgram(prog.p);
		gl.bindFramebuffer(gl.FRAMEBUFFER, target);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}

	let acc = 0, prev = performance.now(), shown = false, raf = 0;

	function frame(now) {
		raf = requestAnimationFrame(frame);
		const dt = Math.min(now - prev, 100);
		prev = now;
		acc += dt / 16.67;
		const aspect = innerWidth / innerHeight;

		gl.viewport(0, 0, simW, simH);

		// Gouttes en attente
		for (let n = 0; n < 14 && drops.length; n++) {
			const d = drops.shift();
			gl.useProgram(dropP.p);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, sim[cur].tex);
			gl.uniform1i(dropP.u.uState, 0);
			gl.uniform2f(dropP.u.uCenter, d.x, d.y);
			gl.uniform1f(dropP.u.uRadius, d.r);
			gl.uniform1f(dropP.u.uStrength, d.s);
			gl.uniform1f(dropP.u.uAspect, aspect);
			pass(dropP, sim[1 - cur].fbo);
			cur = 1 - cur;
		}

		// Propagation
		let steps = Math.min(3, Math.floor(acc));
		acc -= steps;
		while (steps-- > 0) {
			gl.useProgram(simP.p);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, sim[cur].tex);
			gl.uniform1i(simP.u.uState, 0);
			gl.uniform2f(simP.u.uTexel, 1 / simW, 1 / simH);
			pass(simP, sim[1 - cur].fbo);
			cur = 1 - cur;
		}

		if (!photoReady) return;

		// Halo : suit la souris en douceur et s'estompe quand elle est immobile.
		if (mx >= 0) { mx += (tx - mx) * 0.14; my += (ty - my) * 0.14; }
		const idle = (now - lastMove) / 1000;
		const target = mx < 0 ? 0 : Math.max(0, 1 - Math.max(0, idle - 1.2) / 2.5);
		glow += (target - glow) * 0.06;

		// Rendu
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.useProgram(renP.p);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, sim[cur].tex);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, photo);
		gl.uniform1i(renP.u.uState, 0);
		gl.uniform1i(renP.u.uPhoto, 1);
		gl.uniform2f(renP.u.uTexel, 1 / simW, 1 / simH);
		const cover = aspect > photoAspect ? [1, photoAspect / aspect] : [aspect / photoAspect, 1];
		gl.uniform2f(renP.u.uCover, cover[0], cover[1]);
		gl.uniform2f(renP.u.uMouse, mx, my);
		gl.uniform1f(renP.u.uAspect, aspect);
		gl.uniform1f(renP.u.uGlow, glow);
		gl.uniform1f(renP.u.uTime, now / 1000);
		pass(renP, null);

		if (!shown) { shown = true; document.body.classList.add('water-on'); }
	}

	document.addEventListener('visibilitychange', () => {
		cancelAnimationFrame(raf);
		if (!document.hidden) { prev = performance.now(); raf = requestAnimationFrame(frame); }
	});
	canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); cancelAnimationFrame(raf); wrap.remove(); document.body.classList.remove('water-on'); });
	raf = requestAnimationFrame(frame);
})();
