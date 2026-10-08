# Deploy & operação no servidor — Empregol API

Guia de bolso para atualizar a API em produção e rodar tarefas no banco.
Tudo roda em Docker Compose (containers `empregol-api` + `empregol-db`).

---

## 0. Descobrir o caminho exato do projeto (em qualquer servidor)

Os comandos de `docker compose` **só funcionam dentro da pasta que contém o
`docker-compose.yml`**. Para descobrir essa pasta sem adivinhar, use o label que
o Compose grava no container:

```bash
docker inspect empregol-api --format '{{ index .Config.Labels "com.docker.compose.project.working_dir" }}'
```

Isso imprime o caminho (ex.: `/project/empregol/backend/empregol-api`). Guarde-o:

```bash
export EMPREGOL_DIR="$(docker inspect empregol-api --format '{{ index .Config.Labels "com.docker.compose.project.working_dir" }}')"
echo "$EMPREGOL_DIR"
```

> Caminho documentado/padrão neste projeto: **`/project/empregol/backend/empregol-api`**.

---

## 1. Atualizar a API (após `git push` no `main`)

```bash
cd "$EMPREGOL_DIR"            # ou: cd /project/empregol/backend/empregol-api
git pull origin main
docker compose up -d --build  # rebuild da imagem + restart (migrations rodam no boot)
docker compose logs -f api    # acompanhe o boot; Ctrl+C para sair dos logs
```

Verificar saúde:

```bash
curl http://127.0.0.1:3000/health
```

### Versão em uma linha (copiar e colar)

```bash
cd /project/empregol/backend/empregol-api && git pull origin main && docker compose up -d --build && docker compose logs -f api
```

---

## 2. Comandos úteis do Compose

```bash
docker compose ps                 # status dos containers
docker compose logs -f api        # logs da API
docker compose logs -f db         # logs do Postgres
docker compose restart api        # reiniciar só a API (sem rebuild)
docker compose down               # parar tudo (dados ficam em ./pgdata)
docker compose up -d --build      # subir/atualizar
```

---

## 3. Tarefas no banco (funcionam de QUALQUER pasta)

Usam `docker exec` + nome do container (`empregol-db`), então **não dependem do
caminho** nem de estar na pasta do projeto.

### Verificar/ativar um usuário (pular verificação de e-mail em testes)

```bash
docker exec empregol-db psql -U empregol -d empregol -c "UPDATE users SET \"emailVerified\" = true, status = 'ACTIVE' WHERE email = 'EMAIL_AQUI';"
```

### Listar atletas (com status de verificação)

```bash
docker exec empregol-db psql -U empregol -d empregol -c "SELECT a.\"fullName\", u.email, u.\"emailVerified\", u.status, a.position, a.\"createdAt\" FROM athletes a JOIN users u ON u.id = a.\"userId\" ORDER BY a.\"createdAt\" DESC;"
```

### Conferir um usuário específico

```bash
docker exec empregol-db psql -U empregol -d empregol -c "SELECT email, \"emailVerified\", status, role FROM users WHERE email = 'EMAIL_AQUI';"
```

### Abrir um shell SQL interativo (psql)

```bash
docker exec -it empregol-db psql -U empregol -d empregol
```

### Backup / restore do banco

```bash
# backup (gera empregol-backup.sql na pasta atual)
docker exec empregol-db pg_dump -U empregol empregol > empregol-backup-$(date +%F).sql

# restore (a partir de um .sql)
cat empregol-backup.sql | docker exec -i empregol-db psql -U empregol -d empregol
```

---

## 4. Notas

- **App mobile (APK) não é deployado aqui.** O servidor roda só a API. Mudanças
  no app (ex.: a tela de chat) só exigem **rebuild do APK** (ver `empregol-app/README.md`),
  nunca um deploy de backend.
- Variáveis sensíveis vivem no `.env` do servidor (não versionado): `POSTGRES_PASSWORD`,
  `JWT_SECRET`, `JWT_REFRESH_SECRET`, `RESEND_API_KEY`, `CORS_ORIGIN`, `FIREBASE_SERVICE_ACCOUNT`.
- Os dados do Postgres persistem em `./pgdata` dentro da pasta do projeto — `docker compose down`
  **não** apaga os dados.
- Login social: além do deploy, exige `FIREBASE_SERVICE_ACCOUNT` (JSON do service account
  em uma linha) definido no `.env` do servidor.
```
