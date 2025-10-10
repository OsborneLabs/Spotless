// ==UserScript==
// @name         Spotless for eBay
// @namespace    https://github.com/OsborneLabs
// @version      1.8.4
// @description  Hides sponsored listings, cleans urls, and removes sponsored items
// @author       Osborne Labs
// @license      GPL-3.0-only
// @homepageURL  https://github.com/OsborneLabs/Spotless
// @icon         data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjI1MDAiIHdpZHRoPSIyMDcyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAuMzU5IDIxLjY4ODgwMTQ3Nzg4Njg0IDI1MS4yODE5OTk5OTk5OTk5OCAyODIuMzExMTk4NTIyMTEzMTYiPjxwYXRoIGQ9Ik0xNTIuMzM4IDE1Ny4xM2E3MC4zMjcgNzAuMzI3IDAgMSAwLTUzLjggMS42NjJsNi43ODgtMTcuOTM3YTUxLjE0OSA1MS4xNDkgMCAxIDEgMzkuMTI4LTEuMjA5eiIgZmlsbD0iIzQxNDE0MSIvPjxwYXRoIGQ9Ik0uMzU5IDk4LjQwNWg1Ny4xMVYzMDRoLTM5LjExYy05Ljk0MSAwLTE4LTguMDU5LTE4LTE4eiIgZmlsbD0iI2VhMzIzYyIvPjxwYXRoIGQ9Ik0yNTEuNjQxIDk4LjQwNWgtNTcuMTA5VjMwNGgzOS4xMDljOS45NDEgMCAxOC04LjA1OSAxOC0xOHoiIGZpbGw9IiM4OGI2MjEiLz48cGF0aCBkPSJNMTk0LjUzMSA5OC40MDVIMTI2VjMwNGg2OC41MzF6IiBmaWxsPSIjZjVhZTAzIi8+PHBhdGggZD0iTTEyNiA5OC40MDVINTcuNDY4VjMwNEgxMjZ6IiBmaWxsPSIjMDA2NGQxIi8+PC9zdmc+
// @match        https://www.ebay.com/*
// @match        https://www.ebay.at/*
// @match        https://www.ebay.ca/*
// @match        https://www.ebay.ch/*
// @match        https://www.ebay.com.au/*
// @match        https://www.ebay.com.hk/*
// @match        https://www.ebay.com.my/*
// @match        https://www.ebay.com.sg/*
// @match        https://www.ebay.co.uk/*
// @match        https://www.ebay.de/*
// @match        https://www.ebay.es/*
// @match        https://www.ebay.fr/*
// @match        https://www.ebay.ie/*
// @match        https://www.ebay.it/*
// @match        https://www.ebay.nl/*
// @match        https://www.ebay.pl/*
// @run-at       document-start
// @supportURL   https://github.com/OsborneLabs/Spotless/issues
// @downloadURL  https://update.greasyfork.org/scripts/541981/Spotless%20for%20eBay.user.js
// @updateURL    https://update.greasyfork.org/scripts/541981/Spotless%20for%20eBay.meta.js
// @grant        none
// ==/UserScript==

/* jshint esversion: 11 */

