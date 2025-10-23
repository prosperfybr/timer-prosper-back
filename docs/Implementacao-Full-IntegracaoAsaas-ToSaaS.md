# Implementação Full da Integração Asaas para SaaS

Este PRD descreve, passo a passo, como implementar do zero uma integração completa com o Asaas para um produto SaaS com arquitetura web moderna (frontend React + backend/Edge Functions + banco SQL relacional). O objetivo é fornecer um guia prescritivo e reproduzível que cubra cadastro de clientes, assinaturas, gestão de pagamentos, APIs, webhooks e, principalmente, fluxos de upgrade e downgrade.

---

## 1. Objetivos e Escopo

- Implementar cadastro de clientes no Asaas e vinculação ao modelo interno (empresa/usuário).
- Criar e gerenciar assinaturas (planos com ciclo mensal/anual e status).
- Orquestrar pagamentos (faturas, métodos de pagamento, confirmação e falhas).
- Consumir e tratar webhooks oficiais do Asaas com confiabilidade.
- Suportar fluxos de upgrade e downgrade com segurança transacional e rastreabilidade.
- Manter consistência de dados entre o SaaS e o Asaas, com mecanismos de sincronização e reconciliação.

Escopo inclui:
- API interna de integração (customer, subscription, payment).
- Webhook receiver do Asaas e processamento assíncrono/robusto.
- Funções SQL (RPC) para regras de negócio críticas (e.g., manage_asaas_subscription).
- Logs de auditoria, idempotência e tratamento de erros.

Fora do escopo:
- UI detalhada de planos/preços.
- Migração de dados legados (apenas apontamentos).

---

## 2. Arquitetura de Alto Nível

- Frontend (React/Vite) chama API interna para iniciar cadastro, upgrade ou downgrade.
- Backend/Edge Functions integram com Asaas via REST, persistem resultados e acionam RPCs.
- Banco relacional (Postgres) guarda entidades: usuarios, empresas, planos, assinaturas, pagamentos.
- Webhooks do Asaas chegam em endpoint dedicado e são enfileirados/processados de forma confiável.
- Função RPC central gerencia transições de assinatura e políticas (upgrade/downgrade/cancelamento).

Componentes mínimos:
- Service: AsaasService (HTTP client Asaas: customers, subscriptions, payments).
- Service: AsaasIntegrationService (orquestra cadastro + assinatura + vínculo interno).
- Service: SyncPaymentService/RobustSync (processamento de webhooks, reconciliação, idempotência).
- Edge Function: asaas-webhook (receiver + dispatcher).
- RPC SQL: manage_asaas_subscription (transições de estados/cobrança/planos).
- Logs/Auditoria: tabela dedicada com contexto, payloads, correlações.

---

## 3. Domínio e Modelos de Dados

Entidades principais (mínimo):
- Usuario: id, email, nome, data_criacao.
- Empresa (cliente interno): id, owner_user_id, cnpj, nome, status, asaas_customer_id.
- Plano: id (UUID), nome, ciclo (mensal/anual), preco, ativo.
- Assinatura: id, empresa_id, plano_id, status (pending, active, canceled, suspended), asaas_subscription_id, data_ativacao, data_cancelamento.
- Pagamento: id, empresa_id, assinatura_id, valor, status (pending, received, confirmed, refunded, failed), asaas_payment_id, metodo (boleto, pix, cartao), data_evento.
- LogsAuditoria: id, contexto, entidade, entidade_id, acao, payload, resultado, criado_em.

Relacionamentos:
- Usuario 1:N Empresa
- Empresa 1:1 Assinatura ativa (ou N com histórico)
- Assinatura 1:N Pagamentos
- Plano 1:N Assinaturas

Regras:
- asaas_customer_id único por Empresa.
- assinatura ativa por Empresa: no máximo uma.
- plano_id como UUID para consistência e rastreabilidade.

---

## 4. Integração com Asaas (Endpoints Base)

