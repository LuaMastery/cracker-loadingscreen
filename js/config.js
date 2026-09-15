/*
 * Configuração da tela de carregamento do Cracker Games BR.
 * Edite este arquivo à vontade — o resto do código não precisa ser tocado
 * pra trocar textos, links ou ligar a API de perfil.
 */
window.CRACKER_CONFIG = {
	// Nome mostrado se o GameDetails do GMod ainda não disparou (primeiro frame).
	fallbackServerName: "Cracker Games BR",

	// Site/loja/forum da comunidade, se tiver.
	siteUrl: "",

	// Logo oficial da Cracker Games BR, mostrada no cabeçalho da tela.
	logoFile: "img/fanarts/muguetos-crackedface.png",
	// Crédito do autor da arte usada como logo (aparece pequeno, abaixo do
	// nome). Deixe "" se não quiser mostrar nenhum crédito.
	logoCredit: "logo por Muguetos",

	// URL base da API (api/profile.php, api/server_stats.php). Deixe "" para
	// desativar os quadros "Meu Perfil" e o ranking do quadro "Servidor"
	// (mostra um aviso em vez de tentar buscar dados).
	// Ex: "https://painel.crackergamesbr.com/api"
	apiBaseUrl: "",

	// Tempo entre atualizações do ranking ao vivo no quadro "Servidor" (ms).
	serverStatsIntervalMs: 15000,

	// Galeria de imagens de fundo (troca automática entre elas).
	// Por enquanto, desativada de propósito: só entra arte feita pelo
	// Muguetos pra Cracker Games BR. Os screenshots oficiais do Garry's Mod
	// continuam salvos em img/bg/ (gmod-01.jpg a gmod-06.jpg) — é só
	// descomentar as linhas abaixo pra eles voltarem a aparecer na rotação.
	backgrounds: [
		"img/bg/muguetos-bg-01.png",
		// "img/bg/gmod-01.jpg",
		// "img/bg/gmod-02.jpg",
		// "img/bg/gmod-03.jpg",
		// "img/bg/gmod-04.jpg",
		// "img/bg/gmod-05.jpg",
		// "img/bg/gmod-06.jpg",
	],

	// Tempo entre troca automática de imagens de fundo (ms).
	backgroundIntervalMs: 12000,

	// Tempo entre troca automática de curiosidades (ms).
	curiosityIntervalMs: 9000,

	// Curiosidades / fatos sobre o servidor exibidos no quadro "Você sabia?".
	// Troque pelos fatos reais do Cracker Games BR.
	curiosities: [
		"Sabia que você pode soltar props com o Physgun e travá-los no ar com a tecla certa? Isso evita bagunça sem precisar de admin!",
		"O comando !motd (ou o menu de regras) sempre traz as regras atualizadas do servidor. Dá uma lida de vez em quando.",
		"Fanarts feitas pela comunidade aparecem no quadro ao lado. Manda a sua no Discord da comunidade pra ela entrar na próxima atualização!",
		"O Cracker Games BR já teve dezenas de mapas diferentes rotacionando. Qual foi o seu favorito até agora?",
		"Respeite o trabalho dos outros jogadores: destruir base de graça é motivo de punição.",
	],

	// Textos de exemplo pro quadro de Fanarts (título/autor). A imagem de
	// cada entrada é o arquivo dentro de img/fanarts/ com o mesmo índice.
	fanarts: [
		{
			file: "img/fanarts/fanart-01.png",
			title: "Simplificado",
			author: "Muguetos",
		},
	],

	// Música tocando de fundo na tela de carregamento. Toca sozinha (sem
	// precisar de clique, já que o mouse não funciona aqui) e passa pra
	// próxima da lista quando uma termina.
	// volume vai de 0 (mudo) a 1 (máximo) — 0.15 é baixinho de propósito,
	// só ambiente, pra dar pra conversar/jogar sem a música atrapalhar.
	music: {
		volume: 0.15,

		// Toca as músicas em ordem embaralhada (sorteio), não sempre na
		// mesma ordem da lista abaixo.
		shuffle: true,

		// A música para sozinha assim que a página detecta que está sendo
		// fechada (evento "pagehide"/"unload" do navegador) — isso acontece
		// exatamente quando o GMod remove essa tela pra mostrar o jogo de
		// verdade, então é o sinal mais correto que existe. Cortar ali é
		// esperado: como a troca de tela acontece no mesmíssimo instante,
		// não dá pra perceber como um corte seco.
		//
		// fadeDelayMs/fadeDurationMs abaixo são só uma REDE DE SEGURANÇA
		// (bem mais longa, de propósito) pro caso raro do evento de
		// fechamento não disparar — não deve ser o que normalmente corta a
		// música. Se mesmo assim a música ainda cortar cedo demais (com a
		// tela de carregamento ainda visível), me avisa, porque nesse caso
		// o problema é outro, não é tempo.
		fadeDelayMs: 60000,
		fadeDurationMs: 4000,

		tracks: [
			{
				file: "audio/track-01-to-damn-all.mp3",
				title: "To Damn All of the Things I Cannot Do",
				artist: "Zephaniah",
			},
			{
				file: "audio/track-02-torva.mp3",
				title: "Torva",
				artist: "Reece Moseley",
			},
			{
				file: "audio/track-03-solitude.mp3",
				title: "Solitude",
				artist: "Anthony Septim",
			},
		],
	},

	// Cidades brasileiras que aparecem em rotação no quadro "Clima &
	// Horário" (embaixo do clima do próprio jogador), mostrando clima atual,
	// mínima/máxima do dia e chance de chuva de cada uma. Adicione, remova
	// ou troque à vontade — só precisa do nome (pra mostrar) e
	// latitude/longitude (pra buscar o clima no Open-Meteo).
	popularCities: [
		{ name: "São Paulo", lat: -23.5505, lon: -46.6333 },
		{ name: "Rio de Janeiro", lat: -22.9068, lon: -43.1729 },
		{ name: "Sorocaba", lat: -23.5015, lon: -47.4526 },
		{ name: "Brasília", lat: -15.7939, lon: -47.8828 },
		{ name: "Belo Horizonte", lat: -19.9167, lon: -43.9345 },
		{ name: "Salvador", lat: -12.9777, lon: -38.5016 },
		{ name: "Fortaleza", lat: -3.7172, lon: -38.5433 },
		{ name: "Curitiba", lat: -25.4284, lon: -49.2733 },
		{ name: "Recife", lat: -8.0476, lon: -34.8770 },
		{ name: "Porto Alegre", lat: -30.0346, lon: -51.2177 },
		{ name: "Manaus", lat: -3.1190, lon: -60.0217 },
		{ name: "Goiânia", lat: -16.6869, lon: -49.2648 },
	],

	// Tempo entre a troca automática de cidade mostrada (ms).
	climaCityIntervalMs: 6000,

	// Quem participou do desenvolvimento da Cracker Games BR, mostrado no
	// quadro "Créditos".
	credits: [
		{ name: "Muguet", role: "Artista" },
		{ name: "Arthur", role: "Gerenciador de Servidores" },
		{ name: "CaioMarquezine", role: "Centro de Administração e Monitoramento" },
		{ name: "Nico", role: "Representante autorizado" },
	],
};
