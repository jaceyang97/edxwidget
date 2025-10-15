// Popup script for EDX Video Widget
(function() {
  'use strict';

  const toggleCheckbox = document.getElementById('toggleCheckbox');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const transcriptToggle = document.getElementById('transcriptToggle');

  // Load saved state
  chrome.storage.sync.get(['widgetEnabled', 'hideSidebar', 'hideTranscript'], function(result) {
    const widgetEnabled = result.widgetEnabled !== undefined ? result.widgetEnabled : true;
    const hideSidebar = result.hideSidebar !== undefined ? result.hideSidebar : true;
    const hideTranscript = result.hideTranscript !== undefined ? result.hideTranscript : true;
    
    toggleCheckbox.checked = widgetEnabled;
    sidebarToggle.checked = hideSidebar;
    transcriptToggle.checked = hideTranscript;
  });

  // Handle widget toggle change
  toggleCheckbox.addEventListener('change', function() {
    const widgetEnabled = toggleCheckbox.checked;
    
    // Save to storage
    chrome.storage.sync.set({ widgetEnabled: widgetEnabled });

    // Send message to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleWidget',
          enabled: widgetEnabled
        });
      }
    });
  });

  // Handle sidebar toggle change
  sidebarToggle.addEventListener('change', function() {
    const hideSidebar = sidebarToggle.checked;
    
    // Save to storage (this will trigger the storage listener in content.js)
    chrome.storage.sync.set({ hideSidebar: hideSidebar });
  });

  // Handle transcript toggle change
  transcriptToggle.addEventListener('change', function() {
    const hideTranscript = transcriptToggle.checked;
    
    // Save to storage (this will trigger the storage listener in content.js)
    chrome.storage.sync.set({ hideTranscript: hideTranscript });
  });
})();