Clientes (Customers):
- Criar: POST /customers
- Atualizar: PUT /customers/{id}
- Buscar: GET /customers?email=...
- Deletar: DELETE /customers/{id} (usar com extremo cuidado)

Assinaturas (Subscriptions):
- Criar: POST /subscriptions
- Atualizar: POST /subscriptions/{id}
- Buscar: GET /subscriptions/{id}
- Cancelar: DELETE /subscriptions/{id}

Pagamentos (Payments):
- Criar: POST /payments (quando necessário fora da subscrição)
- Buscar: GET /payments/{id}
- Listar: GET /payments?subscriptionId=...

Boas práticas:
- Autenticação via API Key segura (env). Nunca logar segredos.
- Timeouts e retries com backoff exponencial.
- Idempotência: chaves de deduplicação por operação crítica.
- Observabilidade: correlacionar requestId interno com payloads de webhook.

---

## 5. Webhooks do Asaas

Endpoint: /api/asaas/webhook (exemplo).
Eventos relevantes:
- PAYMENT_RECEIVED / PAYMENT_CONFIRMED: confirmação de recebimento.
- PAYMENT_OVERDUE / PAYMENT_REFUNDED / PAYMENT_FAILED: exceções.
- SUBSCRIPTION_ACTIVATED / SUBSCRIPTION_CANCELED: transições de assinatura.

Estratégia de processamento:
- Receber → validar assinatura (se existir) → normalizar payload → enfileirar para processamento assíncrono.
- Registrar log de auditoria com payload bruto + chave de correlação.
- Upsert de pagamento por asaas_payment_id; atualizar status interno.
- Acionar RPC manage_asaas_subscription para transições consistentes.

Robustez:
- Idempotência: deduplicar por eventId/paymentId/subscriptionId.
- Quarentena: mover eventos inválidos para uma fila/tabela de quarentena.
- Retentativas com DLQ (dead-letter) para erros temporários.

---

## 6. Fluxos Essenciais

### 6.1 Cadastro Inicial (Cliente + Assinatura)
1. Frontend coleta dados (empresa, cnpj, email, plano escolhido).
2. Backend verifica existência de asaas_customer; se não existir, cria no Asaas.
3. Persistir empresa com asaas_customer_id e plano pretendido.
4. Criar assinatura no Asaas para o plano selecionado.
5. Persistir assinatura interna com asaas_subscription_id (status pending).
6. Agendar ativação via RPC quando pagamento for confirmado (webhook).

Estados esperados:
- Empresa criada e vinculada ao Asaas.
- Assinatura em pending até PAYMENT_CONFIRMED.

Erros comuns e tratamento:
- Email já existente no Asaas: resolver com find/update ao invés de criar.
- Inconsistências de CNPJ: validação prévia e constraints únicas no DB.

### 6.2 Upgrade de Plano
1. Usuário escolhe novo plano superior no frontend.
2. Backend chama RPC manage_asaas_subscription com ação upgrade.
3. Atualizar assinatura no Asaas (mudar valor/ciclo) ou criar nova conforme política.
4. Ajustar cobrança pro-rata se aplicável (definir política clara: crédito/débito).
5. Persistir nova referência (subscriptionId) se recriada; logar transição.
6. Estado fica pending até novo pagamento ser confirmado (se houver diferença).

Estados esperados:
- Assinatura refletindo novo plano.
- Pagamento gerado/ajustado conforme política.

### 6.3 Downgrade de Plano
1. Usuário escolhe plano inferior.
2. Backend chama RPC manage_asaas_subscription com ação downgrade.
3. Programar mudança no ciclo seguinte ou imediata, conforme política.
4. Tratar diferenças de valor: estornar/crédito futuro.
5. Persistir alterações e logar auditoria.
6. Confirmar via webhook a ativação/cancelamento de parcelas antigas.

Estados esperados:
- Assinatura atualizada para novo plano/ciclo.
- Pagamentos ajustados e status consistentes.

