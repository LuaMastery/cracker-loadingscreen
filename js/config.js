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

		// O GMod não avisa a tela de carregamento quando o jogador termina
		// de entrar de verdade (spawna e pode se mover) — só sabemos quando
		// os ARQUIVOS terminam de baixar, o que acontece bem antes disso
		// (o Lua dos addons ainda inicializa depois). Por isso o fade usa
		// uma espera: conta esse tempo A PARTIR de quando os arquivos
		// terminam, e só DEPOIS disso começa a abaixar o volume aos poucos.
		//
		// Ajuste esses dois valores testando no seu servidor de verdade:
		// se a música ainda estiver tocando depois que você já conseguir
		// se mover, diminua o fadeDelayMs; se ela ainda cortar cedo demais
		// (com a tela de carregamento ainda na tela), aumente.
		fadeDelayMs: 15000,    // espera depois dos arquivos 100% (15s)
		fadeDurationMs: 6000,  // tempo pra ir sumindo de vez (6s)

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
		],
	},
};
