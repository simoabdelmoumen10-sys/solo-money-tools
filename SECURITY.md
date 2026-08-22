# Security policy

## Reporting a vulnerability

Please do not disclose suspected vulnerabilities, exposed credentials, privacy issues, or unsafe data-handling behavior in a public issue. Open a private security report through GitHub’s private vulnerability-reporting flow if it is enabled for the repository, or contact the maintainer through the address listed on the project’s profile and include the affected tool, a concise description, reproduction steps, and the minimum evidence needed to validate the issue.

Never include passwords, API keys, browser cookies, customer records, payment details, or full private documents in a report. Redact sensitive values and use placeholders.

## Scope

This policy covers the tools and source code in this repository, including the public catalog and the browser applications it links to. Third-party checkout pages, external APIs, and operating-system/browser vulnerabilities should be reported to their respective providers as well.

## Release hygiene

The repository should not contain credentials, browser profiles, local databases with personal data, session transcripts, generated runtime state, or private customer information. Releases should be checked for accidental secrets and should preserve the local-only data model of the offline tools.

## Response expectations

Reports are triaged by severity and reproducibility. A maintainer may request a minimal reproduction or a redacted sample. Please allow time for validation and remediation before public disclosure.
