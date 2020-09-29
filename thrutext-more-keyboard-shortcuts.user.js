// ==UserScript==
// @name         ThruText More Keyboard Shortcuts
// @namespace    http://suspectclass.com/
// @version      0.4
// @resource helpScreenshot https://github.com/scottgifford/greasemonkey-thrutext-extra-shortcuts/raw/master/help.png
// @resource helpHtml https://github.com/scottgifford/greasemonkey-thrutext-extra-shortcuts/raw/master/help.html
// @description  Add extra keyboard shortcuts for ThruText
// @author       Scott Gifford <sgifford@suspectclass.com>
// @match        *://*.textforvictory2020.com/*
// @grant       GM_getResourceURL
// ==/UserScript==

(function() {
    'use strict';

    console.log(`Starting ${GM_info.script.name} version ${GM_info.script.version}...`);

    const helpScreenshotImage = document.createElement('img');
    window.helpScreenshotImage = helpScreenshotImage;
    helpScreenshotImage.src = GM_getResourceURL("helpScreenshot");
    helpScreenshotImage.style.display = 'none';
    helpScreenshotImage.style.position = 'fixed';
    helpScreenshotImage.style.zIndex = 100;
    helpScreenshotImage.style.height = '80%';
    helpScreenshotImage.style.top = '10%';
    helpScreenshotImage.style.left = '10%';

    document.body.appendChild(helpScreenshotImage);

    const decorateItems = (sel, callback, root) => {
        if (!root) {
            root = document;
        }
        console.log(`Decorating items for ${sel} at root:`, root);
        const elements = root.querySelectorAll(sel);
        console.log(`Found ${elements.length} matching items`);
        root.querySelectorAll(sel)
            .forEach((elt, i) => {
              if (i < 10) {
                  console.log(`Decorating element ${i}:`, elt);
                  if (!elt.alreadyDecorated) {
                      elt.alreadyDecorated = true;
                      // 1-based numbering
                      callback(elt, (i + 1)%10);
                  }
              }
        });
    };

    const unDecorateItems = (sel, callback, root) => {
        if (!root) {
            root = document;
        }
        console.log(`Undecorating items for ${sel} at root:`, root);
        const elements = root.querySelectorAll(sel);
        console.log(`Found ${elements.length} matching items`);
        root.querySelectorAll(sel)
            .forEach((elt, i) => {
            if (elt.alreadyDecorated) {
                console.log(`Undecorating element ${i}:`, elt);
                // 1-based numbering
                callback(elt, (i + 1)%10);
                elt.alreadyDecorated = false;
            }
        });
    };

    // Survey question DOM element that is active, or undefined if none
    let inSurveyQuestion = undefined;

    // For the Reply menu, the CSS selector to find the menu items to click on.
    // Distinguishes between the main question block and the "My Replies" question block.
    let menuElementSelector = undefined;

    function doc_keyDown(e) {
        console.log("Key Down Event:", e);
        if (e.ctrlKey) {
            let preventDefault = true;
            switch(e.code) {
                // Global Keys
                case "KeyH": {
                    console.log(`Showing help screen`);
                    const helpImage = GM_getResourceURL("helpScreenshot");
                    const w = window.open("", "greasemonkey-thrutext-extra-shortcuts-help");
                    w.document.title = `Help for ${GM_info.script.name} version ${GM_info.script.version}`;

                    const img = window.document.createElement('img');
                    img.src = GM_getResourceURL("helpScreenshot");
                    w.document.body.appendChild(img);
                    break;
                }
                case "KeyS":
                    console.log("Survey Tab Activated");
                    document.querySelector('.v2-conversation-tools__header ul :nth-child(1)').click();
                    menuElementSelector = '.v2-survey-question .v2-survey-question__title';
                    decorateItems(menuElementSelector, (a, i) => {
                        a.innerText = `(${i}) ${a.innerText}`
                    });
                    inSurveyQuestion = undefined;
                    break;
                case "KeyR": {
                    let questionBlock;
                    if (e.shiftKey) {
                        questionBlock = 2;
                    } else {
                        questionBlock = 1;
                    }

                    console.log(`Responses tab activated, question block ${questionBlock}`);

                    // Replies is second tab
                    document.querySelector(`.v2-conversation-tools__header ul :nth-child(2)`).click();

                    document.querySelector('#message-composer__input').focus();

                    // Undecorate any replies to get a clean slate
                    unDecorateItems('.v2-replies-list .v2-reply__single-row', (r) => {
                        const t = r.querySelector('.v2-reply__title');
                        if (t.origText) {
                            t.innerText = t.origText;
                        }
                    });

                    const listHeaders = document.querySelectorAll('.v2-replies-list__header');
                    if (listHeaders.length >= questionBlock) {
                        listHeaders[questionBlock-1].scrollIntoView(true);
                    }
                    menuElementSelector = `.v2-replies-list:nth-of-type(${questionBlock}) .v2-reply__add`;
                    decorateItems(`.v2-replies-list:nth-of-type(${questionBlock}) .v2-reply__single-row`, (r,i) => {
                        const t = r.querySelector('.v2-reply__title');
                        if (!t.origText) {
                            t.origText = t.innerText;
                        }
                        t.innerText = `(${i}) ${t.innerText}`;
                    });
                    break;
                }
                case "Enter": {
                    console.log("Focus and enter activated");
                    const messageInput = document.querySelector('#message-composer__input');
                    messageInput.focus();
                    messageInput.form.querySelector('.button--primary').click();
                    break;
                }
                case "KeyI":
                    console.log("Information Tab Activated");
                    document.querySelector('.v2-conversation-tools__header ul :nth-child(3)').click();
                    break;
                case "KeyO":
                    console.log("Opt-Out Button Activated");
                    document.querySelector('.button--opt-out').click();
                    break;
                case "KeyA":
                    console.log("Archive Button Activated");
                    document.querySelectorAll('.conversation-tools')[1].click();
                    break;
                case "KeyM":
                    console.log("Miscellaneous Menu Activated");
                    document.querySelector('.nav-dropdown-title__menu-icon-left').click();
                    decorateItems(`.nav-dropdown ul a`, (a, i) => {
                        a.innerText = `(${i}) ${a.innerText}`;
                    });
                    break;
                case "KeyC": {
                    console.log("Conversation Shortcut Activated");
                    const activeConversationsDOM = document.querySelectorAll('.v2-conversations-list__conversation-link .v2-conversations-list__indicator-dot--blue');
                    if (activeConversationsDOM.length < 1) {
                        console.log("No active conversations");
                    } else {
                        if (e.shiftKey) {
                            console.log(`Navigating to last conversation`);
                            activeConversationsDOM[activeConversationsDOM.length-1].click();
                        } else {
                            console.log(`Navigating to first conversation`);
                            activeConversationsDOM[0].click();
                        }
                    }
                    break;
                }
                // Confirmation Dialog
                case "KeyY": {
                    const yesButton = document.querySelector('.form__actions--primary-button');
                    if (yesButton) {
                        console.log("Yes button in dialog activated");
                        yesButton.click();
                    } else {
                        console.log("Yes Button in dialog not found");
                    }
                    break;
                }
                case "KeyN": {
                    const noButton = document.querySelector('.form__actions--cancel-button');
                    if (noButton) {
                        console.log("No button in dialog activated");
                        noButton.click();
                    } else {
                        console.log("No button in dialog not found");
                    }
                    break;
                }
                // Numeric Items (for Survey, Replies, Info)
                case "Digit0":
                case "Digit1":
                case "Digit2":
                case "Digit3":
                case "Digit4":
                case "Digit5":
                case "Digit6":
                case "Digit7":
                case "Digit8":
                case "Digit9":
                case "Numpad0":
                case "Numpad1":
                case "Numpad2":
                case "Numpad3":
                case "Numpad4":
                case "Numpad5":
                case "Numpad6":
                case "Numpad7":
                case "Numpad8":
                case "Numpad9":
                    {
                        let item = parseInt(e.key);
                        // 1-based numbering
                        if (item === 0) {
                            item = 9;
                        } else {
                            item -= 1;
                        }
                        console.log(`Numeric shortcut attempted: key ${e.key}, 0-based item ${item}`);
                        if (document.querySelector('.v2-surveys')) {
                            // Survey
                            console.log("Surveys tab is visible");
                            if (inSurveyQuestion) {
                                // Choose a survey response
                                console.log(`Survey response menu item: ${item}`);
                                const response = inSurveyQuestion.querySelectorAll('input,textarea')[item];
                                console.log("Response item", response);
                                response.focus();
                                response.click();
                            } else {
                                // Choose a survey question
                                console.log(`Survey menu item: ${item}`);
                                inSurveyQuestion = document.querySelectorAll(`.v2-surveys .v2-survey-question`)[item];
                                inSurveyQuestion.scrollIntoView(true);
                                decorateItems('.v2-form__radio-option,.v2-form__checkbox-option,.v2-form__text-input', (opt,i) => {
                                    const newElt = document.createElement('span');
                                    newElt.classList = ['tt-kb-decorator'];
                                    newElt.innerText = `(${i}) `;
                                    const label = opt.querySelector('label');
                                    label.insertBefore(newElt, label.firstChild);
                                }, inSurveyQuestion);
                            }
                        } else if (document.querySelector('.v2-conversation-replies')) {
                            // Replies
                            console.log(`Replies tab is visible, selecting item ${item} with selector '${menuElementSelector}`);
                            document.querySelectorAll(menuElementSelector)[item].click();
                        } else if (document.querySelector('.nav-dropdown-item--current-account')) {
                            // Profile/Account
                            console.log(`Profile/Account tab is visible, selecting item ${item}`);
                            document.querySelectorAll(`.nav-dropdown ul a`)[item].click();
                            break;
                        } else {
                            console.log("Survey, Replies, and Profile/Account not active, not doing anything");
                        }
                    }
                    break;
                default:
                    preventDefault = false;
                    break;
            }
            if (preventDefault) {
                e.preventDefault();
            }
        }
    }

    function doc_keyUp(e) {
        console.log("Key Up Event:", e);
        switch(e.code) {
            case "ControlLeft":
            case "ControlRight":
                console.log("Released CTRL-key, removing sub-menus");
                if (inSurveyQuestion) {
                    console.log("Released CTRL-key, should un-decorate");
                    unDecorateItems('.v2-form__radio-option,.v2-form__checkbox-option,.v2-form__text-input', (elt) => {
                        const decoratorElt = elt.querySelector('.tt-kb-decorator');
                        if (decoratorElt) {
                            decoratorElt.remove();
                        }
                    });
                    inSurveyQuestion = undefined;
                }
                break;
        }
    }

    // Main event handlers for keyboard shortcuts
    document.addEventListener('keydown', doc_keyDown, true);
    document.addEventListener('keyup', doc_keyUp, true);

    // Add our swag
    const addSwag = () => {
        const withExtraKeys = document.createElement('span');
        withExtraKeys.innerText = `+More Keyboard Shortcuts ${GM_info.script.version}`;
        const logoContainer = document.querySelector('.nav__left');
        if (logoContainer) {
            // Hack to avoid our swag appearing below the logo instead of next to it
            // Breaks the vertical centering but we'll live with that.
            logoContainer.querySelector('.nav__logo-container').style.display = 'inline';
            logoContainer.appendChild(withExtraKeys);
        } else {
            window.setTimeout(addSwag, 250);
        }
    };
    addSwag();

    console.log(`Successfully started ${GM_info.script.name} version ${GM_info.script.version}!`);

})();
