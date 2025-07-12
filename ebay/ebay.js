// ==UserScript==
// @name         Spotless for eBay
// @namespace    https://github.com/OsborneLabs
// @version      1.3
// @description  Highlights and hides sponsored content on eBay
// @author       Osborne Labs
// @license      GPL-3
// @homepageURL  https://github.com/OsborneLabs/Spotless
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNDcwLjYgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIj4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxLjQwNjU5MzQwNjU5MzQwMTYgMS40MDY1OTM0MDY1OTM0MDE2KSBzY2FsZSgyLjgxIDIuODEpIj4KICAgIDxwYXRoIGZpbGw9IiM4NDg0ODQiIGQ9Ik0xMjcuOCw0Ni4xSDM4LjdWNDJjMC0yMy40LDE5LjEtNDIuNSw0Mi41LTQyLjVoNC4xYzIzLjQsMCw0Mi41LDE5LjEsNDIuNSw0Mi41VjQ2LjF6IE00Mi43LDQyaDgxVjQyIGMwLTIxLjItMTcuMi0zOC40LTM4LjQtMzguNGgtNC4xQzYwLDMuNSw0Mi43LDIwLjgsNDIuNyw0Mkw0Mi43LDQyeiI+PC9wYXRoPgogICAgPHBhdGggZmlsbD0iI0U1MzIzOCIgZD0iTTM1LjEsMTgxLjdoLTkuNmMtMTQuMywwLTI1LjktMTEuNi0yNS45LTI1LjlWNDkuNGMwLTUuMiw0LjMtOS41LDkuNS05LjVoMjYuMUwzNS4xLDE4MS43TDM1LjEsMTgxLjd6Ij48L3BhdGg+CiAgICA8cmVjdCB4PSIzNS4xIiB5PSIzOS45IiBmaWxsPSIjMDA2NEQyIiB3aWR0aD0iNDguMSIgaGVpZ2h0PSIxNDEuOCI+PC9yZWN0PgogICAgPHJlY3QgeD0iODMuMiIgeT0iMzkuOSIgZmlsbD0iI0Y1QUYwMiIgd2lkdGg9IjQ4LjEiIGhlaWdodD0iMTQxLjgiPjwvcmVjdD4KICAgIDxwYXRoIGZpbGw9IiM4NkI4MTciIGQ9Ik0xNDEsMTgxLjdoLTkuNlYzOS45aDI2LjFjNS4yLDAsOS41LDQuMyw5LjUsOS41djEwNi40QzE2NywxNzAuMSwxNTUuMywxODEuNywxNDEsMTgxLjd6Ij48L3BhdGg+CiAgPC9nPgo8L3N2Zz4K
// @match        https://www.ebay.com/sch/*
// @match        https://www.ebay.at/sch/*
// @match        https://www.ebay.ca/sch/*
// @match        https://www.ebay.ch/sch/*
// @match        https://www.ebay.com.au/sch/*
// @match        https://www.ebay.com.hk/sch/*
// @match        https://www.ebay.com.my/sch/*
// @match        https://www.ebay.com.sg/sch/*
// @match        https://www.ebay.co.uk/sch/*
// @match        https://www.ebay.de/sch/*
// @match        https://www.ebay.es/sch/*
// @match        https://www.ebay.fr/sch/*
// @match        https://www.ebay.ie/sch/*
// @match        https://www.ebay.it/sch/*
// @match        https://www.ebay.nl/sch/*
// @match        https://www.ebay.pl/sch/*
// @run-at       document-start
// @downloadURL  https://update.greasyfork.org/scripts/541981/Spotless%20for%20eBay.user.js
// @updateURL    https://update.greasyfork.org/scripts/541981/Spotless%20for%20eBay.meta.js
// @grant        none
// ==/UserScript==

/* jshint esversion: 11 */

