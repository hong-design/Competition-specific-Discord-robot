# Competition-specific Discord Robot

A self-hosted Discord.js bot for tournament check-ins, match coordination, result publishing, and community event operations.

## Why this project exists

Community and grassroots tournaments are often managed through scattered messages, manual attendance lists, and improvised staff coordination.

This project provides reusable Discord workflows for participant check-in, no-show handling, match announcements, event communication, result records, and server operations. It is designed for organizers who need practical tournament tooling without building a custom bot from scratch.

## Core tournament workflows

* Open and close participant check-in windows
* Let participants check in or withdraw independently
* Let authorized staff manage attendance manually
* Send match-call announcements with room details and countdowns
* Publish event or match results
* Generate event overview panels for participants and staff
* Persist guild-scoped settings and event records locally with SQLite

## Additional community tools

* Moderation commands and audit records
* Announcements and polls
* Reaction-role management
* Server and user information
* Reports, blacklist management, and moderation statistics

## Requirements

* Node.js 18 or newer
* npm
* A Discord application and bot token
* A Discord server for development or production use

## Quick start

```bash
git clone https://github.com/hong-design/Competition-specific-Discord-robot.git
cd Competition-specific-Discord-robot
npm install
```

Create your local environment file:

```bash
cp .env.example .env
```

For Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure the required values in `.env`:

```env
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
DISCORD_ENV=development
```

Deploy slash commands:

```bash
npm run deploy:commands
```

Start the bot:

```bash
npm start
```

## Documentation

* [Quick start](QUICKSTART.md)
* [Setup guide](SETUP.md)
* [Command reference](COMMANDS.md)
* [Deployment checklist](DEPLOYMENT_CHECKLIST.md)
* [Documentation index](DOCS.md)

## Data and security

* Never commit `.env`, bot tokens, production database files, or user data.
* Tournament and event data are intended to remain isolated by Discord Guild ID.
* Review bot permissions before inviting the bot to a production server.
* Report security issues privately. Do not publish tokens, exploit details, or personal data in public issues.

## Project status

`v0.1.0` is an early public release focused on core tournament operations and contributor readiness.

The project is not presented as broadly adopted or production-certified. Contributors and organizers should test it in a non-production Discord server before relying on it for a live event.

## Contributing

Contributions, bug reports, documentation fixes, and tournament workflow proposals are welcome.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request.

## License

This project is licensed under the [MIT License](LICENSE).

