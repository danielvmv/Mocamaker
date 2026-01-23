/**
 * Mocamaker v2.0 - Main Application
 * Orchestrates manual and AI modes, manages conversation state
 */

(function() {
    'use strict';

    // Application State
    const state = {
        platform: 'whatsapp',
        mode: 'manual', // 'manual' or 'ai'
        messages: [],
        brandName: 'Mi Empresa',
        isGenerating: false
    };

    // DOM Elements
    let elements = {};

    // LocalStorage keys
    const STORAGE_KEYS = {
        API_KEY: 'mocamaker_api_key',
        BRAND_NAME: 'mocamaker_brand_name'
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
        console.log('Mocamaker v2.0 initialized');
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements = {
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

            // Actions
            clearBtn: document.getElementById('clear-btn'),
            downloadBtn: document.getElementById('download-btn'),

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
        // Load API key
        const savedKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
        if (savedKey) {
            elements.apiKeyInput.value = savedKey;
            AIGenerator.setApiKey(savedKey);
        }

        // Load brand name
        const savedBrandName = localStorage.getItem(STORAGE_KEYS.BRAND_NAME);
        if (savedBrandName) {
            state.brandName = savedBrandName;
            elements.brandNameInput.value = savedBrandName;
        }
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
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

        // Actions
        elements.clearBtn.addEventListener('click', handleClear);
        elements.downloadBtn.addEventListener('click', handleDownload);

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
     * Handle download
     */
    function handleDownload() {
        if (state.messages.length === 0) return;

        const mockupHtml = Renderer.renderFull(state.messages, state.platform, state.brandName);
        const standaloneHtml = Renderer.generateStandaloneHTML(mockupHtml, state.platform);

        const blob = new Blob([standaloneHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mocamaker-${state.platform}-${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
        if (state.messages.length === 0) {
            elements.mockupPreview.innerHTML = Renderer.renderEmpty(state.platform, state.brandName);
        } else {
            elements.mockupPreview.innerHTML = Renderer.renderFull(state.messages, state.platform, state.brandName);

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
