# Contributing

Thanks for helping improve this self-hosted Discord.js bot for tournament and community operations.

## Before opening an issue

- Search existing issues first to avoid duplicates.
- Do not include tokens, private Discord invite links, personal data, private messages, or production database contents in issues, pull requests, logs, or screenshots.
- Report security vulnerabilities privately rather than opening a public issue.

## Local development

```bash
npm install
npm run verify
npm start
```

## Review expectations

Changes that affect any of the following should be validated in a test Discord server before being proposed as a pull request:

- Slash commands
- Permissions
- Guild data isolation
- Check-in flows
- Result publishing
- SQLite persistence

## Pull request expectations

- Keep pull requests focused and small when possible.
- Explain user impact and include a clear testing plan.
- Do not hard-code tokens, guild IDs, channel IDs, or role IDs.
- Update relevant documentation when changing commands, configuration, or deployment behavior.

Suggested branch names:

- `fix/checkin-state`
- `feat/match-reminders`
- `docs/setup-clarification`
- `chore/dependency-update`
