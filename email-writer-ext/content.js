console.log("Email Writer Extension - Content Script Loaded");
let selectedTone = 'professional';

function createAIButton() {
    const wrapper = document.createElement('div');
    wrapper.className = 'dC';
    wrapper.style.marginRight = '8px';

    const mainButton = document.createElement('div');
    mainButton.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    mainButton.setAttribute('role', 'button');
    mainButton.setAttribute('tabindex', '1');
    mainButton.setAttribute('data-tooltip', 'Generate AI Reply');
    mainButton.setAttribute('data-tooltip-delay', '800');
    mainButton.setAttribute('aria-label', 'Generate AI Reply');
    mainButton.style.userSelect = 'none';
    mainButton.innerText = 'AI Reply';

    const dropdownButton = document.createElement('div');
    dropdownButton.className = 'T-I J-J5-Ji hG T-I-atl L3';
    dropdownButton.setAttribute('role', 'button');
    dropdownButton.setAttribute('tabindex', '1');
    dropdownButton.setAttribute('aria-label', 'More AI options');
    dropdownButton.setAttribute('data-tooltip', 'More AI options');
    dropdownButton.setAttribute('data-tooltip-delay', '800');
    dropdownButton.setAttribute('aria-expanded', 'false');
    dropdownButton.setAttribute('aria-haspopup', 'true');
    dropdownButton.style.userSelect = 'none';

    const arrowIcon = document.createElement('div');
    arrowIcon.className = 'G-asx';
    dropdownButton.appendChild(arrowIcon);

    dropdownButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdownMenu(dropdownButton, mainButton);
    });

    wrapper.appendChild(mainButton);
    wrapper.appendChild(dropdownButton);

    // ✅ Return both so injectButton can reference mainButton directly
    return { wrapper, mainButton };
}

function toggleDropdownMenu(anchor, mainButton) {
    const existing = document.querySelector('.ai-reply-dropdown');
    if (existing) {
        existing.remove();
        return;
    }

    const tones = [
        { label: 'Professional', value: 'professional' },
        { label: 'Casual',       value: 'casual' },
        { label: 'Friendly',       value: 'friendly' },
    ];

    const menu = document.createElement('div');
    menu.className = 'ai-reply-dropdown J-M jQjAxd';
    menu.setAttribute('role', 'menu');

    tones.forEach(({ label, value }) => {
        const item = document.createElement('div');
        item.className = 'J-N';
        item.setAttribute('role', 'menuitem');
        item.style.cssText = 'padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px;';

        const check = document.createElement('span');
        check.innerText = selectedTone === value ? '✓' : '';
        check.style.cssText = 'width: 16px; color: #1a73e8; font-weight: bold;';

        const text = document.createElement('span');
        text.innerText = label;

        item.appendChild(check);
        item.appendChild(text);

        item.addEventListener('mouseenter', () => item.style.background = '#f1f3f4');
        item.addEventListener('mouseleave', () => item.style.background = '');
        item.addEventListener('click', () => {
            selectedTone = value;
            // ✅ Only update text, don't touch innerHTML of wrapper
            mainButton.innerText = `AI Reply (${label})`;
            menu.remove();
        });

        menu.appendChild(item);
    });

    const rect = anchor.getBoundingClientRect();
    menu.style.cssText = `
        position: fixed;
        top: ${rect.bottom + 4}px;
        left: ${rect.left}px;
        background: white;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 9999;
        min-width: 180px;
    `;

    document.body.appendChild(menu);

    setTimeout(() => {
        document.addEventListener('click', () => menu.remove(), { once: true });
    }, 0);
}

function getEmailContent() {
    const selectors = ['.h7', '.a3s.aiL', '.gmail_quote', '[role="presentation"]'];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) return content.innerText.trim();
    }
    return '';
}

function findComposeToolbar() {
    const selectors = ['.btC', '.aDh', '[role="toolbar"]', '.gU.Up'];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) return toolbar;
    }
    return null;
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) existingButton.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    console.log("Toolbar found, creating AI button");

    // ✅ Destructure to get both wrapper and mainButton
    const { wrapper, mainButton } = createAIButton();
    wrapper.classList.add('ai-reply-button');

    // ✅ Click listener on mainButton only, never touch wrapper.innerHTML
    mainButton.addEventListener('click', async () => {
        try {
            mainButton.innerText = 'Generating...';          // ✅ innerText on mainButton only
            mainButton.style.pointerEvents = 'none';         // ✅ disable clicks on a div correctly

            const emailContent = getEmailContent();
            const response = await fetch('https://email-writer.duckdns.org/api/email/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailContent, tone: selectedTone })
            });

            if (!response.ok) throw new Error('API Request Failed');

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                document.execCommand('selectAll', false, null);
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose box was not found');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate reply');
        } finally {
            // ✅ Restore label with current tone
            mainButton.innerText = `AI Reply (${selectedTone})`;
            mainButton.style.pointerEvents = 'auto';
        }
    });

    toolbar.insertBefore(wrapper, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );
        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });