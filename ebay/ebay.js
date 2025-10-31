// ==UserScript==
// @name         Spotless for eBay
// @namespace    https://github.com/OsborneLabs
// @version      1.9.0
// @description  Hides sponsored listings, cleans urls, and removes sponsored items
// @author       Osborne Labs
// @license      GPL-3.0-only
// @homepageURL  https://github.com/OsborneLabs/Spotless
// @icon         data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjI1MDAiIHdpZHRoPSIyMDcyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAuMzU5IDIxLjY4ODgwMTQ3Nzg4Njg0IDI1MS4yODE5OTk5OTk5OTk5OCAyODIuMzExMTk4NTIyMTEzMTYiPjxwYXRoIGQ9Ik0xNTIuMzM4IDE1Ny4xM2E3MC4zMjcgNzAuMzI3IDAgMSAwLTUzLjggMS42NjJsNi43ODgtMTcuOTM3YTUxLjE0OSA1MS4xNDkgMCAxIDEgMzkuMTI4LTEuMjA5eiIgZmlsbD0iIzQxNDE0MSIvPjxwYXRoIGQ9Ik0uMzU5IDk4LjQwNWg1Ny4xMVYzMDRoLTM5LjExYy05Ljk0MSAwLTE4LTguMDU5LTE4LTE4eiIgZmlsbD0iI2VhMzIzYyIvPjxwYXRoIGQ9Ik0yNTEuNjQxIDk4LjQwNWgtNTcuMTA5VjMwNGgzOS4xMDljOS45NDEgMCAxOC04LjA1OSAxOC0xOHoiIGZpbGw9IiM4OGI2MjEiLz48cGF0aCBkPSJNMTk0LjUzMSA5OC40MDVIMTI2VjMwNGg2OC41MzF6IiBmaWxsPSIjZjVhZTAzIi8+PHBhdGggZD0iTTEyNiA5OC40MDVINTcuNDY4VjMwNEgxMjZ6IiBmaWxsPSIjMDA2NGQxIi8+PC9zdmc+
// @match        https://*.ebay.com/*
// @match        https://*.ebay.at/*
// @match        https://*.ebay.be/*
// @match        https://*.ebay.ca/*
// @match        https://*.ebay.ch/*
// @match        https://*.ebay.com.au/*
// @match        https://*.ebay.com.hk/*
// @match        https://*.ebay.com.my/*
// @match        https://*.ebay.com.sg/*
// @match        https://*.ebay.co.uk/*
// @match        https://*.ebay.de/*
// @match        https://*.ebay.es/*
// @match        https://*.ebay.fr/*
// @match        https://*.ebay.ie/*
// @match        https://*.ebay.it/*
// @match        https://*.ebay.nl/*
// @match        https://*.ebay.pl/*
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
        ui: {
            hidingEnabled: localStorage.getItem(APP_KEY_OBSTRUCT_SPONSORED) !== "false",
            highlightedSponsoredContent: [],
            isContentProcessing: false,
            updateScheduled: false,
            observerInitialized: false
        },
        carousel: {
            carouselDetectionStopped: false,
            carouselObserver: null,
            carouselObserverInitialized: false,
            carouselObserverTimeoutId: null
        }
    };

    function createStyles() {
        const style = document.createElement("style");
        style.textContent = `
            :root {
                --color-app-bubble: #E74C3C;
                --color-app-icon-heart-hover: red;
                --color-app-icon: white;
                --color-app-switch-off: #CCC;
                --color-app-switch-on: #2AA866;
                --color-app-switch-thumb: white;
                --color-highlight-background: rgba(255, 230, 230, 0.45);
                --color-highlight-border: #D95C5C;
                --color-panel-divider: rgba(255, 255, 255, 0.1);
                --color-panel-row: rgba(20, 30, 45, 0.5);
                --color-panel-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                --color-panel: rgba(34, 50, 70, 0.85);
                --color-text-link-hover: lightblue;
                --color-text-link-visited: var(--color-text-link-hover);
                --color-text-normal: white;
                --size-text-body-error: 17px;
                --size-text-body-normal: 14px;
                --size-text-footer: 12px;
                --size-text-header-title: 20px;
                --size-thickness-highlight-border: 2px;
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
                color: var(--color-text-normal);
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
                font-size: var(--size-text-header-title);
                font-weight: 600;
                margin: 0;
                color: var(--color-text-normal);
            }
            .panel-body-row {
                margin: 0;
                font-size: var(--size-text-body-normal);
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: var(--color-panel-row);
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
                font-size: var(--size-text-footer);
                color: var(--color-text-normal);
            }
            .panel-page-container {
                position: relative;
                width: 100%;
            }
            hr.section-divider {
                flex-grow: 1;
                border: none;
                border-top: 1px solid var(--color-panel-divider);
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
                fill: var(--color-app-icon);
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
                fill: var(--color-app-icon);
                transition: transform 0.3s ease;
            }
            .heart-icon {
                width: 10px;
                height: 10px;
                vertical-align: middle;
                fill: var(--color-app-icon);
            }
            .heart-icon:hover {
                fill: var(--color-app-icon-heart-hover);
            }
            #countBubble {
                background-color: var(--color-app-bubble);
                color: var(--color-text-normal);
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
                background-color: var(--color-app-switch-off);
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
                background-color: var(--color-app-switch-thumb);
                transition: 0.3s;
                border-radius: 50%;
            }
            input:checked + .slider {
                background-color: var(--color-app-switch-on);
            }
            input:checked + .slider:before {
                transform: translateX(20px);
            }
            #creatorPage {
                color: var(--color-text-normal);
                transition: color 0.3s ease;
            }
            #creatorPage:hover, .outbound-status-page:hover, .outbound-update-page:hover {
                color: var(--color-text-link-hover);
            }
            .error-page {
                text-align: center;
                font-size: var(--size-text-body-error);
                padding: 5px 0 5px 0;
            }
            .outbound-status-page, .outbound-update-page {
                text-decoration: underline;
                color: var(--color-text-normal);
            }
            .outbound-status-page:visited, .outbound-update-page:visited {
                color: var(--color-text-link-visited);
            }
            .sponsored-highlight {
                border: var(--size-thickness-highlight-border) dashed var(--color-highlight-border) !important;
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
            removeSponsoredCarousels();
            initCarouselObserver();
        }
        await processSponsoredContent();
    }

    function initObserver() {
        if (state.ui.observerInitialized) return;
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
        state.ui.observerInitialized = true;
    }

    function initCarouselObserver() {
        const carouselState = state.carousel;
        if (carouselState.carouselObserverInitialized) return;
        carouselState.carouselObserverInitialized = true;
        const observer = new MutationObserver(() => {
            if (!carouselState.carouselDetectionStopped) {
                if (carouselState.carouselObserverTimeoutId) {
                    clearTimeout(carouselState.carouselObserverTimeoutId);
                }
                carouselState.carouselObserverTimeoutId = setTimeout(() => {
                    removeSponsoredCarousels();
                }, 300);
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            characterDataOldValue: false
        });
        carouselState.carouselObserver = observer;
    }

    function initCleanListingObserver() {
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

    function observeURLMutation() {
        let previousURL = location.href;
        const handleURLChange = () => {
            const currentURL = location.href;
            if (currentURL !== previousURL) {
                previousURL = currentURL;
                hideOrShowPanel();
                scheduleHighlightUpdate();
            }
        };
        ["pushState", "replaceState"].forEach(method => {
            const original = history[method];
            history[method] = function(...args) {
                const result = original.apply(this, args);
                handleURLChange();
                return result;
            };
        });
        window.addEventListener("popstate", handleURLChange);
        window.addEventListener("hashchange", handleURLChange);
        const observer = new MutationObserver(handleURLChange);
        observer.observe(document, {
            subtree: true,
            childList: true
        });
    }

    async function buildPanel() {
        const wrapper = document.createElement("div");
        wrapper.id = "panelWrapper";
        const box = document.createElement("div");
        box.id = "panelBox";
        const header = buildPanelHeader();
        const sponsoredCount = await processSponsoredContent();
        const body = determinePanelState(sponsoredCount, state.ui.hidingEnabled);
        const footer = buildPanelFooter();
        const createDivider = () => {
            const hr = document.createElement("hr");
            hr.className = "section-divider";
            return hr;
        };
        box.append(header, createDivider(), body, createDivider(), footer);
        wrapper.appendChild(box);
        document.body.appendChild(wrapper);
        const minimizePanelButton = document.getElementById("minimizePanelButton");
        if (minimizePanelButton) {
            minimizePanelButton.addEventListener("click", () => {
                const panelBox = document.getElementById("panelBox");
                const newState = !panelBox.classList.contains("minimized");
                localStorage.setItem("panelMinimized", newState);
                minimizePanel(newState);
            });
        }
        const isPanelMinimized = localStorage.getItem("panelMinimized") === "true";
        minimizePanel(isPanelMinimized);
        const toggleInput = document.getElementById("toggleSponsoredContentSwitch");
        if (!toggleInput) {
            updateLockIcon();
            return;
        }
        toggleInput.addEventListener("change", (e) => {
            state.ui.hidingEnabled = e.target.checked;
            localStorage.setItem(APP_KEY_OBSTRUCT_SPONSORED, state.ui.hidingEnabled);
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
        const footer = Object.assign(document.createElement("div"), {
            className: "panel-footer",
        });
        const creatorLink = Object.assign(document.createElement("a"), {
            id: "creatorPage",
            href: "https://github.com/OsborneLabs/Spotless",
            target: "_blank",
            rel: "noopener noreferrer",
            textContent: "Osborne",
        });
        creatorLink.style.textDecoration = "none";
        const separator = Object.assign(document.createElement("span"), {
            textContent: " · ",
        });
        const donateLink = Object.assign(document.createElement("a"), {
            href: "https://ko-fi.com/osbornelabs",
            target: "_blank",
            rel: "noopener noreferrer",
            innerHTML: APP_ICONS.heart,
        });
        Object.assign(donateLink.style, {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
        });
        footer.append(creatorLink, separator, donateLink);
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
                <input type="checkbox" id="toggleSponsoredContentSwitch" ${state.ui.hidingEnabled ? "checked" : ""}>
                <span class="slider"></span>
            </label>
        `);
        row.id = "toggleSponsoredContentRow";
        return row;
    }

    function buildPanelHomePage() {
        const pageContainer = Object.assign(document.createElement("div"), {
            id: "panelPagecontainer",
            className: "panel-page-container",
        });
        const homePage = Object.assign(document.createElement("div"), {
            id: "homePage",
            className: "panel-page",
        });
        homePage.style.display = "block";
        const countRow = buildSponsoredCountRow();
        const toggleRow = buildSponsoredToggleRow();
        homePage.append(countRow, toggleRow);
        pageContainer.append(homePage);
        return pageContainer;
    }

    function buildPanelErrorPage() {
        const errorPage = Object.assign(document.createElement("div"), {
            className: "error-page panel-page",
        });
        const errorMessage = document.createElement("p");
        errorMessage.textContent = "Nothing sponsored found";
        errorMessage.appendChild(document.createElement("br"));
        const updateLink = Object.assign(document.createElement("a"), {
            textContent: "Update",
            href: "https://greasyfork.org/en/scripts/541981-spotless-for-ebay",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "outbound-update-page",
        });
        const statusLink = Object.assign(document.createElement("a"), {
            textContent: "check status",
            href: "https://github.com/OsborneLabs/Spotless",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "outbound-status-page",
        });
        errorMessage.append(updateLink, " or ", statusLink);
        errorPage.append(errorMessage);
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
        locked.classList.toggle("active", state.ui.hidingEnabled);
        unlocked.classList.toggle("active", !state.ui.hidingEnabled);
    }

    function determinePanelState(sponsoredCount) {
        if (!validateSponsoredCount(sponsoredCount)) {
            return buildPanelErrorPage();
        }
        return buildPanelHomePage();
    }

    function validateCurrentPage() {
        const url = new URL(location.href);
        const params = url.searchParams;
        const isSearchPage = /^https:\/\/([a-z0-9-]+\.)*ebay\.[a-z.]+\/sch\//i.test(url.href);
        const isAdvancedSearchPage = url.href.includes("ebayadvsearch");
        const isSellerPage = params.has("_ssn");
        const isVisuallySimilarPage = params.get("_vss") === "1";
        const isCompletedPage = params.get("LH_Complete") === "1";
        const isSoldPage = params.get("LH_Sold") === "1";
        return isSearchPage && !isAdvancedSearchPage && !isVisuallySimilarPage && !isSellerPage && !isCompletedPage && !isSoldPage;
    }

    function isListingPage() {
        return /^https:\/\/([a-z0-9-]+\.)*ebay\.[a-z.]+\/itm\/\d+/.test(location.href);
    }

    async function processSponsoredContent() {
        if (state.ui.isContentProcessing) return 0;
        state.ui.isContentProcessing = true;

        try {
            observer.disconnect();
            resetSponsoredContent();
            const detectedSponsoredElements = new Set();
            const svgMethod = await detectSponsoredListingBySVG();
            svgMethod.forEach(el => {
                const li = el.closest("li");
                if (li) detectedSponsoredElements.add(li);
            });
            if (detectedSponsoredElements.size === 0) {
                const invertMethod = detectSponsoredListingByInvertStyle();
                invertMethod.elements?.forEach(li => detectedSponsoredElements.add(li));
            }
            if (detectedSponsoredElements.size === 0) {
                const separatorSizeMethod = detectSponsoredListingBySeparatorSize();
                separatorSizeMethod.forEach(li => detectedSponsoredElements.add(li));
            }
            if (detectedSponsoredElements.size === 0) {
                const ariaGroupMethod = detectSponsoredListingByAriaGroup();
                ariaGroupMethod.forEach(li => detectedSponsoredElements.add(li));
            }
            requestAnimationFrame(() => {
                const count = detectedSponsoredElements.size;
                const sponsoredDetectionSucceeded = validateSponsoredCount(count);
                if (sponsoredDetectionSucceeded) {
                    for (const el of detectedSponsoredElements) {
                        if (!el.hasAttribute("data-sponsored-processed")) {
                            designateSponsoredContent(el);
                            highlightSponsoredContent(el);
                            hideShowSponsoredContent(el, state.ui.hidingEnabled);
                        }
                    }
                }
                removeSponsoredRibbons();
                cleanListingURLs();
                cleanGeneralURLs();
                cleanGeneralClutter();
                hideOrShowPanel();
                countSponsoredContent(count);
                initObserver();
                state.ui.isContentProcessing = false;
            });
            return detectedSponsoredElements.size;
        } catch (err) {
            console.error(`${APP_NAME_DEBUG}: UNABLE TO PROCESS SPONSORED CONTENT, SEE CONSOLE ERROR\n`, err);
            state.ui.isContentProcessing = false;
            initObserver();
            return 0;
        }
    }

    function validateSponsoredCount(sponsoredCount) {
        const listings = getListingElements();
        const listingCount = listings.length;
        if (listingCount === 0) return false;
        const MIN_SPONSORED = 2;
        const MAX_PERCENT = 0.5;
        const sponsoredPercent = sponsoredCount / listingCount;
        return sponsoredCount >= MIN_SPONSORED && sponsoredPercent <= MAX_PERCENT;
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
                    let svgDivSpan = listing.querySelector(".s-item__sep span[aria-hidden='true']");
                    let backgroundImage;
                    if (svgDivSpan) {
                        backgroundImage = getComputedStyle(svgDivSpan.parentElement).backgroundImage;
                    } else {
                        const svgDivB = listing.querySelector(".s-card__sep b[style*='data:image/svg+xml']");
                        if (!svgDivB) return done();
                        backgroundImage = getComputedStyle(svgDivB).backgroundImage;
                    }
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
                    img.onerror = done;

                    function done() {
                        processedInBatch++;
                        if (processedInBatch === batch.length) {
                            index += batchSize;
                            setTimeout(processBatch, 0);
                        }
                    }
                });
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
                const filteredBanners = banners.filter(banner => {
                    const h1 = banner.querySelector("h1");
                    if (h1 && /shop similar items/i.test(h1.textContent.trim())) {
                        return false;
                    }
                    return true;
                });
                filteredBanners.forEach(banner => {
                    banner.classList.add("sponsored-hidden-banner");
                });
                resolve(filteredBanners);
            }, 600);
        });
    }

    function removeSponsoredRibbons() {
        document.querySelectorAll('.x-breadcrumb, .x-pda-placements')
            .forEach(el => el.remove());
        const whitelisted = ['statusmessage', 'x-alert'];
        const ribbons = document.querySelectorAll('.x-evo-atf-top-river.vi-grid.vim > .d-vi-evo-region.vim > div');
        ribbons.forEach(ribbon => {
            const isWhitelisted = whitelisted.some(pattern =>
                ribbon.classList.value.includes(pattern)
            );
            if (!isWhitelisted) ribbon.remove();
        });
    }

    function removeSponsoredCarousels() {
        if (!isListingPage()) return;
        const SPONSORED_KEYWORDS = [
            'sponsored', 'anzeige', 'gesponsord', 'patrocinado',
            'sponsorisé', 'sponsorizzato', 'sponsorowane', '助贊'
        ];
        const normalizeText = (text) =>
            text.trim().normalize("NFKC").replace(/[\u200B-\u200D\u061C\uFEFF]/g, '').toLowerCase();
        const labelSponsored = (carousel) => {
            carousel.classList.add('sponsored-hidden-carousel');
            removeSiteTelemetry(carousel);
        };
        const carousels = document.querySelectorAll('[data-viewport]');
        carousels.forEach(carousel => {
            if (carousel.classList.contains('sponsored-hidden-carousel')) return;
            const titleElement = carousel.querySelector('h2, h3, h4');
            if (titleElement && SPONSORED_KEYWORDS.some(kw => normalizeText(titleElement.textContent).includes(kw))) {
                labelSponsored(carousel);
                return;
            }
            const textElements = Array.from(carousel.querySelectorAll('div, span'));
            if (textElements.some(el => SPONSORED_KEYWORDS.some(kw => normalizeText(el.textContent).includes(kw)))) {
                labelSponsored(carousel);
                return;
            }
            const characters = textElements
                .map(el => normalizeText(el.textContent))
                .filter(t => t.length === 1 && /^\p{L}$/u.test(t));
            if (SPONSORED_KEYWORDS.some(kw => {
                    let matchIndex = 0;
                    for (const char of characters) {
                        if (char === kw[matchIndex]) {
                            matchIndex++;
                            if (matchIndex === kw.length) return true;
                        }
                    }
                    return false;
                })) {
                labelSponsored(carousel);
            }
        });
    }

    function removeSiteTelemetry(context = document) {
        const trackableSelector = '[trackableid], [trackablemoduleid]';
        const removeTrackingAttributes = (el) => {
            el.removeAttribute('trackableid');
            el.removeAttribute('trackablemoduleid');
        };
        context.querySelectorAll('[data-viewport]').forEach((el) => {
            el.setAttribute('data-viewport', '{}');
            const trackedElements = el.matches(trackableSelector) ? [el, ...el.querySelectorAll(trackableSelector)] :
                el.querySelectorAll(trackableSelector);
            trackedElements.forEach(removeTrackingAttributes);
        });
        context.querySelectorAll('li[data-viewport]').forEach((li) => {
            li.setAttribute('data-viewport', '{}');
            li.removeAttribute('data-listingid');
            li.removeAttribute('data-view');
            li.removeAttribute('id');
            const trackedElements = li.matches(trackableSelector) ? [li, ...li.querySelectorAll(trackableSelector)] :
                li.querySelectorAll(trackableSelector);
            trackedElements.forEach(removeTrackingAttributes);
        });
        const telemetryAttributesRegex = [
            /^data-s-[a-z0-9]+$/i,
            /^data-atf/i
        ];
        const telemetryAttributes = ['data-click', 'data-ebayui', 'data-track', '_sp'];
        context.querySelectorAll('*').forEach((el) => {
            Array.from(el.attributes).forEach(({
                name
            }) => {
                if (telemetryAttributesRegex.some((rx) => rx.test(name)) || telemetryAttributes.includes(name)) {
                    el.removeAttribute(name);
                }
            });
        });
        context.querySelectorAll('img[onerror]').forEach((img) => {
            img.removeAttribute('onerror');
        });
    }

    function designateSponsoredContent(el) {
        el.setAttribute("data-sponsored", "true");
        el.setAttribute("data-sponsored-processed", "true");
        state.ui.highlightedSponsoredContent.push(el);
    }

    function resetSponsoredContent() {
        const elements = state.ui.highlightedSponsoredContent;
        elements.forEach(el => {
            el.classList.remove("sponsored-hidden");
            el.removeAttribute("data-sponsored");
            el.removeAttribute("data-sponsored-processed");
            el.style.border = "";
            el.style.backgroundColor = "";
        });
        elements.length = 0;
    }

    function highlightSponsoredContent(element) {
        element.setAttribute("data-sponsored", "true");
        element.classList.add("sponsored-highlight");
    }

    function hideShowSponsoredContent(element, hide) {
        element.classList.toggle("sponsored-hidden", hide);
    }

    function cleanListingURLs() {
        const url = /^https:\/\/((?:[a-z0-9-]+\.)*)ebay\.([a-z.]+)\/itm\/(\d+)(?:[/?#].*)?/i;
        const links = document.querySelectorAll("a[href*='/itm/']");
        links.forEach((link) => {
            const match = link.href.match(url);
            if (match) {
                let subdomains = match[1] || "";
                const tld = match[2];
                const itemId = match[3];
                const parts = subdomains.split(".").filter(Boolean).filter(p => p !== "www");
                const subdomain = parts.length ? parts.join(".") + "." : "";
                const cleanURL = `https://${subdomain}ebay.${tld}/itm/${itemId}`;
                if (link.href !== cleanURL) {
                    link.href = cleanURL;
                }
            }
            link.removeAttribute("data-interactions");
        });
        removeSiteTelemetry();
    }

    function cleanGeneralURLs() {
        const TRACKING_KEYS = [
            "_from", "_odkw", "_osacat", "_trksid", "campaign", "campid",
            "mkcid", "mkevt", "mkrid", "promoted_items", "siteid", "source",
            "sr", "templateId", "toolid"
        ];
        document.querySelectorAll("a[href*='ebay.']").forEach(link => {
            try {
                const url = new URL(link.href);
                if (!/(\.|^)ebay\.([a-z.]+)$/i.test(url.hostname)) return;
                const params = url.searchParams;
                TRACKING_KEYS.forEach(key => params.delete(key));
                for (const key of params.keys()) {
                    if (key.startsWith("utm_") || key.startsWith("_trk")) {
                        params.delete(key);
                    }
                }
                const cleanURL = `${url.origin}${url.pathname}${params.toString() ? "?" + params.toString() : ""}${url.hash}`;
                if (link.href !== cleanURL) link.href = cleanURL;
            } catch {}
        });
        document.querySelectorAll("form[action*='ebay.'], form[action='/sch/i.html']").forEach(form => {
            const cleanFormInputs = () => {
                form.querySelectorAll(TRACKING_KEYS.map(k => `[name='${k}']`).join(",")).forEach(input => input.remove());
            };
            cleanFormInputs();
            form.addEventListener("submit", () => cleanFormInputs(), true);
        });
    }

    function cleanGeneralClutter() {
        const selector = [
            '[class*="EBAY_LIVE_ENTRY"]', '[class*="FAQ_KW_SRP_MODULE"]', '.madrona-banner', '.s-feedback', '.s-faq-list'
        ];
        const elements = document.querySelectorAll(selector.join(','));
        elements.forEach(el => el.remove());
    }

    function scheduleHighlightUpdate() {
        if (state.ui.updateScheduled || state.ui.isContentProcessing) return;
        state.ui.updateScheduled = true;
        requestAnimationFrame(() => {
            processSponsoredContent().finally(() => {
                state.ui.updateScheduled = false;
            });
        });
    }

    const observer = new MutationObserver(() => {
        hideOrShowPanel();
        scheduleHighlightUpdate();
    });
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCleanListingObserver);
    } else {
        initCleanListingObserver();
    }

    window.addEventListener("storage", ({
        key,
        newValue
    }) => {
        if (key === APP_KEY_OBSTRUCT_SPONSORED) {
            const isEnabled = newValue === "true";
            if (isEnabled === state.ui.hidingEnabled) return;
            state.ui.hidingEnabled = isEnabled;
            const toggleInput = document.getElementById("toggleSponsoredContentSwitch");
            if (toggleInput) toggleInput.checked = isEnabled;
            updateLockIcon();
            scheduleHighlightUpdate();
            return;
        }
        if (key === "panelMinimized") {
            minimizePanel(newValue === "true");
        }
    });

    const initAfterDOM = async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        init();
        removeSponsoredBanners();
    };
    if (["complete", "interactive"].includes(document.readyState)) {
        initAfterDOM();
    } else {
        window.addEventListener("DOMContentLoaded", initAfterDOM);
    }

})();