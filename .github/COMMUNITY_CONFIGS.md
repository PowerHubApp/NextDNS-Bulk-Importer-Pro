# Community Showcase & Configurations

Welcome to the community configuration hub for [**NextDNS Bulk Importer Pro**](https://github.com/PowerHubApp/NextDNS-Bulk-Importer-Pro). This repository provides community-curated presets designed for direct compatibility with this script.

> [!WARNING]
> These configurations are community-contributed. Always audit rules before bulk-importing to ensure they do not disrupt your specific network requirements.

---

## 📁 Directory Structure & Syntax Guide

All files must follow the formats parsed by the importer's internal `RULES` engine.

```text
community/
├── tlds/       # .txt: TLD strings (e.g., ".xyz" | "*.xyz" | "xyz" | "||xyz^")
├── blocklist/  # .txt: List of valid NextDNS internal blocklist IDs
├── denylist/   # .txt: (e.g., "*.example.com" | "example.com" | "||example.com^")
├── allowlist/  # .txt: (e.g., "*.example.com" | "example.com" | "@@||example.com^")
├── rewrites/   # .txt: (e.g., "0.0.0.0 example.com" | "example.com 0.0.0.0" | "||example.com^$dnsrewrite=0.0.0.0")
└── config/     # .json: Full profile backup JSON Format (https://nextdns.github.io/api/#pagination)
