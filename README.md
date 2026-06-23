# Discord Email Verification Bot

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org)
[![Bun](https://img.shields.io/badge/Bun-000?logo=bun&logoColor=fff)](https://bun.sh)
[![discord.js](https://img.shields.io/badge/discord.js-5865F2?logo=discord&logoColor=fff)](https://discord.js.org)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=fff)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=fff)](https://www.postgresql.org)

A Discord bot that gates server access behind email domain verification.
- Restrict membership to verified institutional/organisational email domains (e.g. `iiitn.ac.in`, `company.com`)
- Privacy-preserving: **discord server admins only see *which domain* your email belong to, never your entire email or identity**

## Overview & Use Case

Members authenticate through an authentication website using their email address on that domain. Once authenticated, users can run `/verify` in Discord and receive the verified role set by server admin.

This bot is intended to be paired with a companion authentication website built with [Better Auth](https://www.better-auth.com). Users authenticate on that site via a one-time login link sent to their email inbox. 

Detailed info about the authentication website can be found on it's github repository: [github.com/cdhananjay/email-verifier-website](https://github.com/cdhananjay/email-verifier-website)

## Open Source & Transparency

Both this bot and its companion authentication website are fully open source. Because authentication relies on magic links rather than passwords, no passwords are stored in the database. The entire verification flow is publicly auditable, giving communities confidence that their authentication process is secure and transparent.

## Features

- `/config domain <domain>` -- Set the email domain for verification (e.g. `example.com`).
- `/config verified-role <role>` -- Set the role granted to verified users.
- `/config view` -- View current server configuration.
- `/config reset` -- Delete the server configuration.
- `/verify` -- Check if your Discord account is linked and verified, and receive the role.


## Prerequisites

- [Bun](https://bun.sh)
- PostgreSQL database
- A Discord application with a bot token ([Discord Developer Portal](https://discord.com/developers/applications))
- A companion authentication website (to handle email sign-in and Discord linking)

## Setup

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd discord-bot
   ```

2. Copy the environment template and fill in the values:

   ```bash
   cp example.env .env
   ```

3. Install dependencies, apply database migrations, and generate the Prisma client:

   ```bash
   bun build
   ```

4. Register slash commands with Discord:

   ```bash
   bun run --env-file=.env src/deploy-commands.ts
   ```

5. Start the bot:

   ```bash
   bun dev
   ```

## Environment Variables

| Variable       | Description                                    |
| -------------- | ---------------------------------------------- |
| `TOKEN`        | Discord bot token from the Developer Portal    |
| `CLIENT_ID`    | Discord application client ID                  |
| `GUILD_ID`     | Discord server (guild) ID for command registration |
| `DATABASE_URL` | PostgreSQL connection string                   |
| `AUTH_SITE_URL` | URL of the companion authentication website   |

## Commands

### `/config` (Administrator only)

Configures the bot for the server. Requires the **Administrator** permission.

| Subcommand    | Options       | Description                         |
| ------------- | ------------- | ----------------------------------- |
| `domain`      | `domain` (string, required) | Set the email domain for verification |
| `verified-role` | `role` (role, required) | Set the role to assign to verified users |
| `view`        | --            | Show the current domain and verified role |
| `reset`       | --            | Delete the server configuration     |

### `/verify` (All users)

Checks whether you are eligible for the verified role. The bot verifies that:

- The server has a domain and verified role configured.
- Your Discord account is linked to the external auth site.
- Your email is verified (you clicked the magic link).
- Your email domain matches the configured domain.

If all checks pass, you receive the verified role. Otherwise, the bot tells you which steps remain.

## Tech Stack

- **Runtime:** [Bun](https://bun.sh)
- **Language:** TypeScript
- **Discord Library:** [discord.js](https://discord.js.org) v14
- **ORM:** [Prisma](https://www.prisma.io)
- **Database:** PostgreSQL
- **Auth Framework:** [Better Auth](https://www.better-auth.com) (companion site)
- **Linter / Formatter:** [Biome](https://biomejs.dev)

## Development

```bash
# Format and lint
bun format-lint

# Check formatting/lint (no write)
bun format-lint:check

# Type-check
bun typecheck

# Run with file watching
bun dev
```

The CI pipeline (GitHub Actions) runs `format-lint:check` and `typecheck` on every push to `main`.
