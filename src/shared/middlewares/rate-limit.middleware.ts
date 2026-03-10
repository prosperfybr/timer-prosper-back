import rateLimit from "express-rate-limit";

// Armazenamento em memória é o padrão do express-rate-limit, ideal para instância única.

export const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 100, // 100 requests por IP
	message: {
		message: "Muitas requisições deste IP, tente novamente mais tarde.",
	},
	standardHeaders: true, // Retorna info no header `RateLimit-*`
	legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
});

export const loginLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hora
	max: 5, // 5 tentativas de login por IP
	message: {
		message: "Muitas tentativas de login, tente novamente mais tarde.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

export const publicLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 200, // Mais permissivo para rotas públicas
	standardHeaders: true,
	legacyHeaders: false,
});
