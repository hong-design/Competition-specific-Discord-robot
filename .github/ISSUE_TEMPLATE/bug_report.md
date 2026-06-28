---
name: Bug report
title: ''
description: Report a problem with the bot
labels: bug
body:
  - type: textarea
    id: summary
    attributes:
      label: Problem summary
      description: Describe the issue briefly.
    validations:
      required: true
  - type: textarea
    id: impacted
    attributes:
      label: Affected command / feature
      description: Which command or feature is affected?
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Reproduction steps
      description: List the steps needed to reproduce the problem.
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
  - type: textarea
    id: actual
    attributes:
      label: Actual behavior
  - type: input
    id: node
    attributes:
      label: Node.js version
  - type: input
    id: npm
    attributes:
      label: npm version
  - type: input
    id: hosting
    attributes:
      label: Hosting environment
  - type: input
    id: discordjs
    attributes:
      label: Discord.js version
  - type: textarea
    id: logs
    attributes:
      label: Logs / screenshots
      description: Include logs or screenshots if available.
  - type: markdown
    attributes:
      value: "Please remove any tokens, private IDs, invite links, personal information, private messages, or production data before submitting."
