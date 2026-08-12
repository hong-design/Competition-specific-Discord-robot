# Security Policy

Security reports are welcome. Please avoid publishing exploitable details, credentials, private Discord data, or production database contents in a public GitHub issue.

## Reporting a vulnerability

If GitHub Private Vulnerability Reporting is enabled for this repository, please use it for security-sensitive reports.

If private reporting is not available, open a public issue only to request a private contact method. Do not include reproduction steps, tokens, private server information, personal data, or exploit details in that issue.

Security-sensitive examples include:

- Discord bot token or credential exposure
- Permission bypasses
- Cross-guild data leakage
- Unauthorized access to tournament or moderation data
- Vulnerabilities that allow users to execute privileged bot actions
- Dependency vulnerabilities with a practical exploit path in this project

## Secrets

Never commit:

- `.env` files
- Discord bot tokens
- Production guild, channel, or role configuration that should remain private
- Production SQLite databases
- User data, private messages, or private Discord invite links

If a Discord bot token is exposed, rotate it immediately in the Discord Developer Portal. Removing the token from the latest commit alone is not sufficient.

## Supported version

Security fixes currently target the latest version on the default branch.

## Scope

This is an early open-source project. Security reports should focus on vulnerabilities in this repository and its intended deployment model. Misconfiguration of Discord permissions or third-party hosting environments may still be documented when the project can reasonably prevent or detect the problem.
