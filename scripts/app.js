/**
 * Mocamaker v2.1 - Main Application
 * Orchestrates manual and AI modes, manages conversation state
 */

(function() {
    'use strict';

    // Application State
    const state = {
        platform: 'whatsapp',
        os: 'ios', // 'ios' or 'android'
        theme: 'light', // 'light' or 'dark'
        mode: 'manual', // 'manual' or 'ai'
        messages: [],
        brandName: 'Mi Empresa',
        brandAvatar: null, // Base64 image or null
        isGenerating: false
    };

    // DOM Elements
    let elements = {};

    // LocalStorage keys
    const STORAGE_KEYS = {
        API_KEY: 'mocamaker_api_key',
        BRAND_NAME: 'mocamaker_brand_name',
        THEME: 'mocamaker_theme',
        OS: 'mocamaker_os',
        AVATAR: 'mocamaker_avatar'
    };

    /**
     * Initialize the application
     */
    function init() {
        cacheElements();
        loadSavedData();
        setupEventListeners();
        Constructor.init(state.platform);
        renderPreview();
        updateApiStatus();
        console.log('Mocamaker v2.1 initialized');
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements = {
            // Theme toggle
            themeToggleBtn: document.getElementById('theme-toggle-btn'),

            // OS selector
            osInputs: document.querySelectorAll('input[name="os"]'),

            // Platform tabs
            platformTabs: document.querySelectorAll('.platform-tab'),

            // Mode toggle
            modeBtns: document.querySelectorAll('.mode-btn'),
            manualMode: document.getElementById('manual-mode'),
            aiMode: document.getElementById('ai-mode'),

            // AI mode
            aiInput: document.getElementById('ai-input'),
            generateAiBtn: document.getElementById('generate-ai-btn'),

            // Preview
            mockupPreview: document.getElementById('mockup-preview'),
            messageCount: document.getElementById('message-count'),
            brandNameInput: document.getElementById('brand-name'),

            // Avatar
            avatarUpload: document.getElementById('avatar-upload'),
            avatarPreview: document.getElementById('avatar-preview'),
            avatarRemoveBtn: document.getElementById('avatar-remove-btn'),

            // Actions
            clearBtn: document.getElementById('clear-btn'),
            downloadBtn: document.getElementById('download-btn'),
            downloadMenu: document.getElementById('download-menu'),

            // API Key
            apiKeyToggle: document.getElementById('api-key-toggle'),
            apiKeyModal: document.getElementById('api-key-modal'),
            apiKeyModalClose: document.getElementById('api-key-modal-close'),
            apiKeyInput: document.getElementById('api-key'),
            toggleKeyVisibility: document.getElementById('toggle-key-visibility'),
            apiStatusDot: document.getElementById('api-status-dot')
        };
    }

    /**
     * Load saved data from localStorage
     */
    function loadSavedData() {
        // Load theme
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        if (savedTheme) {
            state.theme = savedTheme;
            applyTheme(savedTheme);
        }

        // Load OS
        const savedOS = localStorage.getItem(STORAGE_KEYS.OS);
        if (savedOS) {
            state.os = savedOS;
            const osInput = document.querySelector(`input[name="os"][value="${savedOS}"]`);
            if (osInput) osInput.checked = true;
        }

        // Load API key
        const savedKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
        if (savedKey) {
            elements.apiKeyInput.value = savedKey;
            AIGenerator.setApiKey(savedKey);
        }

        // Brand name and avatar: intentionally NOT restored from localStorage
        // App should start fresh with default values each session
        // Clear any previously saved brand data
        localStorage.removeItem(STORAGE_KEYS.BRAND_NAME);
        localStorage.removeItem(STORAGE_KEYS.AVATAR);
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Theme toggle
        elements.themeToggleBtn.addEventListener('click', handleThemeToggle);

        // OS selector
        elements.osInputs.forEach(input => {
            input.addEventListener('change', () => handleOSChange(input.value));
        });

        // Platform tabs
        elements.platformTabs.forEach(tab => {
            tab.addEventListener('click', () => handlePlatformChange(tab.dataset.platform));
        });

        // Mode toggle
        elements.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => handleModeChange(btn.dataset.mode));
        });

        // AI mode
        elements.generateAiBtn.addEventListener('click', handleAiGenerate);
        elements.aiInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleAiGenerate();
            }
        });

        // Brand name
        elements.brandNameInput.addEventListener('input', (e) => {
            state.brandName = e.target.value;
            localStorage.setItem(STORAGE_KEYS.BRAND_NAME, state.brandName);
            renderPreview();
        });

        // Avatar upload
        elements.avatarUpload.addEventListener('change', handleAvatarUpload);
        elements.avatarRemoveBtn.addEventListener('click', handleAvatarRemove);

        // Actions
        elements.clearBtn.addEventListener('click', handleClear);
        // Download dropdown
        elements.downloadBtn.addEventListener('click', toggleDownloadMenu);
        elements.downloadMenu.querySelectorAll('.download-option').forEach(option => {
            option.addEventListener('click', () => {
                const format = option.dataset.format;
                hideDownloadMenu();
                if (format === 'html') {
                    handleDownloadHTML();
                } else if (format === 'gif') {
                    handleDownloadGIF();
                }
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.download-dropdown')) {
                hideDownloadMenu();
            }
        });

        // API Key modal
        elements.apiKeyToggle.addEventListener('click', () => {
            elements.apiKeyModal.classList.remove('hidden');
        });
        elements.apiKeyModalClose.addEventListener('click', () => {
            elements.apiKeyModal.classList.add('hidden');
        });
        elements.apiKeyModal.querySelector('.modal-backdrop').addEventListener('click', () => {
            elements.apiKeyModal.classList.add('hidden');
        });

        // API Key input
        elements.apiKeyInput.addEventListener('input', handleApiKeyChange);
        elements.apiKeyInput.addEventListener('blur', handleApiKeySave);
        elements.toggleKeyVisibility.addEventListener('click', toggleApiKeyVisibility);

        // Listen for messages from Constructor
        window.addEventListener('message:add', handleMessageAdd);
    }

    /**
     * Handle theme toggle
     */
    function handleThemeToggle() {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        state.theme = newTheme;
        applyTheme(newTheme);
        localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    }

    /**
     * Apply theme to document
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    /**
     * Handle OS change
     */
    function handleOSChange(os) {
        state.os = os;
        localStorage.setItem(STORAGE_KEYS.OS, os);
        renderPreview();
    }

    /**
     * Handle avatar upload
     */
    function handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Formato no soportado. Usa JPG, PNG o WebP.');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('La imagen es muy grande. Máximo 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            state.brandAvatar = base64;
            localStorage.setItem(STORAGE_KEYS.AVATAR, base64);
            updateAvatarPreview(base64);
            renderPreview();
        };
        reader.readAsDataURL(file);
    }

    /**
     * Handle avatar remove
     */
    function handleAvatarRemove() {
        state.brandAvatar = null;
        localStorage.removeItem(STORAGE_KEYS.AVATAR);
        elements.avatarUpload.value = ''; // Reset file input
        updateAvatarPreview(null);
        renderPreview();
    }

    /**
     * Update avatar preview
     */
    function updateAvatarPreview(base64) {
        if (base64) {
            elements.avatarPreview.innerHTML = `<img src="${base64}" alt="Avatar">`;
            elements.avatarPreview.classList.add('avatar-upload-preview--has-image');
            elements.avatarRemoveBtn.classList.remove('hidden');
        } else {
            elements.avatarPreview.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
            `;
            elements.avatarPreview.classList.remove('avatar-upload-preview--has-image');
            elements.avatarRemoveBtn.classList.add('hidden');
        }
    }

    /**
     * Handle platform change
     */
    function handlePlatformChange(platform) {
        state.platform = platform;

        // Update UI
        elements.platformTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.platform === platform);
        });

        // Update constructor
        Constructor.updatePlatform(platform);

        // Re-render preview
        renderPreview();
    }

    /**
     * Handle mode change
     */
    function handleModeChange(mode) {
        state.mode = mode;

        // Update UI
        elements.modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        elements.manualMode.classList.toggle('active', mode === 'manual');
        elements.aiMode.classList.toggle('active', mode === 'ai');
    }

    /**
     * Handle message add from Constructor
     */
    function handleMessageAdd(event) {
        const message = event.detail;
        state.messages.push(message);
        renderPreview();
        updateActionButtons();
    }

    /**
     * Handle AI generate
     */
    async function handleAiGenerate() {
        const description = elements.aiInput.value.trim();

        if (!description) {
            alert('Por favor describe el flujo conversacional');
            return;
        }

        if (state.isGenerating) return;

        state.isGenerating = true;
        elements.generateAiBtn.disabled = true;
        elements.generateAiBtn.classList.add('loading');
        elements.generateAiBtn.querySelector('.btn-text').textContent = 'Generando...';

        try {
            const conversationData = await AIGenerator.generate(description, state.platform);

            // Update brand name if provided
            if (conversationData.header && conversationData.header.name) {
                state.brandName = conversationData.header.name;
                elements.brandNameInput.value = state.brandName;
            }

            // Add messages to existing conversation (append to end)
            if (conversationData.messages && Array.isArray(conversationData.messages)) {
                conversationData.messages.forEach(msg => {
                    // Normalize message format
                    const normalizedMsg = {
                        id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        type: msg.type || 'text',
                        sender: msg.sender || 'brand',
                        platform: state.platform,
                        content: msg.content || { text: '' },
                        timestamp: msg.timestamp || getCurrentTime(),
                        createdBy: 'ai'
                    };
                    state.messages.push(normalizedMsg);
                });
            }

            renderPreview();
            updateActionButtons();

            // Clear AI input
            elements.aiInput.value = '';

        } catch (error) {
            console.error('AI Generation error:', error);
            alert('Error al generar: ' + error.message);
        } finally {
            state.isGenerating = false;
            elements.generateAiBtn.disabled = false;
            elements.generateAiBtn.classList.remove('loading');
            elements.generateAiBtn.querySelector('.btn-text').textContent = 'Generar con AI';
        }
    }

    /**
     * Handle clear
     */
    function handleClear() {
        if (state.messages.length === 0) return;

        if (confirm('¿Estás seguro de que quieres limpiar toda la conversación?')) {
            state.messages = [];
            Constructor.clear();
            renderPreview();
            updateActionButtons();
        }
    }

    /**
     * Toggle download dropdown menu
     */
    function toggleDownloadMenu(e) {
        e.stopPropagation();
        if (state.messages.length === 0) return;
        elements.downloadMenu.classList.toggle('hidden');
    }

    /**
     * Hide download dropdown menu
     */
    function hideDownloadMenu() {
        elements.downloadMenu.classList.add('hidden');
    }

    /**
     * Handle download as HTML
     */
    function handleDownloadHTML() {
        if (state.messages.length === 0) return;

        const renderOptions = {
            brandName: state.brandName,
            brandAvatar: state.brandAvatar,
            os: state.os
        };

        const mockupHtml = Renderer.renderFull(state.messages, state.platform, renderOptions);
        const standaloneHtml = Renderer.generateStandaloneHTML(mockupHtml, state.platform, state.os);

        const blob = new Blob([standaloneHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mocamaker-${state.platform}-${state.os}-${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Handle download as animated GIF
     */
    async function handleDownloadGIF() {
        if (state.messages.length === 0) return;

        // Check if libraries are loaded
        if (typeof html2canvas === 'undefined' || typeof GIF === 'undefined') {
            alert('Error: Las librerías de exportación no están cargadas. Por favor recarga la página.');
            return;
        }

        // Show progress modal
        const progressOverlay = document.createElement('div');
        progressOverlay.className = 'gif-progress-overlay';
        progressOverlay.innerHTML = `
            <div class="gif-progress-modal">
                <div class="gif-progress-title">Generando GIF...</div>
                <div class="gif-progress-bar-container">
                    <div class="gif-progress-bar" id="gif-progress-bar"></div>
                </div>
                <div class="gif-progress-text" id="gif-progress-text">Preparando frames...</div>
            </div>
        `;
        document.body.appendChild(progressOverlay);

        const progressBar = document.getElementById('gif-progress-bar');
        const progressText = document.getElementById('gif-progress-text');

        try {
            const renderOptions = {
                brandName: state.brandName,
                brandAvatar: state.brandAvatar,
                os: state.os
            };

            // Create a temporary container for rendering frames
            const tempContainer = document.createElement('div');
            tempContainer.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 400px;';
            document.body.appendChild(tempContainer);

            // Copy styles to temp container
            const mockupPreviewClone = elements.mockupPreview.cloneNode(false);
            mockupPreviewClone.className = 'mockup-preview';
            tempContainer.appendChild(mockupPreviewClone);

            // Create GIF encoder (worker served locally to avoid CORS)
            const gif = new GIF({
                workers: 2,
                quality: 10,
                width: 400,
                height: 600,
                workerScript: '/scripts/gif.worker.js'
            });

            const totalFrames = state.messages.length + 2; // +1 for empty state, +1 for final pause
            let currentFrame = 0;

            // Helper function to capture frame
            async function captureFrame(messagesSubset, delay = 800) {
                const html = messagesSubset.length === 0
                    ? Renderer.renderEmpty(state.platform, renderOptions)
                    : Renderer.renderFull(messagesSubset, state.platform, renderOptions);

                mockupPreviewClone.innerHTML = html;

                // Wait for images to load
                const images = mockupPreviewClone.querySelectorAll('img');
                await Promise.all(Array.from(images).map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                }));

                // Capture with html2canvas
                const canvas = await html2canvas(mockupPreviewClone, {
                    backgroundColor: state.platform === 'whatsapp' ? '#ECE5DD' : '#FFFFFF',
                    scale: 1,
                    width: 400,
                    height: 600,
                    useCORS: true
                });

                gif.addFrame(canvas, { delay: delay });
                currentFrame++;

                const progress = Math.round((currentFrame / totalFrames) * 100);
                progressBar.style.width = progress + '%';
                progressText.textContent = `Capturando frame ${currentFrame} de ${totalFrames}...`;
            }

            // Capture empty state
            await captureFrame([], 1000);

            // Capture each message being added
            for (let i = 0; i < state.messages.length; i++) {
                const messagesSubset = state.messages.slice(0, i + 1);
                const isLast = i === state.messages.length - 1;
                await captureFrame(messagesSubset, isLast ? 2000 : 800);
            }

            progressText.textContent = 'Generando archivo GIF...';

            // Render GIF
            gif.on('finished', function(blob) {
                // Download the GIF
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `mocamaker-${state.platform}-${state.os}-${Date.now()}.gif`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // Cleanup
                document.body.removeChild(tempContainer);
                document.body.removeChild(progressOverlay);
            });

            gif.on('progress', function(p) {
                progressBar.style.width = (50 + p * 50) + '%';
            });

            gif.render();

        } catch (error) {
            console.error('GIF generation error:', error);
            alert('Error al generar GIF: ' + error.message);
            document.body.removeChild(progressOverlay);
        }
    }

    /**
     * Handle delete message
     */
    function handleDeleteMessage(messageId) {
        const index = state.messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
            state.messages.splice(index, 1);
            renderPreview();
            updateActionButtons();
        }
    }

    /**
     * Render preview
     */
    function renderPreview() {
        const renderOptions = {
            brandName: state.brandName,
            brandAvatar: state.brandAvatar,
            os: state.os
        };

        if (state.messages.length === 0) {
            elements.mockupPreview.innerHTML = Renderer.renderEmpty(state.platform, renderOptions);
        } else {
            elements.mockupPreview.innerHTML = Renderer.renderFull(state.messages, state.platform, renderOptions);

            // Add delete button listeners
            elements.mockupPreview.querySelectorAll('.message-delete-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    handleDeleteMessage(btn.dataset.messageId);
                });
            });
        }

        updateMessageCount();
    }

    /**
     * Update message count
     */
    function updateMessageCount() {
        const count = state.messages.length;
        elements.messageCount.textContent = `${count} mensaje${count !== 1 ? 's' : ''}`;
    }

    /**
     * Update action buttons state
     */
    function updateActionButtons() {
        const hasMessages = state.messages.length > 0;
        elements.clearBtn.disabled = !hasMessages;
        elements.downloadBtn.disabled = !hasMessages;
    }

    /**
     * Handle API key change
     */
    function handleApiKeyChange(e) {
        const key = e.target.value.trim();
        AIGenerator.setApiKey(key);
        updateApiStatus();
    }

    /**
     * Handle API key save
     */
    function handleApiKeySave(e) {
        const key = e.target.value.trim();
        if (key) {
            localStorage.setItem(STORAGE_KEYS.API_KEY, key);
        } else {
            localStorage.removeItem(STORAGE_KEYS.API_KEY);
        }
    }

    /**
     * Update API status indicator
     */
    function updateApiStatus() {
        const hasKey = AIGenerator.hasApiKey();
        elements.apiStatusDot.classList.toggle('active', hasKey);
    }

    /**
     * Toggle API key visibility
     */
    function toggleApiKeyVisibility() {
        const input = elements.apiKeyInput;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';

        const icon = elements.toggleKeyVisibility.querySelector('svg');
        if (isPassword) {
            icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
        } else {
            icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
        }
    }

    /**
     * Get current time as HH:MM
     */
    function getCurrentTime() {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for debugging and other modules
    window.Mocamaker = {
        state,
        elements,
        handleDeleteMessage,
        renderPreview
    };

})();
