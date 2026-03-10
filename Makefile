# Timer Prosper - Backend Makefile

.PHONY: help install dev build test test-watch test-cov lint lint-fix format format-check type-check clean migrate migrate-create db-reset health ci pre-commit security

# Variáveis
NODE_ENV ?= development
PORT ?= 8081

help: ## Mostra esta mensagem de ajuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Instala dependências
	npm install

dev: ## Inicia servidor em modo desenvolvimento
	npm run dev

build: ## Compila para produção
	npm run build

start: ## Inicia servidor de produção
	NODE_ENV=production node dist/src/ProsperifyApplication.js

# Testes
test: ## Executa todos os testes
	npm test

test-watch: ## Executa testes em modo watch
	npm test -- --watch

test-cov: ## Executa testes com cobertura
	npm test -- --coverage

test-unit: ## Executa apenas testes unitários
	npm test -- --testPathPattern=unit

test-integration: ## Executa apenas testes de integração
	npm test -- --testPathPattern=integration

# Qualidade de código
lint: ## Executa linter e verifica erros
	npx eslint "src/**/*.ts"

lint-fix: ## Corrige automaticamente problemas de linting
	npx eslint "src/**/*.ts" --fix

format: ## Formata código com Prettier
	npx prettier --write "src/**/*.{ts,js,json}"

format-check: ## Verifica formatação sem alterar arquivos
	npx prettier --check "src/**/*.{ts,js,json}"

type-check: ## Verifica tipos TypeScript
	npx tsc --noEmit

code-quality: lint format-check type-check ## Executa todas verificações de qualidade

# Banco de dados
migrate: ## Executa migrations
	npm run migration:run

migrate-create: ## Cria nova migration (use name=NomeDaMigration)
	npm run migration:create $(name)

migrate-revert: ## Reverte última migration
	npm run typeorm:cli -- migration:revert

db-reset: ## Reseta banco de dados (CUIDADO!)
	@echo "⚠️  ATENÇÃO: Isso vai apagar todos os dados!"
	@read -p "Tem certeza? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		npm run migration:revert; \
		npm run migration:run; \
		echo "✅ Banco resetado com sucesso"; \
	fi

# Utilitários
clean: ## Remove arquivos temporários e build
	rm -rf dist node_modules coverage .nyc_output

clean-install: clean install ## Limpa e reinstala dependências

health: ## Verifica health da API
	@curl -f http://localhost:$(PORT)/health || echo "❌ API não está respondendo"

# CI/CD
ci: lint format-check type-check test ## Executa todas validações do CI

pre-commit: lint-fix format test-unit ## Hook de pre-commit

# Segurança e Análise
security: ## Verifica vulnerabilidades de segurança
	npm audit

security-fix: ## Corrige vulnerabilidades automaticamente
	npm audit fix

outdated: ## Lista dependências desatualizadas
	npm outdated

update-deps: ## Atualiza dependências interativamente
	npx npm-check -u

swagger-generate: ## Gera documentação Swagger atualizada
	npm run swagger:generate

swagger-serve: ## Inicia servidor de documentação em modo watch
	npm run swagger:serve

swagger-validate: ## Valida que o Swagger está correto
	npx swagger-cli validate docs/swagger/swagger.json
