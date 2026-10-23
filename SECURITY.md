# Security

Please report a vulnerability in private. Do not open a public issue, and do not include exploit detail in a pull request.

Email [hello@adamrichardturner.dev](mailto:hello@adamrichardturner.dev). You can also use [private vulnerability reporting](https://github.com/adamrichardturner/dsa/security/advisories/new) on this repository.

Include what you found, where it is in the code or on the site, and what an attacker could do with it. A maintainer will reply, confirm the report, and agree how to disclose it.

The lesson runner blocks `require`, imports, `process`, `eval`, and the `Function` constructor, and it stops a submission after ten seconds. That is enough for these exercises. It is not a hardened sandbox, so a bypass of those limits is worth a private report.
