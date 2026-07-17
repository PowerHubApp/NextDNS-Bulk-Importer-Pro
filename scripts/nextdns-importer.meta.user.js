// ==UserScript==
// @name         NextDNS Bulk Importer Pro
// @namespace    https://github.com/PowerHubApp/NextDNS-Bulk-Importer-Pro
// @version      1.19
// @description  Bulk import automation tool designed for advanced NextDNS users. Easily manage TLDs, blocklists, denylists, allowlists, and rewrites with a responsive, clean interface.
// @author       PowerHub
// @icon         data:image/png;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI1MTIiIGN5PSI1MTIiIHI9IjUxMiIgc3R5bGU9ImZpbGw6IzA1ZiIvPgogIDxwYXRoIGQ9Ik0zODEuMSA2MDIuNmMtMzMuOC05NC41LTU0LjYtMTE3LjMtNTcuNi0xODEuNS0xLTE1LjMtMS0zMC42LjEtNDUuOSA0OS41LTkuOSA5Ni44LTI4LjkgMTQwLjktNTMuMiAxNi45LTkuNSAzMy41LTE9LjQgNDktMzEuMSAzNS45IDI2IDc1LjQgNDcgMTE2LjggNjIuNy04My4xIDgyLjgtMTY1LjggMTY2LjItMjQ5LjIgMjQ5bTI4NS0yMzdDNTc3LjggNDU0LjIgNDg5LjIgNTQyLjQgNDAwLjkgNjMxYzMwLjUgMzkuOSA2Ny41IDc1LjMgMTEwLjEgMTAyLjIgNjQuOC00Mi4xIDExOS0xMDEuMiAxNTIuNS0xNzEgMjguMi01OC4yIDQwLjEtMTIzLjggMzYuNC0xODguMy0xMS40LTIuNC0yMi43LTUtMzMuOC08LjNtNzUuOSAzNC43Yy0yLjkgNzItMjIuNyAxNDMuNS01OC40IDIwNi4yLTM2LjUgNjQuMy04OC4xIDExOS45LTE0OSAxNjEuOC0yLjggMi4xLTUuOSAzLjktOC45IDUuNy0yLjEgMS4yLTQuMSAyLjUtNi4xIDMuOWwtNiAzLjhjLTIuMyAxLjUtNC4xIDAtNC4xIDAtNDkuMS0zMC4zLTkyLTcwLTEyNy45LTExNS00OS02MS45LTgyLjctMTM2LjEtOTQuOS0yMTQuMi01LjMtMzMuMS02LjgtNjYuOC01LTEwMC4zLS4xLTUgMy45LTkuNCA4LjgtOS45IDU1LjYtMTEuMyAxMDguOS0zMi40IDE1OC43LTU5LjYgMjEuNC0xMiA0Mi43LTI0LjUgNjUtMzkuNiAwIDAgMy0yLjcgNS44LS4xIDUuOCA1LjIgMTIuNSA5LjMgMTguOSAxMy43IDU2LjMgMzcwIDExOC42IDY1LjYgMTg0LjMgODEuMSA1LjUgMS41IDExLjQgMS44IDE2LjcgNC4xIDQuNiAyLjUgNC44IDcuNyA1IDEyLjRsLjUgNi44di0uMWMuOSAxMyAuOSAyNi4zLS40IDM5LjNNVDcyMi41IDM1OGMtNzQuOS0xNi4zLTE0NS45LTQ5LjItMjA4LjctOTIuOS0xNS42IDExLjUtMzIuMyAyMS40LTQ5LjEgMzEtNTEuMiAyOC42LTEwNi4yIDUxLjItMTYzLjcgNjMuNi00LjcgODguNiAxOS4zIDE3OC40IDY2LjkgMjUzLjIgMzcwIDU4LjQgODYuMyAxMDguOSAxNDMuNyAxNDcuM0M1ODYgNzExLjggNjQ3IDY0Mi41IDY4My45IDU2MS43YzI5LjEtNjMuNSA0MS45LTEzNC4xIDM4LjYtMjAzLjciIHN0eWxlPSJmaWxsOiNmZmYiLz4KPC9zdmc+
// @updateURL    https://github.com/PowerHubApp/NextDNS-Bulk-Importer-Pro/raw/main/scripts/nextdns-importer.meta.user.js
// @downloadURL  https://github.com/PowerHubApp/NextDNS-Bulk-Importer-Pro/raw/main/scripts/nextdns-importer.user.js
// @supportURL   https://github.com/PowerHubApp/NextDNS-Bulk-Importer-Pro
// @license      MIT
// @match        https://my.nextdns.io/*
// @grant        GM_xmlhttpRequest
// @connect      api.nextdns.io
// @connect      cdn.jsdelivr.net
// @connect      *
// ==/UserScript==
