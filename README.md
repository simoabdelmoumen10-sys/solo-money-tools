# Solo Money Tools

A focused collection of small, offline-first tools for freelancers, solo operators, and independent creators. Each tool is designed to solve one recurring operational problem with minimal setup, no account wall, and a clear path from free utility to paid workflow system.

**Live catalog:** [simoabdelmoumen10-sys.github.io/solo-money-tools](https://simoabdelmoumen10-sys.github.io/solo-money-tools/)

**Commercial products:** [MONEYFORGE on Gumroad](https://simoabdel.gumroad.com)

## Why this repository exists

Solo operators do not need another oversized platform before they can make progress. This repository ships narrow, useful tools that work in a browser and respect the user’s data. The free tools are acquisition and utility products; the paid kits add reusable workflows, templates, and operating systems for people who want a more complete process.

## Free tools

| Tool | Best for | Live demo |
|---|---|---|
| **Freelancer Toolkit** | Invoices, clients, expenses, and cash flow | [Open tool](https://simoabdelmoumen10-sys.github.io/solo-money-tools/freelancer-toolkit/) |
| **Freelancer Irregular Income Tracker** | Rolling-average income planning and buffer targets | [Open tool](https://simoabdelmoumen10-sys.github.io/freelancer-income-tracker/) |
| **Cold Email Generator** | Drafting relevant, personalized outreach | [Open tool](https://simoabdelmoumen10-sys.github.io/solo-money-tools/cold-email-gen/) |
| **Contract Redliner** | Screening contract language before professional review | [Open tool](https://simoabdelmoumen10-sys.github.io/solo-money-tools/contract-redline/) |
| **Client Boundary Coach** | Handling scope creep, late payments, and unreasonable requests | [Open tool](https://simoabdelmoumen10-sys.github.io/solo-money-tools/client-boundary-coach/) |
| **Client Onboarding Kit** | Creating a more consistent client kickoff process | [Open tool](https://simoabdelmoumen10-sys.github.io/solo-money-tools/client-onboarding-kit/) |
| **Focus Timer** | Running focused work sessions with local statistics | [Open tool](https://simoabdelmoumen10-sys.github.io/solo-money-tools/focus-timer/) |
| **Habit Tracker** | Tracking recurring habits and streaks locally | [Open tool](https://simoabdelmoumen10-sys.github.io/solo-money-tools/habit-tracker/) |
| **Rate Checker** | Thinking through minimum sustainable rates | [Open tool](https://simoabdelmoumen10-sys.github.io/solo-money-tools/rate-checker/) |
| **Trader’s Risk & Journal** | Recording trades and reviewing risk decisions locally | [Open tool](https://simoabdelmoumen10-sys.github.io/solo-money-tools/traders-risk-journal/) |

The tools are provided for organization, drafting, and education. Financial, legal, tax, and health-related tools are not professional advice and should be reviewed with an appropriately qualified professional before consequential decisions.

## Paid workflow systems

The free tools are intentionally useful on their own. People who want deeper systems can find the paid catalog at [MONEYFORGE on Gumroad](https://simoabdel.gumroad.com), including the following products:

| Product | Focus |
|---|---|
| [AI Agent Arsenal](https://simoabdel.gumroad.com/l/ai-agent-arsenal) | Installable agent skills and plugin workflows |
| [Claude Code Revenue Pack](https://simoabdel.gumroad.com/l/claude-code-revenue-pack) | Revenue workflows packaged as slash commands |
| [Trader’s Risk & Journal OS](https://simoabdel.gumroad.com/l/traders-risk-journal-os) | A more complete trading-planning system |
| [Freelancer Second Brain](https://simoabdel.gumroad.com/l/freelancer-second-brain-notion) | A structured solo-business workspace |
| [Hard Conversations Suite](https://simoabdel.gumroad.com/l/hard-conversations-suite) | Scripts for difficult client conversations |

## Repository structure

The root `index.html` is the public catalog used by GitHub Pages. The small tools live in their own directories and are independently testable. Most tools are dependency-free HTML, CSS, and JavaScript applications. `freelancer-toolkit` is the exception: it includes a React/Vite source tree and a compiled Pages bundle because GitHub Pages serves static files rather than compiling TSX at request time.

```text
.
├── index.html
├── freelancer-toolkit/
├── cold-email-gen/
├── contract-redline/
├── client-boundary-coach/
├── client-onboarding-kit/
├── focus-timer/
├── habit-tracker/
├── rate-checker/
└── traders-risk-journal/
```

## Local development

For a dependency-free tool, open its `index.html` directly or serve the repository with any static HTTP server. For `freelancer-toolkit`, install the pinned dependencies and run its production build:

```bash
cd freelancer-toolkit
npm ci
npm run build
```

Generated `node_modules` and build output are local artifacts and should not be committed. Before a release, verify the primary input flow, local persistence, export or copy actions, responsive layout, and service-worker behavior where applicable.

## Privacy and data handling

The free browser tools are designed to keep ordinary working data on the device. Do not place credentials, browser profiles, customer records, payment data, or private session logs in this repository. Report suspected security issues privately using the process in [`SECURITY.md`](SECURITY.md).

## Contributing

Small, focused contributions are welcome. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request. Changes should preserve offline behavior, avoid unnecessary dependencies, include a clear verification note, and keep product claims proportional to what the code actually does.

## License

Tool source is released under the license in the relevant tool directory where one is present. Commercial product listings, brand assets, and paid-delivery files are not automatically licensed by the code in this repository; see the applicable product terms before redistributing them.
