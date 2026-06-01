# Empregol API

Backend da Empregol — Node + Express + TypeScript + Prisma + PostgreSQL + Socket.io.

## Desenvolvimento local

```bash
npm install
cp .env.production.example .env   # ajuste os valores
npm run prisma:generate
npm run dev
```

## Deploy no servidor (Docker)

Tudo roda em container: PostgreSQL + API. Os dados do banco ficam em `./pgdata`
(ou seja, dentro do repo — que deve estar no SSD Kingston).

### 1. Colocar o repo no servidor (no SSD Kingston)

```bash
# no servidor, dentro do ponto de montagem do SSD (ex: /mnt/kingston)
cd /mnt/kingston
git clone https://github.com/wellcastroXX/empregol-api.git
cd empregol-api
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.production.example .env
nano .env   # defina POSTGRES_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET, RESEND_API_KEY, CORS_ORIGIN
```

Gere segredos fortes com: `openssl rand -base64 48`

### 3. Subir os containers

```bash
docker compose up -d --build
docker compose logs -f api      # acompanha migrations + boot
```

A API sobe em `http://127.0.0.1:3000` no servidor. Teste:

```bash
curl http://127.0.0.1:3000/health
```

### 4. Expor pelo domínio (reverse proxy)

A porta 3000 é publicada só no localhost do servidor. Coloque um reverse proxy
(Nginx/Caddy/Traefik) na frente para o domínio público com HTTPS.

- **databaseURL** (interno aos containers): `postgresql://USUARIO:SENHA@db:5432/empregol`
- **baseURL** (consumido pelo frontend): `https://SEU_DOMINIO` → proxy → `127.0.0.1:3000`

### Comandos úteis

```bash
docker compose ps                 # status
docker compose logs -f            # logs
docker compose down               # parar (mantém os dados em ./pgdata)
docker compose up -d --build      # atualizar após git pull
```
