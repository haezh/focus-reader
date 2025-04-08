chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle-focus') {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
                // Try to send the message
                chrome.tabs.sendMessage(tabs[0].id, {action: 'toggle'})
                    .catch(error => {
                        console.log('Could not send message to content script:', error);
                    });
            }
        });
    }
}); 