### 6.4 Cancelamento
1. Solicitação de cancelamento.
2. RPC aciona cancel no Asaas; define status canceled interno.
3. Tratar cobranças em aberto: decidir política de estorno.
4. Logar auditoria e bloquear uso conforme regras de negócio.

---

## 7. Função RPC: manage_asaas_subscription

Responsabilidades:
- Centralizar transições de assinatura (create/activate/upgrade/downgrade/cancel).
- Garantir consistência transacional entre tabelas internas.
- Validar pré-condições (empresa existente, plano válido, estados compatíveis).
- Emitir logs e atualizar colunas de auditoria (observacoes, datas, status).

Inputs típicos:
- empresa_id, plano_id (UUID), acao (enum), timezone, observacoes.

Outputs:
- Resultado da transição, IDs afetados, mensagens de auditoria.

Boas práticas:
- Evitar acoplamento a IDs externos; usar chaves internas e relacionar por asaas_* quando preciso.
- Versões e correções de migração devem ser cumulativas e auditáveis.

---

## 8. APIs Internas (Exemplos)

Rotas sugeridas:
- POST /api/asaas/customer: cria ou atualiza cliente Asaas e vincula empresa.
- POST /api/asaas/subscription: cria assinatura para empresa/plano.
- POST /api/asaas/subscription/upgrade: solicita upgrade via RPC.
- POST /api/asaas/subscription/downgrade: solicita downgrade via RPC.
- POST /api/asaas/webhook: receiver oficial.
- GET /api/asaas/payments: lista pagamentos por empresa/assinatura.

Segurança:
- Autenticação do usuário para rotas de ação.
- Assinatura/Token secreto para webhook.
- Rate limiting e proteção contra replay.

---

## 9. Políticas de Upgrade/Downgrade

Definições e recomendações:
- Upgrade imediato: alterar plano e cobrar diferença pro-rata no mesmo ciclo, ativação após confirmação.
- Downgrade programado: aplicar no próximo ciclo para evitar reembolsos complexos; se imediato, definir regra para créditos.
- Ciclo (mensal/anual): respeitar atributo ciclo do plano; migração entre ciclos exige cálculo claro de pro-rata.
- Comunicação ao usuário: enviar e-mail/notificação sobre mudanças e próximas cobranças.

---

## 10. Estratégia de Sincronização e Reconciliação

- Tarefas periódicas para comparar estado interno vs Asaas (assinaturas e pagamentos).
- Reprocessamento de webhooks em quarentena.
- Ferramentas de suporte: endpoint de re-sync manual por admin.
- Métricas e relatórios: assinaturas ativas, falhas de pagamento, eventos não conciliados.

---

## 11. Observabilidade e Auditoria

- Tabela logs_auditoria com contexto (acao, entidade, ids), payloads e resultados.
- Correlação entre request interno, webhook e transações.
- Alertas para erros críticos (ex.: falha ao atualizar assinatura após pagamento confirmado).

---

## 12. Considerações de Segurança

- Segredos em variáveis de ambiente; nunca em logs ou commits.
- Validação forte de input (CNPJ, e-mail, plano UUID).
- Políticas de acesso e RLS onde aplicável.
- Tratamento de dados pessoais conforme LGPD.

---

## 13. Checklist de Implementação

- [ ] Tabelas base e constraints (empresa, assinatura, pagamento, plano, logs).
- [ ] Serviços Asaas (customers, subscriptions, payments) com retries/idempotência.
- [ ] RPC manage_asaas_subscription implementada e testada.
- [ ] Edge Function de webhook com validação, quarentena e DLQ.
- [ ] Rotas internas para cadastro/upgrade/downgrade.
- [ ] Sincronização robusta e relatórios.
- [ ] Observabilidade/auditoria ativa.
- [ ] Políticas claras de pro-rata e comunicação ao usuário.

---

## 14. Anexos e Referências

- Mapeamento de eventos do Asaas e status internos.
- Exemplos de payloads de webhook.
- Esquemas SQL base (colunas e chaves recomendadas).
- Estratégias de migração incremental (DDL) e versionamento.

Fim do documento.