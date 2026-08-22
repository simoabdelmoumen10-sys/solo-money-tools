# Contributing to Solo Money Tools

Thank you for helping improve the tools. This repository favors small, understandable changes over large rewrites. Each tool should solve a clear problem, work reliably on a clean clone, and preserve the privacy-first behavior described in its documentation.

## Before opening a pull request

Read the relevant tool README and inspect the current live demo if the change affects the interface. Do not add credentials, browser profiles, customer data, local databases, generated build output, or private session logs. Keep unrelated products out of the same pull request so a reviewer can understand the change and roll it back safely.

## Development expectations

Dependency-free tools should remain dependency-free unless a new dependency has a clear, documented benefit. Changes to `freelancer-toolkit` should use its pinned lockfile and should pass both TypeScript checking and the production build. For all tools, test the primary input flow, the primary action, local persistence, export or copy behavior, responsive layout, and service-worker behavior when applicable.

## Pull requests

Use a specific title that describes the user-visible result. The description should explain the problem, the change, the verification performed, any new privacy or security considerations, and how to roll back the change. Screenshots or a short screen recording are useful for interface changes. Do not merge unrelated formatting changes with functional work.

## Product and safety boundaries

Do not describe an organizational or educational tool as tax, legal, investment, medical, or accounting advice. Preserve existing disclaimers and add a clearer boundary when a feature could be misunderstood. Do not add unattended outbound email, paid advertising, payment collection, destructive infrastructure operations, or scraping without an explicit design review and an appropriate approval gate.

## Reporting a bug

Please use the bug-report template where possible. Include the tool name, browser and operating system, exact reproduction steps, expected behavior, actual behavior, and whether the issue affects stored local data. Never include private customer information or secrets in an issue.
