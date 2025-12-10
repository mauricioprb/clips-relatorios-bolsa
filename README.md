# bagunca

# BagUnça

Sistema para gerenciamento de horas e geração de relatórios de bolsistas.
Permite cadastrar dados do bolsista, grade semanal, atividades padrão, registrar atividades diárias, preencher dias vazios automaticamente e gerar o PDF do relatório.

## Variáveis de ambiente

Crie um arquivo `.env` a partir de `.env.example`:

- `DATABASE_URL` – string de conexão PostgreSQL.
  - Em Docker: `postgresql://bagunca:senha-segura@db:5432/bagunca?schema=public`
  - Fora do Docker: troque o host para `localhost`.
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` – credenciais de login.
- `SESSION_SECRET` – chave para assinar o JWT de sessão.
- `REPORT_START_TIME` – horário inicial padrão ao preencher dias vazios (ex.: `14:00`).

A carga horária semanal da bolsa agora é definida na página **Configurações** da aplicação.

## Rodando local (sem Docker)

1. Instale dependências:
   ```bash
   npm install
   ```
2. Garanta um PostgreSQL rodando localmente e ajuste `DATABASE_URL` (host `localhost`).
3. Rode as migrações:
   ```bash
   npx prisma migrate dev
   ```
4. Suba o dev server:
   ```bash
   npm run dev
   ```
5. Acesse `http://localhost:3000`, faça login com as credenciais das variáveis de ambiente e navegue até `/dashboard`.

## Rodando com Docker e docker-compose

1. Copie o `.env.example` para `.env` e ajuste os valores desejados (mantendo o host do DB como `db`).
2. Suba os serviços:
   ```bash
   docker compose up -d
   ```
   O serviço `app` depende do `db` e executa `prisma migrate deploy` antes de iniciar.
3. Acesse `http://localhost:3000` e faça login com `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

Para aplicar migrações manualmente dentro do container:

```bash
docker compose exec app npx prisma migrate deploy
```

## Scripts úteis

- `npm run dev` – ambiente de desenvolvimento.
- `npm run build` / `npm run start` – build e servidor em produção.
- `npm run prisma:migrate` – `prisma migrate dev`.
- `npm run prisma:generate` – gera o cliente Prisma.

## Fluxo

1. Faça login em `/login`.
2. Cadastre os dados do bolsista e a carga horária semanal da bolsa em `/config`.
3. Configure grade semanal em `/grade-semanal` e atividades padrão em `/atividades-padrao`.
4. Use `/mes?ano=YYYY&mes=M` para registrar/editar atividades do mês, preencher dias vazios automaticamente e gerar o PDF do relatório.
