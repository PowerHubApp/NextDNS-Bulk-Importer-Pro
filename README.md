# NextDNS Bulk Importer Pro

A simple, fast tool to easily add or remove multiple domains all at once.

---

## Features
* **Bulk Add & Remove:** Bulk Add/Remove: TLDs, Blocklists, Denylists, Allowlists and Rewrites.
* **Hagezi’s AdBlock TLDs:** Supports Hagezi’s AdBlock TLDs. Select from the presets. NextDNS doesn’t support adding domains to TLDs, switch to denylist for that. *adding more soon*
* **Skip Duplicates:** Automatically skips duplicate domains to save time.
* **Supports AdBlock format:** Import your personal list in AdBlock format. Supports using *||example.com^*, *@@||example.com^*, *||example.com^$dnsrewrite=0.0.0.0 (IP only)*
* **Rate-Limit Optimization:** Automatically pauses and resumes when it reaches NextDNS api limit.
* **Logs:** Shows what was imported, skipped and failed.

---

## Compatible Userscript Manager
First, add a userscript manager extension to your web browser if you don't have one already:
* **Tampermonkey** (Recommended for Chrome, Edge, Safari, Firefox)
* **Violentmonkey** (Great open-source alternative)
* **Userscripts/Stay** (iOS alternative)
* **Firefox/Kiwi Browser** (Android alternative)

## Add the Script
* Navigate to the Script page at [GreasyFork](https://greasyfork.org/en/scripts/585661-nextdns-bulk-importer-pro) or [OpenUserJS](https://openuserjs.org/scripts/powerlimit/NextDNS_Bulk_Importer_Pro) and click Install.

* Open [This Link](https://cdn.jsdelivr.net/gh/PowerHubApp/NextDNS-Bulk-Importer-Pro@latest/scripts/nextdns-importer.user.js) and Import it to your Userscript Manager or copy and paste entire code into the editor.

## How to Use
1. Go to your [NextDNS Dashboard](https://my.nextdns.io/).
2. Click the new blue shield icon in the bottom-right corner to open the panel.
3. Choose what you want to import (Deny Lists, Allow Lists, TLDs, etc.).
4. Paste your list, upload a text file, or enter a URL, then click **Bulk Add** or **Bulk Remove**.

---

## Coming Soon

* NextDNS Bulk Importer Pro CLI/GUI tool for Linux, Mac OS and Windows
* Export/Import NextDNS Profiles
* Advanced Profile Editor
* More TLDs presets
