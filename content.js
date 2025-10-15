/**
 * EDX Video Widget
 * Version: 1.0
 * 
 * Enhances EDX video experience with:
 * - Master widget on/off toggle
 * - Video control bar toggle (always visible)
 * - Notification sidebar toggle (minimal popup)
 * - Transcript toggle with auto-hide on load
 * - Reliable fullscreen toggle with focus handling
 * - Play/pause button with dynamic icon
 * - Subtitle on/off toggle
 * - Adjustable subtitle size with number display
 * - Smooth directional staggered animations (no flash on load)
 * - Clean subtitles without drag handle
 * - Hidden unnecessary UI elements
 * - CSS-only modal hiding (no freezing)
 */
(function() {
  'use strict';

  // Create floating toggle buttons
  let floatingButton = null;
  let fullscreenButton = null;
  let playButton = null;
  let subtitleSizeButton = null;
  let subtitleToggleButton = null;
  
  function createFloatingButtons() {
    // Only create in top window, not in every iframe
    if (window !== window.top) {
      return;
    }
    
    // Check if buttons already exist
    if (document.getElementById('edx-control-toggle-btn')) {
      return;
    }
    
    // Create container for buttons
    const container = document.createElement('div');
    container.id = 'edx-floating-controls';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: row;
      gap: 10px;
      z-index: 999999;
    `;
    
    // Add animation styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.8) translateX(10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateX(0);
        }
      }
      
      @keyframes fadeOutScale {
        from {
          opacity: 1;
          transform: scale(1) translateX(0);
        }
        to {
          opacity: 0;
          transform: scale(0.8) translateX(10px);
        }
      }
      
      #edx-floating-controls > div {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      #edx-floating-controls > div.button-enter {
        animation: fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        opacity: 0;
      }
      
      #edx-floating-controls > div.button-exit {
        animation: fadeOutScale 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      
      #edx-floating-controls > div.button-hidden {
        display: none !important;
        opacity: 0;
      }
    `;
    document.head.appendChild(styleSheet);
    
    // Create control bar toggle button
    floatingButton = document.createElement('div');
    floatingButton.id = 'edx-control-toggle-btn';
    floatingButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/>
      </svg>
    `;
    
    // Create fullscreen toggle button
    fullscreenButton = document.createElement('div');
    fullscreenButton.id = 'edx-fullscreen-toggle-btn';
    fullscreenButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path id="fullscreen-icon" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/>
        <path id="exit-fullscreen-icon" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" fill="currentColor" style="display:none;"/>
      </svg>
    `;
    
    // Create play/pause button
    playButton = document.createElement('div');
    playButton.id = 'edx-play-toggle-btn';
    playButton.title = 'Play/pause video';
    playButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path id="play-icon" d="M8 5v14l11-7z" fill="currentColor"/>
        <path id="pause-icon" d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" fill="currentColor" style="display:none;"/>
      </svg>
    `;
    
    // Create subtitle size button
    subtitleSizeButton = document.createElement('div');
    subtitleSizeButton.id = 'edx-subtitle-size-btn';
    subtitleSizeButton.title = 'Change subtitle size (24px)';
    subtitleSizeButton.style.fontSize = '14px';
    subtitleSizeButton.style.fontWeight = 'bold';
    subtitleSizeButton.textContent = '24';
    
    // Create subtitle toggle button
    subtitleToggleButton = document.createElement('div');
    subtitleToggleButton.id = 'edx-subtitle-toggle-btn';
    subtitleToggleButton.title = 'Toggle subtitles';
    subtitleToggleButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
        <rect x="5" y="13" width="6" height="2" fill="currentColor"/>
        <rect x="13" y="13" width="6" height="2" fill="currentColor"/>
      </svg>
    `;
    
    // Common button styling
    const buttonStyle = `
      width: 50px;
      height: 50px;
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    `;
    
    floatingButton.style.cssText = buttonStyle;
    fullscreenButton.style.cssText = buttonStyle + 'display: none; opacity: 0;';
    playButton.style.cssText = buttonStyle + 'display: none; opacity: 0;';
    subtitleSizeButton.style.cssText = buttonStyle + 'display: none; opacity: 0;';
    subtitleToggleButton.style.cssText = buttonStyle + 'display: none; opacity: 0;';
    
    // Mark non-control-bar buttons as initially hidden
    fullscreenButton.classList.add('button-hidden');
    playButton.classList.add('button-hidden');
    subtitleSizeButton.classList.add('button-hidden');
    subtitleToggleButton.classList.add('button-hidden');
    
    // Hover effects for control bar button
    floatingButton.addEventListener('mouseenter', function() {
      this.style.background = 'rgba(0, 0, 0, 0.9)';
      this.style.transform = 'scale(1.1)';
    });
    
    floatingButton.addEventListener('mouseleave', function() {
      this.style.background = 'rgba(0, 0, 0, 0.7)';
      this.style.transform = 'scale(1)';
    });
    
    // Hover effects for fullscreen button
    fullscreenButton.addEventListener('mouseenter', function() {
      this.style.background = 'rgba(0, 0, 0, 0.9)';
      this.style.transform = 'scale(1.1)';
    });
    
    fullscreenButton.addEventListener('mouseleave', function() {
      this.style.background = 'rgba(0, 0, 0, 0.7)';
      this.style.transform = 'scale(1)';
    });
    
    // Hover effects for play button
    playButton.addEventListener('mouseenter', function() {
      this.style.background = 'rgba(0, 0, 0, 0.9)';
      this.style.transform = 'scale(1.1)';
    });
    
    playButton.addEventListener('mouseleave', function() {
      this.style.background = 'rgba(0, 0, 0, 0.7)';
      this.style.transform = 'scale(1)';
    });
    
    // Hover effects for subtitle size button
    subtitleSizeButton.addEventListener('mouseenter', function() {
      this.style.background = 'rgba(0, 0, 0, 0.9)';
      this.style.transform = 'scale(1.1)';
    });
    
    subtitleSizeButton.addEventListener('mouseleave', function() {
      this.style.background = 'rgba(0, 0, 0, 0.7)';
      this.style.transform = 'scale(1)';
    });
    
    // Hover effects for subtitle toggle button
    subtitleToggleButton.addEventListener('mouseenter', function() {
      this.style.background = 'rgba(0, 0, 0, 0.9)';
      this.style.transform = 'scale(1.1)';
    });
    
    subtitleToggleButton.addEventListener('mouseleave', function() {
      this.style.background = 'rgba(0, 0, 0, 0.7)';
      this.style.transform = 'scale(1)';
    });
    
    // Click handler for control bar toggle
    floatingButton.addEventListener('click', function() {
      chrome.storage.sync.get(['hideControls'], function(result) {
        const currentState = result.hideControls !== undefined ? result.hideControls : false;
        const newState = !currentState;
        
        chrome.storage.sync.set({ hideControls: newState }, function() {
          updateFloatingButtonState(newState);
        });
      });
    });
    
    // Click handler for fullscreen toggle
    fullscreenButton.addEventListener('click', function() {
      toggleFullscreen();
    });
    
    // Click handler for play/pause toggle
    playButton.addEventListener('click', function() {
      togglePlayPause();
      // Update icon after a short delay to reflect new state
      setTimeout(updatePlayButtonState, 200);
    });
    
    // Click handler for subtitle size toggle
    subtitleSizeButton.addEventListener('click', function() {
      chrome.storage.sync.get(['subtitleSize'], function(result) {
        const sizes = [20, 24, 28, 32, 36];
        const currentSize = result.subtitleSize || 24;
        const currentIndex = sizes.indexOf(currentSize);
        const nextIndex = (currentIndex + 1) % sizes.length;
        const newSize = sizes[nextIndex];
        
        chrome.storage.sync.set({ subtitleSize: newSize }, function() {
          applySubtitleSize(newSize);
          updateSubtitleSizeButton(newSize);
        });
      });
    });
    
    // Click handler for subtitle toggle
    subtitleToggleButton.addEventListener('click', function() {
      toggleSubtitles();
    });
    
    // Add buttons to container (left to right: play, fullscreen, subtitle toggle, subtitle size, control bar)
    // Mark the control bar button so it's always visible
    floatingButton.setAttribute('data-always-visible', 'true');
    
    container.appendChild(playButton);
    container.appendChild(fullscreenButton);
    container.appendChild(subtitleToggleButton);
    container.appendChild(subtitleSizeButton);
    container.appendChild(floatingButton);
    
    // Add to page
    document.body.appendChild(container);
    
    // Set initial states
    chrome.storage.sync.get(['widgetEnabled', 'hideControls', 'hideSidebar', 'subtitleSize'], function(result) {
      const widgetEnabled = result.widgetEnabled !== undefined ? result.widgetEnabled : true;
      const hideControls = result.hideControls !== undefined ? result.hideControls : false;
      const hideSidebar = result.hideSidebar !== undefined ? result.hideSidebar : true;
      const subtitleSize = result.subtitleSize || 24;
      const hideTranscript = result.hideTranscript !== undefined ? result.hideTranscript : true;
      
      // Show container if widget is enabled
      container.style.display = widgetEnabled ? 'flex' : 'none';
      
      // Show/hide individual buttons based on control bar state
      updateButtonVisibility(hideControls);
      
      if (widgetEnabled) {
        updateFloatingButtonState(hideControls);
        toggleSidebar(hideSidebar);
        applySubtitleSize(subtitleSize);
        updateSubtitleSizeButton(subtitleSize);
        toggleTranscript(!hideTranscript);
      }
    });
    
    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', updateFullscreenButtonState);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButtonState);
    document.addEventListener('mozfullscreenchange', updateFullscreenButtonState);
    document.addEventListener('MSFullscreenChange', updateFullscreenButtonState);
    
    updateFullscreenButtonState();
    
    // Start monitoring video state
    startVideoStateMonitoring();
  }
  
  function updatePlayButtonState(isPlaying) {
    if (!playButton) return;
    
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    
    if (playIcon && pauseIcon) {
      if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        playButton.title = 'Pause video';
      } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        playButton.title = 'Play video';
      }
    }
  }
  
  function startVideoStateMonitoring() {
    // Check video state periodically
    setInterval(() => {
      checkVideoState();
    }, 1000);
    
    // Initial check
    setTimeout(checkVideoState, 500);
  }
  
  function checkVideoState() {
    // Send message to iframes to check video state
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      try {
        iframe.contentWindow?.postMessage({ action: 'check-video-state' }, '*');
      } catch (e) {
        // Silent error handling
      }
    });
    
    // Also check in main window
    const video = document.querySelector('video');
    if (video) {
      updatePlayButtonState(!video.paused && !video.ended);
    }
  }
  
  function applySubtitleSize(size) {
    const subtitleElements = document.querySelectorAll('div.closed-captions, div.closed-captions span, div.closed-captions p, div.closed-captions div');
    subtitleElements.forEach(el => {
      el.style.setProperty('font-size', `${size}px`, 'important');
    });
  }
  
  function updateSubtitleSizeButton(size) {
    if (!subtitleSizeButton) return;
    subtitleSizeButton.textContent = size.toString();
    subtitleSizeButton.title = `Change subtitle size (${size}px)`;
  }
  
  function updateButtonVisibility(hideControls) {
    const container = document.getElementById('edx-floating-controls');
    if (!container) return;
    
    // Get all buttons in the container
    const buttons = Array.from(container.children);
    
    // Filter only the toggleable buttons (not the control bar toggle)
    const toggleableButtons = buttons.filter(btn => btn.getAttribute('data-always-visible') !== 'true');
    
    buttons.forEach((button, index) => {
      // Control bar toggle is always visible
      if (button.getAttribute('data-always-visible') === 'true') {
        button.classList.remove('button-hidden', 'button-exit', 'button-enter');
        button.style.display = 'flex';
        return;
      }
      
      // Get position in toggleable buttons array
      const toggleIndex = toggleableButtons.indexOf(button);
      
      // Other buttons show/hide with animation
      if (hideControls) {
        // Show button with staggered animation (right to left)
        // Reverse order: last button appears first
        const delay = (toggleableButtons.length - 1 - toggleIndex) * 80;
        
        // Remove hidden state and prepare for animation
        button.classList.remove('button-hidden', 'button-exit');
        button.style.opacity = '0';
        button.style.display = 'flex';
        
        setTimeout(() => {
          button.classList.add('button-enter');
          setTimeout(() => {
            button.classList.remove('button-enter');
            button.style.opacity = '1';
          }, 300);
        }, delay);
      } else {
        // Hide button with animation (left to right)
        // Normal order: first button disappears first
        const delay = toggleIndex * 80;
        
        // Clear any pending enter animations
        button.classList.remove('button-enter');
        
        // Only animate if button is currently visible
        if (button.style.display !== 'none' && !button.classList.contains('button-hidden')) {
          setTimeout(() => {
            button.classList.add('button-exit');
            
            setTimeout(() => {
              if (button.classList.contains('button-exit')) {
                button.style.display = 'none';
                button.classList.add('button-hidden');
                button.classList.remove('button-exit');
              }
            }, 300);
          }, delay);
        }
      }
    });
  }
  
  function updateFloatingButtonState(isHidden) {
    if (!floatingButton) return;
    
    if (isHidden) {
      floatingButton.style.borderColor = 'rgba(255, 100, 100, 0.6)';
      floatingButton.title = 'Show video controls';
    } else {
      floatingButton.style.borderColor = 'rgba(100, 255, 100, 0.6)';
      floatingButton.title = 'Hide video controls';
    }
  }
  
  function updateFullscreenButtonState() {
    if (!fullscreenButton) return;
    
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                            document.mozFullScreenElement || document.msFullscreenElement);
    
    const enterIcon = fullscreenButton.querySelector('#fullscreen-icon');
    const exitIcon = fullscreenButton.querySelector('#exit-fullscreen-icon');
    
    if (isFullscreen) {
      if (enterIcon) enterIcon.style.display = 'none';
      if (exitIcon) exitIcon.style.display = 'block';
      fullscreenButton.title = 'Exit fullscreen';
      fullscreenButton.style.borderColor = 'rgba(100, 150, 255, 0.6)';
    } else {
      if (enterIcon) enterIcon.style.display = 'block';
      if (exitIcon) exitIcon.style.display = 'none';
      fullscreenButton.title = 'Enter fullscreen';
      fullscreenButton.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    }
  }
  
  function toggleSidebar(shouldHide) {
    // Hide/show the course sidebar
    const courseSidebar = document.querySelector('#course-sidebar');
    if (courseSidebar) {
      if (shouldHide) {
        courseSidebar.style.setProperty('display', 'none', 'important');
      } else {
        courseSidebar.style.removeProperty('display');
        const computedDisplay = window.getComputedStyle(courseSidebar).display;
        if (computedDisplay === 'none') {
          courseSidebar.style.setProperty('display', 'block', 'important');
        }
      }
    }
    
    // Find the toggle button container and button
    const toggleButtonContainer = document.querySelector('#main-content > div.position-relative.d-flex.align-items-xl-center.mb-4.mt-1.flex-column.flex-xl-row > div > div > div.ml-1.border-primary-700.sidebar-active');
    const toggleButton = toggleButtonContainer?.querySelector('button');
    
    if (!toggleButton || !toggleButtonContainer) return;
    
    // Show/hide the toggle button container
    if (shouldHide) {
      toggleButtonContainer.style.setProperty('display', 'none', 'important');
    } else {
      toggleButtonContainer.style.removeProperty('display');
      const computedDisplay = window.getComputedStyle(toggleButtonContainer).display;
      if (computedDisplay === 'none') {
        toggleButtonContainer.style.setProperty('display', 'block', 'important');
      }
    }
    
    // Click button to sync EDX's internal state
    const sidebarVisible = courseSidebar && window.getComputedStyle(courseSidebar).display !== 'none';
    if ((sidebarVisible && shouldHide) || (!sidebarVisible && !shouldHide)) {
      toggleButton.click();
    }
  }
  
  function toggleFullscreen() {
    // Send message to all iframes to click the fullscreen button
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      try {
        iframe.contentWindow?.postMessage({ action: 'edx-fullscreen-toggle' }, '*');
      } catch (e) {
        // Silent error handling
      }
    });
    
    // Also try in main document immediately (the focus logic handles timing)
    if (window === window.top) {
      findAndClickFullscreenButton();
    }
  }
  
  function togglePlayPause() {
    // Send message to all iframes to click the play/pause button
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      try {
        iframe.contentWindow?.postMessage({ action: 'edx-play-toggle' }, '*');
      } catch (e) {
        // Silent error handling
      }
    });
    
    // Also try in main document
    setTimeout(() => {
      if (window === window.top) {
        findAndClickPlayButton();
      }
    }, 100);
  }
  
  function toggleSubtitles() {
    // Send message to all iframes to click the subtitle button
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      try {
        iframe.contentWindow?.postMessage({ action: 'edx-subtitle-toggle' }, '*');
      } catch (e) {
        // Silent error handling
      }
    });
    
    // Also try in main document
    setTimeout(() => {
      if (window === window.top) {
        findAndClickSubtitleButton();
      }
    }, 100);
  }
  
  // Function to toggle transcript (show/hide transcript panel)
  function toggleTranscript(showTranscript) {
    try {
      // Send message to all iframes
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        try {
          iframe.contentWindow?.postMessage({ action: 'edx-transcript-toggle', show: showTranscript }, '*');
        } catch (e) {
          // Silent error handling
        }
      });
      
      // Also try in main document
      setTimeout(() => {
        const transcriptButton = document.querySelector('button.control.toggle-transcript') ||
                                document.querySelector('button[class*="toggle-transcript"]') ||
                                document.querySelector('button[title*="transcript" i]');
        
        if (transcriptButton) {
          const isActive = transcriptButton.classList.contains('is-active');
          
          // Only click if we need to change the state
          if ((showTranscript && !isActive) || (!showTranscript && isActive)) {
            transcriptButton.click();
          }
        }
      }, 100);
    } catch (error) {
      // Silent fail
    }
  }

  // Function to hide or show video controls based on state
  function toggleVideoControls(shouldHide) {
    // Multiple selectors to catch different EDX versions
    const selectors = [
      'div[id^="video_"] > div.tc-wrapper > div.video-wrapper > div.video-controls',
      'div.tc-wrapper > div.video-wrapper > div.video-controls',
      'div.video-wrapper.link-positioner > div.video-controls',
      'div.video-wrapper > div.video-controls',
      'div[id^="video_"] div.video-controls',
      '.tc-wrapper .video-controls',
      'div.video-controls',
      '.video-controls'
    ];

    let foundElements = 0;
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      
      elements.forEach((element) => {
        foundElements++;
        
        if (shouldHide) {
          // Save original display value before hiding
          if (!element.hasAttribute('data-original-display')) {
            const originalDisplay = window.getComputedStyle(element).display;
            element.setAttribute('data-original-display', originalDisplay);
          }
          
          element.style.setProperty('display', 'none', 'important');
          element.style.setProperty('visibility', 'hidden', 'important');
          element.style.setProperty('opacity', '0', 'important');
          element.style.setProperty('pointer-events', 'none', 'important');
          element.setAttribute('data-edx-hidden', 'true');
        } else {
          // Restore original display value
          const originalDisplay = element.getAttribute('data-original-display') || 'flex';
          
          // Remove all inline styles
          element.style.removeProperty('display');
          element.style.removeProperty('visibility');
          element.style.removeProperty('opacity');
          element.style.removeProperty('pointer-events');
          
          // If element is still hidden, force it visible
          setTimeout(() => {
            if (element.style.display === 'none' || window.getComputedStyle(element).display === 'none') {
              element.style.setProperty('display', originalDisplay, 'important');
            }
            element.style.setProperty('visibility', 'visible', 'important');
            element.style.setProperty('opacity', '1', 'important');
            element.style.setProperty('pointer-events', 'auto', 'important');
          }, 10);
          
          element.removeAttribute('data-edx-hidden');
        }
      });
    });
    
    return foundElements;
  }

  // Reset settings to new default if needed
  function resetToNewDefault() {
    try {
      chrome.storage.sync.get(['settingsVersion', 'widgetEnabled', 'hideControls', 'hideSidebar', 'hideTranscript'], function(result) {
        // Version 4 = widget enabled, controls visible, sidebar hidden, transcript hidden
        if (!result.settingsVersion || result.settingsVersion < 4) {
          chrome.storage.sync.set({ 
            settingsVersion: 4,
            widgetEnabled: true,
            hideControls: false,
            hideSidebar: true,
            hideTranscript: true
          }, function() {
            setTimeout(() => {
              applyStoredState();
              if (typeof updateFloatingButtonState === 'function') {
                updateFloatingButtonState(false);
              }
            }, 100);
          });
        }
      });
    } catch (error) {
      // Silent error handling
    }
  }

  // Get current state from storage and apply it
  function applyStoredState(silent = false) {
    try {
      chrome.storage.sync.get(['hideControls'], function(result) {
        if (chrome.runtime.lastError) return;
        const shouldHide = result.hideControls !== undefined ? result.hideControls : false;
        toggleVideoControls(shouldHide);
      });
    } catch (error) {
      // Silent error handling
    }
  }

  // Listen for storage changes (works across all frames/iframes)
  try {
    chrome.storage.onChanged.addListener(function(changes, areaName) {
      if (areaName === 'sync') {
        if (changes.hideControls) {
          toggleVideoControls(changes.hideControls.newValue);
          updateFloatingButtonState(changes.hideControls.newValue);
          
          // Update button visibility based on control bar state
          updateButtonVisibility(changes.hideControls.newValue);
        }
        if (changes.hideSidebar) {
          toggleSidebar(changes.hideSidebar.newValue);
        }
        if (changes.subtitleSize) {
          applySubtitleSize(changes.subtitleSize.newValue);
          if (typeof updateSubtitleSizeButton === 'function') {
            updateSubtitleSizeButton(changes.subtitleSize.newValue);
          }
        }
        if (changes.hideTranscript) {
          toggleTranscript(!changes.hideTranscript.newValue);
        }
      }
    });
  } catch (error) {
    // Silent error handling
  }

  // Listen for postMessage to handle fullscreen in iframes
  window.addEventListener('message', function(event) {
    if (event.data && event.data.action === 'edx-fullscreen-toggle') {
      // The focus logic in findAndClickFullscreenButton handles timing
      findAndClickFullscreenButton();
    } else if (event.data && event.data.action === 'edx-play-toggle') {
      // Wait a bit to ensure video controls are loaded
      setTimeout(() => {
        findAndClickPlayButton();
      }, 50);
    } else if (event.data && event.data.action === 'edx-subtitle-toggle') {
      // Wait a bit to ensure video controls are loaded
      setTimeout(() => {
        findAndClickSubtitleButton();
      }, 50);
    } else if (event.data && event.data.action === 'edx-transcript-toggle') {
      // Handle transcript toggle from main window
      const showTranscript = event.data.show;
      setTimeout(() => {
        const transcriptButton = document.querySelector('button.control.toggle-transcript') ||
                                document.querySelector('button[class*="toggle-transcript"]') ||
                                document.querySelector('button[title*="transcript" i]');
        
        if (transcriptButton) {
          const isActive = transcriptButton.classList.contains('is-active');
          
          // Only click if we need to change the state
          if ((showTranscript && !isActive) || (!showTranscript && isActive)) {
            transcriptButton.click();
          }
        }
      }, 50);
    } else if (event.data && event.data.action === 'check-video-state') {
      // Check video state in iframe and report back
      const video = document.querySelector('video');
      if (video) {
        const isPlaying = !video.paused && !video.ended;
        window.parent.postMessage({ 
          action: 'video-state-response', 
          isPlaying: isPlaying 
        }, '*');
      }
    } else if (event.data && event.data.action === 'video-state-response') {
      // Update button state based on response from iframe
      if (window === window.top) {
        updatePlayButtonState(event.data.isPlaying);
      }
    }
  });
  
  function findAndClickFullscreenButton() {
    // First, give focus to the video container to ensure player is ready
    const videoContainers = [
      document.querySelector('div[id^="video_"]'),
      document.querySelector('.video-wrapper'),
      document.querySelector('.tc-wrapper'),
      document.querySelector('video')
    ];
    
    let focusedContainer = null;
    for (const container of videoContainers) {
      if (container) {
        focusedContainer = container;
        try {
          // Focus and dispatch events to "wake up" the player
          container.focus();
          container.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
          container.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
        } catch (e) {
          // Silent error
        }
        break;
      }
    }
    
    // Small delay to let the player respond to focus
    setTimeout(() => {
      const selectors = [
        'button.control.add-fullscreen',
        'button[title*="全屏" i]',
        'button[title*="fullscreen" i]',
        'button[title*="Full screen" i]',
        'button[aria-label*="fullscreen" i]',
        'button[data-control="fullscreen"]'
      ];
      
      let fullscreenButton = null;
      
      // Try specific selectors
      for (const selector of selectors) {
        fullscreenButton = document.querySelector(selector);
        if (fullscreenButton) break;
      }
      
      // Fallback: last button in secondary-controls
      if (!fullscreenButton) {
        const secondaryControls = document.querySelector('.secondary-controls');
        if (secondaryControls) {
          const buttons = secondaryControls.querySelectorAll('button');
          if (buttons.length > 0) fullscreenButton = buttons[buttons.length - 1];
        }
      }
      
      // Fallback: last non-speed/volume button in video-controls
      if (!fullscreenButton) {
        const videoControls = document.querySelector('.video-controls');
        if (videoControls) {
          const allButtons = videoControls.querySelectorAll('button');
          for (let i = allButtons.length - 1; i >= 0; i--) {
            const className = allButtons[i].className || '';
            if (!className.includes('speed') && !className.includes('volume')) {
              fullscreenButton = allButtons[i];
              break;
            }
          }
        }
      }
      
      if (fullscreenButton) {
        try {
          // Ensure button is visible and enabled
          fullscreenButton.focus();
          fullscreenButton.click();
        } catch (error) {
          // Silent error handling
        }
      } else if (focusedContainer) {
        // Last resort: try native fullscreen API
        tryNativeFullscreen(focusedContainer);
      }
    }, 50);
  }
  
  function tryNativeFullscreen(element) {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement || 
          document.mozFullScreenElement || document.msFullscreenElement) {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } else {
        // Enter fullscreen
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }
  
  function findAndClickPlayButton() {
    const selectors = [
      'div.video-controls div.vcr > button',
      'div.video-controls button[aria-label*="play" i]',
      'div.video-controls button[aria-label*="pause" i]',
      'div.video-controls button[title*="play" i]',
      'div.video-controls button[title*="pause" i]',
      'div[id^="video_"] div.vcr > button',
      'button.control.control-play-pause',
      '.video-controls .vcr button:first-child'
    ];
    
    let playButton = null;
    
    // Try specific selectors
    for (const selector of selectors) {
      playButton = document.querySelector(selector);
      if (playButton) break;
    }
    
    // Fallback: first button in vcr controls
    if (!playButton) {
      const vcrControls = document.querySelector('.vcr');
      if (vcrControls) {
        const buttons = vcrControls.querySelectorAll('button');
        if (buttons.length > 0) playButton = buttons[0];
      }
    }
    
    if (playButton) {
      try {
        playButton.click();
      } catch (error) {
        // Silent error handling
      }
    }
  }
  
  function findAndClickSubtitleButton() {
    const selectors = [
      'button.control.toggle-captions',
      'button[class*="caption"]',
      'button[aria-label*="caption" i]',
      'button[aria-label*="subtitle" i]',
      'button[title*="caption" i]',
      'button[title*="subtitle" i]',
      '.secondary-controls .grouped-controls button.toggle-captions',
      'div.video-controls button.toggle-captions'
    ];
    
    let subtitleButton = null;
    
    // Try specific selectors
    for (const selector of selectors) {
      subtitleButton = document.querySelector(selector);
      if (subtitleButton) break;
    }
    
    // Fallback: find button in grouped-controls
    if (!subtitleButton) {
      const groupedControls = document.querySelector('.grouped-controls');
      if (groupedControls) {
        const buttons = groupedControls.querySelectorAll('button');
        for (const btn of buttons) {
          const className = btn.className || '';
          if (className.includes('caption') || className.includes('subtitle')) {
            subtitleButton = btn;
            break;
          }
        }
      }
    }
    
    if (subtitleButton) {
      try {
        subtitleButton.click();
      } catch (error) {
        // Silent error handling
      }
    }
  }

  // Listen for messages from popup
  try {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.action === 'toggleWidget') {
        const enabled = request.enabled;
        
        // When disabled, restore everything to default
        if (!enabled) {
          // Hide all floating buttons
          const container = document.getElementById('edx-floating-controls');
          if (container) {
            container.style.display = 'none';
          }
          // Show controls
          toggleVideoControls(false);
          // Show sidebar  
          toggleSidebar(false);
        } else {
          // When enabled, apply saved preferences
          chrome.storage.sync.get(['hideControls', 'hideSidebar', 'hideTranscript'], function(result) {
            const hideControls = result.hideControls !== undefined ? result.hideControls : false;
            const hideSidebar = result.hideSidebar !== undefined ? result.hideSidebar : true;
            const hideTranscript = result.hideTranscript !== undefined ? result.hideTranscript : true;
            
            // Show container and update button visibility
            const container = document.getElementById('edx-floating-controls');
            if (container) {
              container.style.display = 'flex';
              updateButtonVisibility(hideControls);
            }
            
            toggleVideoControls(hideControls);
            toggleSidebar(hideSidebar);
            toggleTranscript(!hideTranscript);
          });
        }
        
        sendResponse({success: true});
      }
      return true;
    });
  } catch (error) {
    // Silent error handling
  }

  // Create floating buttons (only in main window)
  if (window === window.top) {
    // Reset to new default on first run
    resetToNewDefault();
    
    setTimeout(() => {
      createFloatingButtons();
    }, 1000);
  }

  // Apply state immediately and with delays for dynamically loaded content
  setTimeout(applyStoredState, 100);
  setTimeout(applyStoredState, 1000);
  setTimeout(applyStoredState, 3000);
  
  // Apply sidebar state immediately and with delays
  chrome.storage.sync.get(['hideSidebar'], function(result) {
    const hideSidebar = result.hideSidebar !== undefined ? result.hideSidebar : true;
    if (hideSidebar) {
      // Hide sidebar immediately with CSS
      const style = document.createElement('style');
      style.id = 'edx-sidebar-hide';
      style.textContent = `
        #main-content > div.position-relative > div > div > div.ml-1.border-primary-700.sidebar-active,
        [class*="sidebar-active"] {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }
    toggleSidebar(hideSidebar);
  });
  
  setTimeout(() => {
    chrome.storage.sync.get(['hideSidebar'], function(result) {
      const hideSidebar = result.hideSidebar !== undefined ? result.hideSidebar : true;
      toggleSidebar(hideSidebar);
    });
  }, 500);
  
  setTimeout(() => {
    chrome.storage.sync.get(['hideSidebar'], function(result) {
      const hideSidebar = result.hideSidebar !== undefined ? result.hideSidebar : true;
      toggleSidebar(hideSidebar);
    });
  }, 1500);

  // Use MutationObserver to handle dynamically loaded content
  const observer = new MutationObserver((mutations) => {
    // Check if any video-related elements were added
    const hasVideoChanges = mutations.some(mutation => {
      return Array.from(mutation.addedNodes).some(node => {
        if (node.nodeType === 1) { // Element node
          const element = node;
          return element.classList && (
            element.classList.contains('video-controls') ||
            element.classList.contains('tc-wrapper') ||
            element.id?.includes('video_')
          );
        }
        return false;
      });
      });

      if (hasVideoChanges) {
        applyStoredState(true); // Silent mode - no console spam
      }
  });

  // Start observing the document
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Check periodically for dynamically loaded videos (silent mode to avoid console spam)
  setInterval(() => applyStoredState(true), 10000);
  
  // Note: Modal auto-close feature removed to prevent page freezing issues.
  // Modals can be closed manually by clicking the X button.
})();

