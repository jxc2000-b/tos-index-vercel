# Local PostgreSQL setup

The easiest way to run PostgreSQL locally for this project is with Docker.

## 1. Start PostgreSQL

```bash
docker run --name tos-postgres \
  -e POSTGRES_USER=appuser \
  -e POSTGRES_PASSWORD=local-password \
  -e POSTGRES_DB=appdb \
  -p 5432:5432 \
  -d postgres:17
```

Confirm that the container is running:

```bash
docker ps
```

## 2. Configure the application

Create a `.env` file in the repository root:

```env
DATABASE_URL="postgresql://appuser:local-password@localhost:5432/appdb"
NEXTAUTH_SECRET="replace-with-a-long-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a stable secret once with `openssl rand -base64 32`, place its output in
`NEXTAUTH_SECRET`, and keep the same value between restarts. Do not commit `.env`
or use these example credentials in production.

If you change `NEXTAUTH_SECRET` after signing in, clear the site's cookies (or
open the app in a private window) and sign in again. Existing session cookies
were encrypted with the old secret and cannot be decrypted with the new one.

## 3. Initialize and seed the database

Install the project dependencies if needed:

```bash
pnpm install
```

Apply the Prisma migrations and add the sample data:

```bash
pnpm exec prisma migrate dev
pnpm exec prisma db seed
```

## 4. Run the application

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Common container commands

Stop PostgreSQL:

```bash
docker stop tos-postgres
```

Start it again later:

```bash
docker start tos-postgres
```

View its logs:

```bash
docker logs tos-postgres
```

Open a PostgreSQL shell:

```bash
docker exec -it tos-postgres psql -U appuser -d appdb
```

The database remains stored inside the container when it is stopped. Removing the container with `docker rm` also removes its database data unless you configure a persistent Docker volume.
