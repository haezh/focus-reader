let currentParagraph = null;
let overlay = null;
let isEnabled = false;

function createOverlay() {
    overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9998;
        pointer-events: none;
    `;
    document.body.appendChild(overlay);
}

function findParagraphFromElement(element) {
    // Find the nearest paragraph or image element
    while (element && element.nodeType === Node.ELEMENT_NODE) {
        if (element.tagName === 'P' || 
            element.tagName === 'DIV' || 
            element.tagName === 'ARTICLE' || 
            element.tagName === 'SECTION' ||
            element.tagName === 'LI' ||
            element.tagName === 'IMG') {
            return element;
        }
        element = element.parentNode;
    }
    return null;
}

function clearHighlight() {
    if (currentParagraph) {
        currentParagraph.style.backgroundColor = '';
        currentParagraph.style.zIndex = '';
        currentParagraph.style.border = '';
        currentParagraph.classList.remove('focus-reader-highlight');
        currentParagraph = null;
    }
}

function updateHighlight(paragraph) {
    if (!paragraph || !isEnabled) return;
    
    // Clear previous highlight
    clearHighlight();
    
    // Apply new highlight
    currentParagraph = paragraph;
    
    if (currentParagraph.tagName === 'IMG') {
        // Special styling for images
        currentParagraph.style.border = '4px solid white';
        currentParagraph.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
        currentParagraph.style.zIndex = '9999';
        currentParagraph.style.position = 'relative';
    } else {
        // Original styling for text elements
        currentParagraph.style.backgroundColor = 'white';
        currentParagraph.style.zIndex = '9999';
        currentParagraph.style.position = 'relative';
        currentParagraph.classList.add('focus-reader-highlight');
    }
    
    // Scroll to center the paragraph
    const rect = currentParagraph.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const targetPosition = rect.top + scrollTop - (viewportHeight / 2) + (rect.height / 2);
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

function getAllParagraphs() {
    const paragraphs = [];
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: function(node) {
                if (node.tagName === 'P' || 
                    node.tagName === 'DIV' || 
                    node.tagName === 'ARTICLE' || 
                    // node.tagName === 'SECTION' ||
                    node.tagName === 'LI' ||
                    node.tagName === 'IMG') {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP;
            }
        }
    );
    
    let node;
    while (node = walker.nextNode()) {
        paragraphs.push(node);
    }
    
    return paragraphs;
}

function findNextParagraph() {
    if (!currentParagraph) return null;
    
    const allParagraphs = getAllParagraphs();
    const currentIndex = allParagraphs.indexOf(currentParagraph);
    
    if (currentIndex === -1 || currentIndex === allParagraphs.length - 1) {
        return null;
    }
    
    return allParagraphs[currentIndex + 1];
}

function findPreviousParagraph() {
    if (!currentParagraph) return null;
    
    const allParagraphs = getAllParagraphs();
    const currentIndex = allParagraphs.indexOf(currentParagraph);
    
    if (currentIndex <= 0) {
        return null;
    }
    
    return allParagraphs[currentIndex - 1];
}

function handleClick(event) {
    if (!isEnabled) return;
    const clickedElement = event.target;
    const paragraph = findParagraphFromElement(clickedElement);
    updateHighlight(paragraph);
}

function handleKeyDown(event) {
    if (!isEnabled) return;
    
    if (event.key === 'ArrowDown') {
        event.preventDefault(); // Prevent default arrow key behavior
        const nextParagraph = findNextParagraph();
        if (nextParagraph) {
            updateHighlight(nextParagraph);
        }
    } else if (event.key === 'ArrowUp') {
        event.preventDefault(); // Prevent default arrow key behavior
        const prevParagraph = findPreviousParagraph();
        if (prevParagraph) {
            updateHighlight(prevParagraph);
        }
    }
}

function toggleFocusMode() {
    isEnabled = !isEnabled;
    
    if (isEnabled) {
        if (!overlay) {
            createOverlay();
        }
        overlay.style.display = 'block';
    } else {
        if (overlay) {
            overlay.style.display = 'none';
        }
        clearHighlight();
    }
}

// Listen for click events
document.addEventListener('click', handleClick);

// Listen for keyboard events
document.addEventListener('keydown', handleKeyDown);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle') {
        toggleFocusMode();
    }
}); 