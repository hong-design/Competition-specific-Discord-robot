# Tournament Operations Discord Bot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](package.json)
[![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)

An open-source, self-hosted Discord bot for tournament check-ins, match coordination, result publishing, and community event operations.

Built for community organizers, grassroots esports events, school competitions, and Discord communities that want reusable tournament workflows without building their own bot from scratch.

> **Project status:** early public release (`v0.1.0`). The project is actively open to testing, feedback, issues, and pull requests.

## Why this exists

Running a tournament inside Discord often means stitching together attendance lists, staff messages, match calls, room information, result posts, and moderation tools manually.

This project turns those repeated operations into reusable Discord workflows while keeping the deployment self-hosted and the codebase open for organizers and developers to adapt.

## What it can do

### Tournament operations

- Open and close participant check-in windows
- Let participants check in or withdraw independently
- Let authorized staff manage attendance manually
- Handle no-show and attendance workflows
- Publish match calls with room information and countdowns
- Publish match and event results
- Generate overview panels for participants and staff
- Keep event data and configuration isolated by Discord Guild ID
- Persist local data with SQLite

### Community operations

- Moderation commands and audit records
- Announcements and polls
- Reaction-role management
- Server and user information
- Reports and blacklist management
- Moderation statistics

For the complete feature inventory, see [FEATURE_INVENTORY.md](FEATURE_INVENTORY.md).

## Who this project is for

This project may be useful if you are:

- Running a community or grassroots esports tournament
- Organizing competitions through a Discord server
- Building an event-management workflow around Discord
- Looking for an open-source tournament bot to self-host and modify
- Learning how a larger Discord.js bot can structure commands, permissions, persistence, and event operations

It is intentionally self-hosted. There is currently no hosted SaaS service or official public bot instance that you need to depend on.

## Quick start

### Requirements

- Node.js 18+
- npm
- A Discord application and bot token
- A Discord server for development or deployment

### 1. Clone and install

```bash
git clone https://github.com/hong-design/Competition-specific-Discord-robot.git
cd Competition-specific-Discord-robot
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Set at least:

```env
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
DISCORD_ENV=development
```

Never commit your real bot token or production secrets.

### 3. Deploy slash commands

```bash
npm run deploy:commands
```

### 4. Start the bot

```bash
npm start
```

For a more detailed setup, see [QUICKSTART.md](QUICKSTART.md) and [SETUP.md](SETUP.md).

## Project structure and documentation

| Document | Purpose |
| --- | --- |
| [QUICKSTART.md](QUICKSTART.md) | Fast local setup |
| [SETUP.md](SETUP.md) | Full configuration guide |
| [COMMANDS.md](COMMANDS.md) | Slash-command reference |
| [FEATURE_INVENTORY.md](FEATURE_INVENTORY.md) | Current feature inventory |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Pre-deployment checks |
| [DOCS.md](DOCS.md) | Documentation index |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution workflow |

## Open-source development

Issues, pull requests, documentation fixes, bug reports, and tournament workflow proposals are welcome.

Good contribution areas include:

- Tournament workflow improvements
- Better organizer UX
- Permission and moderation hardening
- Test coverage
- Documentation and deployment improvements
- Multi-event and larger-community workflows
- Accessibility and localization

Before making a larger change, consider opening an issue first so the intended behavior can be discussed.

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution details.

## Security and data

- Never commit `.env`, Discord tokens, production database files, or user data.
- Review requested Discord permissions before production deployment.
- Tournament and event records are intended to remain guild-scoped.
- Test changes in a non-production Discord server before using them for a live event.
- Security-sensitive reports should not include secrets, exploit details, or personal data in public issues.

## Current maturity

This project is not presented as production-certified or broadly adopted. `v0.1.0` is an early open-source release focused on making the core tournament workflows usable, inspectable, and contributor-friendly.

If you deploy it for a real event, feedback about what worked, what broke, and what organizers still had to do manually is especially valuable.

## Roadmap direction

The project is expected to evolve around real tournament operations rather than becoming a generic all-purpose Discord bot. Areas worth exploring include better event lifecycle management, organizer dashboards, richer match workflows, scheduling, stronger testing, and easier deployment.

Roadmap proposals are welcome through GitHub Issues.

## License

Released under the [MIT License](LICENSE). You can use, modify, fork, and redistribute the project under the terms of the license.