(function() {
    "use strict";

    const APP_NAME = "Spotless";
    const APP_NAME_DEBUG = "SPOTLESS FOR EBAY";
    const APP_KEY_OBSTRUCT_SPONSORED = "hideSponsoredContent";
    const APP_PARAM_OBSTRUCT_KEYS = ["campaign", "promoted_items", "source", "sr"];
    const APP_ICONS = {
        locked: `
            <svg class="lock-icon lock-icon-animation" id="lockedIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 2C9.79 2 8 3.79 8 6v4H7c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-1V6c0-2.21-1.79-4-4-4zm-2 8V6c0-1.1.9-2 2-2s2 .9 2 2v4h-4z"/>
            </svg>`,
        unlocked: `
            <svg class="lock-icon lock-icon-animation" id="unlockedIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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

    const state = {
        hidingEnabled: localStorage.getItem(APP_KEY_OBSTRUCT_SPONSORED) !== "false",
        highlightedSponsoredContent: [],
        isContentProcessing: false,
        updateScheduled: false,
        scrollListenerStopped: false,
        carouselTimeoutReached: false,
        carouselTimeoutId: null,
        observerInitialized: false
    };

    function createStyles() {
        const style = document.createElement("style");
        style.textContent = `
            :root {
                --size-font-title: 20px;
                --size-font-body: 14px;
                --size-font-body-error: 17px;
                --size-font-footer: 12px;
                --color-font-text: white;
                --color-font-link-hover: lightblue;
                --color-font-link-visited: lightblue;
                --color-panel: rgba(34, 50, 70, 0.85);
                --color-panel-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                --color-row: rgba(20, 30, 45, 0.5);
                --color-divider-border: rgba(255, 255, 255, 0.1);
                --color-bubble: #E74C3C;
                --color-highlight-background: #FFE6E6;
                --color-highlight-border: red;
                --color-svg-fill: white;
                --color-svg-fill-heart-hover: red;
                --color-switch-knob: white;
                --color-switch-on: #2AA866;
                --color-switch-off: #CCC;
                --thickness-highlight-border: 2px;
            }
            #panelWrapper, #panelBox, .lock-icon-animation, .lock-icon-animation.active {
                box-sizing: border-box;
            }
            #panelWrapper {
                position: fixed;
                bottom: 10px;
                right: 5px;
                z-index: 9999;
                width: 100%;
                max-width: 320px;
                padding: 0 16px;
                font-family: "Segoe UI", sans-serif;
            }
            @media (max-width: 768px) {
                #panelWrapper {
                    position: fixed;
                    bottom: 5px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 90% !important;
                    right: unset;
                    padding: 0 16px;
                }
            }
            #panelBox {
                display: none;
            }
            #panelBox.show {
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
            #panelBox.minimized #arrowIcon {
                transform: rotate(180deg);
            }
            #panelBox.minimized {
                padding: 12px;
                overflow: hidden;
            }
            #panelHeader {
                display: flex;
                align-items: center;
                height: 30px;
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
            .panel-footer {
                height: 14px;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 6px;
                font-size: var(--size-font-footer);
                color: var(--color-font-text);
            }
            .panel-page-container {
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
            .lock-icon {
                width: 28px;
                height: 28px;
                padding: 4px;
                border-radius: 50%;
                fill: var(--color-svg-fill);
            }
            .lock-icon-animation {
                position: absolute;
                top: 0;
                left: 0;
                width: 28px;
                height: 28px;
                opacity: 0;
                transition: opacity 0.4s ease, transform 0.4s ease;
                transform: rotate(0deg);
            }
            .lock-icon-animation.active {
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
            }
            input:checked + .slider:before {
                transform: translateX(20px);
            }
            #creatorPage {
                color: var(--color-font-text);
                transition: color 0.3s ease;
            }
            #creatorPage:hover, .outbound-status-page:hover, .outbound-update-page:hover {
                color: var(--color-font-link-hover);
            }
            .error-page {
                text-align: center;
                font-size: var(--size-font-body-error);
                padding: 5px 0 5px 0;
            }
            .outbound-status-page, .outbound-update-page {
                text-decoration: underline;
                color: var(--color-font-text);
            }
            .outbound-status-page:visited, .outbound-update-page:visited {
                color: var(--color-font-link-visited);
            }
            .sponsored-highlight {
                border: var(--thickness-highlight-border) dashed var(--color-highlight-border) !important;
                background-color: var(--color-highlight-background);
            }
            .sponsored-hidden {
                display: none !important;
            }
            .sponsored-hidden-banner {
                display: none !important;
            }
            .sponsored-hidden-carousel {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    async function init() {
        observeURLMutation();
        createStyles();
        buildPanel();
        hideOrShowPanel();
        if (isListingPage()) {
            startCarouselDetection();
        }
        await processSponsoredContent();
    }

    function validateCurrentPage() {
        const url = new URL(location.href);
        const params = url.searchParams;
        const isSearchPage = /^https:\/\/www\.ebay\.[a-z.]+\/sch\//i.test(url.href);
        const isAdvancedSearchPage = url.href.includes("ebayadvsearch");
        const isSellerPage = params.has("_ssn");
        const isSoldPage = params.get("LH_Sold") === "1";
        return isSearchPage && !isAdvancedSearchPage && !isSellerPage && !isSoldPage;
    }

    function isListingPage() {
        return /^https:\/\/www\.ebay\.[a-z.]+\/itm\/\d+/.test(location.href);
    }

    function initializeObserver() {
        if (state.observerInitialized) return;
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
        state.observerInitialized = true;
    }

    function observeURLMutation() {
        let previousURL = location.href;
        const observeURL = () => {
            const currentURL = location.href;
            if (currentURL !== previousURL) {
                previousURL = currentURL;
                hideOrShowPanel();
                scheduleHighlightUpdate();
            }
        };
        const pushState = history.pushState;
        history.pushState = function() {
            pushState.apply(history, arguments);
            observeURL();
        };
        const replaceState = history.replaceState;
        history.replaceState = function() {
            replaceState.apply(history, arguments);
            observeURL();
        };
        window.addEventListener("popstate", observeURL);
        window.addEventListener("hashchange", observeURL);
        setInterval(observeURL, 1000);
    }

    function cleanListingObserver() {
        const observer = new MutationObserver(() => {
            cleanListingURLs();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['href'],
        });
    }

    async function buildPanel() {
        const wrapper = document.createElement("div");
        wrapper.id = "panelWrapper";
        const box = document.createElement("div");
        box.id = "panelBox";

        const header = buildPanelHeader();
        const sponsoredCount = await processSponsoredContent();
        const body = determinePanelState(sponsoredCount, state.hidingEnabled);
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
            minimizePanel(newState);
        });
        const isPanelMinimized = localStorage.getItem("panelMinimized") === "true";
        minimizePanel(isPanelMinimized);
        const toggleSponsoredContentSwitchInput = document.getElementById("toggleSponsoredContentSwitch");
        if (!toggleSponsoredContentSwitchInput) {
            updateLockIcon();
            return;
        }
        toggleSponsoredContentSwitchInput.addEventListener("change", (e) => {
            state.hidingEnabled = e.target.checked;
            localStorage.setItem(APP_KEY_OBSTRUCT_SPONSORED, state.hidingEnabled);
            updateLockIcon();
            scheduleHighlightUpdate();
        });
        updateLockIcon();
    }

    function buildPanelHeader() {
        const header = document.createElement("div");
        header.id = "panelHeader";
        header.innerHTML = `
            <div id="lockIconContainer">
                ${APP_ICONS.locked}
                ${APP_ICONS.unlocked}
            </div>
            <h2 class="panel-title" aria-level="1">${APP_NAME}</h2>
            <button id="minimizePanelButton" aria-label="Expands or minimizes the panel">
                ${APP_ICONS.arrow}
            </button>
        `;
        return header;
    }

    function buildPanelFooter() {
        const creatorPage = document.createElement("a");
        creatorPage.href = "https://github.com/OsborneLabs/Spotless";
        creatorPage.target = "_blank";
        creatorPage.rel = "noopener noreferrer";
        creatorPage.style.textDecoration = "none";
        creatorPage.textContent = "Osborne";
        creatorPage.id = "creatorPage";

        const separator = document.createElement("span");
        separator.textContent = " · ";

        const donatePage = document.createElement("a");
        donatePage.href = "https://ko-fi.com/osbornelabs";
        donatePage.target = "_blank";
        donatePage.rel = "noopener noreferrer";
        donatePage.innerHTML = APP_ICONS.heart;
        donatePage.style.display = "inline-flex";
        donatePage.style.alignItems = "center";
        donatePage.style.justifyContent = "center";

        const footer = document.createElement("div");
        footer.className = "panel-footer";
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

    function buildSponsoredCountRow() {
        const row = buildPanelRow(`
            <span>Sponsored items</span>
            <span id="countBubble">0</span>
        `);
        row.id = "countSponsoredContentRow";
        return row;
    }

    function buildSponsoredToggleRow() {
        const row = buildPanelRow(`
            <span class="switch-label">Hide all sponsored</span>
            <label class="switch" aria-label="Toggles the visibility of sponsored items">
                <input type="checkbox" id="toggleSponsoredContentSwitch" ${state.hidingEnabled ? "checked" : ""}>
                <span class="slider"></span>
            </label>
        `);
        row.id = "toggleSponsoredContentRow";
        return row;
    }

    function buildPanelHomePage() {
        const pageContainer = document.createElement("div");
        pageContainer.id = "panelPagecontainer";
        pageContainer.classList.add("panel-page-container");

        const homePage = document.createElement("div");
        homePage.id = "homePage";
        homePage.className = "panel-page";
        homePage.style.display = "block";

        const countSponsoredContentRow = buildSponsoredCountRow();
        const toggleSponsoredContentRow = buildSponsoredToggleRow();

        homePage.appendChild(countSponsoredContentRow);
        homePage.appendChild(toggleSponsoredContentRow);
        pageContainer.appendChild(homePage);
        return pageContainer;
    }

    function buildPanelErrorPage() {
        const errorPage = document.createElement("div");
        errorPage.classList.add("error-page", "panel-page");

        const errorMessage = document.createElement("p");
        errorMessage.textContent = "Nothing sponsored found";
        errorMessage.appendChild(document.createElement("br"));

        const outboundUpdatePage = document.createElement("a");
        outboundUpdatePage.textContent = "Update";
        outboundUpdatePage.href = "https://greasyfork.org/en/scripts/541981-spotless-for-ebay";
        outboundUpdatePage.target = "_blank";
        outboundUpdatePage.rel = "noopener noreferrer";
        outboundUpdatePage.classList.add("outbound-update-page");

        const outboundStatusPage = document.createElement("a");
        outboundStatusPage.textContent = "check status";
        outboundStatusPage.href = "https://github.com/OsborneLabs/Spotless";
        outboundStatusPage.target = "_blank";
        outboundStatusPage.rel = "noopener noreferrer";
        outboundStatusPage.classList.add("outbound-status-page");

        errorMessage.appendChild(outboundUpdatePage);
        errorMessage.appendChild(document.createTextNode(" or "));
        errorMessage.appendChild(outboundStatusPage);
        errorPage.appendChild(errorMessage);
        return errorPage;
    }

    function hideOrShowPanel() {
        const panelBox = document.getElementById("panelBox");
        if (!panelBox) return;
        const isSearchPage = validateCurrentPage();
        if (isSearchPage) {
            panelBox.classList.add("show");
        } else {
            panelBox.classList.remove("show");
        }
    }

    function minimizePanel(minimized) {
        const panelBox = document.getElementById("panelBox");
        if (!panelBox) return;

        const panelPage = panelBox.querySelector(".panel-page");
        const sectionDivider = panelBox.querySelectorAll(".section-divider");
        const panelFooter = panelBox.querySelector(".panel-footer");

        panelBox.classList.toggle("minimized", minimized);
        if (panelPage) panelPage.style.display = minimized ? "none" : "block";
        sectionDivider.forEach(el => {
            el.style.display = minimized ? "none" : "";
        });
        if (panelFooter) panelFooter.style.display = minimized ? "none" : "";
    }

    function updateLockIcon() {
        const locked = document.getElementById("lockedIcon");
        const unlocked = document.getElementById("unlockedIcon");
        locked.classList.toggle("active", state.hidingEnabled);
        unlocked.classList.toggle("active", !state.hidingEnabled);
    }

    function determinePanelState(sponsoredCount) {
        if (!validateSponsoredCount(sponsoredCount)) {
            return buildPanelErrorPage();
        }
        return buildPanelHomePage();
    }

    async function processSponsoredContent() {
        if (state.isContentProcessing) return 0;
        state.isContentProcessing = true;

        try {
            observer.disconnect();
            resetSponsoredContent();
            const detectedSponsoredElements = new Set();
            const base64Results = await detectSponsoredListingBySVG();
            base64Results.forEach(el => {
                const li = el.closest("li");
                if (li) detectedSponsoredElements.add(li);
            });
            if (detectedSponsoredElements.size === 0) {
                const invertMethod = detectSponsoredListingByInvertStyle();
                invertMethod.elements?.forEach(li => detectedSponsoredElements.add(li));
            }
            if (detectedSponsoredElements.size === 0) {
                const dimensionBasedResults = detectSponsoredListingBySeparatorSize();
                dimensionBasedResults.forEach(li => detectedSponsoredElements.add(li));
            }
            if (detectedSponsoredElements.size === 0) {
                const ariaGroupResults = detectSponsoredListingByAriaGroup();
                ariaGroupResults.forEach(li => detectedSponsoredElements.add(li));
            }
            requestAnimationFrame(() => {
                const count = detectedSponsoredElements.size;
                const sponsoredDetectionSucceeded = validateSponsoredCount(count);
                if (sponsoredDetectionSucceeded) {
                    for (const el of detectedSponsoredElements) {
                        if (!el.hasAttribute("data-sponsored-processed")) {
                            designateSponsoredContent(el);
                            highlightSponsoredContent(el);
                            hideShowSponsoredContent(el, state.hidingEnabled);
                        }
                    }
                }
                removeSponsoredRibbons();
                cleanListingURLs();
                cleanGeneralURLs();
                cleanGeneralClutter();
                hideOrShowPanel();
                countSponsoredContent(count);
                initializeObserver();
                state.isContentProcessing = false;
            });
            return detectedSponsoredElements.size;
        } catch (err) {
            console.error(`${APP_NAME_DEBUG}: UNABLE TO PROCESS SPONSORED CONTENT, SEE CONSOLE ERROR\n`, err);
            state.isContentProcessing = false;
            initializeObserver();
            return 0;
        }
    }

    function validateSponsoredCount(count) {
        return count >= 2 && count <= 20;
    }

    function countSponsoredContent(count) {
        const countBubble = document.getElementById("countBubble");
        if (countBubble) countBubble.textContent = count;
    }

    function getListingElements() {
        return Array.from(document.querySelectorAll("li[class*='s-']")).filter(
            (el) => el.className.split(/\s+/).some((cls) => /^s-[\w-]+$/.test(cls))
        );
    }

    function detectSponsoredListingBySVG(batchSize = 10) {
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
                        canvas.width = img.naturalWidth || 20;
                        canvas.height = img.naturalHeight || 20;
                        ctx.drawImage(img, 0, 0);
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                        const colors = new Set();

                        const sampleWidth = 15;
                        const sampleHeight = 15;

                        for (let y = 0; y < sampleHeight && y < canvas.height; y++) {
                            for (let x = 0; x < sampleWidth && x < canvas.width; x++) {
                                const i = (y * canvas.width + x) * 4;
                                const r = imageData[i];
                                const g = imageData[i + 1];
                                const b = imageData[i + 2];
                                const a = imageData[i + 3];
                                if (a > 0) {
                                    colors.add(`${r},${g},${b}`);
                                    if (colors.size > 1) break;
                                }
                            }
                            if (colors.size > 1) break;
                        }
                        if (colors.size > 1) {
                            sponsoredElements.push(listing);
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

    function detectSponsoredListingByInvertStyle() {
        const invertStyleMatch = /div\.([a-zA-Z0-9_-]+)(?:\s+div)?\s*\{[^}]*color:\s*(black|white);[^}]*filter:\s*invert\(([-\d.]+)\)/g;
        const sponsoredGroups = {};
        const classToInvertMap = {};
        const styleTags = Array.from(document.querySelectorAll("style"));
        styleTags.forEach(styleTag => {
            const css = styleTag.textContent;
            let match;
            while ((match = invertStyleMatch.exec(css)) !== null) {
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
                invert: null,
                elements: [],
                allGroups: []
            };
        }
        const sortedGroups = groupEntries.sort((a, b) => a[1].length - b[1].length);
        const [sponsoredInvert, sponsoredList] = sortedGroups[0];
        const sponsoredElements = sponsoredList
            .map(container => container.closest("li"))
            .filter(Boolean);
        return {
            invert: parseFloat(sponsoredInvert),
            elements: sponsoredElements,
            allGroups: groupEntries
        };
    }

    function detectSponsoredListingBySeparatorSize() {
        const listings = getListingElements();
        const sponsoredListings = [];
        listings.forEach(listing => {
            const separatorSpan = listing.querySelector('span.s-item__sep');
            if (!separatorSpan) return;
            const innerSpan = separatorSpan.querySelector('span');
            const width = innerSpan?.offsetWidth || 0;
            const height = innerSpan?.offsetHeight || 0;
            const isSponsored = width > 0 && height > 0;
            if (isSponsored) {
                sponsoredListings.push(listing);
            }
        });
        return sponsoredListings;
    }

    function detectSponsoredListingByAriaGroup() {
        function generateAriaGroupLabel(num) {
            let letters = '';
            do {
                letters = String.fromCharCode(65 + (num % 26)) + letters;
                num = Math.floor(num / 26) - 1;
            } while (num >= 0);
            return letters;
        }
        const listings = getListingElements();
        const groupMap = {};
        const ariaLabelToGroup = {};
        let groupCounter = 0;
        listings.forEach(listing => {
            const labelSpan = listing.querySelector('span[aria-labelledby]');
            if (!labelSpan) return;
            const ariaLabel = labelSpan.getAttribute('aria-labelledby');
            if (!ariaLabel || !ariaLabel.includes("s-")) return;
            if (!ariaLabelToGroup[ariaLabel]) {
                ariaLabelToGroup[ariaLabel] = `Group ${generateAriaGroupLabel(groupCounter)}`;
                groupCounter++;
            }
            const group = ariaLabelToGroup[ariaLabel];
            if (!groupMap[group]) {
                groupMap[group] = [];
            }
            groupMap[group].push(listing);
        });
        let sponsoredGroup = null;
        let minCount = Infinity;
        for (const [group, listings] of Object.entries(groupMap)) {
            if (listings.length < minCount) {
                sponsoredGroup = group;
                minCount = listings.length;
            }
        }
        return sponsoredGroup ? groupMap[sponsoredGroup] : [];
    }

    function removeSponsoredBanners() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const banners = Array.from(
                    document.querySelectorAll(".s-answer-region-center-top.s-answer-region > div")
                ).filter((el) => el.offsetHeight >= 140);
                banners.forEach(banner => {
                    banner.classList.add("sponsored-hidden-banner");
                });
                resolve(banners);
            }, 600);
        });
    }

    function removeSponsoredRibbons() {
        const breadcrumb = document.querySelector('.x-breadcrumb');
        if (breadcrumb) {
            breadcrumb.remove();
        }
        const placements = document.querySelector('.x-pda-placements');
        if (placements) {
            placements.remove();
        }
        const ribbons = document.querySelector('.x-evo-atf-top-river.vi-grid.vim > .d-vi-evo-region.vim > div');
        const whitelisted = ['statusmessage', 'x-alert'];
        const isWhitelisted = ribbons && Array.from(ribbons.classList).some(cls =>
            whitelisted.some(pattern => cls.includes(pattern))
        );
        if (ribbons && !isWhitelisted) {
            ribbons.style.minHeight = '48px';
            ribbons.style.maxHeight = '100px';
            ribbons.remove();
        }
    }

    function removeSponsoredCarousels() {
        if (state.scrollListenerStopped || state.carouselTimeoutReached) return;
        if (!isListingPage()) {
            stopCarouselDetection();
            return;
        }
        const carouselsExpected = 3;
        let sponsoredCarouselCount = 0;
        const sponsoredKeywords = new Set([
            'sponsored', 'anzeige', 'gesponsord', 'patrocinado', 'sponsorisé', 'sponsorizzato', 'sponsorowane', '助贊'
        ]);
        const sponsoredKeywordsArray = [...sponsoredKeywords];
        const normalizeText = (text) => {
            return text.trim()
                .normalize("NFKC")
                .replace(/[\u200B-\u200D\u061C\uFEFF]/g, '')
                .toLowerCase();
        };
        const labelSponsored = (carousel) => {
            carousel.classList.add('sponsored-hidden-carousel');
            sponsoredCarouselCount++;
            if (sponsoredCarouselCount >= carouselsExpected) {
                stopCarouselDetection();
            }
        };
        const carousels = document.querySelectorAll('[data-viewport]');
        for (const carousel of carousels) {
            if (carousel.classList.contains('sponsored-hidden-carousel')) continue;
            const titleElement = carousel.querySelector('h2, h3, h4');
            if (titleElement) {
                const titleText = normalizeText(titleElement.textContent);
                if (sponsoredKeywordsArray.some(keyword => titleText.includes(keyword))) {
                    labelSponsored(carousel);
                    continue;
                }
            }
            const elements = carousel.querySelectorAll('div, span');
            for (const el of elements) {
                const text = normalizeText(el.textContent);
                if (sponsoredKeywordsArray.some(keyword => text.includes(keyword))) {
                    labelSponsored(carousel);
                    break;
                }
            }
            const characterElements = Array.from(carousel.querySelectorAll('span'));
            const characters = characterElements
                .map(el => normalizeText(el.textContent))
                .filter(text => text.length === 1 && /^\p{L}$/u.test(text));
            for (const keyword of sponsoredKeywordsArray) {
                let matchIndex = 0;
                for (const char of characters) {
                    if (char === keyword[matchIndex]) {
                        matchIndex++;
                        if (matchIndex === keyword.length) {
                            labelSponsored(carousel);
                            break;
                        }
                    }
                }
                if (matchIndex === keyword.length) break;
            }
        }
    }

    function designateSponsoredContent(el) {
        el.setAttribute("data-sponsored", "true");
        el.setAttribute("data-sponsored-processed", "true");
        state.highlightedSponsoredContent.push(el);
    }

    function resetSponsoredContent() {
        state.highlightedSponsoredContent.forEach(el => {
            el.classList.remove("sponsored-hidden");
            el.removeAttribute("data-sponsored");
            el.removeAttribute("data-sponsored-processed");
            el.style.border = "";
            el.style.backgroundColor = "";
        });
        state.highlightedSponsoredContent.length = 0;
    }

    function highlightSponsoredContent(element) {
        element.setAttribute("data-sponsored", "true");
        element.classList.add("sponsored-highlight");
    }

    function hideShowSponsoredContent(element, hide) {
        element.classList.toggle("sponsored-hidden", hide);
    }

    function cleanListingURLs() {
        const url = /^https:\/\/www\.ebay\.([a-z.]+)\/itm\/(\d+)(?:[/?#].*)?/;
        const links = document.querySelectorAll("a[href*='/itm/']");
        links.forEach((link) => {
            const match = link.href.match(url);
            if (match) {
                const tld = match[1];
                const itemId = match[2];
                const cleanURL = `https://www.ebay.${tld}/itm/${itemId}`;
                if (link.href !== cleanURL) {
                    link.href = cleanURL;
                }
            }
        });
    }

    function cleanGeneralURLs() {
        const links = document.querySelectorAll("a[href*='ebay.']");
        links.forEach((link) => {
            try {
                const url = new URL(link.href);
                const tldMatch = url.hostname.match(/(?:^|\.)ebay\.([a-z.]+)$/);
                if (!tldMatch) return;
                const params = new URLSearchParams(url.search);
                APP_PARAM_OBSTRUCT_KEYS.forEach(param => {
                    if (params.has(param)) {
                        params.delete(param);
                    }
                });
                for (const key of [...params.keys()]) {
                    if (key.startsWith("utm_") || key.startsWith("_trk")) {
                        params.delete(key);
                    }
                }
                const cleanURL = `${url.origin}${url.pathname}${params.toString() ? '?' + params.toString() : ''}${url.hash}`;
                if (link.href !== cleanURL) {
                    link.href = cleanURL;
                }
            } catch (e) {}
        });
    }

    function cleanGeneralClutter() {
        const removeBySubstring = (substring) => {
            document.querySelectorAll(`[class*="${substring}"]`).forEach(el => {
                el.remove();
            });
        };
        ['EBAY_LIVE_ENTRY', 'FAQ_KW_SRP_MODULE'].forEach(substring => removeBySubstring(substring));
        const clutter = ['.madrona-banner', '.s-feedback', '.s-faq-list'];
        clutter.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.remove();
            });
        });
    }

    function scheduleHighlightUpdate() {
        if (state.updateScheduled || state.isContentProcessing) return;
        state.updateScheduled = true;
        requestAnimationFrame(() => {
            processSponsoredContent().finally(() => {
                state.updateScheduled = false;
            });
        });
    }

    function startCarouselDetection() {
        if (state.scrollListenerStopped) return;
        window.addEventListener('scroll', removeSponsoredCarousels, {
            passive: true
        });
        scheduleCarouselTimeout();
    }

    function scheduleCarouselTimeout(seconds = 600) {
        const ms = seconds * 1000;
        state.carouselTimeoutId = setTimeout(() => {
            if (state.scrollListenerStopped) return;
            state.carouselTimeoutReached = true;
            stopCarouselDetection();
        }, ms);
    }

    function stopCarouselDetection() {
        if (state.scrollListenerStopped) return;
        state.scrollListenerStopped = true;
        window.removeEventListener('scroll', removeSponsoredCarousels);
        if (state.carouselTimeoutId !== null) {
            clearTimeout(state.carouselTimeoutId);
            state.carouselTimeoutId = null;
        }
    }

    const observer = new MutationObserver(() => {
        hideOrShowPanel();
        scheduleHighlightUpdate();
    });
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cleanListingObserver);
    } else {
        cleanListingObserver();
    }

    window.addEventListener("storage", (event) => {
        if (event.key === APP_KEY_OBSTRUCT_SPONSORED) {
            const newValue = event.newValue === "true";
            if (newValue !== state.hidingEnabled) {
                state.hidingEnabled = newValue;
                const toggleInput = document.getElementById("toggleSponsoredContentSwitch");
                if (toggleInput) toggleInput.checked = state.hidingEnabled;
                updateLockIcon();
                scheduleHighlightUpdate();
            }
        } else if (event.key === "panelMinimized") {
            minimizePanel(event.newValue === "true");
        }
    });

    const delayedInit = async () => {
        await new Promise(r => setTimeout(r, 200));
        init();
        removeSponsoredBanners();
    };
    if (document.readyState === "complete" || document.readyState === "interactive") {
        delayedInit();
    } else {
        window.addEventListener("DOMContentLoaded", delayedInit);
    }

})();