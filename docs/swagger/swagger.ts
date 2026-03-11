export const swaggerDocs = {
	openapi: "3.0.0",
	info: {
		title: "Timer Prosper - API",
		description: "",
		termsOfService: "http://localhost:8101/terms",
		contact: {
			name: "Raylson Alves Marques",
			email: "mr.raylson11@gmail.com",
		},
		license: {
			name: "License",
			url: "about:blank",
		},
	},
	version: "1.0.0",
	host: "",
	servers: [],
	paths: {
		"/users": {
			post: {
				tags: ["Usuários"],
				summary: "Criação de Usuário",
				description: "Cria um novo usuário com perfil padrão.",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/CreateUserDTO" },
						},
					},
				},
				responses: {
					"201": {
						description: "Usuário criado com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/UserResponseWrapper" } } },
					},
					"400": { description: "Dados inválidos." },
				},
			},
			get: {
				tags: ["Usuários"],
				summary: "Detalhes do Usuário Autenticado",
				description: "Retorna os dados do usuário logado (token JWT obrigatório).",
				security: [{ BearerAuth: [] }],
				responses: {
					"200": {
						description: "Usuário encontrado com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/UserResponseWrapper" } } },
					},
					"401": { description: "Não autenticado." },
				},
			},
			patch: {
				tags: ["Usuários"],
				summary: "Atualiza o próprio cadastro",
				description: "Atualiza os dados do usuário autenticado (não pode mudar o perfil/role).",
				security: [{ BearerAuth: [] }],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/UpdateUserDTO" },
						},
					},
				},
				responses: {
					"200": {
						description: "Cadastro do usuário atualizado com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/UserResponseWrapper" } } },
					},
					"401": { description: "Não autenticado." },
				},
			},
		},
		"/users/adm/all": {
			get: {
				tags: ["Administradores e/ou Proprietários"],
				summary: "Lista todos os usuários (ADMIN)",
				description: "Retorna a lista completa de todos os usuários. Requer perfil ADMIN ou OWNER.",
				security: [{ BearerAuth: [] }],
				responses: {
					"200": {
						description: "Usuários listados com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/UsersArrayResponseWrapper" } } },
					},
					"401": { description: "Não autenticado." },
					"403": { description: "Acesso negado (perfil insuficiente)." },
				},
			},
		},
		"/users/adm": {
			patch: {
				tags: ["Administradores e/ou Proprietários"],
				summary: "Atualiza cadastro de outro usuário (ADMIN)",
				description: "Permite que ADMIN/OWNER atualize o cadastro de *qualquer* usuário. O ID do usuário a ser alterado deve estar no corpo (`UpdateUserDTO.userId`).",
				security: [{ BearerAuth: [] }],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/UpdateUserDTO" },
						},
					},
				},
				responses: {
					"200": {
						description: "Cadastro do usuário atualizado com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/UserResponseWrapper" } } },
					},
					"401": { description: "Não autenticado." },
					"403": { description: "Acesso negado (perfil insuficiente)." },
				},
			},
		},
		"/users/{id}": {
			delete: {
				tags: ["Usuários"],
				summary: "Deleta um usuário",
				description: "Deleta um usuário pelo ID. Requer autenticação. O usuário pode deletar a própria conta ou, se for ADMIN/OWNER, deletar outros.",
				security: [{ BearerAuth: [] }],
				parameters: [
					{
						in: "path",
						name: "id",
						schema: { type: "string", format: "uuid" },
						required: true,
						description: "O ID (UUID) do usuário a ser deletado.",
					},
				],
				responses: {
					"200": { description: "Usuário deletado com sucesso." },
					"401": { description: "Não autenticado." },
					"404": { description: "Usuário não encontrado." },
				},
			},
		},

		// Adicionar ao objeto swaggerDocs.paths

		"/auth/login": {
			post: {
				tags: ["Autenticação"],
				summary: "Login de Usuário",
				description: "Autentica um usuário via email e senha. Retorna o token de acesso no corpo e o refresh token no cookie.",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/DoLoginDTO" },
						},
					},
				},
				responses: {
					"200": {
						description: "Usuário logado com sucesso. O refresh token é enviado como um cookie HttpOnly.",
						headers: {
							"Set-Cookie": {
								schema: { type: "string", example: "refreshToken=...; HttpOnly; SameSite=Strict; Secure" },
								description: "O Refresh Token é enviado no cookie.",
							},
						},
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										message: { type: "string" },
										payload: { $ref: "#/components/schemas/LoginSuccessPayload" },
									},
								},
							},
						},
					},
					"401": { description: "Credenciais inválidas." },
				},
			},
		},
		"/auth/refresh": {
			post: {
				tags: ["Autenticação"],
				summary: "Atualização de Token (Refresh)",
				description: "Gera um novo token de acesso usando o refresh token (esperado no cookie 'refreshToken'). Revoga o token antigo e emite um novo refresh token.",
				parameters: [
					{
						in: "cookie",
						name: "refreshToken",
						schema: { type: "string" },
						required: true,
						description: "O refresh token (HttpOnly) lido pelo servidor.",
					},
				],
				responses: {
					"200": {
						description: "Token de acesso atualizado com sucesso. O novo refresh token é enviado via cookie.",
						headers: {
							"Set-Cookie": {
								schema: { type: "string", example: "refreshToken=...; HttpOnly; SameSite=Strict; Secure" },
								description: "O novo Refresh Token.",
							},
						},
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										message: { type: "string" },
										payload: { $ref: "#/components/schemas/RefreshSuccessPayload" },
									},
								},
							},
						},
					},
					"403": { description: "Refresh token inválido, expirado ou não fornecido." },
				},
			},
		},


		"/services": {
			post: {
				tags: ["Administradores e/ou Proprietários"],
				summary: "Cria um novo serviço",
				description: "Cria um serviço associado a um tipo e estabelecimento. Requer perfil ADMIN ou OWNER.",
				security: [{ BearerAuth: [] }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/CreateServiceDTO" } } },
				},
				responses: {
					"201": {
						description: "Serviço criado com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/ServiceResponseWrapper" } } },
					},
					"403": { description: "Acesso negado (perfil insuficiente)." },
				},
			},
			get: {
				tags: ["Serviços"],
				summary: "Filtra e lista serviços",
				description: "Retorna uma lista paginada de serviços com base em filtros (estabelecimento e tipo de serviço).",
				security: [{ BearerAuth: [] }],
				parameters: [
					{
						in: "query",
						name: "establishmentId",
						schema: { type: "string", format: "uuid" },
						required: true,
						description: "ID do estabelecimento para filtrar os serviços.",
					},
					{
						in: "query",
						name: "serviceTypeId",
						schema: { type: "string", format: "uuid" },
						required: false,
						description: "ID do tipo de serviço para filtrar.",
					},
					{
						in: "query",
						name: "page",
						schema: { type: "integer", example: 1 },
						required: false,
					},
					{
						in: "query",
						name: "limit",
						schema: { type: "integer", example: 10 },
						required: false,
					},
				],
				responses: {
					"200": {
						description: "Serviços filtrados com sucesso (resultado paginado).",
						content: { "application/json": { schema: { $ref: "#/components/schemas/ServiceListResponseWrapper" } } },
					},
				},
			},
			patch: {
				tags: ["Serviços"],
				summary: "Atualiza um serviço",
				description: "Atualiza campos de um serviço existente (requer autenticação).",
				security: [{ BearerAuth: [] }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateServiceDTO" } } },
				},
				responses: {
					"200": {
						description: "Serviço atualizado com sucesso.",
						content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, payload: { nullable: true } } } } },
					},
					"404": { description: "Serviço não encontrado." },
				},
			},
		},
		"/services/detail/{id}": {
			get: {
				tags: ["Serviços"],
				summary: "Detalha um serviço pelo ID",
				description: "Retorna os detalhes de um serviço específico.",
				security: [{ BearerAuth: [] }],
				parameters: [
					{
						in: "path",
						name: "id",
						schema: { type: "string", format: "uuid" },
						required: true,
						description: "O ID (UUID) do serviço.",
					},
				],
				responses: {
					"200": {
						description: "Serviço detalhado com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/ServiceResponseWrapper" } } },
					},
					"404": { description: "Serviço não encontrado." },
				},
			},
		},
		"/services/{id}": {
			delete: {
				tags: ["Administradores e/ou Proprietários"],
				summary: "Deleta um serviço",
				description: "Deleta um único serviço pelo ID. Requer perfil ADMIN ou OWNER.",
				security: [{ BearerAuth: [] }],
				parameters: [
					{
						in: "path",
						name: "id",
						schema: { type: "string", format: "uuid" },
						required: true,
						description: "O ID (UUID) do serviço a ser deletado.",
					},
				],
				responses: {
					"200": { description: "Serviço deletado com sucesso." },
					"403": { description: "Acesso negado (perfil insuficiente)." },
					"404": { description: "Serviço não encontrado." },
				},
			},
		},
		"/services/{ids}": {
			delete: {
				tags: ["Serviços"],
				summary: "Deleta múltiplos serviços (Batch Delete)",
				description: "Deleta um ou mais serviços, aceitando IDs múltiplos no path (ex: 'id1,id2,id3'). Requer perfil ADMIN ou OWNER.",
				security: [{ BearerAuth: [] }],
				parameters: [
					{
						in: "path",
						name: "ids",
						schema: { type: "string", example: "a1b2c3d4,e5f6g7h8" },
						required: true,
						description: "IDs dos serviços a serem deletados, separados por vírgula.",
					},
				],
				responses: {
					"200": { description: "Serviços deletados com sucesso." },
					"403": { description: "Acesso negado (perfil insuficiente)." },
				},
			},
		},


		"/service-type": {
			post: {
				tags: ["Administradores e/ou Proprietários"],
				summary: "Cria um novo tipo de serviço",
				description: "Requer autenticação e perfil ADMIN ou OWNER.",
				security: [{ BearerAuth: [] }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/CreateServiceTypeDTO" } } },
				},
				responses: {
					"201": {
						description: "Tipo de serviço criado com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/ServiceTypeResponseWrapper" } } },
					},
					"403": { description: "Acesso negado (perfil insuficiente)." },
				},
			},
			get: {
				tags: ["Tipos de Serviço"],
				summary: "Lista todos os tipos de serviço",
				description: "Retorna todos os tipos de serviço cadastrados. Requer autenticação.",
				security: [{ BearerAuth: [] }],
				responses: {
					"200": {
						description: "Tipos de serviço listados com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/ServiceTypeArrayResponseWrapper" } } },
					},
					"401": { description: "Não autenticado." },
				},
			},
			patch: {
				tags: ["Administradores e/ou Proprietários"],
				summary: "Atualiza um tipo de serviço",
				description: "Atualiza campos de um tipo de serviço existente. Requer perfil ADMIN ou OWNER.",
				security: [{ BearerAuth: [] }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateServiceTypeDTO" } } },
				},
				responses: {
					"200": {
						description: "Tipo de serviço atualizado com sucesso.",
						content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, payload: { nullable: true } } } } },
					},
					"403": { description: "Acesso negado (perfil insuficiente)." },
				},
			},
		},
		"/service-type/detail/{id}": {
			get: {
				tags: ["Tipos de Serviço"],
				summary: "Detalha um tipo de serviço pelo ID",
				description: "Retorna os detalhes de um tipo de serviço específico. Requer autenticação.",
				security: [{ BearerAuth: [] }],
				parameters: [
					{
						in: "path",
						name: "id",
						schema: { type: "string", format: "uuid" },
						required: true,
						description: "O ID (UUID) do tipo de serviço.",
					},
				],
				responses: {
					"200": {
						description: "Tipo de serviço detalhado com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/ServiceTypeResponseWrapper" } } },
					},
					"404": { description: "Tipo de serviço não encontrado." },
				},
			},
		},
		"/service-type/establishment/{establishmentId}": {
			get: {
				tags: ["Tipos de Serviço"],
				summary: "Lista tipos de serviço por estabelecimento",
				description: "Lista todos os ServiceTypes que possuem serviços associados a um dado estabelecimento. Requer autenticação.",
				security: [{ BearerAuth: [] }],
				parameters: [
					{
						in: "path",
						name: "establishmentId",
						schema: { type: "string", format: "uuid" },
						required: true,
						description: "O ID (UUID) do estabelecimento para filtrar.",
					},
				],
				responses: {
					"200": {
						description: "Tipos de serviços do estabelecimento listados com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/ServiceTypeArrayResponseWrapper" } } },
					},
					"401": { description: "Não autenticado." },
				},
			},
		},
		"/service-type/{id}": {
			delete: {
				tags: ["Administradores e/ou Proprietários"],
				summary: "Deleta um tipo de serviço",
				description: "Deleta um tipo de serviço pelo ID. Requer perfil ADMIN ou OWNER.",
				security: [{ BearerAuth: [] }],
				parameters: [
					{
						in: "path",
						name: "id",
						schema: { type: "string", format: "uuid" },
						required: true,
						description: "O ID (UUID) do tipo de serviço a ser deletado.",
					},
				],
				responses: {
					"200": { description: "Tipo de serviço deletado com sucesso." },
					"403": { description: "Acesso negado (perfil insuficiente)." },
					"404": { description: "Tipo de serviço não encontrado." },
				},
			},
		},

		// Adicionar ao objeto swaggerDocs.paths

		"/establishment": {
			post: {
				tags: ["Estabelecimento"],
				summary: "Cria um novo estabelecimento",
				description: "Cria um novo estabelecimento, associando-o ao 'userId' fornecido. Requer autenticação.",
				security: [{ BearerAuth: [] }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/CreateEstablishmentDTO" } } },
				},
				responses: {
					"201": {
						description: "Estabelecimento criado com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/EstablishmentResponseWrapper" } } },
					},
					"401": { description: "Não autenticado." },
				},
			},
			patch: {
				tags: ["Administradores e/ou Proprietários"],
				summary: "Atualiza um estabelecimento",
				description: "Atualiza campos de um estabelecimento existente. Requer perfil ADMIN ou OWNER.",
				security: [{ BearerAuth: [] }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateEstablishmentDTO" } } },
				},
				responses: {
					"200": {
						description: "Estabelecimento atualizado com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/EstablishmentResponseWrapper" } } },
					},
					"403": { description: "Acesso negado (perfil insuficiente)." },
					"404": { description: "Estabelecimento não encontrado." },
				},
			},
		},
		"/establishment/detail/{id}": {
			get: {
				tags: ["Administradores e/ou Proprietários"],
				summary: "Detalha um estabelecimento pelo ID",
				description: "Retorna os detalhes de um estabelecimento. Requer perfil ADMIN ou OWNER.",
				security: [{ BearerAuth: [] }],
				parameters: [
					{
						in: "path",
						name: "id",
						schema: { type: "string", format: "uuid" },
						required: true,
						description: "O ID (UUID) do estabelecimento.",
					},
				],
				responses: {
					"200": {
						description: "Estabelecimento detalhado com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/EstablishmentResponseWrapper" } } },
					},
					"403": { description: "Acesso negado (perfil insuficiente)." },
					"404": { description: "Estabelecimento não encontrado." },
				},
			},
		},
		"/establishment/all": {
			get: {
				tags: ["Administradores e/ou Proprietários"],
				summary: "Lista todos os estabelecimentos (ADMIN)",
				description: "Retorna uma lista de todos os estabelecimentos cadastrados. Requer perfil ADMIN.",
				security: [{ BearerAuth: [] }],
				responses: {
					"200": {
						description: "Estabelecimentos listados com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/EstablishmentArrayResponseWrapper" } } },
					},
					"403": { description: "Acesso negado (perfil insuficiente)." },
				},
			},
		},
		"/establishment/all/owner": {
			get: {
				tags: ["Administradores e/ou Proprietários"],
				summary: "Lista estabelecimentos do proprietário",
				description: "Retorna todos os estabelecimentos pertencentes ao usuário logado. Requer perfil ADMIN ou OWNER.",
				security: [{ BearerAuth: [] }],
				responses: {
					"200": {
						description: "Estabelecimentos listados com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/EstablishmentArrayResponseWrapper" } } },
					},
					"403": { description: "Acesso negado (perfil insuficiente)." },
				},
			},
		},
		"/establishment/{id}": {
			delete: {
				tags: ["Administradores e/ou Proprietários"],
				summary: "Deleta um estabelecimento",
				description: "Deleta um estabelecimento pelo ID. Requer perfil ADMIN ou OWNER.",
				security: [{ BearerAuth: [] }],
				parameters: [
					{
						in: "path",
						name: "id",
						schema: { type: "string", format: "uuid" },
						required: true,
						description: "O ID (UUID) do estabelecimento a ser deletado.",
					},
				],
				responses: {
					"200": { description: "Estabelecimento deletado com sucesso." },
					"403": { description: "Acesso negado (perfil insuficiente)." },
					"404": { description: "Estabelecimento não encontrado." },
				},
			},
		},

		// ─── Plans ───────────────────────────────────────────────────────────

		"/plans": {
			get: {
				tags: ["Planos"],
				summary: "Lista todos os planos ativos",
				description: "Retorna os planos disponíveis para assinatura (endpoint público, sem autenticação).",
				responses: {
					"200": {
						description: "Planos listados com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/PlanArrayResponseWrapper" } } },
					},
				},
			},
			post: {
				tags: ["Planos"],
				summary: "Cria um novo plano (ADMIN)",
				description: "Cria um plano de assinatura. Requer perfil ADMIN.",
				security: [{ BearerAuth: [] }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/CreatePlanDTO" } } },
				},
				responses: {
					"201": {
						description: "Plano criado com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/PlanResponseWrapper" } } },
					},
					"400": { description: "Dados inválidos ou plano com mesmo nome já existe." },
					"403": { description: "Acesso negado (perfil insuficiente)." },
				},
			},
		},
		"/plans/{id}": {
			get: {
				tags: ["Planos"],
				summary: "Detalha um plano pelo ID",
				description: "Retorna os detalhes de um plano específico (endpoint público, sem autenticação).",
				parameters: [
					{ in: "path", name: "id", schema: { type: "string", format: "uuid" }, required: true, description: "UUID do plano." },
				],
				responses: {
					"200": {
						description: "Plano detalhado com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/PlanResponseWrapper" } } },
					},
					"400": { description: "Plano não encontrado." },
				},
			},
			patch: {
				tags: ["Planos"],
				summary: "Atualiza um plano (ADMIN)",
				description: "Atualiza campos de um plano existente. Requer perfil ADMIN.",
				security: [{ BearerAuth: [] }],
				parameters: [
					{ in: "path", name: "id", schema: { type: "string", format: "uuid" }, required: true, description: "UUID do plano." },
				],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/UpdatePlanDTO" } } },
				},
				responses: {
					"200": {
						description: "Plano atualizado com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/PlanResponseWrapper" } } },
					},
					"400": { description: "Plano não encontrado." },
					"403": { description: "Acesso negado (perfil insuficiente)." },
				},
			},
			delete: {
				tags: ["Planos"],
				summary: "Desativa um plano (ADMIN)",
				description: "Soft-delete: marca o plano como inativo. Requer perfil ADMIN.",
				security: [{ BearerAuth: [] }],
				parameters: [
					{ in: "path", name: "id", schema: { type: "string", format: "uuid" }, required: true, description: "UUID do plano." },
				],
				responses: {
					"200": { description: "Plano desativado com sucesso." },
					"400": { description: "Plano não encontrado." },
					"403": { description: "Acesso negado (perfil insuficiente)." },
				},
			},
		},

		// ─── Promotions ──────────────────────────────────────────────────────

		"/promotions": {
			post: {
				tags: ["Promoções"],
				summary: "Cria uma promoção (OWNER)",
				description: "Proprietário cria uma promoção com desconto temporário em um ou mais serviços (ex: Semana do Consumidor). Requer perfil OWNER.",
				security: [{ BearerAuth: [] }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/CreatePromotionDTO" } } },
				},
				responses: {
					"201": {
						description: "Promoção criada com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/PromotionResponseWrapper" } } },
					},
					"400": { description: "Dados inválidos (ex: data de início >= data de término)." },
					"403": { description: "Acesso negado (perfil insuficiente)." },
				},
			},
		},
		"/promotions/establishment/{establishmentId}": {
			get: {
				tags: ["Promoções"],
				summary: "Lista todas as promoções do estabelecimento (OWNER/COLLABORATOR)",
				description: "Retorna todas as promoções (ativas e inativas) cadastradas pelo estabelecimento. Requer perfil OWNER ou COLLABORATOR.",
				security: [{ BearerAuth: [] }],
				parameters: [
					{ in: "path", name: "establishmentId", schema: { type: "string", format: "uuid" }, required: true, description: "UUID do estabelecimento." },
				],
				responses: {
					"200": {
						description: "Promoções listadas com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/PromotionArrayResponseWrapper" } } },
					},
					"403": { description: "Acesso negado (perfil insuficiente)." },
				},
			},
		},
		"/promotions/active/{establishmentId}": {
			get: {
				tags: ["Promoções"],
				summary: "Lista promoções ATIVAS do estabelecimento (público)",
				description: "Retorna apenas as promoções em vigência no momento (now() BETWEEN starts_at AND ends_at). Endpoint público, sem autenticação, para uso na página de agendamento.",
				parameters: [
					{ in: "path", name: "establishmentId", schema: { type: "string", format: "uuid" }, required: true, description: "UUID do estabelecimento." },
				],
				responses: {
					"200": {
						description: "Promoções ativas listadas com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/PromotionArrayResponseWrapper" } } },
					},
				},
			},
		},
		"/promotions/{id}": {
			patch: {
				tags: ["Promoções"],
				summary: "Atualiza uma promoção (OWNER)",
				description: "Atualiza título, desconto, datas ou serviços de uma promoção. Requer perfil OWNER.",
				security: [{ BearerAuth: [] }],
				parameters: [
					{ in: "path", name: "id", schema: { type: "string", format: "uuid" }, required: true, description: "UUID da promoção." },
				],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/UpdatePromotionDTO" } } },
				},
				responses: {
					"200": {
						description: "Promoção atualizada com sucesso.",
						content: { "application/json": { schema: { $ref: "#/components/schemas/PromotionResponseWrapper" } } },
					},
					"400": { description: "Promoção não encontrada ou dados inválidos." },
					"403": { description: "Acesso negado (perfil insuficiente)." },
				},
			},
			delete: {
				tags: ["Promoções"],
				summary: "Desativa uma promoção (OWNER)",
				description: "Soft-delete: marca a promoção como inativa. Requer perfil OWNER.",
				security: [{ BearerAuth: [] }],
				parameters: [
					{ in: "path", name: "id", schema: { type: "string", format: "uuid" }, required: true, description: "UUID da promoção." },
				],
				responses: {
					"200": { description: "Promoção desativada com sucesso." },
					"400": { description: "Promoção não encontrada." },
					"403": { description: "Acesso negado (perfil insuficiente)." },
				},
			},
		},
	},
	components: {
		securitySchemes: {
			BearerAuth: {
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
				description: "Token JWT para autenticação. Ex: Bearer <token>",
			},
		},
		schemas: {
			CreateUserDTO: {
				type: "object",
				required: ["name", "email", "password"],
				properties: {
					name: { type: "string", example: "Fulano de tal" },
					email: { type: "string", format: "email", example: "fulano.de.tal@email.com" },
					password: { type: "string", format: "password", description: "Mínimo de 6 caracteres", example: "SenhaForte123" },
				},
			},
			UserResponseDTO: {
				type: "object",
				properties: {
					id: { type: "string", format: "uuid" },
					name: { type: "string" },
					email: { type: "string", format: "email" },
					password: { type: "string", nullable: true, description: "Omitido em respostas seguras" },
					role: { type: "string", enum: ["ADMIN", "OWNER", "USER"], example: "USER" },
					establishments: { type: "array", description: "Lista de estabelecimentos do usuário", items: { type: "object" } },
				},
			},
			UpdateUserDTO: {
				type: "object",
				properties: {
					userId: { type: "string", format: "uuid", description: "ID do usuário a ser atualizado (opcional no payload)" },
					name: { type: "string" },
					email: { type: "string", format: "email" },
					password: { type: "string", format: "password" },
					role: { type: "string", enum: ["ADMIN", "OWNER", "USER"] },
				},
			},
			UserResponseWrapper: {
				type: "object",
				properties: {
					message: { type: "string" },
					payload: { $ref: "#/components/schemas/UserResponseDTO" },
				},
			},
			UsersArrayResponseWrapper: {
				type: "object",
				properties: {
					message: { type: "string" },
					payload: { type: "array", items: { $ref: "#/components/schemas/UserResponseDTO" } },
				},
			},
			DoLoginDTO: {
				type: "object",
				required: ["email", "password"],
				properties: {
					email: { type: "string", format: "email", example: "usuario@exemplo.com" },
					password: { type: "string", format: "password", description: "Senha do usuário", example: "minhasenha123" },
				},
			},
			LoginSuccessPayload: {
				type: "object",
				properties: {
					accessToken: { type: "string", description: "Token de acesso JWT." },
					type: { type: "string", enum: ["Bearer"], example: "Bearer" },
					expiresIn: { type: "number", description: "Tempo de expiração do token de acesso em segundos." },
					user: { $ref: "#/components/schemas/UserResponseDTO" },
				},
			},
			RefreshSuccessPayload: {
				type: "object",
				properties: {
					accessToken: { type: "string", description: "Novo token de acesso JWT." },
					expiresIn: { type: "number", description: "Tempo de expiração do novo token em segundos." },
				},
			},

			// Adicionar ao objeto swaggerDocs.components.schemas

			CreateServiceDTO: {
				type: "object",
				required: ["name", "price", "duration", "serviceTypeId", "establishmentId"],
				properties: {
					name: { type: "string", example: "Corte Feminino Padrão" },
					description: { type: "string", nullable: true, example: "Corte de cabelo com lavagem e secagem simples." },
					price: { type: "number", format: "float", example: 75.5 },
					duration: { type: "string", description: "Duração do serviço no formato 'HH:MM' ou minutos (Ex: '2:53' ou '173').", example: "60" },
					serviceTypeId: { type: "string", format: "uuid", description: "ID do tipo/categoria de serviço." },
					establishmentId: { type: "string", format: "uuid", description: "ID do estabelecimento onde o serviço é oferecido." },
				},
			},
			ServiceResponseDTO: {
				type: "object",
				properties: {
					id: { type: "string", format: "uuid" },
					name: { type: "string" },
					description: { type: "string" },
					price: { type: "number", format: "float" },
					duration: { type: "number", description: "Duração em minutos." },
					durationFormated: { type: "string", description: "Duração formatada (Ex: '1h 30m')." },
					// Note: serviceType e establishment estão comentados no DTO, mas podem ser adicionados aqui se forem retornados.
				},
			},
			UpdateServiceDTO: {
				type: "object",
				required: ["id"],
				properties: {
					id: { type: "string", format: "uuid", description: "ID do serviço a ser atualizado." },
					name: { type: "string", nullable: true },
					description: { type: "string", nullable: true },
					price: { type: "number", format: "float", nullable: true },
					duration: { type: "string", nullable: true, description: "Duração (Ex: '60')." },
					serviceTypeId: { type: "string", format: "uuid", nullable: true },
				},
			},
			ServiceRequestFilter: {
				type: "object",
				properties: {
					establishmentId: { type: "string", format: "uuid", description: "Filtra serviços por estabelecimento." },
					serviceTypeId: { type: "string", format: "uuid", description: "Filtra serviços por tipo/categoria." },
					page: { type: "string", example: "1", description: "Número da página para paginação." },
					limit: { type: "string", example: "10", description: "Itens por página." },
				},
			},
			PaginatedServiceResult: {
				type: "object",
				properties: {
					data: { type: "array", items: { $ref: "#/components/schemas/ServiceResponseDTO" } },
					meta: { $ref: "#/components/schemas/PaginationMeta" },
				},
			},
			PaginationMeta: {
				type: "object",
				properties: {
					totalItems: { type: "number" },
					itemCount: { type: "number" },
					itemsPerPage: { type: "number" },
					totalPages: { type: "number" },
					currentPage: { type: "number" },
				},
			},
			ServiceResponseWrapper: {
				type: "object",
				properties: {
					message: { type: "string" },
					payload: { $ref: "#/components/schemas/ServiceResponseDTO" },
				},
			},
			ServiceListResponseWrapper: {
				type: "object",
				properties: {
					message: { type: "string" },
					payload: { $ref: "#/components/schemas/PaginatedServiceResult" },
				},
			},

			// Adicionar ao objeto swaggerDocs.components.schemas

			CreateServiceTypeDTO: {
				type: "object",
				required: ["name"],
				properties: {
					name: { type: "string", description: "Nome do tipo de serviço (Ex: 'Cortes', 'Manicure').", example: "Cortes Masculinos" },
					description: { type: "string", nullable: true, description: "Descrição detalhada." },
				},
			},
			UpdateServiceTypeDTO: {
				type: "object",
				required: ["id"],
				properties: {
					id: { type: "string", format: "uuid", description: "ID do tipo de serviço a ser atualizado." },
					name: { type: "string", nullable: true },
					description: { type: "string", nullable: true },
				},
			},
			ServiceTypeResponseDTO: {
				type: "object",
				properties: {
					id: { type: "string", format: "uuid" },
					name: { type: "string" },
					description: { type: "string" },
					services: { type: "array", description: "Serviços associados a este tipo.", items: { $ref: "#/components/schemas/ServiceResponseDTO" } },
				},
			},
			ServiceTypeResponseWrapper: {
				type: "object",
				properties: {
					message: { type: "string" },
					payload: { $ref: "#/components/schemas/ServiceTypeResponseDTO" },
				},
			},
			ServiceTypeArrayResponseWrapper: {
				type: "object",
				properties: {
					message: { type: "string" },
					payload: { type: "array", items: { $ref: "#/components/schemas/ServiceTypeResponseDTO" } },
				},
			},

			// Adicionar ao objeto swaggerDocs.components.schemas

			CreateEstablishmentDTO: {
				type: "object",
				required: ["userId", "tradeName", "zipCode", "street", "number", "neighborhood", "city", "state", "mainPhone"],
				properties: {
					userId: { type: "string", format: "uuid", description: "ID do proprietário/usuário associado." },
					tradeName: { type: "string", example: "Barbearia do João" },
					logo: { type: "string", nullable: true, format: "url" },
					logoDark: { type: "string", nullable: true, format: "url" },
					zipCode: { type: "string", example: "01001000" },
					street: { type: "string", example: "Rua da Consolação" },
					number: { type: "string", example: "1234" },
					complement: { type: "string", nullable: true },
					neighborhood: { type: "string", example: "Centro" },
					city: { type: "string", example: "São Paulo" },
					state: { type: "string", example: "SP" },
					mainPhone: { type: "string", example: "11987654321" },
					website: { type: "string", nullable: true, format: "url" },
					instagram: { type: "string", nullable: true },
					linkedin: { type: "string", nullable: true },
					tiktok: { type: "string", nullable: true },
					youtube: { type: "string", nullable: true, format: "url" },
				},
			},
			UpdateEstablishmentDTO: {
				type: "object",
				required: ["id"],
				properties: {
					id: { type: "string", format: "uuid", description: "ID do estabelecimento a ser atualizado." },
					tradeName: { type: "string", nullable: true },
					logo: { type: "string", nullable: true, format: "url" },
					logoDark: { type: "string", nullable: true, format: "url" },
					zipCode: { type: "string", nullable: true },
					street: { type: "string", nullable: true },
					number: { type: "string", nullable: true },
					complement: { type: "string", nullable: true },
					neighborhood: { type: "string", nullable: true },
					city: { type: "string", nullable: true },
					state: { type: "string", nullable: true },
					mainPhone: { type: "string", nullable: true },
					website: { type: "string", nullable: true, format: "url" },
					instagram: { type: "string", nullable: true },
					linkedin: { type: "string", nullable: true },
					tiktok: { type: "string", nullable: true },
					youtube: { type: "string", nullable: true, format: "url" },
				},
			},
			EstablishmentResponseDTO: {
				type: "object",
				properties: {
					id: { type: "string", format: "uuid" },
					userId: { type: "string", format: "uuid" },
					tradeName: { type: "string" },
					logo: { type: "string" },
					logoDark: { type: "string" },
					zipCode: { type: "string" },
					street: { type: "string" },
					number: { type: "string" },
					complement: { type: "string" },
					neighborhood: { type: "string" },
					city: { type: "string" },
					state: { type: "string" },
					mainPhone: { type: "string" },
					website: { type: "string" },
					instagram: { type: "string" },
					linkedin: { type: "string" },
					tiktok: { type: "string" },
					youtube: { type: "string" },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
					user: { $ref: "#/components/schemas/UserResponseDTO", description: "Proprietário do estabelecimento." },
					services: { type: "array", items: { $ref: "#/components/schemas/ServiceResponseDTO" }, description: "Serviços oferecidos pelo estabelecimento." },
				},
			},
			EstablishmentResponseWrapper: {
				type: "object",
				properties: {
					message: { type: "string" },
					payload: { $ref: "#/components/schemas/EstablishmentResponseDTO" },
				},
			},
			EstablishmentArrayResponseWrapper: {
				type: "object",
				properties: {
					message: { type: "string" },
					payload: { type: "array", items: { $ref: "#/components/schemas/EstablishmentResponseDTO" } },
				},
			},

			// ─── Plans Schemas ───────────────────────────────────────────────

			PlanResponseDTO: {
				type: "object",
				properties: {
					id: { type: "string", format: "uuid" },
					name: { type: "string", enum: ["BASIC", "PROFESSIONAL", "ENTERPRISE"], example: "PROFESSIONAL" },
					description: { type: "string", example: "Para negócios em crescimento" },
					monthlyPrice: { type: "integer", description: "Preço mensal em centavos (R$357 = 35700)", example: 35700 },
					annualDiscount: { type: "number", format: "float", description: "Desconto anual decimal (0.17 = 17%)", example: 0.17 },
					maxClients: { type: "integer", nullable: true, description: "Máximo de clientes ativos. null = ilimitado", example: 500 },
					hasAIScheduler: { type: "boolean", example: true },
					hasFeedbackCollector: { type: "boolean", example: true },
					hasCustomWebsite: { type: "boolean", example: false },
					popular: { type: "boolean", description: "Marca o plano como 'Mais Popular'", example: true },
					features: { type: "array", items: { type: "string" }, example: ["Até 500 clientes", "Suporte prioritário"] },
					active: { type: "boolean", example: true },
				},
			},
			CreatePlanDTO: {
				type: "object",
				required: ["name", "description", "monthlyPrice", "annualDiscount"],
				properties: {
					name: { type: "string", enum: ["BASIC", "PROFESSIONAL", "ENTERPRISE"] },
					description: { type: "string", example: "Para negócios em crescimento" },
					monthlyPrice: { type: "integer", description: "Preço mensal em centavos", example: 35700 },
					annualDiscount: { type: "number", format: "float", example: 0.17 },
					maxClients: { type: "integer", nullable: true, example: 500 },
					hasAIScheduler: { type: "boolean", example: true },
					hasFeedbackCollector: { type: "boolean", example: true },
					hasCustomWebsite: { type: "boolean", example: false },
					popular: { type: "boolean", example: true },
					features: { type: "array", items: { type: "string" } },
				},
			},
			UpdatePlanDTO: {
				type: "object",
				properties: {
					name: { type: "string", enum: ["BASIC", "PROFESSIONAL", "ENTERPRISE"], nullable: true },
					description: { type: "string", nullable: true },
					monthlyPrice: { type: "integer", nullable: true },
					annualDiscount: { type: "number", nullable: true },
					maxClients: { type: "integer", nullable: true },
					hasAIScheduler: { type: "boolean", nullable: true },
					hasFeedbackCollector: { type: "boolean", nullable: true },
					hasCustomWebsite: { type: "boolean", nullable: true },
					popular: { type: "boolean", nullable: true },
					features: { type: "array", items: { type: "string" }, nullable: true },
					active: { type: "boolean", nullable: true },
				},
			},
			PlanResponseWrapper: {
				type: "object",
				properties: {
					message: { type: "string" },
					payload: { $ref: "#/components/schemas/PlanResponseDTO" },
				},
			},
			PlanArrayResponseWrapper: {
				type: "object",
				properties: {
					message: { type: "string" },
					payload: { type: "array", items: { $ref: "#/components/schemas/PlanResponseDTO" } },
				},
			},

			// ─── Promotions Schemas ──────────────────────────────────────────

			PromotionServiceDTO: {
				type: "object",
				properties: {
					id: { type: "string", format: "uuid" },
					name: { type: "string" },
					price: { type: "integer", description: "Preço em centavos" },
					duration: { type: "integer", description: "Duração em minutos" },
				},
			},
			PromotionResponseDTO: {
				type: "object",
				properties: {
					id: { type: "string", format: "uuid" },
					establishmentId: { type: "string", format: "uuid" },
					title: { type: "string", example: "Semana do Consumidor" },
					description: { type: "string", example: "20% de desconto em cortes masculinos" },
					discountType: { type: "string", enum: ["PERCENTAGE", "FIXED"], example: "PERCENTAGE" },
					discountValue: { type: "integer", description: "20 para 20% ou 1000 para R$10,00", example: 20 },
					startsAt: { type: "string", format: "date-time", example: "2026-03-17T00:00:00.000Z" },
					endsAt: { type: "string", format: "date-time", example: "2026-03-23T23:59:59.999Z" },
					active: { type: "boolean", example: true },
					services: { type: "array", items: { $ref: "#/components/schemas/PromotionServiceDTO" } },
				},
			},
			CreatePromotionDTO: {
				type: "object",
				required: ["establishmentId", "title", "discountType", "discountValue", "startsAt", "endsAt", "serviceIds"],
				properties: {
					establishmentId: { type: "string", format: "uuid" },
					title: { type: "string", example: "Semana do Consumidor" },
					description: { type: "string", nullable: true, example: "20% de desconto em toda a linha de cortes" },
					discountType: { type: "string", enum: ["PERCENTAGE", "FIXED"], example: "PERCENTAGE" },
					discountValue: { type: "integer", description: "20 para 20% ou 1000 para R$10 fixo", example: 20 },
					startsAt: { type: "string", format: "date-time", example: "2026-03-17T00:00:00.000Z" },
					endsAt: { type: "string", format: "date-time", example: "2026-03-23T23:59:59.999Z" },
					serviceIds: { type: "array", items: { type: "string", format: "uuid" }, description: "IDs dos serviços cobertos pela promoção" },
				},
			},
			UpdatePromotionDTO: {
				type: "object",
				properties: {
					title: { type: "string", nullable: true },
					description: { type: "string", nullable: true },
					discountType: { type: "string", enum: ["PERCENTAGE", "FIXED"], nullable: true },
					discountValue: { type: "integer", nullable: true },
					startsAt: { type: "string", format: "date-time", nullable: true },
					endsAt: { type: "string", format: "date-time", nullable: true },
					serviceIds: { type: "array", items: { type: "string", format: "uuid" }, nullable: true },
					active: { type: "boolean", nullable: true },
				},
			},
			PromotionResponseWrapper: {
				type: "object",
				properties: {
					message: { type: "string" },
					payload: { $ref: "#/components/schemas/PromotionResponseDTO" },
				},
			},
			PromotionArrayResponseWrapper: {
				type: "object",
				properties: {
					message: { type: "string" },
					payload: { type: "array", items: { $ref: "#/components/schemas/PromotionResponseDTO" } },
				},
			},
		},
	},
};
