(function () {
	"use strict";

	var CFG = window.CRACKER_CONFIG || {};
	var state = {
		steamId: null,
		mapName: "",
		serverName: CFG.fallbackServerName || "Cracker Games BR",
		filesTotal: 0,
		filesNeeded: 0,
	};

	/* ---------- elementos ---------- */
	var el = {};
	function cacheEls() {
		el.bgTint = document.querySelector(".bg-tint");
		el.brandLogo = document.getElementById("brand-logo");
		el.brandCredit = document.getElementById("brand-credit");
		el.serverName = document.getElementById("server-name");
		el.mapName = document.getElementById("map-name");
		el.status = document.getElementById("status-text");
		el.progressBar = document.getElementById("progress-bar");
		el.progressLabel = document.getElementById("progress-label");
		el.curiosityText = document.getElementById("curiosity-text");
		el.fanartGrid = document.getElementById("fanart-grid");
		el.profileBody = document.getElementById("profile-body");
		el.bgLayers = document.getElementById("bg-layers");
	}

	/* ---------- fundo (crossfade) ---------- */
	var bgIndex = 0;
	function setupBackgrounds() {
		var BACKGROUNDS = CFG.backgrounds || [];
		if (!BACKGROUNDS.length) return;
		BACKGROUNDS.forEach(function (src, i) {
			var div = document.createElement("div");
			// artes feitas sob encomenda pra Cracker Games BR (ex: peças do
			// Muguetos com o logo/nome já desenhado nelas) já nascem na cor
			// certa, então não levam o filtro pesado de desaturar + duotone
			// usado nos screenshots do jogo — senão o texto delas some.
			var isBranded = /muguetos-bg/i.test(src);
			div.className = "bg-layer" + (isBranded ? " bg-layer--branded" : "") + (i === 0 ? " active" : "");
			div.dataset.branded = isBranded ? "1" : "";
			div.style.backgroundImage = "url('" + src + "')";
			el.bgLayers.appendChild(div);
		});
		updateTint();
		if (BACKGROUNDS.length > 1) {
			setInterval(cycleBackground, CFG.backgroundIntervalMs || 12000);
		}
	}
	function cycleBackground() {
		var layers = el.bgLayers.children;
		layers[bgIndex].classList.remove("active");
		bgIndex = (bgIndex + 1) % layers.length;
		layers[bgIndex].classList.add("active");
		updateTint();
	}
	function updateTint() {
		var layers = el.bgLayers.children;
		if (!layers.length) return;
		el.bgTint.classList.toggle("bg-tint--off", layers[bgIndex].dataset.branded === "1");
	}

	/* ---------- curiosidades ---------- */
	var curiosityIndex = 0;
	function setupCuriosities() {
		var list = CFG.curiosities || [];
		if (!list.length) {
			el.curiosityText.textContent = "Nenhuma curiosidade cadastrada ainda.";
			return;
		}
		renderCuriosity(list);
		if (list.length > 1) {
			setInterval(function () {
				curiosityIndex = (curiosityIndex + 1) % list.length;
				renderCuriosity(list);
			}, CFG.curiosityIntervalMs || 9000);
		}
	}
	function renderCuriosity(list) {
		el.curiosityText.classList.remove("fade-in");
		void el.curiosityText.offsetWidth; // reinicia a animação
		el.curiosityText.textContent = list[curiosityIndex];
		el.curiosityText.classList.add("fade-in");
	}

	/* ---------- fanarts ---------- */
	function setupFanarts() {
		var list = CFG.fanarts || [];
		el.fanartGrid.innerHTML = "";
		if (!list.length) {
			el.fanartGrid.innerHTML = '<p class="empty-msg">Nenhuma fanart cadastrada ainda. Manda a sua no Discord!</p>';
			return;
		}
		list.forEach(function (item) {
			var card = document.createElement("figure");
			card.className = "fanart-card";

			var img = document.createElement("img");
			img.src = item.file;
			img.alt = item.title || "Fanart";
			img.loading = "lazy";

			var caption = document.createElement("figcaption");
			caption.innerHTML =
				"<strong>" + escapeHtml(item.title || "Sem título") + "</strong>" +
				(item.author ? "<span>por " + escapeHtml(item.author) + "</span>" : "");

			card.appendChild(img);
			card.appendChild(caption);
			el.fanartGrid.appendChild(card);
		});
	}

	/* ---------- perfil (aba "Meu Perfil") ---------- */
	function setupProfile() {
		if (!CFG.apiBaseUrl) {
			el.profileBody.innerHTML =
				'<p class="empty-msg">A integração com o perfil ainda não foi configurada neste servidor.</p>';
			return;
		}
		if (!state.steamId) {
			el.profileBody.innerHTML =
				'<p class="empty-msg">Aguardando o jogo enviar seu SteamID...</p>';
			return;
		}
		fetchProfile(state.steamId);
	}

	function fetchProfile(steamId) {
		el.profileBody.innerHTML = '<p class="empty-msg">Carregando seus dados...</p>';
		var url = CFG.apiBaseUrl.replace(/\/$/, "") + "/profile.php?steamid=" + encodeURIComponent(steamId);

		fetch(url, { cache: "no-store" })
			.then(function (res) {
				if (!res.ok) throw new Error("HTTP " + res.status);
				return res.json();
			})
			.then(renderProfile)
			.catch(function (err) {
				el.profileBody.innerHTML =
					'<p class="empty-msg">Não foi possível carregar seus dados agora (' +
					escapeHtml(err.message) +
					"). Isso não afeta sua entrada no servidor.</p>";
			});
	}

	function renderProfile(data) {
		var playtimeHours = data.playtime_seconds
			? (data.playtime_seconds / 3600).toFixed(1)
			: "0.0";

		var banHtml = "";
		if (data.active_ban) {
			banHtml =
				'<div class="profile-alert profile-alert--ban">' +
				"<strong>Você está banido.</strong><br>" +
				"Motivo: " + escapeHtml(data.active_ban.reason || "não informado") + "<br>" +
				"Expira: " + escapeHtml(data.active_ban.expires_at || "permanente") +
				"</div>";
		}

		var warnsHtml = "";
		if (data.warns && data.warns.length) {
			warnsHtml =
				"<h4>Avisos recebidos (" + data.warns.length + ")</h4><ul class='profile-list'>" +
				data.warns
					.slice(0, 5)
					.map(function (w) {
						return "<li><span>" + escapeHtml(w.reason || "sem motivo") + "</span><time>" + escapeHtml(w.date || "") + "</time></li>";
					})
					.join("") +
				"</ul>";
		} else {
			warnsHtml = "<h4>Avisos recebidos</h4><p class='empty-msg'>Nenhum aviso. Continue assim!</p>";
		}

		el.profileBody.innerHTML =
			banHtml +
			'<div class="profile-stats">' +
			'<div class="profile-stat"><span class="value">' + playtimeHours + "h</span><span class='label'>tempo de jogo</span></div>" +
			'<div class="profile-stat"><span class="value">' + (data.bans ? data.bans.length : 0) + "</span><span class='label'>bans no histórico</span></div>" +
			'<div class="profile-stat"><span class="value">' + (data.warns ? data.warns.length : 0) + "</span><span class='label'>avisos</span></div>" +
			"</div>" +
			warnsHtml;
	}

	/* ---------- utilitário ---------- */
	function escapeHtml(str) {
		return String(str).replace(/[&<>"']/g, function (c) {
			return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
		});
	}

	/* ---------- callbacks chamados pelo GMod (não renomear!) ---------- */
	window.GameDetails = function (servername, serverurl, mapname, maxplayers, steamid, gamemode) {
		state.serverName = servername || state.serverName;
		state.mapName = mapname || "";
		state.steamId = steamid || null;

		el.serverName.textContent = state.serverName;
		el.mapName.textContent = state.mapName ? "Mapa: " + state.mapName : "";
		setupProfile();
	};

	window.SetStatusChanged = function (status) {
		el.status.textContent = status || "";
	};

	window.SetFilesTotal = function (total) {
		state.filesTotal = total || 0;
		updateProgress();
	};

	window.SetFilesNeeded = function (needed) {
		state.filesNeeded = needed || 0;
		updateProgress();
	};

	window.DownloadingFile = function (fileName) {
		el.status.textContent = "Baixando: " + fileName;
	};

	function updateProgress() {
		if (!state.filesTotal) {
			el.progressBar.style.width = "0%";
			el.progressLabel.textContent = "";
			return;
		}
		var downloaded = state.filesTotal - state.filesNeeded;
		var pct = Math.max(0, Math.min(100, (downloaded / state.filesTotal) * 100));
		el.progressBar.style.width = pct.toFixed(1) + "%";
		el.progressLabel.textContent = downloaded + " / " + state.filesTotal + " arquivos";
	}

	/* ---------- boot ---------- */
	document.addEventListener("DOMContentLoaded", function () {
		cacheEls();
		el.serverName.textContent = state.serverName;
		if (CFG.logoFile) {
			el.brandLogo.src = CFG.logoFile;
			el.brandLogo.hidden = false;
		}
		if (CFG.logoCredit) {
			el.brandCredit.textContent = CFG.logoCredit;
			el.brandCredit.hidden = false;
		}

		setupBackgrounds();
		setupCuriosities();
		setupFanarts();
		setupProfile();

		// Em navegador comum (fora do GMod) simula um progresso pra visualizar o design.
		if (!window.chrome || !window.chrome.webview) {
			var demoNeeded = 40;
			window.SetFilesTotal(40);
			window.SetStatusChanged("Conectando ao servidor...");
			var demo = setInterval(function () {
				demoNeeded -= 3;
				window.SetFilesNeeded(Math.max(0, demoNeeded));
				if (demoNeeded <= 0) {
					clearInterval(demo);
					window.SetStatusChanged("Entrando no servidor...");
				}
			}, 400);
			window.GameDetails("Cracker Games BR | Sandbox #1", "", "gm_construct", 32, "76561198000000000", "sandbox");
		}
	});
})();
