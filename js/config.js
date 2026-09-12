/*
 * Configuração da tela de carregamento do Cracker Games BR.
 * Edite este arquivo à vontade — o resto do código não precisa ser tocado
 * pra trocar textos, links ou ligar a API de perfil.
 */
window.CRACKER_CONFIG = {
	// Nome mostrado se o GameDetails do GMod ainda não disparou (primeiro frame).
	fallbackServerName: "Cracker Games BR",

	// Link do Discord da comunidade (botão no rodapé).
	discordUrl: "https://discord.gg/SEU_CONVITE_AQUI",

	// Site/loja/forum da comunidade, se tiver.
	siteUrl: "",

	// Logo oficial da Cracker Games BR, mostrada no cabeçalho da tela.
	logoFile: "img/fanarts/muguetos-crackedface.png",
	// Crédito do autor da arte usada como logo (aparece pequeno, abaixo do
	// nome). Deixe "" se não quiser mostrar nenhum crédito.
	logoCredit: "logo por Muguetos",

	// URL base da API de perfil (api/profile.php). Deixe "" para desativar
	// a aba "Meu Perfil" (mostra um aviso em vez de tentar buscar dados).
	// Ex: "https://painel.crackergamesbr.com/api"
	apiBaseUrl: "",

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

	// Curiosidades / fatos sobre o servidor exibidos na aba "Curiosidades".
	// Troque pelos fatos reais do Cracker Games BR.
	curiosities: [
		"Sabia que você pode soltar props com o Physgun e travá-los no ar com a tecla certa? Isso evita bagunça sem precisar de admin!",
		"O comando !motd (ou o menu de regras) sempre traz as regras atualizadas do servidor. Dá uma lida de vez em quando.",
		"Fanarts feitas pela comunidade aparecem na aba ao lado. Manda a sua no Discord pra ela entrar na próxima atualização!",
		"O Cracker Games BR já teve dezenas de mapas diferentes rotacionando. Qual foi o seu favorito até agora?",
		"Respeite o trabalho dos outros jogadores: destruir base de graça é motivo de punição.",
	],

	// Textos de exemplo pra aba Fanarts (título/autor). A imagem de cada
	// entrada é o arquivo dentro de img/fanarts/ com o mesmo índice.
	fanarts: [
		{
			file: "img/fanarts/fanart-01.png",
			title: "Simplificado",
			author: "Muguetos",
		},
	],
};
