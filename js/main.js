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
		el.serverInfoBody = document.getElementById("server-info-body");
		el.modsBody = document.getElementById("mods-body");
		el.climaBody = document.getElementById("clima-body");
		el.musicBody = document.getElementById("music-body");
		el.creditsBody = document.getElementById("credits-body");
		el.etaText = document.getElementById("eta-text");
		el.bgLayers = document.getElementById("bg-layers");
	}

	/* ---------- tamanho de cada quadro ("masonry" via grid-row: span) ---------- */
	// .panels usa grid-auto-rows numa unidade bem miúda (2px, ver style.css)
	// e aqui a gente mede a altura de verdade do CONTEÚDO de cada quadro e
	// converte isso num "grid-row: span N" — assim cada quadro fica só do
	// tamanho que precisa (nem mais, nem menos), sem sobrar espaço vazio de
	// fundo embaixo dos quadros mais curtos. Roda de novo sozinho a cada
	// segundo (heartbeat simples) pra se ajustar sempre que algum conteúdo
	// mudar de tamanho (clima trocando de cidade, lista de mods crescendo,
	// perfil terminando de carregar, etc.) sem precisar chamar isso na mão
	// em cada função que muda alguma coisa na tela.
	var PANEL_ROW_UNIT = 2;
	var PANEL_ROW_GAP = 6; // precisa bater com row-gap do .panels no CSS

	function resizePanelsToContent() {
		var cards = document.querySelectorAll(".panel-card");
		for (var i = 0; i < cards.length; i++) {
			var card = cards[i];
			// o teto máximo vem do CSS de verdade (não de um número fixo aqui)
			// — assim continua certo mesmo quando o teto muda, tipo no modo
			// mobile (media query lá no style.css), sem precisar manter dois
			// números iguais em dois arquivos diferentes.
			var maxHeight = parseFloat(getComputedStyle(card).maxHeight) || 270;
			// scrollHeight não conta a borda (3px em cima + 3px embaixo = 6px)
			// nem passa do teto máximo — sem isso os quadros que tentassem
			// crescer mais que o teto reservariam espaço a mais no grid do que
			// realmente aparecem na tela.
			var contentHeight = Math.min(card.scrollHeight, maxHeight - 6) + 6;
			var span = 1;
			while (span * PANEL_ROW_UNIT + (span - 1) * PANEL_ROW_GAP < contentHeight) span++;
			card.style.gridRowEnd = "span " + span;
		}
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
		// reforço: aplica o mesmo fundo direto no <body> também. Se por
		// algum motivo os elementos posicionados não renderizarem no
		// Chromium do GMod, o body sozinho ainda mostra a imagem.
		document.body.style.backgroundImage = layers[bgIndex].style.backgroundImage;
		document.body.style.backgroundSize = "cover";
		document.body.style.backgroundPosition = "center";
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
	// O SteamID já chega de graça pelo GameDetails do próprio GMod, então
	// mostramos ele sempre (é informação real, não depende de nenhuma API).
	// O resto (tempo de jogo, bans, avisos) só aparece quando a API estiver
	// configurada — mas em vez de esconder tudo atrás de um aviso genérico,
	// deixamos o que já é real visível o tempo todo.
	function renderSteamIdRow() {
		if (!state.steamId) return "";
		return "<ul class='kv-list'><li><span>SteamID</span><strong>" + escapeHtml(state.steamId) + "</strong></li></ul>";
	}

	function setupProfile() {
		if (!CFG.apiBaseUrl) {
			el.profileBody.innerHTML =
				renderSteamIdRow() +
				"<p class='empty-msg'>Tempo de jogo, bans e avisos ainda não foram configurados neste servidor.</p>";
			return;
		}
		if (!state.steamId) {
			el.profileBody.innerHTML =
				'<p class="empty-msg">Aguardando o jogo enviar seu SteamID...</p>';
			return;
		}
		el.profileBody.innerHTML = renderSteamIdRow();
		fetchProfile(state.steamId);
	}

	function fetchProfile(steamId) {
		el.profileBody.innerHTML = renderSteamIdRow() + '<p class="empty-msg">Carregando seus dados...</p>';
		var url = CFG.apiBaseUrl.replace(/\/$/, "") + "/profile.php?steamid=" + encodeURIComponent(steamId);

		fetch(url, { cache: "no-store" })
			.then(function (res) {
				if (!res.ok) throw new Error("HTTP " + res.status);
				return res.json();
			})
			.then(renderProfile)
			.catch(function (err) {
				el.profileBody.innerHTML =
					renderSteamIdRow() +
					'<p class="empty-msg">Não foi possível carregar o resto dos seus dados agora (' +
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
				"<h4>Avisos recebidos (" + data.warns.length + ")</h4><ul class='kv-list'>" +
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
			renderSteamIdRow() +
			banHtml +
			'<div class="profile-stats">' +
			'<div class="profile-stat"><span class="value">' + playtimeHours + "h</span><span class='label'>tempo de jogo</span></div>" +
			'<div class="profile-stat"><span class="value">' + (data.bans ? data.bans.length : 0) + "</span><span class='label'>bans no histórico</span></div>" +
			'<div class="profile-stat"><span class="value">' + (data.warns ? data.warns.length : 0) + "</span><span class='label'>avisos</span></div>" +
			"</div>" +
			warnsHtml;
	}

	/* ---------- painel "Servidor" ---------- */
	// Nome/mapa/modo/capacidade chegam de graça pelo GameDetails do próprio
	// GMod (nenhuma API precisa estar configurada pra ver isso). Já o
	// ranking de kills/mortes/ping/fps depende da API + do addon Lua
	// (cracker_server_stats.lua) publicando um "retrato" do servidor de
	// tempos em tempos — enquanto isso não estiver configurado, mostra um
	// aviso só nessa parte.
	var serverPanel = { basicHtml: "", statsHtml: "" };

	function renderServerPanel() {
		el.serverInfoBody.innerHTML = serverPanel.basicHtml + serverPanel.statsHtml;
	}

	function renderServerBasic(servername, mapname, gamemode, maxplayers) {
		serverPanel.basicHtml =
			"<ul class='kv-list'>" +
			"<li><span>Servidor</span><strong>" + escapeHtml(servername || "-") + "</strong></li>" +
			"<li><span>Mapa</span><strong>" + escapeHtml(mapname || "-") + "</strong></li>" +
			"<li><span>Modo</span><strong>" + escapeHtml(gamemode || "-") + "</strong></li>" +
			"<li><span>Capacidade</span><strong>" + escapeHtml(String(maxplayers || "-")) + " jogadores</strong></li>" +
			"</ul>";
		renderServerPanel();
	}

	function setupServerStats() {
		if (!CFG.apiBaseUrl) {
			serverPanel.statsHtml =
				"<h4>Ranking ao vivo</h4><p class='empty-msg'>Ainda não configurado neste servidor.</p>";
			renderServerPanel();
			return;
		}
		fetchServerStats();
		setInterval(fetchServerStats, CFG.serverStatsIntervalMs || 15000);
	}

	function fetchServerStats() {
		var url = CFG.apiBaseUrl.replace(/\/$/, "") + "/server_stats.php";
		fetch(url, { cache: "no-store" })
			.then(function (res) {
				if (!res.ok) throw new Error("HTTP " + res.status);
				return res.json();
			})
			.then(renderServerStats)
			.catch(function () {
				serverPanel.statsHtml =
					"<h4>Ranking ao vivo</h4><p class='empty-msg'>Não foi possível carregar agora.</p>";
				renderServerPanel();
			});
	}

	function renderServerStats(data) {
		if (!data || !data.players || !data.players.length) {
			serverPanel.statsHtml =
				"<h4>Ranking ao vivo</h4><p class='empty-msg'>Nenhum jogador conectado no momento.</p>";
			renderServerPanel();
			return;
		}

		function highlight(label, entry, suffix) {
			if (!entry) return "";
			return "<li><span>" + escapeHtml(label) + "</span><strong>" +
				escapeHtml(entry.name) + " (" + entry.value + (suffix || "") + ")</strong></li>";
		}

		function extremes(list, key) {
			var withValue = list.filter(function (p) { return p[key] !== null && p[key] !== undefined; });
			if (!withValue.length) return { max: null, min: null };
			var max = withValue[0], min = withValue[0];
			withValue.forEach(function (p) {
				if (p[key] > max[key]) max = p;
				if (p[key] < min[key]) min = p;
			});
			return {
				max: { name: max.name, value: max[key] },
				min: { name: min.name, value: min[key] },
			};
		}

		var kills = extremes(data.players, "kills");
		var deaths = extremes(data.players, "deaths");
		var ping = extremes(data.players, "ping");
		var fps = extremes(data.players, "fps");

		serverPanel.statsHtml =
			"<h4>Jogadores conectados</h4><p class='curiosity' style='font-size:15px;min-height:auto;'>" +
			data.players.length + " online</p>" +
			"<h4>Ranking ao vivo</h4><ul class='kv-list'>" +
			highlight("Mais kills", kills.max) +
			highlight("Menos kills", kills.min) +
			highlight("Mais mortes", deaths.max) +
			highlight("Menos mortes", deaths.min) +
			highlight("Maior ping", ping.max, "ms") +
			highlight("Menor ping", ping.min, "ms") +
			highlight("Maior FPS", fps.max) +
			highlight("Menor FPS", fps.min) +
			"</ul>";
		renderServerPanel();
	}

	/* ---------- painel "Mods & Arquivos" ---------- */
	// IMPORTANTE (limitação real do GMod, não é falta de código): essa tela
	// não recebe uma lista de addons nem um código de erro de verdade quando
	// algo falha — o jogo só avisa, um de cada vez, qual arquivo está
	// baixando agora (DownloadingFile) e quantos ainda faltam no total
	// (SetFilesNeeded). Não existe callback nenhum de "esse arquivo deu
	// erro" nessa tela. Por isso o status aqui é deduzido:
	// - o arquivo que está chegando agora fica "Instalando";
	// - assim que o próximo arquivo começa a baixar, o anterior vira
	//   "Confirmado" (sinal de que o jogo seguiu em frente);
	// - se o mesmo arquivo ficar parado tempo demais sem nada mudar, mostra
	//   "Demorando" — um AVISO, não um código de erro de verdade (esse dado
	//   não existe aqui pra mostrar).
	var modsState = { list: [], lastChangeAt: 0 };

	function setupMods() {
		el.modsBody.innerHTML = "<p class='empty-msg'>Aguardando o servidor começar a mandar arquivos...</p>";
		modsState.lastChangeAt = Date.now();
		setInterval(checkModsStall, 4000);
	}

	function trackModFile(fileName) {
		var list = modsState.list;
		var last = list[list.length - 1];
		if (!last || last.name !== fileName) {
			if (last && last.status === "installing") last.status = "done";
			list.push({ name: fileName, status: "installing" });
			if (list.length > 25) list.shift(); // mantém só os mais recentes, pra não crescer pra sempre
		}
		modsState.lastChangeAt = Date.now();
		renderMods();
	}

	function markAllModsDone() {
		if (!modsState.list.length) return;
		modsState.list.forEach(function (item) {
			if (item.status === "installing") item.status = "done";
		});
		renderMods();
	}

	function checkModsStall() {
		var list = modsState.list;
		if (!list.length) return;
		var last = list[list.length - 1];
		if (last.status !== "installing") return;
		if (Date.now() - modsState.lastChangeAt > 12000) {
			last.status = "stalled";
			renderMods();
		}
	}

	function renderMods() {
		var list = modsState.list;
		if (!list.length) return;
		var statusLabel = { done: "Confirmado", installing: "Instalando...", stalled: "Demorando" };
		el.modsBody.innerHTML =
			"<ul class='mod-list'>" +
			list
				.slice()
				.reverse() // mais recente primeiro
				.map(function (item) {
					return (
						"<li><span class='mod-name'>" + escapeHtml(item.name) + "</span>" +
						"<span class='mod-status mod-status--" + item.status + "'>" + statusLabel[item.status] + "</span></li>"
					);
				})
				.join("") +
			"</ul>";
	}

	/* ---------- painel "Clima & Horário" ---------- */
	// Não tenta mais descobrir onde o jogador está (nem por IP nem por
	// nenhum outro jeito) — só mostra o clima das cidades populosas do
	// Brasil cadastradas em CFG.popularCities, uma de cada vez, em rotação
	// automática (sem precisar de clique nenhum). O relógio no topo é o
	// horário do próprio PC do jogador (não depende de internet nenhuma).
	var climaState = {
		timeStr: "",
		// clima das cidades populares (rotaciona uma de cada vez, já que não
		// cabem todas juntas no quadro e não dá pra clicar pra escolher).
		cities: [], cityIndex: 0, cityRotateTimer: null,
	};

	function setupClima() {
		updateClock();
		setInterval(updateClock, 1000);
		fetchCitiesWeather();
	}

	// Clima de várias cidades brasileiras populares (config: popularCities),
	// buscado tudo de uma vez só (o Open-Meteo aceita várias
	// latitude/longitude separadas por vírgula numa única chamada, em vez de
	// precisar de uma requisição por cidade). Junto do clima atual, pede
	// também a mínima/máxima, a chance de chuva do dia e o fuso horário de
	// cada uma (pra mostrar o horário local de cada cidade também).
	function fetchCitiesWeather() {
		var cities = CFG.popularCities || [];
		if (!cities.length) return;
		var lats = cities.map(function (c) { return c.lat; }).join(",");
		var lons = cities.map(function (c) { return c.lon; }).join(",");
		var url =
			"https://api.open-meteo.com/v1/forecast?latitude=" + lats + "&longitude=" + lons +
			"&current=temperature_2m,weather_code" +
			"&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min" +
			"&forecast_days=1&timezone=auto";

		fetch(url, { cache: "no-store" })
			.then(function (res) {
				if (!res.ok) throw new Error("HTTP " + res.status);
				return res.json();
			})
			.then(function (data) {
				// com uma cidade só o Open-Meteo devolve um objeto direto (não uma
				// lista) — normaliza pra sempre trabalhar com array.
				var list = Array.isArray(data) ? data : [data];
				climaState.cities = list.map(function (entry, i) {
					var current = entry.current || {};
					var daily = entry.daily || {};
					return {
						name: cities[i].name,
						icon: cities[i].icon || "",
						timezone: entry.timezone || null,
						tempC: typeof current.temperature_2m === "number" ? current.temperature_2m : null,
						weatherDesc: weatherCodeToText(current.weather_code),
						rainChance: daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : null,
						maxC: daily.temperature_2m_max ? daily.temperature_2m_max[0] : null,
						minC: daily.temperature_2m_min ? daily.temperature_2m_min[0] : null,
					};
				});
				startCityRotation();
			})
			.catch(function () {
				renderClima();
			});
	}

	function startCityRotation() {
		if (!climaState.cities.length || climaState.cityRotateTimer) return;
		renderClima();
		if (climaState.cities.length > 1) {
			var intervalMs = CFG.climaCityIntervalMs || 6000;
			climaState.cityRotateTimer = setInterval(function () {
				climaState.cityIndex = (climaState.cityIndex + 1) % climaState.cities.length;
				renderClima();
			}, intervalMs);
		}
	}

	// Ícones das cidades (silhuetas simples, desenhadas do zero — não são
	// fotos nem arte de terceiros, só formas geométricas que lembram algo da
	// cidade), pra ajudar a diferenciar uma cidade da outra de relance no
	// quadro "Clima & Horário". A cor principal vem sozinha do CSS
	// (currentColor, mesma cor de destaque do quadro); os detalhes "vazados"
	// (janela, porta, vão da ponte etc.) usam a classe "cutout", que o CSS
	// pinta com a cor de fundo do próprio quadro — assim eles aparecem como
	// um "furo" na silhueta em vez de precisar de uma segunda cor de tinta.
	// Todos têm uma linha de chão embaixo, pra dar uma base visual comum.
	var CITY_ICONS = {
		skyline:
			'<svg viewBox="0 0 100 60"><rect x="0" y="54" width="100" height="6"/>' +
			'<rect x="6" y="22" width="14" height="32"/><rect x="24" y="8" width="16" height="46"/>' +
			'<rect x="44" y="28" width="12" height="26"/><rect x="60" y="14" width="14" height="40"/><rect x="78" y="34" width="12" height="20"/>' +
			'<rect class="cutout" x="9" y="28" width="3" height="4"/><rect class="cutout" x="15" y="28" width="3" height="4"/>' +
			'<rect class="cutout" x="28" y="15" width="3" height="4"/><rect class="cutout" x="34" y="15" width="3" height="4"/><rect class="cutout" x="28" y="26" width="3" height="4"/><rect class="cutout" x="34" y="26" width="3" height="4"/>' +
			'<rect class="cutout" x="64" y="20" width="3" height="4"/><rect class="cutout" x="70" y="20" width="3" height="4"/></svg>',
		cristo:
			'<svg viewBox="0 0 100 60"><rect x="0" y="56" width="100" height="4"/>' +
			'<polygon points="8,56 50,18 92,56"/>' +
			'<rect x="47" y="2" width="6" height="20"/><rect x="34" y="9" width="32" height="6"/><circle cx="50" cy="4" r="5"/></svg>',
		hills:
			'<svg viewBox="0 0 100 60"><circle cx="26" cy="58" r="24"/><circle cx="62" cy="62" r="30"/>' +
			'<rect x="70" y="32" width="16" height="18"/><polygon points="68,32 78,19 88,32"/>' +
			'<rect class="cutout" x="76" y="40" width="4" height="10"/></svg>',
		congresso:
			'<svg viewBox="0 0 100 60"><rect x="0" y="56" width="100" height="4"/>' +
			'<rect x="18" y="34" width="64" height="12"/><rect x="44" y="8" width="5" height="32"/><rect x="53" y="12" width="5" height="28"/>' +
			'<polygon points="18,34 29,23 40,34"/><polygon points="60,34 71,25 82,34"/>' +
			'<rect class="cutout" x="30" y="38" width="4" height="8"/><rect class="cutout" x="66" y="38" width="4" height="8"/></svg>',
		mountain:
			'<svg viewBox="0 0 100 60"><rect x="0" y="56" width="100" height="4"/>' +
			'<polygon points="0,58 20,24 38,58"/><polygon points="25,58 50,13 75,58"/><polygon points="60,58 80,29 100,58"/>' +
			'<polygon class="cutout" points="47,22 50,17 53,22 50,26"/></svg>',
		cliff:
			'<svg viewBox="0 0 100 60"><rect x="0" y="44" width="100" height="10"/>' +
			'<rect x="58" y="10" width="16" height="34"/><rect x="14" y="28" width="14" height="16"/><rect x="31" y="22" width="14" height="22"/>' +
			'<rect class="cutout" x="63" y="16" width="6" height="8"/><rect class="cutout" x="19" y="34" width="4" height="6"/><rect class="cutout" x="36" y="30" width="4" height="6"/></svg>',
		beach:
			'<svg viewBox="0 0 100 60"><rect x="0" y="52" width="100" height="4"/>' +
			'<circle cx="80" cy="14" r="9"/>' +
			'<path d="M2,44 q12,-8 24,0 q12,8 24,0 q12,-8 24,0 q12,8 24,0" fill="none" stroke-width="4"/>' +
			'<rect x="18" y="18" width="4" height="28"/><polygon points="20,18 4,9 20,13"/><polygon points="20,18 36,9 20,13"/><polygon points="20,18 20,2 25,12"/></svg>',
		greenhouse:
			'<svg viewBox="0 0 100 60"><rect x="0" y="52" width="100" height="4"/>' +
			'<rect x="10" y="44" width="80" height="8"/><polygon points="10,44 50,8 90,44"/>' +
			'<path d="M50,8 L50,44 M28,44 L50,24 M72,44 L50,24" fill="none" stroke-width="2" class="cutout-stroke"/></svg>',
		bridge:
			'<svg viewBox="0 0 100 60"><rect x="0" y="54" width="100" height="4"/>' +
			'<rect x="8" y="30" width="84" height="6"/><rect x="18" y="36" width="6" height="18"/><rect x="76" y="36" width="6" height="18"/>' +
			'<polygon points="28,30 50,8 72,30"/><polygon class="cutout" points="42,30 50,18 58,30"/></svg>',
		chimneys:
			'<svg viewBox="0 0 100 60"><rect x="0" y="56" width="100" height="4"/>' +
			'<rect x="20" y="20" width="8" height="36"/><rect x="34" y="14" width="8" height="42"/>' +
			'<rect x="48" y="24" width="8" height="32"/><rect x="62" y="10" width="8" height="46"/>' +
			'<circle cx="24" cy="12" r="3"/><circle cx="38" cy="6" r="3"/><circle cx="66" cy="2" r="3"/></svg>',
		amazon:
			'<svg viewBox="0 0 100 60"><circle cx="33" cy="20" r="17"/><circle cx="55" cy="13" r="13"/><rect x="42" y="30" width="6" height="20"/>' +
			'<path d="M0,54 q20,-8 40,0 q20,8 40,0 q10,-4 20,0" fill="none" stroke-width="4"/></svg>',
		park:
			'<svg viewBox="0 0 100 60"><rect x="0" y="54" width="100" height="4"/>' +
			'<rect x="28" y="18" width="4" height="32"/><polygon points="30,18 14,9 30,13"/><polygon points="30,18 46,9 30,13"/>' +
			'<rect x="66" y="12" width="4" height="38"/><polygon points="68,12 52,3 68,7"/><polygon points="68,12 84,3 68,7"/></svg>',
	};

	function weatherCodeToText(code) {
		var map = {
			0: "Céu limpo", 1: "Poucas nuvens", 2: "Parcialmente nublado", 3: "Nublado",
			45: "Neblina", 48: "Neblina com geada",
			51: "Garoa fraca", 53: "Garoa", 55: "Garoa forte",
			56: "Garoa congelante", 57: "Garoa congelante forte",
			61: "Chuva fraca", 63: "Chuva", 65: "Chuva forte",
			66: "Chuva congelante", 67: "Chuva congelante forte",
			71: "Neve fraca", 73: "Neve", 75: "Neve forte", 77: "Grãos de neve",
			80: "Pancadas de chuva fracas", 81: "Pancadas de chuva", 82: "Pancadas de chuva fortes",
			85: "Pancadas de neve fracas", 86: "Pancadas de neve fortes",
			95: "Tempestade", 96: "Tempestade com granizo", 99: "Tempestade com granizo forte",
		};
		return map[code] || null;
	}

	function updateClock() {
		climaState.timeStr = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date());
		renderClima();
	}

	// Horário local de uma cidade específica (não o do PC do jogador) — usa
	// o fuso horário que o Open-Meteo já manda de graça em cada cidade.
	function cityLocalTime(timezone) {
		if (!timezone) return "";
		try {
			return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: timezone }).format(new Date());
		} catch (e) {
			return "";
		}
	}

	function renderClima() {
		var rows = "<li><span>Horário</span><strong>" + escapeHtml(climaState.timeStr || "--:--:--") + "</strong></li>";

		var citiesHtml;
		if (climaState.cities.length) {
			var c = climaState.cities[climaState.cityIndex];
			var tempStr = typeof c.tempC === "number" ? c.tempC.toFixed(0) + "°C" : "-";
			var rangeStr =
				typeof c.minC === "number" && typeof c.maxC === "number"
					? c.minC.toFixed(0) + "° / " + c.maxC.toFixed(0) + "°"
					: "";
			var rainStr = typeof c.rainChance === "number" ? c.rainChance + "% de chance de chuva hoje" : "sem previsão de chuva";
			var localTime = cityLocalTime(c.timezone);
			var iconSvg = CITY_ICONS[c.icon] || "";

			citiesHtml =
				"<div class='city-heading'>" +
				(iconSvg ? "<span class='city-icon-wrap'>" + iconSvg + "</span>" : "") +
				"<h4 class='city-name'>" + escapeHtml(c.name) + "</h4>" +
				"</div>" +
				"<ul class='kv-list'>" +
				(localTime ? "<li><span>Horário local</span><strong>" + localTime + "</strong></li>" : "") +
				"<li><span>Agora</span><strong>" + escapeHtml(c.weatherDesc || "-") + " · " + tempStr + "</strong></li>" +
				(rangeStr ? "<li><span>Mín / Máx hoje</span><strong>" + rangeStr + "</strong></li>" : "") +
				"<li><span>Chuva</span><strong>" + rainStr + "</strong></li>" +
				"</ul>";
		} else {
			citiesHtml = "<p class='empty-msg'>Carregando o clima das cidades...</p>";
		}

		el.climaBody.innerHTML = "<ul class='kv-list'>" + rows + "</ul>" + citiesHtml;
	}

	/* ---------- painel "Créditos" ---------- */
	function setupCreditos() {
		var list = CFG.credits || [];
		if (!list.length) {
			el.creditsBody.innerHTML = "<p class='empty-msg'>Créditos ainda não cadastrados.</p>";
			return;
		}
		el.creditsBody.innerHTML =
			"<ul class='kv-list'>" +
			list
				.map(function (c) {
					return "<li><span>" + escapeHtml(c.name) + "</span><strong>" + escapeHtml(c.role) + "</strong></li>";
				})
				.join("") +
			"</ul>";
	}

	/* ---------- painel "Música" ---------- */
	// Toca sozinha, sem precisar de clique nenhum (mouse desativado na tela
	// de carregamento) — e sorteia a próxima faixa quando uma termina (sem
	// repetir a mesma duas vezes seguidas), em loop. Volume baixo de
	// propósito (config: music.volume), só ambiente.
	var musicState = { audio: null, index: 0, tracks: [] };

	function setupMusic() {
		var music = CFG.music || {};
		musicState.tracks = music.tracks || [];
		musicState.shuffle = music.shuffle !== false; // liga por padrão
		if (!musicState.tracks.length) {
			el.musicBody.innerHTML = "<p class='empty-msg'>Nenhuma música cadastrada ainda.</p>";
			return;
		}

		musicState.audio = new Audio();
		musicState.audio.volume = typeof music.volume === "number" ? music.volume : 0.15;
		musicState.audio.addEventListener("ended", playNextTrack);
		musicState.audio.addEventListener("error", playNextTrack);

		var firstIndex = musicState.shuffle
			? Math.floor(Math.random() * musicState.tracks.length)
			: 0;
		playTrack(firstIndex);

		// Corta a música assim que o navegador avisa que a página está
		// sendo fechada/destruída — no GMod, isso acontece exatamente
		// quando essa tela de carregamento é removida pra mostrar o jogo.
		window.addEventListener("pagehide", stopMusicNow);
		window.addEventListener("unload", stopMusicNow);
	}

	function playTrack(index) {
		musicState.index = index % musicState.tracks.length;
		var track = musicState.tracks[musicState.index];
		musicState.audio.src = track.file;
		// autoplay com som pode ser bloqueado em navegador comum fora do
		// GMod — dentro do jogo funciona normalmente. Se falhar, não trava
		// nada, só não toca.
		musicState.audio.play().catch(function () {});
		renderMusicPanel();
	}

	function playNextTrack() {
		var next;
		if (musicState.shuffle && musicState.tracks.length > 1) {
			// sorteia, mas nunca repete a mesma faixa duas vezes seguidas
			do {
				next = Math.floor(Math.random() * musicState.tracks.length);
			} while (next === musicState.index);
		} else {
			next = musicState.index + 1;
		}
		playTrack(next);
	}

	function stopMusicNow() {
		if (musicFadeTimer) clearInterval(musicFadeTimer);
		if (!musicState.audio) return;
		musicState.audio.pause();
	}

	// Monta um "letreiro andando" (ver .marquee no CSS): o texto some duas
	// vezes seguidas (a 2ª cópia fica escondida até a hora de entrar em
	// cena) — se não precisar animar (texto curto, cabe de boa), a 2ª cópia
	// nunca aparece, já que o .marquee corta tudo que passa da largura dele.
	function marqueeHtml(text, extraClass) {
		var safe = escapeHtml(text);
		return (
			"<span class='marquee" + (extraClass ? " " + extraClass : "") + "'><span class='marquee__text'>" +
			"<span class='marquee__copy'>" + safe + "</span><span class='marquee__copy'>" + safe + "</span>" +
			"</span></span>"
		);
	}

	function renderMusicPanel() {
		var volumePct = Math.round((musicState.audio.volume || 0) * 100);
		var track = musicState.tracks[musicState.index];

		var listHtml =
			"<h4>Playlist</h4><ul class='music-track-list'>" +
			musicState.tracks
				.map(function (t, i) {
					var playing = i === musicState.index;
					return (
						"<li" + (playing ? " class='is-playing'" : "") + ">" +
						marqueeHtml((playing ? "▶ " : "") + t.title) +
						"<strong>" + escapeHtml(t.artist || "") + "</strong></li>"
					);
				})
				.join("") +
			"</ul>";

		el.musicBody.innerHTML =
			"<ul class='kv-list'>" +
			"<li><span>Agora</span>" + marqueeHtml(track.title, "kv-value") + "</li>" +
			"<li><span>Volume</span><strong>" + volumePct + "%</strong></li>" +
			"</ul>" +
			listHtml;

		applyMarquees(el.musicBody);
	}

	// Liga o "letreiro andando" só nos textos que realmente não cabem no
	// espaço deles — mede a largura de verdade de UMA cópia do texto contra
	// a largura disponível depois que o navegador terminou de desenhar
	// (requestAnimationFrame), e só então decide animar. Texto curto nunca
	// anima: fica parado, normal.
	function applyMarquees(container) {
		requestAnimationFrame(function () {
			var wraps = container.querySelectorAll(".marquee");
			for (var i = 0; i < wraps.length; i++) {
				var wrap = wraps[i];
				var firstCopy = wrap.querySelector(".marquee__copy");
				if (!firstCopy) continue;
				var singleWidth = firstCopy.getBoundingClientRect().width;
				if (singleWidth <= wrap.clientWidth + 2) continue;

				var textEl = wrap.querySelector(".marquee__text");
				textEl.style.setProperty("--marquee-distance", singleWidth + "px");
				var seconds = Math.max(5, singleWidth * 0.045);
				textEl.style.animationDuration = seconds.toFixed(1) + "s";
				wrap.classList.add("marquee--scroll");
			}
		});
	}

	// REDE DE SEGURANÇA apenas — quem normalmente corta a música é o
	// listener de "pagehide"/"unload" lá em cima (dispara exatamente quando
	// o GMod fecha essa tela). Isso aqui só existe pro caso raro desse
	// evento não disparar; por isso o delay padrão é bem mais longo
	// (fadeDelayMs no config.js), pra não cortar a música cedo demais com
	// a tela de carregamento ainda visível.
	var musicFadeScheduled = false;
	var musicFadeTimer = null;
	function scheduleMusicFadeOut() {
		if (musicFadeScheduled || !musicState.audio) return;
		musicFadeScheduled = true;

		var music = CFG.music || {};
		var delayMs = typeof music.fadeDelayMs === "number" ? music.fadeDelayMs : 15000;
		setTimeout(fadeOutMusic, delayMs);
	}

	function fadeOutMusic() {
		if (!musicState.audio) return;

		var music = CFG.music || {};
		var durationMs = typeof music.fadeDurationMs === "number" ? music.fadeDurationMs : 6000;
		var stepMs = 120;
		var steps = Math.max(1, Math.round(durationMs / stepMs));
		var startVolume = musicState.audio.volume;
		var stepAmount = startVolume / steps;

		musicFadeTimer = setInterval(function () {
			var next = musicState.audio.volume - stepAmount;
			if (next <= 0) {
				musicState.audio.volume = 0;
				musicState.audio.pause();
				clearInterval(musicFadeTimer);
				return;
			}
			musicState.audio.volume = next;
		}, stepMs);
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
		renderServerBasic(state.serverName, state.mapName, gamemode, maxplayers);
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
		trackModFile(fileName);
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
		updateEta(pct);
		if (pct >= 100) {
			scheduleMusicFadeOut();
			markAllModsDone();
		}
	}

	/* ---------- mensagem "tempo estimado pra entrar" (não é aba) ---------- */
	// Não existe nenhum aviso real de "terminou de baixar" nem de "o jogador
	// já consegue se mexer" — o jeito mais honesto de estimar é medir a
	// própria velocidade de download que está rolando agora (quantos
	// arquivos sumiram da fila / quanto tempo passou) e projetar quanto
	// falta. Por isso o texto é sempre aproximado ("~").
	var etaSamples = [];
	function updateEta(pct) {
		if (!el.etaText) return;
		var now = Date.now();
		etaSamples.push({ time: now, needed: state.filesNeeded });
		if (etaSamples.length > 8) etaSamples.shift();

		if (pct >= 100) {
			el.etaText.textContent = "Quase lá — entrando no servidor...";
			return;
		}

		var first = etaSamples[0];
		var elapsedSec = (now - first.time) / 1000;
		var filesDownloadedInWindow = first.needed - state.filesNeeded;
		if (etaSamples.length < 2 || elapsedSec < 1 || filesDownloadedInWindow <= 0) {
			el.etaText.textContent = "Calculando tempo estimado...";
			return;
		}

		var rate = filesDownloadedInWindow / elapsedSec; // arquivos por segundo
		var etaSec = Math.ceil(state.filesNeeded / rate);
		el.etaText.textContent = "Tempo estimado para entrar: ~" + formatEta(etaSec);
	}

	function formatEta(seconds) {
		if (seconds < 5) return "poucos segundos";
		if (seconds < 60) return seconds + "s";
		var min = Math.floor(seconds / 60);
		var sec = seconds % 60;
		return min + "min" + (sec > 0 ? " " + sec + "s" : "");
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
		renderServerBasic(state.serverName, "", "", "");
		setupServerStats();
		setupMods();
		setupClima();
		setupMusic();
		setupCreditos();

		resizePanelsToContent();
		setInterval(resizePanelsToContent, 1000);

		// Em navegador comum (fora do GMod) simula um progresso pra visualizar o design.
		if (!window.chrome || !window.chrome.webview) {
			var demoFiles = [
				"maps/gm_construct.bsp",
				"materials/props/metal_wall01.vtf",
				"models/player/group01.mdl",
				"sound/ambient/wind_loop1.wav",
				"lua/autorun/client/cracker_hud.lua",
				"resource/fonts/pixelfont.ttf",
			];
			var demoNeeded = 40;
			window.SetFilesTotal(40);
			window.SetStatusChanged("Conectando ao servidor...");
			var demo = setInterval(function () {
				demoNeeded -= 3;
				window.SetFilesNeeded(Math.max(0, demoNeeded));
				window.DownloadingFile(demoFiles[Math.floor(Math.random() * demoFiles.length)]);
				if (demoNeeded <= 0) {
					clearInterval(demo);
					window.SetStatusChanged("Entrando no servidor...");
				}
			}, 400);
			window.GameDetails("Cracker Games BR | Sandbox #1", "", "gm_construct", 32, "76561198000000000", "sandbox");
		}
	});
})();