(function() {
    "use strict";

    const APP_TITLE = "Spotless";
    const SPONSORED_CONTENT_KEY = "hideSponsoredContent";

    let hidingEnabled = localStorage.getItem(SPONSORED_CONTENT_KEY);
    hidingEnabled = hidingEnabled !== "false";
    let highlightedSponsoredContent = [];

    let isProcessing = false;
    let updateScheduled = false;
    let observerInitialized = false;

    const SVG_ICONS = {
        locked: `
            <svg class="lock-icon lockSVG" id="lockedIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 2C9.79 2 8 3.79 8 6v4H7c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-1V6c0-2.21-1.79-4-4-4zm-2 8V6c0-1.1.9-2 2-2s2 .9 2 2v4h-4z"/>
            </svg>`,
        unlocked: `
            <svg class="lock-icon lockSVG" id="unlockedIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M17 8V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2h-1z"/>
            </svg>`,
        arrow: `
            <svg id="arrowIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5z"/>
            </svg>`,
        heart: `
            <svg class="heart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>`
    };

    function init() {
        initializeUI();
        processSponsoredContent();
    }

    function initializeUI() {
        createStyles();
        buildPanel();
    }

    function createStyles() {
        const style = document.createElement("style");
        style.textContent = `
            :root {

                --size-font-title: 18px;
                --size-font-body: 14px;
                --size-font-body-error: 16px;
                --size-font-footer: 12px;

                --color-bubble: #e74c3c;
                --color-divider-border: rgba(255, 255, 255, 0.1);
                --color-font-text: white;
                --color-font-link-hover: lightblue;
                --color-font-link-visited: lightblue;
                --color-highlight-background: #ffe6e6;
                --color-highlight-border: red;
                --color-panel: rgba(34, 50, 70, 0.85);
                --color-panel-shadow: 0 8px 20px rgba(0, 0, 0, 0.20);
                --color-row: rgba(20, 30, 45, 0.5);
                --color-svg-fill: white;
                --color-svg-fill-heart-hover: red;
                --color-switch-knob: white;
                --color-switch-off: #ccc;
                --color-switch-on: #2AA866;
                --color-switch-on-shadow: 0 0 4px rgba(39, 174, 96, 0.3);

                --thickness-highlight-border: 2px;
            }

            #panelWrapper {
                position: fixed;
                bottom: 10px;
                right: 5px;
                z-index: 2147483647;
                width: 100%;
                max-width: 320px;
                padding: 0 16px;
                box-sizing: border-box;
                font-family: "Segoe UI", sans-serif;
            }

            @media (max-width: 768px) {
                #panelWrapper {
                    bottom: 5px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 90% !important;
                    right: unset;
                    padding: 0 16px;
                }
            }

            #panelBox {
                display: flex;
                flex-direction: column;
                gap: 0px;
                background: var(--color-panel);
                backdrop-filter: blur(10px);
                color: var(--color-font-text);
                padding: 16px;
                border-radius: 12px;
                width: 100%;
                box-shadow: var(--color-panel-shadow);
                transition: transform 0.2s ease;
            }

            #panelBox:hover {
                transform: translateY(-2px);
            }

            #panelHeader {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            #panelHeader h2.panel-title {
                font-size: var(--size-font-title);
                font-weight: 600;
                margin: 0;
                color: var(--color-font-text);
            }

            .panel-body-row {
                margin: 0;
                font-size: var(--size-font-body);
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: var(--color-row);
                backdrop-filter: blur(12px);
                padding: 12px 16px;
                border-radius: 8px;
            }

            .panel-body-row + .panel-body-row {
                margin-top: 5px;
            }

            .panelFooter {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 6px;
                font-size: var(--size-font-footer);
                color: var(--color-font-text);
            }

            .panelPageContainer {
                position: relative;
                width: 100%;
            }

            hr.section-divider {
                flex-grow: 1;
                border: none;
                border-top: 1px solid var(--color-divider-border);
                margin: 12px 0;
            }

            #minimizePanelButton {
                width: 28px;
                height: 28px;
                margin-left: auto;
                padding: 2px;
                border: none;
                background: none;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-sizing: content-box;
            }

            #panelBox.minimized #arrowIcon {
                transform: rotate(180deg);
            }

            #panelBox.minimized {
                padding: 12px;
                overflow: hidden;
            }

            .lock-icon {
                width: 24px;
                height: 24px;
                padding: 4px;
                border-radius: 50%;
                fill: var(--color-svg-fill);
            }

            .lockSVG {
                position: absolute;
                top: 0;
                left: 0;
                width: 28px;
                height: 28px;
                opacity: 0;
                transition: opacity 0.4s ease, transform 0.4s ease;
                transform: rotate(0deg);
            }

            .lockSVG.active {
                opacity: 1;
                transform: rotate(360deg);
            }

            #lockIconContainer {
                position: relative;
                width: 28px;
                height: 28px;
            }

            #arrowIcon {
                width: 28px;
                height: 28px;
                fill: var(--color-svg-fill);
                transition: transform 0.3s ease;
            }

            .heart-icon {
                width: 10px;
                height: 10px;
                vertical-align: middle;
                fill: var(--color-svg-fill);
            }

            .heart-icon:hover {
                fill: var(--color-svg-fill-heart-hover);
            }

            #countBubble {
                background-color: var(--color-bubble);
                color: var(--color-font-text);
                font-size: 12px;
                font-weight: bold;
                padding: 3px 8px;
                border-radius: 999px;
                min-width: 20px;
                text-align: center;
            }

            .switch {
                position: relative;
                display: inline-block;
                width: 42px;
                height: 22px;
            }

            .switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .switch-label {
                margin-right: 10px;
            }

            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: var(--color-switch-off);
                transition: 0.3s;
                border-radius: 34px;
            }

            .slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                top: 2px;
                left: 2px;
                background-color: var(--color-switch-knob);
                transition: 0.3s;
                border-radius: 50%;
            }

            input:checked + .slider {
                background-color: var(--color-switch-on);
                box-shadow: var(--color-switch-on-shadow);
            }

            input:checked + .slider:before {
                transform: translateX(20px);
            }

            #creator-page {
                color: var(--color-font-text);
                transition: color 0.3s ease;
            }

            #creator-page:hover,  .check-status-page:hover, .retry-link:hover{
                color: var(--color-font-link-hover);
            }

            .error-page {
                text-align: center;
                font-size: var(--size-font-body-error);
            }

            .check-status-page, .retry-link {
                text-decoration: underline;
                color: var(--color-font-text);
            }

            .check-status-page:visited, .retry-link:visited {
                color: var(--color-font-link-visited);
            }

            .sponsored-hidden {
                display: none !important;
            }

            .sponsored-highlight {
            border: var(--thickness-highlight-border) solid var(--color-highlight-border) !important;
            background-color: var(--color-highlight-background);
            }

        `;
        document.head.appendChild(style);
    }

    function determineCurrentPage(sponsoredCount, hidingEnabled) {
        if (hidingEnabled && sponsoredCount === 0) {
            return buildPanelErrorPage();
        }
        return buildPanelHomePage();
    }

    function initializeObserver() {
        if (observerInitialized) return;
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
        observerInitialized = true;
    }

    async function buildPanel() {
        const wrapper = document.createElement("div");
        wrapper.id = "panelWrapper";

        const box = document.createElement("div");
        box.id = "panelBox";

        const header = buildPanelHeader();
        const sponsoredCount = await processSponsoredContent();
        const body = determineCurrentPage(sponsoredCount, hidingEnabled);
        const footer = buildPanelFooter();

        const topDivider = document.createElement("hr");
        topDivider.className = "section-divider";
        const bottomDivider = document.createElement("hr");
        bottomDivider.className = "section-divider";

        box.appendChild(header);
        box.appendChild(topDivider);
        box.appendChild(body);
        box.appendChild(bottomDivider);
        box.appendChild(footer);

        wrapper.appendChild(box);
        document.body.appendChild(wrapper);

        const minimizePanelButton = document.getElementById("minimizePanelButton");
        minimizePanelButton.addEventListener("click", () => {

            const panelBox = document.getElementById("panelBox");
            const isCurrentlyMinimized = panelBox.classList.contains("minimized");
            const newState = !isCurrentlyMinimized;

            localStorage.setItem("panelMinimized", newState);
            setPanelMinimized(newState);
        });

        const isPanelMinimized = localStorage.getItem("panelMinimized") === "true";
        setPanelMinimized(isPanelMinimized);

        const toggleSponsoredContentSwitchInput = document.getElementById("toggleSponsoredContentSwitch");
        toggleSponsoredContentSwitchInput.addEventListener("change", (e) => {
            hidingEnabled = e.target.checked;
            localStorage.setItem(SPONSORED_CONTENT_KEY, hidingEnabled);
            updateLockIcons();
            debounceHighlighting();
        });
        updateLockIcons();
    }

    function buildPanelHeader() {
        const header = document.createElement("div");
        header.id = "panelHeader";

        header.innerHTML = `
            <div id="lockIconContainer">
                ${SVG_ICONS.locked}
                ${SVG_ICONS.unlocked}
            </div>
            <h2 class="panel-title" aria-level="1">${APP_TITLE}</h2>
            <button id="minimizePanelButton" aria-label="Expand or minimize the panel">
                ${SVG_ICONS.arrow}
            </button>
        `;
        return header;
    }

    function buildPanelFooter() {
        const footer = document.createElement("div");
        footer.className = "panelFooter";

        const creatorPage = document.createElement("a");
        creatorPage.href = "https://github.com/OsborneLabs/Spotless";
        creatorPage.target = "_blank";
        creatorPage.style.textDecoration = "none";
        creatorPage.textContent = "Osborne";
        creatorPage.id = "creator-page";

        const separator = document.createElement("span");
        separator.textContent = " · ";

        const donatePage = document.createElement("a");
        donatePage.href = "https://ko-fi.com/osbornelabs";
        donatePage.target = "_blank";
        donatePage.innerHTML = SVG_ICONS.heart;
        donatePage.style.display = "inline-flex";
        donatePage.style.alignItems = "center";
        donatePage.style.justifyContent = "center";

        footer.appendChild(creatorPage);
        footer.appendChild(separator);
        footer.appendChild(donatePage);
        return footer;
    }

    function buildPanelRow(innerHTML = "") {
        const row = document.createElement("div");
        row.className = "panel-body-row";
        row.innerHTML = innerHTML;
        return row;
    }

    function buildCountSponsoredContentRow() {
        const row = buildPanelRow(`
            <span>Content found</span>
            <span id="countBubble">0</span>
        `);
        row.id = "count-sponsored-content-row";
        return row;
    }

    function buildToggleSponsoredContentRow() {
        const row = buildPanelRow(`
            <span class="switch-label">Hide sponsored content</span>
            <label class="switch" aria-label="Toggle visibility of sponsored content">
                <input type="checkbox" id="toggleSponsoredContentSwitch" ${hidingEnabled ? "checked" : ""}>
                <span class="slider"></span>
            </label>
        `);
        row.id = "toggle-sponsored-content-row";
        return row;
    }

    function buildPanelHomePage() {
        const pageContainer = document.createElement("div");
        pageContainer.id = "panelPageContainer";
        pageContainer.classList.add("panelPageContainer");

        const homePage = document.createElement("div");
        homePage.id = "homePage";
        homePage.className = "panel-page";
        homePage.style.display = "block";

        const countSponsoredContentRow = buildCountSponsoredContentRow();
        const toggleSponsoredContentRow = buildToggleSponsoredContentRow();

        homePage.appendChild(countSponsoredContentRow);
        homePage.appendChild(toggleSponsoredContentRow);

        pageContainer.appendChild(homePage);
        return pageContainer;
    }

    function buildPanelErrorPage() {
        const errorPage = document.createElement("div");
        errorPage.classList.add("error-page", "panel-page");

        const errorMessage = document.createElement("p");
        errorMessage.textContent = "No sponsored content found. ";
        errorMessage.appendChild(document.createElement("br"));

        const outboundRetryPage = document.createElement("a");
        outboundRetryPage.textContent = "Retry";
        outboundRetryPage.href = "#";
        outboundRetryPage.addEventListener("click", function(event) {
            event.preventDefault();
            location.reload();
        });
        outboundRetryPage.classList.add("retry-link");

        const outboundStatusPage = document.createElement("a");
        outboundStatusPage.textContent = "check status";
        outboundStatusPage.href = "https://github.com/OsborneLabs/Spotless";
        outboundStatusPage.target = "_blank";
        outboundStatusPage.classList.add("check-status-page");

        errorMessage.appendChild(outboundRetryPage);
        errorMessage.appendChild(document.createTextNode(" or "));
        errorMessage.appendChild(outboundStatusPage);

        const endText = document.createTextNode(".");
        errorMessage.appendChild(endText);
        errorPage.appendChild(errorMessage);
        return errorPage;
    }

    function setPanelMinimized(minimized) {
        const panelBox = document.getElementById("panelBox");
        if (!panelBox) return;

        const panelPage = panelBox.querySelector(".panel-page");
        const sectionDividers = panelBox.querySelectorAll(".section-divider");
        const panelFooter = panelBox.querySelector(".panelFooter");

        panelBox.classList.toggle("minimized", minimized);

        if (panelPage) panelPage.style.display = minimized ? "none" : "block";
        sectionDividers.forEach(el => {
            el.style.display = minimized ? "none" : "";
        });
        if (panelFooter) panelFooter.style.display = minimized ? "none" : "";
    }

    function updateLockIcons() {
        const locked = document.getElementById("lockedIcon");
        const unlocked = document.getElementById("unlockedIcon");
        locked.classList.toggle("active", hidingEnabled);
        unlocked.classList.toggle("active", !hidingEnabled);
    }

    function getListingElements() {
        return Array.from(document.querySelectorAll("li[class*='s-']")).filter(
            (el) => el.className.split(/\s+/).some((cls) => /^s-[\w-]+$/.test(cls))
        );
    }

    function detectSponsoredListingByBase64(batchSize = 5) {
        return new Promise((resolve) => {
            const listings = getListingElements();
            const sponsoredElements = [];
            let index = 0;

            function processBatch() {
                const end = Math.min(index + batchSize, listings.length);
                const batch = listings.slice(index, end);
                let processedInBatch = 0;

                if (batch.length === 0) {
                    resolve(sponsoredElements);
                    return;
                }

                batch.forEach((listing) => {
                    const svgImage = listing.querySelector(".s-item__sep span[aria-hidden='true']");
                    if (!svgImage) return done();

                    const backgroundImage = getComputedStyle(svgImage.parentElement).backgroundImage;
                    const match = backgroundImage.match(/url\("data:image\/svg\+xml;base64,([^"]+)"\)/);

                    if (!match || !match[1]) return done();

                    const base64 = match[1];
                    const svgString = atob(base64);
                    const img = new Image();
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    img.src = "data:image/svg+xml;base64," + btoa(svgString);

                    img.onload = () => {
                        canvas.width = img.naturalWidth || 25;
                        canvas.height = img.naturalHeight || 25;
                        ctx.drawImage(img, 0, 0);
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

                        for (let i = 0; i < imageData.length; i += 4) {
                            const r = imageData[i];
                            const g = imageData[i + 1];
                            const b = imageData[i + 2];
                            const a = imageData[i + 3];

                            if (a > 0 && r === 112 && g === 112 && b === 112) {
                                sponsoredElements.push(listing);
                                break;
                            }
                        }
                        done();
                    };

                    img.onerror = () => {
                        done();
                    };

                    function done() {
                        processedInBatch++;
                        if (processedInBatch === batch.length) {
                            index += batchSize;
                            setTimeout(processBatch, 0);
                        }
                    }
                });
                if (batch.length === 0) resolve(sponsoredElements);
            }
            if (listings.length === 0) {
                resolve([]);
            } else {
                processBatch();
            }
        });
    }

    function detectSponsoredListingByAriaID(listings = getListingElements()) {
        const groupMap = {};
        const ariaLabelToGroup = {};
        let groupCounter = 0;

        listings.forEach(listing => {
            const labelSpans = Array.from(listing.querySelectorAll('span[aria-labelledby]'));
            if (labelSpans.length === 0) return;

            for (const spanElement of labelSpans) {
                const ariaLabel = spanElement.getAttribute('aria-labelledby');
                if (!ariaLabel || !ariaLabel.includes("s-")) continue;

                if (!ariaLabelToGroup[ariaLabel]) {
                    ariaLabelToGroup[ariaLabel] = `Group ${numberToLettersForAriaID(groupCounter)}`;
                    groupCounter++;
                }
                const group = ariaLabelToGroup[ariaLabel];
                if (!groupMap[group]) {
                    groupMap[group] = [];
                }
                groupMap[group].push(listing);
                break;
            }
        });

        let sponsoredGroup = null;
        let minCount = Infinity;

        for (const [group, groupListings] of Object.entries(groupMap)) {
            if (groupListings.length < minCount) {
                sponsoredGroup = group;
                minCount = groupListings.length;
            }
        }
        return sponsoredGroup ? groupMap[sponsoredGroup] : [];
    }

    function numberToLettersForAriaID(num) {
        let result = '';
        while (num >= 0) {
            result = String.fromCharCode((num % 26) + 65) + result;
            num = Math.floor(num / 26) - 1;
        }
        return result;
    }

    function detectSponsoredListingByInvertFilter() {
        const INVERT_REGEX = /div\.([a-zA-Z0-9_-]+)(?:\s+div)?\s*\{[^}]*color:\s*(black|white);[^}]*filter:\s*invert\(([-\d.]+)\)/g;

        const sponsoredGroups = {};
        const classToInvertMap = {};

        const styleTags = Array.from(document.querySelectorAll("style"));
        styleTags.forEach(styleTag => {
            const css = styleTag.textContent;
            let match;
            while ((match = INVERT_REGEX.exec(css)) !== null) {
                const [_, className, color, invertValue] = match;
                if (!classToInvertMap[className]) {
                    classToInvertMap[className] = [];
                }
                classToInvertMap[className].push({
                    color,
                    invert: parseFloat(invertValue)
                });
            }
        });
        const containers = Array.from(document.querySelectorAll('div[role="text"]')).filter(container => {
            return container.querySelector('div[aria-hidden="true"]');
        });

        containers.forEach(container => {
            const targetDiv = container.querySelector('div[aria-hidden="true"]');
            if (!targetDiv) return;

            const ancestorDiv = container.closest("div[class*='_']");
            if (!ancestorDiv) return;

            const classList = Array.from(ancestorDiv.classList);
            const dynamicClass = classList.find(cls => classToInvertMap[cls]);
            if (!dynamicClass) return;

            const candidates = classToInvertMap[dynamicClass];
            const invertEntry = candidates?.[0];
            if (!invertEntry) return;

            const key = invertEntry.invert;
            if (!sponsoredGroups[key]) {
                sponsoredGroups[key] = [];
            }
            sponsoredGroups[key].push(container);
        });

        const groupEntries = Object.entries(sponsoredGroups);
        if (groupEntries.length === 0) {
            return {
                allGroups: []
            };
        }

        const sortedGroups = groupEntries.sort((a, b) => a[1].length - b[1].length);
        const [sponsoredInvert, sponsoredList] = sortedGroups[0];

        return {
            invert: parseFloat(sponsoredInvert),
            elements: sponsoredList,
            allGroups: groupEntries
        };
    }

    function detectSponsoredBanner() {
        const tld = getEffectiveTLD();
        if (tld !== "co.uk" && tld !== "com.au" && tld !== "de") return [];

        return new Promise((resolve) => {
            setTimeout(() => {
                const banners = Array.from(
                    document.querySelectorAll(".s-answer-region-center-top.s-answer-region > div")
                ).filter((el) => {
                    return !el.className.includes("srp-controls") && el.offsetHeight >= 100;
                });
                resolve(banners);
            }, 525);
        });
    }

    async function processSponsoredContent() {
        if (isProcessing) return 0;
        isProcessing = true;

        try {
            observer.disconnect();
            clearDesignateSponsoredContent();

            const listings = getListingElements();
            const unprocessedListings = listings.filter(el => !el.hasAttribute("data-sponsored-processed"));
            const detectedSponsoredElements = new Set();

            const base64Results = await detectSponsoredListingByBase64();
            base64Results.forEach(el => {
                const li = el.closest("li");
                if (li) detectedSponsoredElements.add(li);
            });

            if (detectedSponsoredElements.size === 0) {
                const ariaMethod = detectSponsoredListingByAriaID(unprocessedListings);
                ariaMethod.forEach(listing => {
                    const li = listing.closest("li");
                    if (li) detectedSponsoredElements.add(li);
                });
            }
            if (detectedSponsoredElements.size === 0) {
                const invertMethod = detectSponsoredListingByInvertFilter();
                invertMethod.elements?.forEach(container => {
                    const li = container.closest("li");
                    if (li) detectedSponsoredElements.add(li);
                });
            }

            const banners = await detectSponsoredBanner();
            banners.forEach(banner => {
                detectedSponsoredElements.add(banner);
            });

            requestAnimationFrame(() => {
                for (const el of detectedSponsoredElements) {
                    if (!el.hasAttribute("data-sponsored-processed")) {
                        designateSponsoredContent(el);
                        highlightSponsoredContent(el);
                        hideShowSponsoredContent(el, hidingEnabled);
                    }
                }

                const count = detectedSponsoredElements.size;
                countSponsoredContent(count);

                initializeObserver();
                isProcessing = false;
            });
            return detectedSponsoredElements.size;
        } catch (err) {
            console.error("Error processing sponsored content:", err);
            isProcessing = false;
            initializeObserver();
            return 0;
        }
    }

    function designateSponsoredContent(el) {
        el.setAttribute("data-sponsored", "true");
        el.setAttribute("data-sponsored-processed", "true");
        highlightedSponsoredContent.push(el);
    }

    function clearDesignateSponsoredContent() {
        highlightedSponsoredContent.forEach(el => {
            el.classList.remove("sponsored-hidden");
            el.removeAttribute("data-sponsored");
            el.removeAttribute("data-sponsored-processed");
            el.style.border = "";
            el.style.backgroundColor = "";
        });
        highlightedSponsoredContent.length = 0;
    }

    function highlightSponsoredContent(element) {
        element.setAttribute("data-sponsored", "true");
        element.classList.add("sponsored-highlight");
    }

    function hideShowSponsoredContent(element, hide) {
        element.classList.toggle("sponsored-hidden", hide);
    }

    function countSponsoredContent(count) {
        const countBubble = document.getElementById("countBubble");
        if (countBubble) countBubble.textContent = count;
    }

    function debounceHighlighting() {
        if (updateScheduled || isProcessing) return;
        updateScheduled = true;
        requestAnimationFrame(() => {
            processSponsoredContent().finally(() => {
                updateScheduled = false;
            });
        });
    }

    function getEffectiveTLD() {
        const host = window.location.hostname;
        const tldMap = {
            "ebay.com.au": "com.au",
            "ebay.com.hk": "com.hk",
            "ebay.com.my": "com.my",
            "ebay.com.sg": "com.sg",
            "ebay.co.uk": "co.uk",
            "ebay.at": "at",
            "ebay.ca": "ca",
            "ebay.ch": "ch",
            "ebay.de": "de",
            "ebay.es": "es",
            "ebay.fr": "fr",
            "ebay.ie": "ie",
            "ebay.it": "it",
            "ebay.nl": "nl",
            "ebay.pl": "pl",
            "ebay.com": "com",
        };
        return Object.entries(tldMap).find(([domain]) => host.endsWith(domain))?.[1] || "Unknown";
    }

    const observer = new MutationObserver(() => {
        debounceHighlighting();
    });

    (async function() {
        if (document.readyState === "complete" || document.readyState === "interactive") {
            await new Promise(r => setTimeout(r, 200));
            init();
        } else {
            window.addEventListener("DOMContentLoaded", async () => {
                await new Promise(r => setTimeout(r, 200));
                init();
            });
        }
    })();

    window.addEventListener("storage", (event) => {
        if (event.key === SPONSORED_CONTENT_KEY) {
            const newValue = event.newValue === "true";
            if (newValue !== hidingEnabled) {
                hidingEnabled = newValue;
                const toggleSponsoredContentSwitchInput = document.getElementById("toggleSponsoredContentSwitch");
                if (toggleSponsoredContentSwitchInput) toggleSponsoredContentSwitchInput.checked = hidingEnabled;
                updateLockIcons();
                debounceHighlighting();
            }
        } else if (event.key === "panelMinimized") {
            setPanelMinimized(event.newValue === "true");
        }
    });
})();