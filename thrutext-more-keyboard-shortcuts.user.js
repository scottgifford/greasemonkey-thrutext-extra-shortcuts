// ==UserScript==
// @name         ThruText More Keyboard Shortcuts
// @namespace    http://suspectclass.com/
// @version      0.2
// @resource helpScreenshot https://github.com/scottgifford/greasemonkey-thrutext-extra-shortcuts/raw/master/help.png
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

    let inSurveyQuestion = undefined;
    function doc_keyDown(e) {
        console.log("Key Down Event:", e);
        if (e.ctrlKey) {
            let preventDefault = true;
            switch(e.code) {
                // Global Keys
                case "KeyH":
                    if (helpScreenshotImage.style.display) {
                        console.log("Help Screen Activated");
                        helpScreenshotImage.style.display = '';
                    } else {
                        console.log("Help Screen De-Activated");
                        helpScreenshotImage.style.display = 'none';
                    }
                    break;
                case "KeyS":
                    console.log("Survey Tab Activated");
                    document.querySelector('.v2-conversation-tools__header ul :nth-child(1)').click();
                    decorateItems(`.v2-survey-question .v2-survey-question__title`, (a, i) => {
                        a.innerText = `(${i}) ${a.innerText}`
                    });
                    inSurveyQuestion = undefined;
                    break;
                case "KeyR":
                    console.log("Responses Tab Activated");
                    document.querySelector('.v2-conversation-tools__header ul :nth-child(2)').click();
                    decorateItems('.v2-replies-list .v2-reply__single-row', (r,i) => {
                          const t = r.querySelector('.v2-reply__title');
                          t.innerText = `(${i}) ${t.innerText}`;
                    });
                    document.querySelector('#message-composer__input').focus();
                    break;
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
                                inSurveyQuestion.scrollIntoViewIfNeeded();
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
                            console.log(`Replies tab is visible, selecting item: ${item}`);
                            document.querySelectorAll(`.v2-conversation-replies .v2-reply__single-row .v2-reply__add`)[item].click();
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
                    inSurveyQuestion.querySelectorAll('.tt-kb-decorator').forEach((elt) => {
                        // Mark as un-decorated so we can re-decorate if chosen again
                        elt.parentNode.parentNode.alreadyDecorated = false;
                        elt.remove();
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
        withExtraKeys.innerText = "+More Keyboard Shortcuts";
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
