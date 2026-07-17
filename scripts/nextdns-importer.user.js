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

(function () {
  'use strict';

  const HAGEZI_URL = "https://cdn.jsdelivr.net/gh/hagezi/dns-blocklists@latest/adblock/spam-tlds-adblock.txt";
  const DOM_RE = "(?:[a-z0-9](?:[a-z0-9\\-]{0,61}[a-z0-9])?\\.)+[a-z]{2,63}";
  const IP_RE = "(?:[0-9]{1,3}\\.){3}[0-9]{1,3}|(?:[a-f0-9:]+:+)+[a-f0-9]+";

  let isAborted = false;
  let isImporting = false;
  let importLogs = [];
  let globalRateLimitLock = false;
  let cachedAvailableBlocklists = [];

  const RULES = {
    denylist: new RegExp(`^(\\*\\.)?${DOM_RE}$|^\\|\\|${DOM_RE}\\^$`, 'i'),
    allowlist: new RegExp(`^(\\*\\.)?${DOM_RE}$|^@@\\|\\|${DOM_RE}\\^$`, 'i'),
    tld: /^\.?[a-z0-9\-]+$|^\ *\.?[a-z0-9\-]+$|^\|\|[a-z0-9\-]+\^$/i,
    rewrites: {
      domIp: new RegExp(`^(\\*\\.)?(${DOM_RE})\\s+(${IP_RE})$`, 'i'),
      ipDom: new RegExp(`^(${IP_RE})\\s+(\\*|\\*\\.)?(${DOM_RE})$`, 'i'),
      adblock: new RegExp(`^\\|\\|(${DOM_RE})\\^\\$dnsrewrite=(?:.+;)?(${IP_RE})$`, 'i')
    }
  };

  const styles = `
        #ndns-imp-btn {
            position: fixed; bottom: 24px; right: 24px; z-index: 2147483647;
            background: #0070f3; color: #fff; border: 1px solid #0070f3;
            width: 44px; height: 44px; padding: 0; border-radius: 50%;
            cursor: move; display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 14px rgba(0, 112, 243, 0.3); transition: transform 0.15s ease, background 0.15s ease;
            user-select: none; touch-action: none;
        }
        #ndns-imp-btn:hover { background: #1a80f5; border-color: #1a80f5; transform: scale(1.05); }
        #ndns-imp-btn:active { transform: scale(0.95); }
        #ndns-imp-btn svg { width: 22px; height: 22px; fill: currentColor; pointer-events: none; }

        #ndns-imp-pnl {
            position: fixed; bottom: 84px; right: 24px; z-index: 2147483646;
            border-radius: 12px; padding: 24px 20px 20px 20px;
            width: calc(100% - 48px); max-width: 420px; box-sizing: border-box;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15); font-family: inherit;
            display: none; border: 1px solid transparent;
            max-height: calc(100vh - 140px); overflow-y: auto;
            transition: border-color 0.15s ease, background-color 0.15s ease;
        }

        /* Resizing handles styling */
        .pnl-resize-l {
            position: absolute; top: 0; left: 0; width: 6px; height: 100%;
            cursor: w-resize; z-index: 2147483645;
        }
        .pnl-resize-t {
            position: absolute; top: 0; left: 0; width: 100%; height: 6px;
            cursor: n-resize; z-index: 2147483645;
        }
        .pnl-resize-tl {
            position: absolute; top: 0; left: 0; width: 14px; height: 14px;
            cursor: nwse-resize; z-index: 2147483646;
        }

        #ndns-imp-pnl.mac-fullscreen {
            max-width: 100% !important;
            max-height: 100% !important;
            width: 100% !important;
            height: 100% !important;
            top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
            border-radius: 0px !important;
            z-index: 2147483647;
        }
        #ndns-imp-pnl.mac-fullscreen textarea { height: 160px !important; }
        #ndns-imp-pnl.mac-fullscreen .bl-checkbox-list {
            max-height: calc(100vh - 460px) !important;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)) !important;
        }

        .mac-controls { display: flex; gap: 8px; position: absolute; top: 12px; left: 14px; cursor: pointer; z-index: 2147483646; }
        .mac-dot { width: 12px; height: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; }
        .mac-dot svg { width: 6px; height: 6px; opacity: 0; transition: opacity 0.15s ease; fill: rgba(0,0,0,0.5); }
        .mac-controls:hover .mac-dot svg { opacity: 1; }
        .mac-close { background: #ff5f56; border: 0.5px solid #e0443e; }
        .mac-minimize { background: #ffbd2e; border: 0.5px solid #dea123; }
        .mac-maximize { background: #27c93f; border: 0.5px solid #1aab29; }

        .pnl-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; margin-top: 4px; }
        .pnl-header h3 { margin: 0; font-size: 16px; font-weight: 600; letter-spacing: -0.2px; }
        #ndns-imp-refresh {
            background: transparent; border: none; font-size: 18px; cursor: pointer;
            padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center;
            transition: transform 0.2s ease, background 0.15s ease; user-select: none;
        }
        #ndns-imp-refresh:active { transform: rotate(45deg); }

        .imp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 16px; padding: 10px; border-radius: 7px; border: 1px solid transparent; }
        .imp-box { text-align: center; padding: 6px 0; cursor: pointer; border-radius: 6px; border: 2px solid transparent; transition: all 0.15s ease; }
        .imp-box:hover { background: rgba(0, 112, 243, 0.08) !important; border-color: rgba(0, 112, 243, 0.2); }
        .imp-box.active { background: rgba(0, 112, 243, 0.15) !important; border-color: #0070f3 !important; box-shadow: 0 0 8px rgba(0, 112, 243, 0.25); }
        .imp-val { font-size: 15px; font-weight: 700; color: #0070f3; font-family: monospace; text-decoration: underline; }
        .imp-box.active .imp-val { text-decoration: none; color: #0070f3 !important; }
        .imp-lbl { font-size: 10px; font-weight: 600; text-transform: uppercase; margin-top: 2px; }

        .lbl-row-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .imp-fld-lbl { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

        #toggle-endpoints-btn {
            background: transparent; border: 1px solid #0070f3; color: #0070f3;
            font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 5px;
            cursor: pointer; text-transform: uppercase; transition: background 0.12s, color 0.12s;
            outline: none; user-select: none;
        }
        #toggle-endpoints-btn:hover { background: rgba(0, 112, 243, 0.08); }

        .mini-copy-btn {
            background: transparent; border: none; padding: 2px; cursor: pointer;
            display: flex; align-items: center; justify-content: center; border-radius: 4px;
            transition: background 0.15s ease, color 0.15s ease; width: 20px; height: 20px;
        }
        .mini-copy-btn svg { width: 12px; height: 12px; fill: currentColor; }
        .mini-copy-btn:active { transform: scale(0.9); }

        .ndns-setup-pnl {
            background: rgba(0, 0, 0, 0.03); border-radius: 8px; padding: 10px;
            margin-bottom: 12px; border: 1px dashed rgba(0, 0, 0, 0.1); display: none;
        }
        .ndns-setup-row {
            display: flex; align-items: center; justify-content: space-between;
            font-size: 11px; margin-bottom: 6px; gap: 12px;
        }
        .ndns-setup-row:last-child { margin-bottom: 0; }
        .ndns-setup-key { font-weight: 600; color: #555; white-space: nowrap; flex-shrink: 0; }
        .ndns-setup-val {
            font-family: monospace; background: rgba(0, 112, 243, 0.05);
            padding: 2px 6px; border-radius: 4px; color: #0070f3; cursor: pointer;
            transition: background 0.12s, color 0.12s; flex: 1; min-width: 0;
            overflow-x: auto; white-space: nowrap; text-align: right; scrollbar-width: none;
        }
        .ndns-setup-val::-webkit-scrollbar { display: none; }
        .ndns-setup-val:hover { background: rgba(0, 112, 243, 0.12); }

        #ndns-imp-pnl select, #ndns-imp-pnl input, #ndns-imp-pnl textarea {
            width: 100%; margin-bottom: 12px; padding: 0 12px; border-radius: 7px;
            box-sizing: border-box; font-size: 14px; height: 38px; font-family: inherit;
            background: transparent; border: 1px solid transparent; outline: none;
        }
        #ndns-imp-pnl textarea { height: 90px; padding: 10px; font-family: monospace; font-size: 12px; resize: none; }
        #ndns-imp-pnl select:focus, #ndns-imp-pnl input:focus, #ndns-imp-pnl textarea:focus { border-color: #0070f3 !important; }
        .file-wrapper { margin-bottom: 12px; position: relative; }
        .file-wrapper input { display: none; }
        .file-lbl { display: flex; align-items: center; justify-content: center; height: 38px; border: 1px dashed transparent; border-radius: 7px; cursor: pointer; font-size: 13px; user-select: none; }
        .imp-row { display: flex; gap: 10px; margin-top: 4px; }
        .imp-row button { flex: 1; height: 38px; border-radius: 7px; font-size: 14px; font-weight: 500; cursor: pointer; box-sizing: border-box; font-family: inherit; border: 1px solid transparent; user-select: none; transition: all 0.15s ease; }
        .imp-row button:disabled { cursor: not-allowed; }
        #imp-start-add, #imp-start-remove { background: #0070f3; color: #fff; }
        #imp-start-add:hover:not(:disabled), #imp-start-remove:hover:not(:disabled) { background: #1a80f5; }

        #config-export-btn { background: #10b981; color: #fff; }
        #config-export-btn:hover:not(:disabled) { background: #059669; }
        #config-import-btn { background: #f59e0b; color: #fff; }
        #config-import-btn:hover:not(:disabled) { background: #d97706; }

        #ndns-imp-pnl span, #ndns-imp-pnl div { transition: color 0.2s ease; }
        #imp-status { margin-top: 12px; font-size: 13px; text-align: center; font-weight: 500; line-height: 1.4; white-space: pre-line; }

        .log-btn-container { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 6px auto 0 auto; width: fit-content; }
        #log-toggle-btn {
            display: none; background: transparent; border: 1px solid transparent; border-radius: 5px;
            padding: 4px 8px; font-size: 11px; font-weight: 600; cursor: pointer;
            text-transform: uppercase; font-family: inherit; transition: all 0.15s ease; user-select: none;
        }
        #log-display-area {
            display: none; width: 100%; height: 120px; font-family: monospace; font-size: 11px;
            padding: 8px; box-sizing: border-box; margin-top: 8px; border-radius: 6px;
            border: 1px solid transparent; overflow-y: auto; white-space: pre-wrap; word-break: break-all;
        }

        .bl-ctrl-row { display: none; justify-content: flex-end; gap: 12px; margin-bottom: 6px; }
        .bl-ctrl-btn { font-size: 11px; font-weight: 600; color: #0070f3; background: transparent; border: none; cursor: pointer; padding: 2px 4px; text-transform: uppercase; font-family: inherit; }
        .bl-ctrl-btn:hover { text-decoration: underline; }

        .bl-checkbox-list { max-height: 240px; overflow-y: auto; border: 1px solid transparent; padding: 10px; border-radius: 7px; margin-bottom: 12px; display: none; grid-template-columns: 1fr; gap: 4px; }
        .bl-item { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; padding: 4px; border-radius: 4px; }
        .bl-item:hover { background: rgba(0, 112, 243, 0.05); }
        .bl-item input { width: auto !important; margin-bottom: 0 !important; height: auto !important; cursor: pointer; flex-shrink: 0; }
        .bl-item span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        @media (max-width: 480px) {
            #ndns-imp-btn { bottom: 16px; right: 16px; width: 38px; height: 38px; }
            #ndns-imp-btn svg { width: 18px; height: 18px; }
            #ndns-imp-pnl {
                bottom: 0px !important; right: 0px !important; left: 0px !important;
                width: 100% !important; max-width: 100% !important; max-height: 80vh !important;
                border-radius: 12px 12px 0 0 !important; border-bottom: none !important;
                padding: 24px 14px 14px 14px;
            }
            #ndns-imp-pnl select, #ndns-imp-pnl input, #ndns-imp-pnl textarea, .file-lbl, .imp-row button { height: 34px; font-size: 13px; }
            #ndns-imp-pnl textarea { height: 75px; }
            .imp-grid { gap: 4px; padding: 6px; }
            .imp-val { font-size: 13px; }
            .imp-lbl { font-size: 9px; }
        }

        @media (max-height: 600px) {
            #ndns-imp-pnl:not(.mac-fullscreen) { top: auto; bottom: 10px; max-height: calc(100vh - 20px); }
            #ndns-imp-pnl:not(.mac-fullscreen) textarea { height: 60px; }
        }
    `;

  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);

  const floatingBtn = document.createElement("button");
  floatingBtn.id = "ndns-imp-btn";
  floatingBtn.title = "NextDNS Bulk Importer Pro v1.21";
  floatingBtn.innerHTML = `
       <svg viewBox="0 0 24 24">
           <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"/>
       </svg>
    `;
  document.body.appendChild(floatingBtn);

  const COPY_SVG = `<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;

  document.body.insertAdjacentHTML('beforeend', `
        <div id="ndns-imp-pnl">
            <div class="mac-controls">
                <div class="mac-dot mac-close" id="mac-ctrl-close" title="Terminate Script">
                    <svg viewBox="0 0 12 12"><path d="M2 2L10 10M10 2L2 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </div>
                <div class="mac-dot mac-minimize" id="mac-ctrl-min" title="Minimize Panel">
                    <svg viewBox="0 0 12 12"><line x1="1.5" y1="6" x2="10.5" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </div>
                <div class="mac-dot mac-maximize" id="mac-ctrl-max" title="Toggle Fullscreen">
                    <svg viewBox="0 0 12 12"><path d="M3 9L9 3M9 3H5M9 3v4M9 3L3 9M3 9h4M3 9V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </div>
            </div>

            <div class="pnl-header">
                <h3>NextDNS Bulk Importer Pro</h3>
                <button id="ndns-imp-refresh" title="Refresh data">↻</button>
            </div>

            <div class="imp-grid">
                <div class="imp-box" id="box-tlds" title="Click to view TLD List"><div class="imp-val" id="st-tlds">-</div><div class="imp-lbl">TLDs</div></div>
                <div class="imp-box" id="box-blocklists" title="Click to view Blocklists"><div class="imp-val" id="st-bl">-</div><div class="imp-lbl">Block Lists</div></div>
                <div class="imp-box" id="box-denylist" title="Click to view Denylist"><div class="imp-val" id="st-dl">-</div><div class="imp-lbl">Deny Lists</div></div>
                <div class="imp-box" id="box-allowlist" style="grid-column: span 1.5;" title="Click to view Allowlist"><div class="imp-val" id="st-al">-</div><div class="imp-lbl">Allow Lists</div></div>
                <div class="imp-box" id="box-rewrites" style="grid-column: span 1.5;" title="Click to view Rewrites"><div class="imp-val" id="st-rw">-</div><div class="imp-lbl">Rewrites</div></div>
            </div>

            <div class="lbl-row-container">
                <span class="imp-fld-lbl">Profile Configuration</span>
            </div>
            <select id="imp-prof"><option value="">Loading profiles...</option></select>

            <div class="lbl-row-container">
                <span class="imp-fld-lbl">Setup & Endpoints</span>
                <button id="toggle-endpoints-btn">Show</button>
            </div>
            <div class="ndns-setup-pnl" id="setup-panel">
                <div class="ndns-setup-row">
                    <span class="ndns-setup-key">Profile ID:</span>
                    <span class="ndns-setup-val" id="setup-id" title="Click to Copy">------</span>
                </div>
                <div class="ndns-setup-row">
                    <span class="ndns-setup-key">Link IP:</span>
                    <span class="ndns-setup-val" id="setup-linkip" title="Click to Link Network IP">------</span>
                </div>
                <div class="ndns-setup-row">
                    <span class="ndns-setup-key">DoH:</span>
                    <span class="ndns-setup-val" id="setup-doh" title="Click to Copy">https://dns.nextdns.io/...</span>
                </div>
                <div class="ndns-setup-row">
                    <span class="ndns-setup-key">DoH3:</span>
                    <span class="ndns-setup-val" id="setup-doh3" title="Click to Copy">https://doh3.dns.nextdns.io/...</span>
                </div>
                <div class="ndns-setup-row">
                    <span class="ndns-setup-key">Anycast DoH:</span>
                    <span class="ndns-setup-val" id="setup-anydoh" title="Click to Copy">https://anycast.dns.nextdns.io/...</span>
                </div>
                <div class="ndns-setup-row">
                    <span class="ndns-setup-key">Ultralow DoH:</span>
                    <span class="ndns-setup-val" id="setup-ultradoh" title="Click to Copy">https://ultralow.dns.nextdns.io/...</span>
                </div>
                <div class="ndns-setup-row">
                    <span class="ndns-setup-key">DoT / DoQ:</span>
                    <span class="ndns-setup-val" id="setup-dot" title="Click to Copy">...dns.nextdns.io</span>
                </div>
            </div>

            <input type="hidden" id="imp-type" value="denylist">

            <div id="p-wrap" style="display: none;">
                <div class="lbl-row-container">
                    <span class="imp-fld-lbl">TLD Presets</span>
                </div>
                <select id="imp-preset">
                    <option value="hagezi-adblock" selected>Hagezi’s AdBlock TLDs</option>
                    <option value="custom">More soon…</option>
                    <option value="custom">Custom</option>
                </select>
            </div>

            <div class="bl-ctrl-row" id="bl-ctrl-actions">
                <button class="bl-ctrl-btn" id="bl-master-all">Select All</button>
                <button class="bl-ctrl-btn" id="bl-master-none">Deselect All</button>
            </div>
            <div id="bl-wrap" class="bl-checkbox-list">
                 <div style="padding: 10px; text-align: center; font-size: 12px; opacity: 0.6; grid-column: 1/-1;">Loading NextDNS blocklist catalog...</div>
            </div>

            <div id="src-wrap">
                <div class="lbl-row-container" id="src-url-lbl">
                    <span class="imp-fld-lbl">Remote URL</span>
                    <button class="mini-copy-btn" id="copy-url-btn" title="Copy URL text">${COPY_SVG}</button>
                </div>
                <input type="text" id="imp-url" placeholder="https://example.com/list.txt">

                <div class="lbl-row-container" id="src-file-lbl">
                    <span class="imp-fld-lbl">Local file</span>
                </div>
                <div class="file-wrapper" id="src-file-wrap">
                    <label for="imp-file" class="file-lbl" id="fl-lbl">select file</label>
                    <input type="file" id="imp-file" accept=".txt,.hosts,.box,text/plain">
                </div>

                <div class="lbl-row-container">
                    <span class="imp-fld-lbl">Input</span>
                    <button class="mini-copy-btn" id="copy-input-btn" title="Copy input box contents">${COPY_SVG}</button>
                </div>
                <textarea id="imp-input"></textarea>
            </div>

            <div class="imp-row">
                <button id="imp-start-add">Bulk Add</button>
                <button id="imp-start-remove">Bulk Remove</button>
            </div>
            <div class="imp-row" style="margin-top: 8px;">
                <button id="config-export-btn" title="Backup profile configurations to JSON">Export Config</button>
                <button id="config-import-btn" title="Restore profile configurations from JSON">Import Config</button>
            </div>
            <div id="imp-status">Initializing...</div>
            <div class="log-btn-container">
                <button id="log-toggle-btn">Show Log</button>
                <button class="mini-copy-btn" id="log-copy-btn" title="Copy raw extraction logs">${COPY_SVG}</button>
            </div>
            <div id="log-display-area"></div>
        </div>
    `);

  const pnl = document.getElementById("ndns-imp-pnl");
  const status = document.getElementById("imp-status");
  const profSel = document.getElementById("imp-prof");
  const typeSel = document.getElementById("imp-type");
  const presetSel = document.getElementById("imp-preset");
  const pWrap = document.getElementById("p-wrap");
  const blWrap = document.getElementById("bl-wrap");
  const blCtrlRow = document.getElementById("bl-ctrl-actions");
  const srcWrap = document.getElementById("src-wrap");
  const txtInput = document.getElementById("imp-input");
  const urlInput = document.getElementById("imp-url");
  const fileInput = document.getElementById("imp-file");
  const flLbl = document.getElementById("fl-lbl");
  const logToggleBtn = document.getElementById("log-toggle-btn");
  const logCopyBtn = document.getElementById("log-copy-btn");
  const logDisplayArea = document.getElementById("log-display-area");
  const refreshBtn = document.getElementById("ndns-imp-refresh");
  const addBtn = document.getElementById("imp-start-add");
  const removeBtn = document.getElementById("imp-start-remove");
  const exportConfigBtn = document.getElementById("config-export-btn");
  const importConfigBtn = document.getElementById("config-import-btn");
  let cancelBtn = null;

  const stTlds = document.getElementById("st-tlds");
  const stBl = document.getElementById("st-bl");
  const stDl = document.getElementById("st-dl");
  const stAl = document.getElementById("st-al");
  const stRw = document.getElementById("st-rw");

  const impGrid = pnl.querySelector(".imp-grid");
  const formInputs = pnl.querySelectorAll("select, input, textarea, .file-lbl, .bl-checkbox-list");
  const formLabels = pnl.querySelectorAll(".imp-fld-lbl, .imp-lbl, #imp-status");
  const copyButtons = pnl.querySelectorAll(".mini-copy-btn");

  const setupId = document.getElementById("setup-id");
  const setupLinkIp = document.getElementById("setup-linkip");
  const setupDoh = document.getElementById("setup-doh");
  const setupDoh3 = document.getElementById("setup-doh3");
  const setupAnydoh = document.getElementById("setup-anydoh");
  const setupUltradoh = document.getElementById("setup-ultradoh");
  const setupDot = document.getElementById("setup-dot");
  const setupPanel = document.getElementById("setup-panel");
  const toggleEndpointsBtn = document.getElementById("toggle-endpoints-btn");

  let isDarkTheme = false;
  let isSyncingTokens = false;

  // Dynamically created hidden element for importing config files
  const configFileInput = document.createElement("input");
  configFileInput.type = "file";
  configFileInput.accept = ".json";
  configFileInput.style.display = "none";
  document.body.appendChild(configFileInput);

  // Initialize custom resize triggers
  makeResizable(pnl);

  toggleEndpointsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isCurrentlyHidden = window.getComputedStyle(setupPanel).display === "none";
    if (isCurrentlyHidden) {
      setupPanel.style.display = "block";
      toggleEndpointsBtn.innerText = "Hide";
    }
    else {
      setupPanel.style.display = "none";
      toggleEndpointsBtn.innerText = "Show";
    }
  });

  /**
   * WINDOW RESIZING ENGINE
   * Implements edge-bound resizers. Calculates offsets to scale container towards top-left.
   */
  function makeResizable(targetPnl) {
    const resizerL = document.createElement('div');
    resizerL.className = 'pnl-resize-l';
    const resizerT = document.createElement('div');
    resizerT.className = 'pnl-resize-t';
    const resizerTL = document.createElement('div');
    resizerTL.className = 'pnl-resize-tl';

    targetPnl.appendChild(resizerL);
    targetPnl.appendChild(resizerT);
    targetPnl.appendChild(resizerTL);

    let isResizing = false;
    let activeHandle = null;
    let startWidth, startHeight, startX, startY;

    function startResize(e, handle) {
      e.preventDefault();
      e.stopPropagation();
      isResizing = true;
      activeHandle = handle;
      startX = e.clientX;
      startY = e.clientY;
      const rect = targetPnl.getBoundingClientRect();
      startWidth = rect.width;
      startHeight = rect.height;
      handle.setPointerCapture(e.pointerId);
    }

    function resize(e) {
      if (!isResizing) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      targetPnl.style.maxWidth = 'none';
      targetPnl.style.maxHeight = 'none';

      if (activeHandle === resizerL || activeHandle === resizerTL) {
        const newWidth = Math.max(320, Math.min(window.innerWidth - 48, startWidth - deltaX));
        targetPnl.style.width = newWidth + 'px';
      }
      if (activeHandle === resizerT || activeHandle === resizerTL) {
        const newHeight = Math.max(350, Math.min(window.innerHeight - 100, startHeight - deltaY));
        targetPnl.style.height = newHeight + 'px';
      }
    }

    function stopResize(e) {
      if (!isResizing) return;
      isResizing = false;
      if (activeHandle) {
        try {
          activeHandle.releasePointerCapture(e.pointerId);
        }
        catch (_) {}
      }
      activeHandle = null;
    }

    resizerL.addEventListener('pointerdown', (e) => startResize(e, resizerL));
    resizerT.addEventListener('pointerdown', (e) => startResize(e, resizerT));
    resizerTL.addEventListener('pointerdown', (e) => startResize(e, resizerTL));

    window.addEventListener('pointermove', resize);
    window.addEventListener('pointerup', stopResize);
    window.addEventListener('pointercancel', stopResize);
  }

  function updateEndpoints(profileId) {
    if (!profileId) {
      setupId.innerText = "------";
      setupLinkIp.innerText = "------";
      setupLinkIp.removeAttribute("data-copy");
      setupDoh.innerText = "https://dns.nextdns.io/...";
      setupDoh3.innerText = "https://doh3.dns.nextdns.io/...";
      setupAnydoh.innerText = "https://anycast.dns.nextdns.io/...";
      setupUltradoh.innerText = "https://ultralow.dns.nextdns.io/...";
      setupDot.innerText = "...dns.nextdns.io";
      return;
    }

    setupId.innerText = profileId;
    setupId.setAttribute("data-copy", profileId);

    setupLinkIp.innerText = "Loading...";
    setupLinkIp.removeAttribute("data-copy");
    loadLinkedIp(profileId);

    setupDoh.innerText = `https://dns.nextdns.io/${profileId}`;
    setupDoh.setAttribute("data-copy", `https://dns.nextdns.io/${profileId}`);

    setupDoh3.innerText = `https://doh3.dns.nextdns.io/${profileId}`;
    setupDoh3.setAttribute("data-copy", `https://doh3.dns.nextdns.io/${profileId}`);

    setupAnydoh.innerText = `https://anycast.dns.nextdns.io/${profileId}`;
    setupAnydoh.setAttribute("data-copy", `https://anycast.dns.nextdns.io/${profileId}`);

    setupUltradoh.innerText = `https://ultralow.dns.nextdns.io/${profileId}`;
    setupUltradoh.setAttribute("data-copy", `https://ultralow.dns.nextdns.io/${profileId}`);

    setupDot.innerText = `${profileId}.dns.nextdns.io`;
    setupDot.setAttribute("data-copy", `${profileId}.dns.nextdns.io`);
  }

  let linkedIpRequestId = 0;
  async function loadLinkedIp(profileId) {
    const requestId = ++linkedIpRequestId;
    try {
      const res = await fetch(`https://api.nextdns.io/profiles/${profileId}/setup`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (requestId !== linkedIpRequestId) return;
      if (!res.ok) throw new Error();
      const json = await res.json();
      const info = json?.data || json;

      const currentLinkedIp = info?.linkedIp?.ip || (typeof info?.linkedIp === 'string' ? info.linkedIp : '') || info?.setup?.linkedIp || "";
      const linkUrl = info?.linkedIp?.link || "";

      if (currentLinkedIp) {
        setupLinkIp.innerText = currentLinkedIp;
        setupLinkIp.setAttribute("data-copy", currentLinkedIp);
        setupLinkIp.setAttribute("title", `Currently linked WAN IP: ${currentLinkedIp}. Click to update/re-link.`);
      }
      else {
        setupLinkIp.innerText = "Not Linked (Click to Link)";
        setupLinkIp.removeAttribute("data-copy");
        setupLinkIp.setAttribute("title", "Click to link your network public IP address.");
      }

      if (linkUrl) {
        setupLinkIp.setAttribute("data-link-url", linkUrl);
      }
      else {
        setupLinkIp.removeAttribute("data-link-url");
      }
    }
    catch {
      if (requestId !== linkedIpRequestId) return;
      setupLinkIp.innerText = "Unavailable";
      setupLinkIp.removeAttribute("data-copy");
      setupLinkIp.removeAttribute("data-link-url");
    }
  }

  function setupCopyListeners() {
    const setupVals = pnl.querySelectorAll(".ndns-setup-val");
    setupVals.forEach(el => {
      el.addEventListener("click", async () => {
        if (el.id === "setup-linkip") {
          const profileId = profSel.value;
          if (!profileId || el.innerText === "Loading..." || el.innerText === "Linking...") return;

          const originalText = el.innerText;
          el.innerText = "Linking...";
          el.style.color = "#0070f3";

          const linkUrl = el.getAttribute("data-link-url") || `https://link-ip.nextdns.io/${profileId}`;

          const fallbackFetchLink = async () => {
            try {
              const response = await fetch(linkUrl, {
                method: 'GET',
                mode: 'cors'
              });
              const respText = await response.text();

              if (respText && respText.trim() && !respText.includes("{") && !respText.includes("<")) {
                const cleanIp = respText.trim();
                el.innerText = cleanIp;
                el.setAttribute("data-copy", cleanIp);
              }
              else {
                el.innerText = "Linked!";
              }

              el.style.color = "#42b983";
              setTimeout(() => {
                loadLinkedIp(profileId);
                el.style.color = "";
              }, 1800);
            }
            catch (err) {
              el.innerText = "Failed";
              el.style.color = "#ff6b6b";
              setTimeout(() => {
                el.innerText = originalText;
                el.style.color = "";
              }, 1500);
            }
          };

          if (typeof GM_xmlhttpRequest !== "undefined") {
            GM_xmlhttpRequest({
              method: "GET",
              url: linkUrl,
              headers: {
                "Accept": "text/html,text/plain"
              },
              onload: (response) => {
                if (response.status >= 200 && response.status < 400) {
                  const respText = response.responseText;
                  if (respText && respText.trim() && !respText.includes("{") && !respText.includes("<")) {
                    const cleanIp = respText.trim();
                    el.innerText = cleanIp;
                    el.setAttribute("data-copy", cleanIp);
                  }
                  else {
                    el.innerText = "Linked!";
                  }
                  el.style.color = "#42b983";
                  setTimeout(() => {
                    loadLinkedIp(profileId);
                    el.style.color = "";
                  }, 1800);
                }
                else {
                  fallbackFetchLink();
                }
              },
              onerror: () => {
                fallbackFetchLink();
              }
            });
          }
          else {
            await fallbackFetchLink();
          }
          return;
        }

        const textToCopy = el.getAttribute("data-copy") || el.innerText;
        if (!textToCopy || textToCopy.includes("...") || textToCopy.includes("---") || textToCopy === "Unavailable") return;

        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalText = el.innerText;
          el.innerText = "Copied!";
          el.style.color = "#42b983";
          setTimeout(() => {
            el.innerText = originalText;
            el.style.color = "";
          }, 1000);
        });
      });
    });
  }

  function getOrdinalAttemptText(count) {
    const ordinals = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
    return ordinals[count - 1] || `${count}th`;
  }

  function syncCheckboxesToTextarea() {
    if (isSyncingTokens || typeSel.value !== 'blocklists') return;
    isSyncingTokens = true;

    const checkedIds = [];
    const checkboxes = blWrap.querySelectorAll("input[type='checkbox']");
    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) checkedIds.push(checkboxes[i].value);
    }

    txtInput.value = checkedIds.join('\n');
    isSyncingTokens = false;
  }

  function syncTextareaToCheckboxes() {
    if (isSyncingTokens || typeSel.value !== 'blocklists') return;
    isSyncingTokens = true;

    const currentTokens = new Set(
      txtInput.value.split('\n').map(r => r.trim().toLowerCase()).filter(Boolean)
    );

    const checkboxes = blWrap.querySelectorAll("input[type='checkbox']");
    for (let i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = currentTokens.has(checkboxes[i].value.toLowerCase());
    }

    isSyncingTokens = false;
  }

  txtInput.addEventListener('input', syncTextareaToCheckboxes);

  async function loadDynamicNextDNSBlocklists() {
    const profId = profSel.value;
    if (!profId) return;

    let data = null;
    try {
      const res = await fetch(`https://api.nextdns.io/profiles/${profId}/privacy/blocklists/available`, {
        method: 'GET',
        credentials: 'include'
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) data = json.data;
      }
    }
    catch (e) {}

    if (!data) {
      try {
        const globalRes = await fetch(`https://api.nextdns.io/privacy/blocklists`, {
          method: 'GET',
          credentials: 'include'
        });
        if (globalRes.ok) {
          const globalJson = await globalRes.json();
          if (globalJson?.data) data = globalJson.data;
        }
      }
      catch (e) {}
    }

    if (data) {
      cachedAvailableBlocklists = data;

      let htmlBuffer = '';
      for (let i = 0; i < cachedAvailableBlocklists.length; i++) {
        const bl = cachedAvailableBlocklists[i];
        htmlBuffer += `
                    <label class="bl-item" title="${bl.name || bl.id}">
                        <input type="checkbox" value="${bl.id}">
                        <span>${bl.name || bl.id}</span>
                    </label>
                `;
      }
      blWrap.innerHTML = htmlBuffer;

      const checkboxes = blWrap.querySelectorAll("input[type='checkbox']");
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].addEventListener('change', syncCheckboxesToTextarea);
      }

      syncTextareaToCheckboxes();
      themeSync();
    }
    else {
      blWrap.innerHTML = '<div style="padding: 10px; text-align: center; font-size: 12px; color: #ff6b6b; grid-column: 1/-1;">Failed to populate live NextDNS blocklist map.</div>';
    }
  }

  document.getElementById("bl-master-all").addEventListener("click", () => {
    const checkboxes = blWrap.querySelectorAll("input[type='checkbox']");
    for (let i = 0; i < checkboxes.length; i++) checkboxes[i].checked = true;
    syncCheckboxesToTextarea();
  });
  document.getElementById("bl-master-none").addEventListener("click", () => {
    const checkboxes = blWrap.querySelectorAll("input[type='checkbox']");
    for (let i = 0; i < checkboxes.length; i++) checkboxes[i].checked = false;
    syncCheckboxesToTextarea();
  });

  function updateActiveGridBox(currentType) {
    pnl.querySelectorAll(".imp-box").forEach(box => box.classList.remove("active"));
    let targetBoxId = "";
    if (currentType === "tld") targetBoxId = "box-tlds";
    else if (currentType === "blocklists") targetBoxId = "box-blocklists";
    else if (currentType === "denylist") targetBoxId = "box-denylist";
    else if (currentType === "allowlist") targetBoxId = "box-allowlist";
    else if (currentType === "rewrites") targetBoxId = "box-rewrites";

    const targetBox = document.getElementById(targetBoxId);
    if (targetBox) targetBox.classList.add("active");
  }

  function themeSync() {
    const firstMatch = window.getComputedStyle(document.body).color.match(/\d+/);
    isDarkTheme = firstMatch && parseInt(firstMatch[0], 10) > 140;

    pnl.style.background = isDarkTheme ? "#1c1e22" : "#ffffff";
    pnl.style.color = isDarkTheme ? "#ffffff" : "#111111";
    pnl.style.borderColor = isDarkTheme ? "#2f343c" : "#eaeaea";
    impGrid.style.background = isDarkTheme ? "#131517" : "#fafafa";
    impGrid.style.borderColor = isDarkTheme ? "#2f343c" : "#eaeaea";

    setupPanel.style.background = isDarkTheme ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)";
    setupPanel.style.borderColor = isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
    const setupKeys = pnl.querySelectorAll(".ndns-setup-key");
    setupKeys.forEach(el => el.style.color = isDarkTheme ? "#aaa" : "#555");

    toggleEndpointsBtn.style.color = isDarkTheme ? "#38bdf8" : "#0070f3";
    toggleEndpointsBtn.style.borderColor = isDarkTheme ? "#38bdf8" : "#0070f3";

    const inputBg = isDarkTheme ? "#131517" : "#ffffff";
    const inputColor = isDarkTheme ? "#ffffff" : "#111111";
    const inputBorder = isDarkTheme ? "#2f343c" : "#eaeaea";
    for (let i = 0; i < formInputs.length; i++) {
      const el = formInputs[i];
      el.style.background = inputBg;
      el.style.color = inputColor;
      el.style.borderColor = inputBorder;
    }

    const labelColor = isDarkTheme ? "#8892b0" : "#666666";
    for (let i = 0; i < formLabels.length; i++) {
      const el = formLabels[i];
      if (el.id !== "imp-status") {
        el.style.color = labelColor;
      }
    }

    for (let i = 0; i < copyButtons.length; i++) {
      copyButtons[i].style.color = labelColor;
    }

    if (status.children.length === 0) {
      const txt = status.innerText;
      if (txt === "Ready") {
        status.style.color = "#42b983";
      }
      else if (txt === "Operation Cancelled" || txt.startsWith("Error")) {
        status.style.color = "#ff6b6b";
      }
      else {
        status.style.color = labelColor;
      }
    }

    [addBtn, removeBtn, exportConfigBtn, importConfigBtn].forEach((btn) => {
      if (btn === cancelBtn) {
        btn.style.background = "#ff6b6b";
        btn.style.color = "#ffffff";
        btn.style.borderColor = "#ff6b6b";
      }
      else if (btn.disabled) {
        btn.style.background = isDarkTheme ? "#2f343c" : "#eaeaea";
        btn.style.color = isDarkTheme ? "#8892b0" : "#999999";
        btn.style.borderColor = "transparent";
      }
      else {
        btn.style.background = "";
        btn.style.color = "";
        btn.style.borderColor = "";
      }
    });

    refreshBtn.style.color = labelColor;
    logToggleBtn.style.borderColor = isDarkTheme ? "#3a3f47" : "#eaeaea";
    logToggleBtn.style.color = labelColor;
    logDisplayArea.style.background = isDarkTheme ? "#131517" : "#fafafa";
    logDisplayArea.style.borderColor = isDarkTheme ? "#2f343c" : "#eaeaea";
    logDisplayArea.style.color = isDarkTheme ? "#a2aabf" : "#444444";
  }

  function setStatusError(message) {
    status.innerHTML = message;
    status.style.color = "#ff6b6b";
  }

  function setStatusReady() {
    status.innerHTML = "Ready";
    status.style.color = "#42b983";
  }

  function setStatusText(message) {
    status.innerHTML = message;
    status.style.color = isDarkTheme ? "#8892b0" : "#666666";
  }

  function renderSegmentedSummary(processed, skipped, failed, isRemoveMode = false) {
    const neutralColor = isDarkTheme ? "#8892b0" : "#666666";
    const finalActionColor = processed === 0 ? neutralColor : (isRemoveMode ? "#ff6b6b" : "#42b983");
    const finalFailColor = failed === 0 ? neutralColor : "#ff6b6b";

    status.style.color = "inherit";
    status.innerHTML = `<span style="color: ${finalActionColor};">${isRemoveMode ? 'Removed' : 'Imported'}: ${processed}</span>  <span style="color: ${neutralColor};">Skipped: ${skipped}</span>  <span style="color: ${finalFailColor};">Failed: ${failed}</span>`;
  }

  const hints = {
    denylist: "example.com\n*.example.com\n||example.com^",
    allowlist: "example.com\n*.example.com\n@@||example.com^",
    rewrites: "example.com 1.1.1.1\n||example.com^$dnsrewrite=0.0.0.0\n1.1.1.1 example.com",
    tld: ".xyz\nxyz\n*.xyz\n||xyz^",
    blocklists: "Checking checkbox options will write live tokens here automatically."
  };

  function uiToggle() {
    const currentType = typeSel.value;
    txtInput.placeholder = hints[currentType] || "";

    const isTld = currentType === 'tld';
    const isBlocklists = currentType === 'blocklists';

    pWrap.style.display = isTld ? "block" : "none";
    blWrap.style.display = isBlocklists ? "grid" : "none";
    blCtrlRow.style.display = isBlocklists ? "flex" : "none";

    const isBlocklistDisplay = isBlocklists ? "none" : "flex";
    const isBlocklistBlock = isBlocklists ? "none" : "block";

    document.getElementById("src-url-lbl").style.display = isBlocklistDisplay;
    urlInput.style.display = isBlocklistBlock;
    document.getElementById("src-file-lbl").style.display = isBlocklistDisplay;
    document.getElementById("src-file-wrap").style.display = isBlocklistBlock;
    srcWrap.style.display = "block";

    updateActiveGridBox(currentType);
  }

  function setButtonsIdle() {
    cancelBtn = null;
    addBtn.disabled = false;
    removeBtn.disabled = false;
    exportConfigBtn.disabled = false;
    importConfigBtn.disabled = false;
    addBtn.innerText = "Bulk Add";
    removeBtn.innerText = "Bulk Remove";
    importConfigBtn.innerText = "Import Config";
    themeSync();
  }

  function setButtonsRunning(mode) {
    if (mode === "remove") {
      removeBtn.disabled = true;
      addBtn.disabled = false;
      addBtn.innerText = "Cancel";
      cancelBtn = addBtn;
      exportConfigBtn.disabled = true;
      importConfigBtn.disabled = true;
    }
    else if (mode === "import-config") {
      addBtn.disabled = true;
      removeBtn.disabled = true;
      exportConfigBtn.disabled = true;
      importConfigBtn.disabled = false;
      importConfigBtn.innerText = "Cancel";
      cancelBtn = importConfigBtn;
    }
    else {
      addBtn.disabled = true;
      removeBtn.disabled = false;
      removeBtn.innerText = "Cancel";
      cancelBtn = removeBtn;
      exportConfigBtn.disabled = true;
      importConfigBtn.disabled = true;
    }
    themeSync();
  }

  function abortImport() {
    if (!isImporting) return;
    isAborted = true;
    isImporting = false;
    status.innerText = "Operation Cancelled";
    status.style.color = "#ff6b6b";
    importConfigBtn.innerText = "Import Config";
    setButtonsIdle();
  }

  presetSel.addEventListener("change", uiToggle);

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      flLbl.innerText = `📄 ${fileInput.files[0].name}`;
      flLbl.style.borderColor = "#0070f3";
      flLbl.style.color = "#0070f3";
    }
    else {
      flLbl.innerText = "select file";
      themeSync();
    }
  });

  let isDragging = false;
  let dragDistanceMoved = 0;
  let startX, startY, startLeft, startTop;

  floatingBtn.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    isDragging = true;
    dragDistanceMoved = 0;
    startX = e.clientX;
    startY = e.clientY;

    const rect = floatingBtn.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;

    floatingBtn.style.bottom = "auto";
    floatingBtn.style.right = "auto";
    floatingBtn.style.left = startLeft + "px";
    floatingBtn.style.top = startTop + "px";

    floatingBtn.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  floatingBtn.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    dragDistanceMoved += Math.abs(deltaX) + Math.abs(deltaY);

    floatingBtn.style.left = (startLeft + deltaX) + "px";
    floatingBtn.style.top = (startTop + deltaY) + "px";
  });

  floatingBtn.addEventListener("pointerup", (e) => {
    if (!isDragging) return;
    isDragging = false;
    floatingBtn.releasePointerCapture(e.pointerId);

    if (dragDistanceMoved < 6) {
      themeSync();
      pnl.style.display = pnl.style.display === "block" ? "none" : "block";
    }
  });

  floatingBtn.addEventListener("pointercancel", (e) => {
    isDragging = false;
    try {
      floatingBtn.releasePointerCapture(e.pointerId);
    }
    catch (_) {}
  });

  floatingBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener("pointerdown", (e) => {
    if (pnl.style.display === "block") {
      const clickedInsidePanel = pnl.contains(e.target);
      const clickedButton = floatingBtn.contains(e.target) || e.target === floatingBtn;

      if (!clickedInsidePanel && !clickedButton) {
        pnl.style.display = "none";
      }
    }
  });

  pnl.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
  });

  document.getElementById("mac-ctrl-close").addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    isAborted = true;
    pnl.remove();
    floatingBtn.remove();
    styleSheet.remove();
  });

  document.getElementById("mac-ctrl-min").addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    pnl.style.display = "none";
  });

  document.getElementById("mac-ctrl-max").addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    pnl.classList.toggle("mac-fullscreen");
  });

  refreshBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    themeSync();
    fetchStats(profSel.value);
    loadDynamicNextDNSBlocklists();
  });

  addBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (addBtn === cancelBtn) {
      abortImport();
      return;
    }
    if (isImporting || !profSel.value) return;
    setButtonsRunning("add");
    runImport("add");
  });

  removeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (removeBtn === cancelBtn) {
      abortImport();
      return;
    }
    if (isImporting || !profSel.value) return;
    setButtonsRunning("remove");
    runImport("remove");
  });

  exportConfigBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isImporting || !profSel.value) return;
    exportProfileConfig();
  });

  importConfigBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (importConfigBtn === cancelBtn) {
      abortImport();
      return;
    }
    if (isImporting || !profSel.value) return;
    configFileInput.click();
  });

  configFileInput.addEventListener("change", async () => {
    if (configFileInput.files.length > 0) {
      try {
        setStatusText("Reading configuration file...");
        const fileText = await readTextFile(configFileInput.files[0]);
        const parsedConfig = JSON.parse(fileText);

        if (!parsedConfig || typeof parsedConfig !== 'object') {
          throw new Error("Invalid configuration format.");
        }

        setButtonsRunning("import-config");
        await importProfileConfig(parsedConfig);
      }
      catch (err) {
        setStatusError("Error: Invalid config JSON file.");
        setButtonsIdle();
      }
      finally {
        configFileInput.value = "";
      }
    }
  });

  logToggleBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isHidden = window.getComputedStyle(logDisplayArea).display === "none";

    if (isHidden) {
      logDisplayArea.style.display = "block";
      logToggleBtn.innerText = "Hide Log";
      logDisplayArea.scrollTop = logDisplayArea.scrollHeight;
    }
    else {
      logDisplayArea.style.display = "none";
      logToggleBtn.innerText = "Show Log";
    }
  });

  function executeClipboardWrite(textValue, triggerBtnElement) {
    if (!textValue) return;
    navigator.clipboard.writeText(textValue).then(() => {
      const preservedColor = triggerBtnElement.style.color;
      triggerBtnElement.style.color = "#42b983";
      setTimeout(() => {
        triggerBtnElement.style.color = preservedColor;
      }, 800);
    }).catch(() => {});
  }

  document.getElementById("copy-url-btn").addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    executeClipboardWrite(urlInput.value, e.currentTarget);
  });

  document.getElementById("copy-input-btn").addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    executeClipboardWrite(txtInput.value, e.currentTarget);
  });

  logCopyBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    executeClipboardWrite(logDisplayArea.innerText, e.currentTarget);
  });

  async function fetchListAndPopulate(endpoint, mapFn, syncTypeKey) {
    const profId = profSel.value;
    if (!profId) return;
    setStatusText("Fetching live list data from cloud...");
    try {
      let typeKey = syncTypeKey;
      if (syncTypeKey === "blocklists") typeKey = "blocklists";
      if (syncTypeKey === "tld") typeKey = "tld";

      const data = await getExisting(profId, typeKey);

      typeSel.value = syncTypeKey;

      if (data && data.length > 0) {
        txtInput.value = data.map(mapFn).join('\n');
        uiToggle();
        if (syncTypeKey === "blocklists") {
          syncTextareaToCheckboxes();
        }
        setStatusReady();
      }
      else {
        txtInput.value = "";
        uiToggle();
        if (syncTypeKey === "blocklists") {
          syncTextareaToCheckboxes();
        }
        setStatusText("List is empty.");
      }
    }
    catch {
      setStatusError("Failed to fetch target cloud list.");
    }
  }

  document.getElementById("box-tlds").addEventListener("click", () => fetchListAndPopulate('security/tlds', i => i.id, 'tld'));
  document.getElementById("box-blocklists").addEventListener("click", () => fetchListAndPopulate('privacy/blocklists', i => i.id, 'blocklists'));
  document.getElementById("box-denylist").addEventListener("click", () => fetchListAndPopulate('denylist', i => i.id, 'denylist'));
  document.getElementById("box-allowlist").addEventListener("click", () => fetchListAndPopulate('allowlist', i => i.id, 'allowlist'));
  document.getElementById("box-rewrites").addEventListener("click", () => fetchListAndPopulate('rewrites', i => `${i.name} ${i.content}`, 'rewrites'));

  async function fetchStats(profId) {
    if (!profId) return;
    const targets = {
      tlds: 'security/tlds',
      blocklists: 'privacy/blocklists',
      denylist: 'denylist',
      allowlist: 'allowlist',
      rewrites: 'rewrites'
    };
    const boxes = {
      tlds: stTlds,
      blocklists: stBl,
      denylist: stDl,
      allowlist: stAl,
      rewrites: stRw
    };

    stTlds.innerText = "...";
    stBl.innerText = "...";
    stDl.innerText = "...";
    stAl.innerText = "...";
    stRw.innerText = "...";

    for (const [k, endpoint] of Object.entries(targets)) {
      try {
        const res = await fetch(`https://api.nextdns.io/profiles/${profId}/${endpoint}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        const count = json?.data ? json.data.length : 0;
        const hasMore = json?.meta?.pagination?.cursor ? "+" : ""; // Append '+' if a paging cursor exists
        boxes[k].innerText = `${count}${hasMore}`;
      }
      catch {
        boxes[k].innerText = "err";
      }
    }
    updateActiveGridBox(typeSel.value);
  }

  profSel.addEventListener("change", () => {
    fetchStats(profSel.value);
    updateEndpoints(profSel.value);
    loadDynamicNextDNSBlocklists();
  });

  async function initProfiles() {
    try {
      const res = await fetch('https://api.nextdns.io/profiles', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (json?.data) {
        profSel.innerHTML = '';
        const activeId = window.location.pathname.split('/')[1] || '';
        for (let i = 0; i < json.data.length; i++) {
          const p = json.data[i];
          const el = document.createElement('option');
          el.value = p.id;
          el.innerText = `${p.name || 'Unnamed'} (${p.id})`;
          if (p.id === activeId) el.selected = true;
          profSel.appendChild(el);
        }
        setStatusReady();
        uiToggle();
        fetchStats(profSel.value);
        updateEndpoints(profSel.value);
        loadDynamicNextDNSBlocklists();
        themeSync();
      }
    }
    catch {
      setStatusError("Auth Initialization Error");
    }
  }
  setTimeout(() => {
    initProfiles();
    setupCopyListeners();
  }, 1000);

  function readTextFile(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = (e) => resolve(e.target.result);
      r.onerror = () => reject();
      r.readAsText(file);
    });
  }

  function fetchListUrl(url) {
    return new Promise((resolve, reject) => {
      if (typeof GM_xmlhttpRequest === "undefined") return reject();
      GM_xmlhttpRequest({
        method: "GET",
        url: url,
        onload: (res) => (res.status >= 200 && res.status < 300) ? resolve(res.responseText) : reject(),
        onerror: () => reject()
      });
    });
  }

  async function sendRequest(url, method, payload, attemptCount = 1) {
    if (isAborted) return;

    while (globalRateLimitLock) {
      await new Promise(r => setTimeout(r, 200));
      if (isAborted) return;
    }

    const res = await fetch(url, {
      method: method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: payload ? JSON.stringify(payload) : undefined
    });

    if (res.status === 429) {
      if (globalRateLimitLock) {
        return await sendRequest(url, method, payload, attemptCount);
      }

      globalRateLimitLock = true;
      let retryAfterHeader = parseInt(res.headers.get("Retry-After"), 10);
      let totalDelaySeconds = !isNaN(retryAfterHeader) && retryAfterHeader > 0 ? retryAfterHeader : 15;

      const targetEndTime = Date.now() + (totalDelaySeconds * 1000);

      while (Date.now() < targetEndTime) {
        if (isAborted) {
          globalRateLimitLock = false;
          return;
        }
        let remainingSecs = Math.max(1, Math.ceil((targetEndTime - Date.now()) / 1000));
        setStatusText(`⚠️ Rate limited!\nPausing for ${remainingSecs}s...`);
        await new Promise(r => setTimeout(r, 250));
      }

      globalRateLimitLock = false;
      attemptCount++;
      const retryLabel = getOrdinalAttemptText(attemptCount);
      setStatusText(`trying again ${retryLabel} time.`);
      await new Promise(r => setTimeout(r, 250));

      return await sendRequest(url, method, payload, attemptCount);
    }
    if (!res.ok) throw new Error();
  }

  function runStrictParser(text, type) {
    const lines = text.split('\n');
    let valid = [];
    let failedValidationCount = 0;

    if (type === 'blocklists') {
      const officialSet = new Set(cachedAvailableBlocklists.map(b => b.id.toLowerCase()));
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line || line[0] === '#' || line[0] === '!') continue;
        let idToken = line.toLowerCase();
        if (officialSet.size === 0 || officialSet.has(idToken)) {
          valid.push({
            raw: line,
            id: idToken
          });
        }
        else {
          failedValidationCount++;
          importLogs.push(`[SKIPPED (UNSUPPORTED NEXTDNS ID)] ${line}`);
        }
      }
      return {
        valid,
        failedValidationCount
      };
    }

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line || line[0] === '#' || line[0] === '!' || line.startsWith('//') || (line[0] === '[' && line[line.length - 1] === ']')) continue;

      if (type === 'denylist' || type === 'allowlist' || type === 'tld') {
        if (RULES[type].test(line)) {
          let token = line.replace(/^@@\|\||^\|\||^@@|^\*\\\.|\*\./i, '').replace(/\^$/, '').toLowerCase();
          if (type === 'tld' && token[0] === '.') token = token.substring(1);
          valid.push({
            raw: line,
            id: token
          });
        }
        else {
          failedValidationCount++;
          importLogs.push(`[FAILED (SYNTAX)] ${line}`);
        }
      }
      else if (type === 'rewrites') {
        let m1 = line.match(RULES.rewrites.domIp);
        let m2 = line.match(RULES.rewrites.ipDom);
        let m3 = line.match(RULES.rewrites.adblock);

        if (m1) {
          valid.push({
            domain: m1[2].replace(/^(\*\.|\.)/, '').toLowerCase(),
            ip: m1[3]
          });
        }
        else if (m2) {
          valid.push({
            domain: m2[3].replace(/^(\*\.|\.)/, '').toLowerCase(),
            ip: m2[1]
          });
        }
        else if (m3) {
          valid.push({
            domain: m3[1].toLowerCase(),
            ip: m3[2]
          });
        }
        else {
          failedValidationCount++;
          importLogs.push(`[FAILED (SYNTAX)] ${line}`);
        }
      }
    }
    return {
      valid,
      failedValidationCount
    };
  }

  /**
   * PAGINATED GET IMPLEMENTATION (NextDNS API Documentation Format)
   * Recursively fetches list pages using the `cursor` param until cursor evaluates to null.
   */
  async function getExisting(profId, type) {
    let endpoint = type === 'tld' ? 'security/tlds' : (type === 'blocklists' ? 'privacy/blocklists' : type);
    let url = `https://api.nextdns.io/profiles/${profId}/${endpoint}`;
    let allData = [];
    let cursor = null;

    do {
      let requestUrl = url;
      if (cursor) {
        requestUrl += `?cursor=${encodeURIComponent(cursor)}`;
      }

      try {
        const res = await fetch(requestUrl, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        if (!res.ok) {
          if (res.status === 429) {
            let retryAfter = parseInt(res.headers.get("Retry-After"), 10) || 5;
            await new Promise(r => setTimeout(r, retryAfter * 1000));
            continue;
          }
          break;
        }
        const json = await res.json();
        if (json?.data) {
          allData = allData.concat(json.data);
        }
        cursor = json?.meta?.pagination?.cursor || null;
      }
      catch {
        break;
      }
      await new Promise(r => setTimeout(r, 100));
    } while (cursor);

    return allData;
  }

  /**
   * CONFIGURATION BACKUP EXPORTER
   * Recursively reads Allow/Deny Lists, TLDs, Blocklists and DNS Rewrites into a backup file.
   */
  async function exportProfileConfig() {
    const profId = profSel.value;
    if (!profId) {
      setStatusError("Error: Select a profile first.");
      return;
    }

    setStatusText("Exporting configuration... Please wait.");

    const configKeys = {
      denylist: 'denylist',
      allowlist: 'allowlist',
      tlds: 'tld',
      blocklists: 'blocklists',
      rewrites: 'rewrites'
    };

    let exportedConfig = {
      version: 1.0,
      profileId: profId,
      timestamp: new Date().toISOString(),
      denylist: [],
      allowlist: [],
      tlds: [],
      blocklists: [],
      rewrites: []
    };

    try {
      for (const [key, type] of Object.entries(configKeys)) {
        setStatusText(`Exporting: ${key}...`);
        const items = await getExisting(profId, type);

        if (key === 'denylist' || key === 'allowlist' || key === 'tlds') {
          exportedConfig[key] = items.map(item => ({
            id: item.id,
            active: item.active !== false
          }));
        }
        else if (key === 'blocklists') {
          exportedConfig[key] = items.map(item => ({
            id: item.id
          }));
        }
        else if (key === 'rewrites') {
          exportedConfig[key] = items.map(item => ({
            name: item.name,
            content: item.content
          }));
        }
      }

      const profileNameOpt = profSel.options[profSel.selectedIndex];
      const profileName = profileNameOpt ? profileNameOpt.innerText.split(' (')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase() : profId;
      const filename = `nextdns_config_${profileName}_${profId}.json`;
      const blob = new Blob([JSON.stringify(exportedConfig, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusReady();
      status.innerText = "Config Exported Successfully!";
      status.style.color = "#42b983";
    }
    catch (err) {
      setStatusError("Failed to export complete configuration.");
    }
  }

  /**
   * CONFIGURATION RESTORE IMPORTER
   * Validates and imports full profile configurations, skipping duplicate cloud entries safely.
   */
  async function importProfileConfig(config) {
    const profId = profSel.value;
    if (!profId) {
      setStatusError("Error: Select a profile first.");
      return;
    }

    isImporting = true;
    isAborted = false;
    importLogs = [];
    globalRateLimitLock = false;

    logToggleBtn.style.display = "none";
    logCopyBtn.style.display = "none";
    logDisplayArea.style.display = "none";
    logToggleBtn.innerText = "Show Log";
    themeSync();

    let totalAdded = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    const categories = [{
        key: 'denylist',
        type: 'denylist',
        endpoint: 'denylist'
      },
      {
        key: 'allowlist',
        type: 'allowlist',
        endpoint: 'allowlist'
      },
      {
        key: 'tlds',
        type: 'tld',
        endpoint: 'security/tlds'
      },
      {
        key: 'blocklists',
        type: 'blocklists',
        endpoint: 'privacy/blocklists'
      },
      {
        key: 'rewrites',
        type: 'rewrites',
        endpoint: 'rewrites'
      }
    ];

    try {
      for (const cat of categories) {
        if (isAborted) break;

        const list = config[cat.key];
        if (!Array.isArray(list) || list.length === 0) continue;

        setStatusText(`Syncing ${cat.key}...`);
        const existing = await getExisting(profId, cat.type);
        const cacheMap = new Set();
        for (let i = 0; i < existing.length; i++) {
          let item = existing[i];
          let key = cat.type === 'rewrites' ? `${item.name.toLowerCase().trim()}:::${item.content}` : item.id.toLowerCase().trim();
          cacheMap.add(key);
        }

        let toAdd = [];
        for (let item of list) {
          if (cat.type === 'rewrites') {
            if (!item.name || !item.content) continue;
            let key = `${item.name.toLowerCase().trim()}:::${item.content}`;
            if (!cacheMap.has(key)) {
              toAdd.push({
                domain: item.name,
                ip: item.content
              });
            }
            else {
              totalSkipped++;
              importLogs.push(`[SKIPPED (DUPLICATE)] Rewrite ${item.name} -> ${item.content}`);
            }
          }
          else {
            let itemVal = item.id || item;
            if (typeof itemVal !== 'string') continue;
            let lookupKey = itemVal.toLowerCase().trim();
            if (!cacheMap.has(lookupKey)) {
              toAdd.push({
                id: itemVal
              });
            }
            else {
              totalSkipped++;
              importLogs.push(`[SKIPPED (DUPLICATE)] ${cat.key}: ${itemVal}`);
            }
          }
        }

        if (toAdd.length === 0) continue;

        let endpointBase = `https://api.nextdns.io/profiles/${profId}/${cat.endpoint}`;

        for (let i = 0; i < toAdd.length; i++) {
          if (isAborted) break;

          let item = toAdd[i];
          let label = cat.type === 'rewrites' ? item.domain : item.id;
          let targetUrl = endpointBase;
          let method = "POST";
          let payload = cat.type === 'rewrites' ? {
            name: item.domain,
            content: item.ip
          } : {
            id: item.id
          };

          if (!globalRateLimitLock) {
            setStatusText(`Importing ${cat.key}: (${i + 1}/${toAdd.length})\nProcessing [ ${label.substring(0, 22)} ]\nAdded: ${totalAdded} Skipped: ${totalSkipped} Failed: ${totalFailed}`);
          }

          try {
            await sendRequest(targetUrl, method, payload);
            if (!isAborted) {
              totalAdded++;
              importLogs.push(`[IMPORTED ${cat.key.toUpperCase()}] ${label}`);
            }
          }
          catch {
            totalFailed++;
            importLogs.push(`[FAILED ${cat.key.toUpperCase()} (API ERROR)] ${label}`);
          }

          if (!isAborted && i < toAdd.length - 1) {
            await new Promise(r => setTimeout(r, 200));
          }
        }
      }

      isImporting = false;
      if (isAborted) {
        status.innerText = "Operation Cancelled";
        status.style.color = "#ff6b6b";
      }
      else {
        status.style.color = "inherit";
        status.innerHTML = `<span style="color: #42b983;">Imported: ${totalAdded}</span>  <span style="color: ${isDarkTheme ? "#8892b0" : "#666666"};">Skipped: ${totalSkipped}</span>  <span style="color: ${totalFailed === 0 ? (isDarkTheme ? "#8892b0" : "#666666") : "#ff6b6b"};">Failed: ${totalFailed}</span>`;

        logDisplayArea.innerText = importLogs.join('\n');
        logToggleBtn.style.display = "block";
        logCopyBtn.style.display = "inline-flex";
      }
      setButtonsIdle();
      fetchStats(profId);
    }
    catch (err) {
      isImporting = false;
      setStatusError("Failed to import configuration fully.");
      setButtonsIdle();
    }
  }

  async function runImport(mode) {
    const profId = profSel.value;
    const type = typeSel.value;
    const preset = presetSel.value;
    const isRemoveMode = mode === "remove";
    const isBlocklists = type === "blocklists";

    isImporting = true;
    isAborted = false;
    importLogs = [];
    globalRateLimitLock = false;

    logToggleBtn.style.display = "none";
    logCopyBtn.style.display = "none";
    logDisplayArea.style.display = "none";
    logToggleBtn.innerText = "Show Log";
    themeSync();

    if (isBlocklists) {
      let selectedBls = [];
      const checkedBoxes = pnl.querySelectorAll("#bl-wrap input[type='checkbox']:checked");
      for (let i = 0; i < checkedBoxes.length; i++) {
        selectedBls.push(checkedBoxes[i].value);
      }
      let textRows = txtInput.value.split('\n').map(r => r.trim()).filter(Boolean);
      let unified = Array.from(new Set([...selectedBls, ...textRows]));
      txtInput.value = unified.join('\n');
    }

    let combinedContentPieces = [];

    if (!isBlocklists && !isRemoveMode && type === 'tld' && preset === 'hagezi-adblock') {
      try {
        setStatusText("Downloading Preset...");
        let presetData = await fetchListUrl(HAGEZI_URL);
        combinedContentPieces.push(presetData);
      }
      catch {
        importLogs.push("[ERROR] Failed to fetch Hagezi TLD preset remote map.");
      }
    }

    const cleanUrl = urlInput.value.trim();
    if (!isBlocklists && cleanUrl !== "") {
      try {
        setStatusText("Downloading Remote URL stream...");
        let urlData = await fetchListUrl(cleanUrl);
        combinedContentPieces.push(urlData);
      }
      catch {
        importLogs.push(`[ERROR] Failed to download URL stream: ${cleanUrl}`);
      }
    }

    if (!isBlocklists && fileInput.files.length > 0) {
      try {
        setStatusText("Reading localized upload file...");
        let fileData = await readTextFile(fileInput.files[0]);
        combinedContentPieces.push(fileData);
      }
      catch {
        importLogs.push("[ERROR] Failed to read chosen local text file stream.");
      }
    }

    if (txtInput.value.trim() !== "") combinedContentPieces.push(txtInput.value);

    let content = combinedContentPieces.join('\n');

    if (content.trim() === "") {
      isImporting = false;
      setStatusError("Error: No source input provided.");
      setButtonsIdle();
      return;
    }

    if (isAborted) {
      isImporting = false;
      status.innerText = "Operation Cancelled";
      status.style.color = "#ff6b6b";
      setButtonsIdle();
      return;
    }

    setStatusText("Analyzing Whitelist Rules...");
    const parsed = runStrictParser(content, type);
    let valid = parsed.valid;
    let failed = parsed.failedValidationCount;
    let skipped = 0;
    let processedCounter = 0;

    let deduplicatedValid = [];
    let seenKeys = new Set();
    for (let i = 0; i < valid.length; i++) {
      let item = valid[i];
      let itemKey = type === 'rewrites' ? `${item.domain}:::${item.ip}` : item.id;
      if (!seenKeys.has(itemKey)) {
        seenKeys.add(itemKey);
        deduplicatedValid.push(item);
      }
      else {
        skipped++;
      }
    }

    if (deduplicatedValid.length === 0) {
      isImporting = false;
      renderSegmentedSummary(processedCounter, skipped, failed, isRemoveMode);
      logDisplayArea.innerText = importLogs.join('\n');
      logToggleBtn.style.display = "block";
      logCopyBtn.style.display = "inline-flex";
      setButtonsIdle();
      fetchStats(profId);
      return;
    }

    setStatusText("Synchronizing data maps...");
    const rawCache = await getExisting(profId, type);
    const cacheMap = new Map();
    for (let i = 0; i < rawCache.length; i++) {
      let item = rawCache[i];
      let key = type === 'rewrites' ? item.name.toLowerCase().trim() : item.id.toLowerCase().trim();
      cacheMap.set(key, item.id);
    }

    let queue = [];
    for (let i = 0; i < deduplicatedValid.length; i++) {
      let item = deduplicatedValid[i];
      let lookupKey = type === 'rewrites' ? item.domain : item.id;
      const exists = cacheMap.has(lookupKey);

      if (isRemoveMode) {
        if (exists) queue.push({
          ...item,
          cloudId: cacheMap.get(lookupKey)
        });
        else {
          skipped++;
          importLogs.push(`[SKIPPED (NOT FOUND)] ${lookupKey}`);
        }
      }
      else {
        if (exists) {
          skipped++;
          importLogs.push(`[SKIPPED (DUPLICATE)] ${lookupKey}`);
        }
        else queue.push(item);
      }
    }

    if (queue.length === 0) {
      isImporting = false;
      renderSegmentedSummary(processedCounter, skipped, failed, isRemoveMode);
      logDisplayArea.innerText = importLogs.join('\n');
      logToggleBtn.style.display = "block";
      logCopyBtn.style.display = "inline-flex";
      setButtonsIdle();
      fetchStats(profId);
      return;
    }

    let endpointBase = `https://api.nextdns.io/profiles/${profId}/${type === 'tld' ? 'security/tlds' : (type === 'blocklists' ? 'privacy/blocklists' : type)}`;

    for (let i = 0; i < queue.length; i++) {
      if (isAborted) break;

      let item = queue[i];
      let label = type === 'rewrites' ? item.domain : item.id;
      let targetUrl = endpointBase;
      let method = "POST";
      let payload = null;

      if (isRemoveMode) {
        method = "DELETE";
        targetUrl = `${endpointBase}/${encodeURIComponent(item.cloudId || item.id)}`;
      }
      else {
        payload = type === 'rewrites' ? {
          name: item.domain,
          content: item.ip
        } : {
          id: item.id
        };
      }

      if (!globalRateLimitLock) {
        setStatusText("Queue: (" + (i + 1) + "/" + queue.length + ")\nProcessing [ ." + label.substring(0, 22) + " ]\n" + (isRemoveMode ? 'Removed' : 'Imported') + ": " + processedCounter + " Skipped: " + skipped + " Failed: " + failed);
      }

      try {
        await sendRequest(targetUrl, method, payload);
        if (!isAborted) {
          processedCounter++;
          importLogs.push(`[${isRemoveMode ? 'REMOVED' : 'IMPORTED'}] ${label}`);
        }
      }
      catch {
        failed++;
        importLogs.push(`[FAILED (API ERROR)] ${label}`);
      }

      if (!isAborted && i < queue.length - 1) {
        await new Promise(r => setTimeout(r, 200));
      }
    }

    isImporting = false;
    if (isAborted) {
      status.innerText = "Operation Cancelled";
      status.style.color = "#ff6b6b";
    }
    else {
      renderSegmentedSummary(processedCounter, skipped, failed, isRemoveMode);
      txtInput.value = "";
      urlInput.value = "";
      fileInput.value = "";
      flLbl.innerText = "select file";
      const checkboxes = pnl.querySelectorAll("#bl-wrap input[type='checkbox']");
      for (let i = 0; i < checkboxes.length; i++) checkboxes[i].checked = false;
      logDisplayArea.innerText = importLogs.join('\n');
      logToggleBtn.style.display = "block";
      logCopyBtn.style.display = "inline-flex";
    }
    setButtonsIdle();
    uiToggle();
    fetchStats(profId);
  }
})();
