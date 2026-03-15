/**
 * Mocamaker v2.0 - Constructor
 * Handles manual mode message building
 */

const Constructor = (function() {
    'use strict';

    // State
    const state = {
        selectedType: null,
        selectedSender: 'brand',
        formData: {},
        buttonsList: [''],
        listSections: [{ title: '', items: [{ title: '', description: '' }] }],
        // RCS specific
        rcsSuggestions: [{ type: 'reply', text: '' }],
        rcsCarouselCards: [
            { mediaUrl: '', title: '', description: '', suggestions: [] },
            { mediaUrl: '', title: '', description: '', suggestions: [] }
        ]
    };

    // DOM Elements (cached on init)
    let elements = {};

    /**
     * Initialize the constructor
     */
    function init(platform) {
        cacheElements();
        renderTypeSelector(platform);
        setupEventListeners();
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements = {
            typeSelector: document.getElementById('type-selector'),
            dynamicFields: document.getElementById('dynamic-fields-container'),
            addMessageBtn: document.getElementById('add-message-btn'),
            senderBtns: document.querySelectorAll('.sender-btn')
        };
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Sender toggle
        elements.senderBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.senderBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.selectedSender = btn.dataset.sender;

                // Update type selector based on sender
                const platform = window.Mocamaker?.state?.platform || 'whatsapp';
                renderTypeSelector(platform);
            });
        });

        // Add message button
        elements.addMessageBtn.addEventListener('click', handleAddMessage);
    }

    /**
     * Render type selector based on platform and sender
     */
    function renderTypeSelector(platform) {
        const categories = MessageTypes.getCategories(platform);
        const allTypes = MessageTypes.getTypes(platform);

        // Filter categories based on sender
        const filteredCategories = state.selectedSender === 'user'
            ? categories.filter(c => c.id === 'user')
            : categories.filter(c => c.id !== 'user');

        let html = '';

        filteredCategories.forEach(category => {
            const types = MessageTypes.getTypesByCategory(platform, category.id);
            if (types.length === 0) return;

            html += `
                <div class="type-category" data-category="${category.id}">
                    <div class="type-category-header">${category.icon} ${category.name}</div>
                    <div class="type-category-items">
                        ${types.map(type => `
                            <button class="type-btn ${state.selectedType === type.id ? 'active' : ''}"
                                    data-type="${type.id}"
                                    title="${type.description}">
                                <span class="type-btn-icon">${type.icon}</span>
                                ${type.name}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        elements.typeSelector.innerHTML = html;

        // Add click listeners to type buttons
        elements.typeSelector.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', () => selectType(btn.dataset.type, platform));
        });
    }

    /**
     * Select a message type
     */
    function selectType(typeId, platform) {
        // Update UI
        elements.typeSelector.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === typeId);
        });

        state.selectedType = typeId;
        state.formData = {};
        state.buttonsList = [''];
        state.listSections = [{ title: '', items: [{ title: '', description: '' }] }];
        state.rcsSuggestions = [{ type: 'reply', text: '' }];
        state.rcsCarouselCards = [
            { mediaUrl: '', title: '', description: '', suggestions: [] },
            { mediaUrl: '', title: '', description: '', suggestions: [] }
        ];

        renderDynamicForm(typeId, platform);
        elements.addMessageBtn.disabled = false;

        // Apply contextual fade for RCS (text and multimedia are mutually exclusive)
        applyContextualFade(typeId, platform);
    }

    /**
     * Apply contextual fade to incompatible categories (RCS only)
     * When "text" is selected, fade out multimedia and rich cards
     * because text and media are mutually exclusive in RCS
     */
    function applyContextualFade(typeId, platform) {
        // Only apply for RCS platform
        if (platform !== 'rcs') {
            // Remove any existing fades for non-RCS
            elements.typeSelector.querySelectorAll('.type-category').forEach(cat => {
                cat.classList.remove('type-category--faded');
            });
            return;
        }

        // Categories to fade when text is selected
        const fadeOnText = ['media', 'cards'];
        // Categories to fade when media/cards are selected
        const fadeOnMedia = ['basic'];

        const isTextSelected = typeId === 'text';
        const isMediaOrCardSelected = ['image', 'video', 'audio', 'document', 'rich_card', 'carousel'].includes(typeId);

        elements.typeSelector.querySelectorAll('.type-category').forEach(cat => {
            const categoryId = cat.dataset.category;

            if (isTextSelected && fadeOnText.includes(categoryId)) {
                // Fade media and cards when text is selected
                cat.classList.add('type-category--faded');
            } else if (isMediaOrCardSelected && fadeOnMedia.includes(categoryId)) {
                // Fade basic (text) when media/cards are selected
                cat.classList.add('type-category--faded');
            } else {
                // Remove fade from all other categories
                cat.classList.remove('type-category--faded');
            }
        });
    }

    /**
     * Render dynamic form based on message type
     */
    function renderDynamicForm(typeId, platform) {
        const type = MessageTypes.getType(platform, typeId);
        if (!type) {
            elements.dynamicFields.innerHTML = '<div class="empty-type-state"><p>Tipo no encontrado</p></div>';
            return;
        }

        let html = '<div class="dynamic-form">';

        type.fields.forEach(field => {
            html += renderField(field);
        });

        html += '</div>';
        elements.dynamicFields.innerHTML = html;

        // Setup field event listeners
        setupFieldListeners(type.fields);
    }

    /**
     * Render a single form field
     */
    function renderField(field) {
        let inputHtml = '';

        switch (field.type) {
            case 'text':
                inputHtml = `
                    <input type="text"
                           id="field-${field.name}"
                           name="${field.name}"
                           placeholder="${field.placeholder || ''}"
                           ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}
                           ${field.required ? 'required' : ''}>
                `;
                break;

            case 'textarea':
                inputHtml = `
                    <textarea id="field-${field.name}"
                              name="${field.name}"
                              placeholder="${field.placeholder || ''}"
                              ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}
                              ${field.required ? 'required' : ''}></textarea>
                `;
                break;

            case 'url':
                inputHtml = `
                    <input type="url"
                           id="field-${field.name}"
                           name="${field.name}"
                           placeholder="${field.placeholder || ''}"
                           ${field.required ? 'required' : ''}>
                `;
                break;

            case 'tel':
                inputHtml = `
                    <input type="tel"
                           id="field-${field.name}"
                           name="${field.name}"
                           placeholder="${field.placeholder || ''}"
                           ${field.required ? 'required' : ''}>
                `;
                break;

            case 'email':
                inputHtml = `
                    <input type="email"
                           id="field-${field.name}"
                           name="${field.name}"
                           placeholder="${field.placeholder || ''}"
                           ${field.required ? 'required' : ''}>
                `;
                break;

            case 'number':
                inputHtml = `
                    <input type="number"
                           id="field-${field.name}"
                           name="${field.name}"
                           placeholder="${field.placeholder || ''}"
                           ${field.step ? `step="${field.step}"` : ''}
                           ${field.required ? 'required' : ''}>
                `;
                break;

            case 'select':
                inputHtml = `
                    <select id="field-${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>
                        <option value="">Seleccionar...</option>
                        ${field.options.map(opt => `
                            <option value="${opt.value}">${opt.label}</option>
                        `).join('')}
                    </select>
                `;
                break;

            case 'button_list':
                inputHtml = renderButtonListBuilder(field);
                break;

            case 'list_sections':
                inputHtml = renderListSectionsBuilder(field);
                break;

            case 'flow_fields':
                inputHtml = renderFlowFieldsBuilder(field);
                break;

            case 'checkbox':
                inputHtml = `
                    <label class="checkbox-field">
                        <input type="checkbox"
                               id="field-${field.name}"
                               name="${field.name}"
                               ${field.default ? 'checked' : ''}>
                        <span class="checkbox-label">${field.label}</span>
                    </label>
                `;
                // Return early to avoid duplicate label
                return `
                    <div class="dynamic-field dynamic-field--checkbox" data-field="${field.name}">
                        ${inputHtml}
                    </div>
                `;

            case 'datetime':
                inputHtml = `
                    <input type="datetime-local"
                           id="field-${field.name}"
                           name="${field.name}"
                           ${field.required ? 'required' : ''}>
                `;
                break;

            case 'rcs_suggestions':
                inputHtml = renderRcsSuggestionsBuilder(field);
                break;

            case 'rcs_carousel_cards':
                inputHtml = renderRcsCarouselBuilder(field);
                break;

            case 'media_source':
                inputHtml = renderMediaSourceField(field);
                break;

            default:
                inputHtml = `<input type="text" id="field-${field.name}" name="${field.name}">`;
        }

        return `
            <div class="dynamic-field" data-field="${field.name}">
                <label for="field-${field.name}">
                    ${field.label}
                    ${field.required ? '<span style="color: #EF4444;">*</span>' : ''}
                </label>
                ${inputHtml}
                ${field.maxLength ? `<span class="field-hint">Máximo ${field.maxLength} caracteres</span>` : ''}
            </div>
        `;
    }

    /**
     * Render button list builder
     */
    function renderButtonListBuilder(field) {
        return `
            <div class="button-list-builder" id="button-list-builder">
                ${state.buttonsList.map((btn, index) => `
                    <div class="button-item" data-index="${index}">
                        <input type="text"
                               class="button-input"
                               value="${btn}"
                               placeholder="Texto del botón ${index + 1}"
                               maxlength="${field.buttonMaxLength || 20}">
                        <button type="button" class="button-item-remove" ${state.buttonsList.length <= 1 ? 'disabled' : ''}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                `).join('')}
                <button type="button" class="add-button-btn" id="add-button-btn" ${state.buttonsList.length >= (field.max || 3) ? 'disabled' : ''}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Agregar botón (${state.buttonsList.length}/${field.max || 3})
                </button>
            </div>
        `;
    }

    /**
     * Render media source field (URL or local file)
     */
    function renderMediaSourceField(field) {
        const mediaTypeLabels = {
            image: 'imagen',
            video: 'video',
            audio: 'audio'
        };
        const label = mediaTypeLabels[field.mediaType] || 'archivo';

        return `
            <div class="media-source-field" data-media-type="${field.mediaType}">
                <div class="media-source-tabs">
                    <button type="button" class="media-source-tab active" data-source="url">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        URL
                    </button>
                    <button type="button" class="media-source-tab" data-source="file">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Archivo local
                    </button>
                </div>
                <div class="media-source-content">
                    <div class="media-source-panel active" data-panel="url">
                        <input type="url"
                               id="field-${field.name}"
                               name="${field.name}"
                               class="media-url-input"
                               placeholder="${field.placeholder || ''}"
                               ${field.required ? 'required' : ''}>
                    </div>
                    <div class="media-source-panel" data-panel="file">
                        <div class="media-file-dropzone" data-accept="${field.accept}">
                            <input type="file"
                                   id="field-${field.name}-file"
                                   name="${field.name}-file"
                                   class="media-file-input"
                                   accept="${field.accept}"
                                   style="display: none;">
                            <div class="media-file-placeholder">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                <span>Arrastra o haz clic para seleccionar ${label}</span>
                                <span class="media-file-formats">${field.accept.split(',').map(f => f.split('/')[1]).join(', ').toUpperCase()}</span>
                            </div>
                            <div class="media-file-preview" style="display: none;">
                                ${field.mediaType === 'image' ? '<img src="" alt="Preview">' : ''}
                                ${field.mediaType === 'video' ? '<video src="" controls></video>' : ''}
                                ${field.mediaType === 'audio' ? '<audio src="" controls></audio>' : ''}
                                <button type="button" class="media-file-remove">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                                <span class="media-file-name"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render list sections builder
     */
    function renderListSectionsBuilder(field) {
        return `
            <div class="list-sections-builder" id="list-sections-builder">
                ${state.listSections.map((section, sIndex) => `
                    <div class="list-section" data-section="${sIndex}">
                        <div class="list-section-header">
                            <input type="text"
                                   class="section-title-input"
                                   value="${section.title}"
                                   placeholder="Título de sección"
                                   maxlength="24">
                            <button type="button" class="button-item-remove section-remove" ${state.listSections.length <= 1 ? 'disabled' : ''}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <div class="list-section-items">
                            ${section.items.map((item, iIndex) => `
                                <div class="list-item" data-item="${iIndex}">
                                    <div class="list-item-row">
                                        <input type="text"
                                               class="item-title-input"
                                               value="${item.title}"
                                               placeholder="Título del item"
                                               maxlength="24">
                                        <input type="text"
                                               class="item-desc-input"
                                               value="${item.description}"
                                               placeholder="Descripción"
                                               maxlength="72">
                                        <button type="button" class="button-item-remove item-remove" ${section.items.length <= 1 ? 'disabled' : ''}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <line x1="18" y1="6" x2="6" y2="18"/>
                                                <line x1="6" y1="6" x2="18" y2="18"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                            <button type="button" class="add-button-btn add-item-btn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                Agregar item
                            </button>
                        </div>
                    </div>
                `).join('')}
                <button type="button" class="add-button-btn" id="add-section-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Agregar sección
                </button>
            </div>
        `;
    }

    /**
     * Render flow fields builder
     */
    function renderFlowFieldsBuilder(field) {
        return `
            <div class="flow-fields-builder" id="flow-fields-builder">
                <p class="field-hint">Los campos del formulario se mostrarán como un preview simplificado en el mockup.</p>
                <div class="flow-preview">
                    <div class="flow-preview-header">📝 Formulario Interactivo</div>
                    <div class="flow-preview-body">
                        <div class="flow-field-preview">
                            <span class="flow-field-label">Campo de texto</span>
                            <span class="flow-field-input"></span>
                        </div>
                        <div class="flow-field-preview">
                            <span class="flow-field-label">Selector</span>
                            <span class="flow-field-input"></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render RCS suggestions builder
     */
    function renderRcsSuggestionsBuilder(field) {
        const maxSuggestions = field.max || 11;
        return `
            <div class="rcs-suggestions-builder" id="rcs-suggestions-builder">
                ${state.rcsSuggestions.map((sug, index) => `
                    <div class="rcs-suggestion-item" data-index="${index}">
                        <select class="suggestion-type-select">
                            <option value="reply" ${sug.type === 'reply' ? 'selected' : ''}>💬 Respuesta</option>
                            <option value="url" ${sug.type === 'url' ? 'selected' : ''}>🔗 Abrir URL</option>
                            <option value="dial" ${sug.type === 'dial' ? 'selected' : ''}>📞 Llamar</option>
                            <option value="location" ${sug.type === 'location' ? 'selected' : ''}>📍 Ver ubicación</option>
                            <option value="share_location" ${sug.type === 'share_location' ? 'selected' : ''}>🗺️ Compartir ubicación</option>
                            <option value="calendar" ${sug.type === 'calendar' ? 'selected' : ''}>📅 Crear evento</option>
                        </select>
                        <input type="text"
                               class="suggestion-text-input"
                               value="${sug.text || ''}"
                               placeholder="Texto del chip"
                               maxlength="25">
                        ${sug.type === 'url' ? `
                            <input type="url"
                                   class="suggestion-url-input"
                                   value="${sug.url || ''}"
                                   placeholder="https://...">
                        ` : ''}
                        ${sug.type === 'dial' ? `
                            <input type="tel"
                                   class="suggestion-phone-input"
                                   value="${sug.phone || ''}"
                                   placeholder="+52 55 1234 5678">
                        ` : ''}
                        <button type="button" class="button-item-remove suggestion-remove" ${state.rcsSuggestions.length <= 1 && !field.required === false ? '' : state.rcsSuggestions.length <= 1 ? 'disabled' : ''}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                `).join('')}
                <button type="button" class="add-button-btn" id="add-suggestion-btn" ${state.rcsSuggestions.length >= maxSuggestions ? 'disabled' : ''}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Agregar sugerencia (${state.rcsSuggestions.length}/${maxSuggestions})
                </button>
            </div>
        `;
    }

    /**
     * Render RCS carousel cards builder
     * Note: Base64 images are NOT included in HTML to avoid breaking the template.
     * They are restored via JavaScript after rendering using restoreCarouselPreviews()
     */
    function renderRcsCarouselBuilder(field) {
        const maxCards = field.max || 10;
        const minCards = field.min || 2;
        return `
            <div class="rcs-carousel-builder" id="rcs-carousel-builder">
                ${state.rcsCarouselCards.map((card, index) => {
                    const hasBase64 = card.mediaUrl && card.mediaUrl.startsWith('data:');
                    const hasUrl = card.mediaUrl && !card.mediaUrl.startsWith('data:');
                    return `
                    <div class="rcs-card-item" data-index="${index}" data-has-base64="${hasBase64}">
                        <div class="rcs-card-header">
                            <span class="rcs-card-number">Tarjeta ${index + 1}</span>
                            <button type="button" class="button-item-remove card-remove" data-card-index="${index}" data-min-cards="${minCards}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <div class="rcs-card-fields">
                            <div class="carousel-media-field" data-card-index="${index}">
                                <label class="carousel-media-label">Imagen (opcional)</label>
                                <div class="media-source-tabs">
                                    <button type="button" class="media-source-tab ${!hasBase64 ? 'active' : ''}" data-source="url">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                                        </svg>
                                        URL
                                    </button>
                                    <button type="button" class="media-source-tab ${hasBase64 ? 'active' : ''}" data-source="file">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                            <polyline points="17 8 12 3 7 8"/>
                                            <line x1="12" y1="3" x2="12" y2="15"/>
                                        </svg>
                                        Archivo
                                    </button>
                                </div>
                                <div class="media-source-content">
                                    <div class="media-source-panel ${!hasBase64 ? 'active' : ''}" data-panel="url">
                                        <input type="url"
                                               class="card-media-input card-media-url"
                                               value="${hasUrl ? card.mediaUrl : ''}"
                                               placeholder="https://ejemplo.com/imagen.jpg">
                                    </div>
                                    <div class="media-source-panel ${hasBase64 ? 'active' : ''}" data-panel="file">
                                        <div class="carousel-file-dropzone">
                                            <input type="file" class="carousel-file-input" accept="image/jpeg,image/png,image/gif,image/webp" style="display:none;">
                                            <div class="carousel-file-placeholder" ${hasBase64 ? 'style="display:none;"' : ''}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                                    <polyline points="21 15 16 10 5 21"/>
                                                </svg>
                                                <span>Click o arrastra imagen</span>
                                            </div>
                                            <div class="carousel-file-preview" ${hasBase64 ? 'style="display:flex;"' : 'style="display:none;"'}>
                                                <img src="" alt="Preview">
                                                <button type="button" class="carousel-file-remove">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <input type="text"
                                   class="card-title-input"
                                   value="${card.title || ''}"
                                   placeholder="Título"
                                   maxlength="200">
                            <textarea class="card-desc-input"
                                      placeholder="Descripción"
                                      maxlength="2000">${card.description || ''}</textarea>
                        </div>
                    </div>
                `;}).join('')}
                <button type="button" class="add-button-btn" id="add-card-btn" ${state.rcsCarouselCards.length >= maxCards ? 'disabled' : ''}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Agregar tarjeta (${state.rcsCarouselCards.length}/${maxCards})
                </button>
            </div>
        `;
    }

    /**
     * Restore carousel image previews from state
     * This is called after re-rendering to restore base64 images
     */
    function restoreCarouselPreviews() {
        const builder = document.getElementById('rcs-carousel-builder');
        if (!builder) return;

        builder.querySelectorAll('.rcs-card-item[data-has-base64="true"]').forEach((item) => {
            const index = parseInt(item.dataset.index);
            const card = state.rcsCarouselCards[index];

            if (card && card.mediaUrl && card.mediaUrl.startsWith('data:')) {
                const previewImg = item.querySelector('.carousel-file-preview img');
                if (previewImg) {
                    previewImg.src = card.mediaUrl;
                }
            }
        });
    }

    /**
     * Setup event listeners for dynamic fields
     */
    function setupFieldListeners(fields) {
        // Standard input fields
        elements.dynamicFields.querySelectorAll('input, textarea, select').forEach(input => {
            if (input.classList.contains('button-input') ||
                input.classList.contains('section-title-input') ||
                input.classList.contains('item-title-input') ||
                input.classList.contains('item-desc-input')) {
                return; // Skip special inputs
            }

            input.addEventListener('input', (e) => {
                state.formData[e.target.name] = e.target.value;
            });
        });

        // Button list builder
        setupButtonListListeners();

        // List sections builder
        setupListSectionsListeners();

        // RCS suggestions builder
        setupRcsSuggestionsListeners();

        // RCS carousel builder - restore previews first, then setup listeners
        restoreCarouselPreviews();
        setupRcsCarouselListeners();

        // Media source (URL/File) fields
        setupMediaSourceListeners();
    }

    /**
     * Setup button list builder listeners
     */
    function setupButtonListListeners() {
        const builder = document.getElementById('button-list-builder');
        if (!builder) return;

        // Button inputs
        builder.querySelectorAll('.button-input').forEach((input, index) => {
            input.addEventListener('input', (e) => {
                state.buttonsList[index] = e.target.value;
            });
        });

        // Remove buttons
        builder.querySelectorAll('.button-item-remove').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                if (state.buttonsList.length > 1) {
                    // Remove focus to prevent browser scroll-to-focus behavior
                    if (document.activeElement) {
                        document.activeElement.blur();
                    }
                    state.buttonsList.splice(index, 1);
                    rerenderButtonList();
                }
            });
        });

        // Add button
        const addBtn = document.getElementById('add-button-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                if (state.buttonsList.length < 3) {
                    // Remove focus to prevent browser scroll-to-focus behavior
                    if (document.activeElement) {
                        document.activeElement.blur();
                    }
                    state.buttonsList.push('');
                    rerenderButtonList();
                }
            });
        }
    }

    /**
     * Re-render button list
     */
    function rerenderButtonList() {
        const scrollPositions = preserveScrollPositions();

        const platform = window.Mocamaker?.state?.platform || 'whatsapp';
        const type = MessageTypes.getType(platform, state.selectedType);
        const field = type.fields.find(f => f.type === 'button_list');

        const builder = document.getElementById('button-list-builder');
        if (builder && field) {
            builder.outerHTML = renderButtonListBuilder(field);
            setupButtonListListeners();
        }

        restoreScrollPositions(scrollPositions);
    }

    /**
     * Setup list sections builder listeners
     */
    function setupListSectionsListeners() {
        const builder = document.getElementById('list-sections-builder');
        if (!builder) return;

        // Section title inputs
        builder.querySelectorAll('.section-title-input').forEach((input) => {
            const section = input.closest('.list-section');
            const sIndex = parseInt(section.dataset.section);
            input.addEventListener('input', (e) => {
                state.listSections[sIndex].title = e.target.value;
            });
        });

        // Item inputs
        builder.querySelectorAll('.list-item').forEach((itemEl) => {
            const section = itemEl.closest('.list-section');
            const sIndex = parseInt(section.dataset.section);
            const iIndex = parseInt(itemEl.dataset.item);

            const titleInput = itemEl.querySelector('.item-title-input');
            const descInput = itemEl.querySelector('.item-desc-input');

            if (titleInput) {
                titleInput.addEventListener('input', (e) => {
                    state.listSections[sIndex].items[iIndex].title = e.target.value;
                });
            }
            if (descInput) {
                descInput.addEventListener('input', (e) => {
                    state.listSections[sIndex].items[iIndex].description = e.target.value;
                });
            }
        });

        // Remove section buttons
        builder.querySelectorAll('.section-remove').forEach((btn) => {
            btn.addEventListener('click', () => {
                const section = btn.closest('.list-section');
                const sIndex = parseInt(section.dataset.section);
                if (state.listSections.length > 1) {
                    // Remove focus to prevent browser scroll-to-focus behavior
                    if (document.activeElement) {
                        document.activeElement.blur();
                    }
                    state.listSections.splice(sIndex, 1);
                    rerenderListSections();
                }
            });
        });

        // Remove item buttons
        builder.querySelectorAll('.item-remove').forEach((btn) => {
            btn.addEventListener('click', () => {
                const itemEl = btn.closest('.list-item');
                const section = itemEl.closest('.list-section');
                const sIndex = parseInt(section.dataset.section);
                const iIndex = parseInt(itemEl.dataset.item);
                if (state.listSections[sIndex].items.length > 1) {
                    // Remove focus to prevent browser scroll-to-focus behavior
                    if (document.activeElement) {
                        document.activeElement.blur();
                    }
                    state.listSections[sIndex].items.splice(iIndex, 1);
                    rerenderListSections();
                }
            });
        });

        // Add item buttons
        builder.querySelectorAll('.add-item-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                // Remove focus to prevent browser scroll-to-focus behavior
                if (document.activeElement) {
                    document.activeElement.blur();
                }
                const section = btn.closest('.list-section');
                const sIndex = parseInt(section.dataset.section);
                state.listSections[sIndex].items.push({ title: '', description: '' });
                rerenderListSections();
            });
        });

        // Add section button
        const addSectionBtn = document.getElementById('add-section-btn');
        if (addSectionBtn) {
            addSectionBtn.addEventListener('click', () => {
                // Remove focus to prevent browser scroll-to-focus behavior
                if (document.activeElement) {
                    document.activeElement.blur();
                }
                state.listSections.push({ title: '', items: [{ title: '', description: '' }] });
                rerenderListSections();
            });
        }
    }

    /**
     * Re-render list sections
     */
    function rerenderListSections() {
        const scrollPositions = preserveScrollPositions();

        const platform = window.Mocamaker?.state?.platform || 'whatsapp';
        const type = MessageTypes.getType(platform, state.selectedType);
        const field = type.fields.find(f => f.type === 'list_sections');

        const builder = document.getElementById('list-sections-builder');
        if (builder && field) {
            builder.outerHTML = renderListSectionsBuilder(field);
            setupListSectionsListeners();
        }

        restoreScrollPositions(scrollPositions);
    }

    /**
     * Setup RCS suggestions builder listeners
     */
    function setupRcsSuggestionsListeners() {
        const builder = document.getElementById('rcs-suggestions-builder');
        if (!builder) return;

        // Suggestion type selects
        builder.querySelectorAll('.suggestion-type-select').forEach((select) => {
            const item = select.closest('.rcs-suggestion-item');
            const index = parseInt(item.dataset.index);
            select.addEventListener('change', (e) => {
                // Remove focus to prevent browser scroll-to-focus behavior
                if (document.activeElement) {
                    document.activeElement.blur();
                }
                state.rcsSuggestions[index].type = e.target.value;
                // Clear extra fields when type changes
                delete state.rcsSuggestions[index].url;
                delete state.rcsSuggestions[index].phone;
                rerenderRcsSuggestions();
            });
        });

        // Suggestion text inputs
        builder.querySelectorAll('.suggestion-text-input').forEach((input) => {
            const item = input.closest('.rcs-suggestion-item');
            const index = parseInt(item.dataset.index);
            input.addEventListener('input', (e) => {
                state.rcsSuggestions[index].text = e.target.value;
            });
        });

        // Suggestion URL inputs
        builder.querySelectorAll('.suggestion-url-input').forEach((input) => {
            const item = input.closest('.rcs-suggestion-item');
            const index = parseInt(item.dataset.index);
            input.addEventListener('input', (e) => {
                state.rcsSuggestions[index].url = e.target.value;
            });
        });

        // Suggestion phone inputs
        builder.querySelectorAll('.suggestion-phone-input').forEach((input) => {
            const item = input.closest('.rcs-suggestion-item');
            const index = parseInt(item.dataset.index);
            input.addEventListener('input', (e) => {
                state.rcsSuggestions[index].phone = e.target.value;
            });
        });

        // Remove suggestion buttons
        builder.querySelectorAll('.suggestion-remove').forEach((btn) => {
            const item = btn.closest('.rcs-suggestion-item');
            const index = parseInt(item.dataset.index);
            btn.addEventListener('click', () => {
                // Remove focus to prevent browser scroll-to-focus behavior
                if (document.activeElement) {
                    document.activeElement.blur();
                }

                if (state.rcsSuggestions.length > 1) {
                    state.rcsSuggestions.splice(index, 1);
                    rerenderRcsSuggestions();
                } else if (state.rcsSuggestions.length === 1) {
                    // Allow removing the last one if field is not required
                    const platform = window.Mocamaker?.state?.platform || 'whatsapp';
                    const type = MessageTypes.getType(platform, state.selectedType);
                    const field = type?.fields.find(f => f.type === 'rcs_suggestions');
                    if (field && !field.required) {
                        state.rcsSuggestions = [];
                        rerenderRcsSuggestions();
                    }
                }
            });
        });

        // Add suggestion button
        const addBtn = document.getElementById('add-suggestion-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const platform = window.Mocamaker?.state?.platform || 'whatsapp';
                const type = MessageTypes.getType(platform, state.selectedType);
                const field = type?.fields.find(f => f.type === 'rcs_suggestions');
                const maxSuggestions = field?.max || 11;

                if (state.rcsSuggestions.length < maxSuggestions) {
                    // Remove focus to prevent browser scroll-to-focus behavior
                    if (document.activeElement) {
                        document.activeElement.blur();
                    }
                    state.rcsSuggestions.push({ type: 'reply', text: '' });
                    rerenderRcsSuggestions();
                }
            });
        }
    }

    /**
     * Scroll Lock System
     *
     * Prevents scroll displacement during DOM updates by:
     * 1. Capturing scroll positions AND current overflow styles
     * 2. Setting overflow: hidden to completely prevent any scroll
     * 3. Restoring overflow and scroll positions after DOM updates
     * 4. Using multiple restoration strategies (sync + RAF + timeout)
     */
    let scrollLockState = null;

    function lockScroll() {
        const modeContent = document.querySelector('.mode-content.active');
        const previewContainer = document.querySelector('.preview-container');

        // Capture current state
        scrollLockState = {
            modeContent: {
                el: modeContent,
                scrollTop: modeContent ? modeContent.scrollTop : 0,
                overflow: modeContent ? modeContent.style.overflow : ''
            },
            preview: {
                el: previewContainer,
                scrollTop: previewContainer ? previewContainer.scrollTop : 0,
                overflow: previewContainer ? previewContainer.style.overflow : ''
            },
            window: window.scrollY
        };

        // Lock scrolling by setting overflow: hidden
        if (modeContent) {
            modeContent.style.overflow = 'hidden';
        }
        if (previewContainer) {
            previewContainer.style.overflow = 'hidden';
        }

        return scrollLockState;
    }

    function unlockScroll() {
        if (!scrollLockState) return;

        const { modeContent, preview } = scrollLockState;

        // Restore overflow styles
        if (modeContent.el) {
            modeContent.el.style.overflow = modeContent.overflow;
        }
        if (preview.el) {
            preview.el.style.overflow = preview.overflow;
        }

        // Immediate scroll restoration
        if (modeContent.el) {
            modeContent.el.scrollTop = modeContent.scrollTop;
        }
        if (preview.el) {
            preview.el.scrollTop = preview.scrollTop;
        }
        if (scrollLockState.window > 0) {
            window.scrollTo(0, scrollLockState.window);
        }

        // Capture values for async restoration
        const savedPositions = {
            modeContentScroll: modeContent.scrollTop,
            previewScroll: preview.scrollTop,
            windowScroll: scrollLockState.window,
            modeContentEl: modeContent.el,
            previewEl: preview.el
        };

        // RAF restoration (catches browser layout recalculations)
        requestAnimationFrame(() => {
            if (savedPositions.modeContentEl) {
                savedPositions.modeContentEl.scrollTop = savedPositions.modeContentScroll;
            }
            if (savedPositions.previewEl) {
                savedPositions.previewEl.scrollTop = savedPositions.previewScroll;
            }
        });

        // Timeout restoration (catches any delayed browser adjustments)
        setTimeout(() => {
            if (savedPositions.modeContentEl) {
                savedPositions.modeContentEl.scrollTop = savedPositions.modeContentScroll;
            }
            if (savedPositions.previewEl) {
                savedPositions.previewEl.scrollTop = savedPositions.previewScroll;
            }
        }, 0);

        scrollLockState = null;
    }

    // Functions used by rerender methods
    function preserveScrollPositions() {
        return lockScroll();
    }

    function restoreScrollPositions() {
        unlockScroll();
    }

    /**
     * Re-render RCS suggestions
     */
    function rerenderRcsSuggestions() {
        // Preserve scroll positions
        const scrollPositions = preserveScrollPositions();

        const platform = window.Mocamaker?.state?.platform || 'whatsapp';
        const type = MessageTypes.getType(platform, state.selectedType);
        const field = type?.fields.find(f => f.type === 'rcs_suggestions');

        const builder = document.getElementById('rcs-suggestions-builder');
        if (builder && field) {
            builder.outerHTML = renderRcsSuggestionsBuilder(field);
            setupRcsSuggestionsListeners();
        }

        // Restore scroll positions
        restoreScrollPositions(scrollPositions);
    }

    /**
     * Setup RCS carousel builder listeners
     * Uses event delegation for card removal to ensure correct index handling
     */
    function setupRcsCarouselListeners() {
        const builder = document.getElementById('rcs-carousel-builder');
        if (!builder) return;

        const minCards = 2;
        const maxCards = 10;

        // Update visual state of all remove buttons based on current card count
        updateAllRemoveButtonStates();

        // EVENT DELEGATION for card removal - single listener on parent
        // This ensures the index is read at click time, not captured in closure
        builder.addEventListener('click', function(e) {
            const removeBtn = e.target.closest('.card-remove');
            if (!removeBtn) return;

            e.preventDefault();
            e.stopPropagation();

            // Check if removal is allowed
            if (state.rcsCarouselCards.length <= minCards) {
                return;
            }

            // Get index from the button's data attribute at click time
            const cardIndex = parseInt(removeBtn.getAttribute('data-card-index'), 10);

            // Validate index
            if (isNaN(cardIndex) || cardIndex < 0 || cardIndex >= state.rcsCarouselCards.length) {
                return;
            }

            // Remove focus from button to prevent browser scroll-to-focus behavior
            if (document.activeElement) {
                document.activeElement.blur();
            }

            // Remove the card
            state.rcsCarouselCards.splice(cardIndex, 1);
            rerenderRcsCarousel();
        });

        // Setup input listeners for each card
        builder.querySelectorAll('.rcs-card-item').forEach((cardItem) => {
            const cardIndex = parseInt(cardItem.dataset.index);

            // Input listeners for this card
            const urlInput = cardItem.querySelector('.card-media-url');
            const titleInput = cardItem.querySelector('.card-title-input');
            const descInput = cardItem.querySelector('.card-desc-input');

            if (urlInput) {
                urlInput.addEventListener('input', () => {
                    state.rcsCarouselCards[cardIndex].mediaUrl = urlInput.value;
                });
            }
            if (titleInput) {
                titleInput.addEventListener('input', () => {
                    state.rcsCarouselCards[cardIndex].title = titleInput.value;
                });
            }
            if (descInput) {
                descInput.addEventListener('input', () => {
                    state.rcsCarouselCards[cardIndex].description = descInput.value;
                });
            }

            // Tab switching
            const mediaField = cardItem.querySelector('.carousel-media-field');
            if (mediaField) {
                const tabs = mediaField.querySelectorAll('.media-source-tab');
                const panels = mediaField.querySelectorAll('.media-source-panel');

                tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        const source = tab.dataset.source;
                        tabs.forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        panels.forEach(p => p.classList.toggle('active', p.dataset.panel === source));
                    });
                });

                // File dropzone
                const dropzone = mediaField.querySelector('.carousel-file-dropzone');
                const fileInput = mediaField.querySelector('.carousel-file-input');
                const placeholder = mediaField.querySelector('.carousel-file-placeholder');
                const preview = mediaField.querySelector('.carousel-file-preview');
                const fileRemoveBtn = mediaField.querySelector('.carousel-file-remove');

                if (dropzone && fileInput) {
                    dropzone.addEventListener('click', (e) => {
                        if (!e.target.closest('.carousel-file-remove')) {
                            fileInput.click();
                        }
                    });

                    dropzone.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        dropzone.classList.add('dragover');
                    });

                    dropzone.addEventListener('dragleave', () => {
                        dropzone.classList.remove('dragover');
                    });

                    dropzone.addEventListener('drop', (e) => {
                        e.preventDefault();
                        dropzone.classList.remove('dragover');
                        if (e.dataTransfer.files.length > 0) {
                            handleCarouselCardFile(e.dataTransfer.files[0], cardIndex, mediaField);
                        }
                    });

                    fileInput.addEventListener('change', () => {
                        if (fileInput.files.length > 0) {
                            handleCarouselCardFile(fileInput.files[0], cardIndex, mediaField);
                        }
                    });
                }

                if (fileRemoveBtn) {
                    fileRemoveBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        state.rcsCarouselCards[cardIndex].mediaUrl = '';
                        if (placeholder) placeholder.style.display = 'flex';
                        if (preview) {
                            preview.style.display = 'none';
                            const img = preview.querySelector('img');
                            if (img) img.src = '';
                        }
                        if (fileInput) fileInput.value = '';
                    });
                }
            }
        });

        // Add card button
        const addBtn = builder.querySelector('#add-card-btn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (state.rcsCarouselCards.length >= maxCards) return;

                // Remove focus from button to prevent browser scroll-to-focus behavior
                if (document.activeElement) {
                    document.activeElement.blur();
                }

                state.rcsCarouselCards.push({ mediaUrl: '', title: '', description: '', suggestions: [] });
                rerenderRcsCarousel();
            });
        }
    }

    /**
     * Update visual state of all card remove buttons
     */
    function updateAllRemoveButtonStates() {
        const builder = document.getElementById('rcs-carousel-builder');
        if (!builder) return;

        const minCards = 2;
        const canRemove = state.rcsCarouselCards.length > minCards;

        builder.querySelectorAll('.card-remove').forEach(btn => {
            if (canRemove) {
                btn.classList.remove('card-remove--disabled');
                btn.removeAttribute('disabled');
            } else {
                btn.classList.add('card-remove--disabled');
                btn.setAttribute('disabled', 'disabled');
            }
        });
    }

    /**
     * Handle carousel card file upload
     */
    function handleCarouselCardFile(file, cardIndex, fieldContainer) {
        const placeholder = fieldContainer.querySelector('.carousel-file-placeholder');
        const preview = fieldContainer.querySelector('.carousel-file-preview');
        const previewImg = preview.querySelector('img');

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Formato no soportado. Usa JPEG, PNG, GIF o WebP.');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('La imagen es muy grande. Máximo 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            // Store in state immediately
            state.rcsCarouselCards[cardIndex].mediaUrl = base64;
            // Update UI
            previewImg.src = base64;
            placeholder.style.display = 'none';
            preview.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }

    /**
     * Sync carousel card values from DOM to state before re-render
     */
    function syncCarouselStateFromDOM() {
        const builder = document.getElementById('rcs-carousel-builder');
        if (!builder) return;

        builder.querySelectorAll('.rcs-card-item').forEach((item) => {
            const index = parseInt(item.dataset.index);
            if (index >= 0 && index < state.rcsCarouselCards.length) {
                // Get URL input value
                const urlInput = item.querySelector('.card-media-url');
                if (urlInput && urlInput.value && !urlInput.value.startsWith('data:')) {
                    state.rcsCarouselCards[index].mediaUrl = urlInput.value;
                }

                // Check for file preview (base64) - use getAttribute to get raw value
                const previewImg = item.querySelector('.carousel-file-preview img');
                if (previewImg) {
                    const imgSrc = previewImg.getAttribute('src') || previewImg.src;
                    if (imgSrc && imgSrc.startsWith('data:')) {
                        state.rcsCarouselCards[index].mediaUrl = imgSrc;
                    }
                }

                const titleInput = item.querySelector('.card-title-input');
                if (titleInput) {
                    state.rcsCarouselCards[index].title = titleInput.value;
                }

                const descInput = item.querySelector('.card-desc-input');
                if (descInput) {
                    state.rcsCarouselCards[index].description = descInput.value;
                }
            }
        });
    }

    /**
     * Re-render RCS carousel
     */
    function rerenderRcsCarousel() {
        // Preserve scroll positions
        const scrollPositions = preserveScrollPositions();

        // First, sync current DOM values to state to preserve user input
        syncCarouselStateFromDOM();

        const platform = window.Mocamaker?.state?.platform || 'whatsapp';
        const type = MessageTypes.getType(platform, state.selectedType);
        const field = type?.fields.find(f => f.type === 'rcs_carousel_cards');

        const container = document.getElementById('rcs-carousel-builder');
        if (container && field) {
            // Create new content
            const temp = document.createElement('div');
            temp.innerHTML = renderRcsCarouselBuilder(field);
            const newBuilder = temp.firstElementChild;

            // Replace old with new
            container.parentNode.replaceChild(newBuilder, container);

            // Restore base64 image previews (not included in HTML to avoid breaking template)
            restoreCarouselPreviews();

            // Setup listeners on new element
            setupRcsCarouselListeners();
        }

        // Restore scroll positions
        restoreScrollPositions(scrollPositions);
    }

    /**
     * Setup media source (URL/File) listeners
     */
    function setupMediaSourceListeners() {
        const mediaFields = elements.dynamicFields.querySelectorAll('.media-source-field');
        if (!mediaFields.length) return;

        mediaFields.forEach(field => {
            const tabs = field.querySelectorAll('.media-source-tab');
            const panels = field.querySelectorAll('.media-source-panel');
            const urlInput = field.querySelector('.media-url-input');
            const fileInput = field.querySelector('.media-file-input');
            const dropzone = field.querySelector('.media-file-dropzone');
            const placeholder = field.querySelector('.media-file-placeholder');
            const preview = field.querySelector('.media-file-preview');
            const removeBtn = field.querySelector('.media-file-remove');
            const fileNameSpan = field.querySelector('.media-file-name');
            const mediaType = field.dataset.mediaType;

            // Tab switching
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const source = tab.dataset.source;

                    // Update tabs
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    // Update panels
                    panels.forEach(p => {
                        p.classList.toggle('active', p.dataset.panel === source);
                    });

                    // Update required state
                    if (source === 'url') {
                        urlInput.setAttribute('required', '');
                    } else {
                        urlInput.removeAttribute('required');
                    }
                });
            });

            // Dropzone click
            if (dropzone) {
                dropzone.addEventListener('click', (e) => {
                    if (e.target !== removeBtn && !removeBtn.contains(e.target)) {
                        fileInput.click();
                    }
                });

                // Drag and drop
                dropzone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dropzone.classList.add('dragover');
                });

                dropzone.addEventListener('dragleave', () => {
                    dropzone.classList.remove('dragover');
                });

                dropzone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropzone.classList.remove('dragover');
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        handleMediaFile(files[0], field, mediaType);
                    }
                });
            }

            // File input change
            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        handleMediaFile(e.target.files[0], field, mediaType);
                    }
                });
            }

            // Remove button
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    clearMediaFile(field, urlInput);
                });
            }
        });
    }

    /**
     * Handle media file selection
     */
    function handleMediaFile(file, fieldContainer, mediaType) {
        const urlInput = fieldContainer.querySelector('.media-url-input');
        const placeholder = fieldContainer.querySelector('.media-file-placeholder');
        const preview = fieldContainer.querySelector('.media-file-preview');
        const fileNameSpan = fieldContainer.querySelector('.media-file-name');

        // Validate file type
        const accept = fieldContainer.querySelector('.media-file-dropzone').dataset.accept;
        const allowedTypes = accept.split(',');
        if (!allowedTypes.some(type => file.type.match(type.replace('*', '.*')))) {
            alert('Formato de archivo no soportado. Formatos permitidos: ' + accept);
            return;
        }

        // Validate file size (max 10MB for images, 50MB for video/audio)
        const maxSize = mediaType === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
        if (file.size > maxSize) {
            const maxMB = maxSize / (1024 * 1024);
            alert(`El archivo es muy grande. Máximo ${maxMB}MB.`);
            return;
        }

        // Read file and create base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;

            // Update preview
            if (mediaType === 'image') {
                preview.querySelector('img').src = base64;
            } else if (mediaType === 'video') {
                preview.querySelector('video').src = base64;
            } else if (mediaType === 'audio') {
                preview.querySelector('audio').src = base64;
            }

            fileNameSpan.textContent = file.name;
            placeholder.style.display = 'none';
            preview.style.display = 'flex';

            // Store in form data (use the url field)
            urlInput.value = base64;
            state.formData[urlInput.name] = base64;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Clear media file selection
     */
    function clearMediaFile(fieldContainer, urlInput) {
        const fileInput = fieldContainer.querySelector('.media-file-input');
        const placeholder = fieldContainer.querySelector('.media-file-placeholder');
        const preview = fieldContainer.querySelector('.media-file-preview');
        const mediaType = fieldContainer.dataset.mediaType;

        // Clear file input
        fileInput.value = '';

        // Clear preview
        if (mediaType === 'image') {
            preview.querySelector('img').src = '';
        } else if (mediaType === 'video') {
            preview.querySelector('video').src = '';
        } else if (mediaType === 'audio') {
            preview.querySelector('audio').src = '';
        }

        placeholder.style.display = 'flex';
        preview.style.display = 'none';

        // Clear form data
        urlInput.value = '';
        state.formData[urlInput.name] = '';
    }

    /**
     * Handle add message button click
     */
    function handleAddMessage() {
        if (!state.selectedType) return;

        const platform = window.Mocamaker?.state?.platform || 'whatsapp';
        const type = MessageTypes.getType(platform, state.selectedType);

        // Collect form data
        const content = { ...state.formData };

        // Add buttons if applicable
        if (type.fields.some(f => f.type === 'button_list')) {
            content.buttons = state.buttonsList.filter(b => b.trim() !== '');
        }

        // Add list sections if applicable
        if (type.fields.some(f => f.type === 'list_sections')) {
            content.sections = state.listSections.filter(s => s.title.trim() !== '' || s.items.some(i => i.title.trim() !== ''));
        }

        // Add RCS suggestions if applicable
        if (type.fields.some(f => f.type === 'rcs_suggestions')) {
            content.suggestions = state.rcsSuggestions.filter(s => s.text.trim() !== '');
        }

        // Add RCS carousel cards if applicable
        if (type.fields.some(f => f.type === 'rcs_carousel_cards')) {
            content.cards = state.rcsCarouselCards.filter(c => c.title.trim() !== '' || c.description.trim() !== '' || c.mediaUrl.trim() !== '');
        }

        // Validate required fields
        const validation = MessageTypes.validateContent(platform, state.selectedType, content);
        if (!validation.valid) {
            alert('Por favor completa los campos requeridos:\n' + validation.errors.join('\n'));
            return;
        }

        // Create message object
        const message = {
            id: `msg_${Date.now()}`,
            type: state.selectedType,
            sender: type.senderLocked || state.selectedSender,
            platform: platform,
            content: content,
            timestamp: getCurrentTime(),
            createdBy: 'manual'
        };

        // Dispatch event for app.js to handle
        window.dispatchEvent(new CustomEvent('message:add', { detail: message }));

        // Reset form
        resetForm();
    }

    /**
     * Get current time as HH:MM
     */
    function getCurrentTime() {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }

    /**
     * Reset the form
     */
    function resetForm() {
        // Reset all state
        state.selectedType = null;
        state.formData = {};
        state.buttonsList = [''];
        state.listSections = [{ title: '', items: [{ title: '', description: '' }] }];
        state.rcsSuggestions = [{ type: 'reply', text: '' }];
        state.rcsCarouselCards = [
            { mediaUrl: '', title: '', description: '', suggestions: [] },
            { mediaUrl: '', title: '', description: '', suggestions: [] }
        ];

        // Remove active state from all type buttons
        elements.typeSelector.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Remove faded state from all categories (RCS contextual fade)
        elements.typeSelector.querySelectorAll('.type-category').forEach(cat => {
            cat.classList.remove('type-category--faded');
        });

        // Reset dynamic fields to empty state
        elements.dynamicFields.innerHTML = '<div class="empty-type-state"><p>Selecciona un tipo de mensaje para ver las opciones</p></div>';

        // Disable add message button
        elements.addMessageBtn.disabled = true;
    }

    /**
     * Update platform (called when platform changes)
     */
    function updatePlatform(platform) {
        state.selectedType = null;
        state.formData = {};
        renderTypeSelector(platform);
        elements.dynamicFields.innerHTML = '<div class="empty-type-state"><p>Selecciona un tipo de mensaje para ver las opciones</p></div>';
        elements.addMessageBtn.disabled = true;
    }

    /**
     * Clear all state
     */
    function clear() {
        state.selectedType = null;
        state.selectedSender = 'brand';
        state.formData = {};
        state.buttonsList = [''];
        state.listSections = [{ title: '', items: [{ title: '', description: '' }] }];
        state.rcsSuggestions = [{ type: 'reply', text: '' }];
        state.rcsCarouselCards = [
            { mediaUrl: '', title: '', description: '', suggestions: [] },
            { mediaUrl: '', title: '', description: '', suggestions: [] }
        ];

        elements.senderBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sender === 'brand');
        });

        const platform = window.Mocamaker?.state?.platform || 'whatsapp';
        renderTypeSelector(platform);
        elements.dynamicFields.innerHTML = '<div class="empty-type-state"><p>Selecciona un tipo de mensaje para ver las opciones</p></div>';
        elements.addMessageBtn.disabled = true;
    }

    // Public API
    return {
        init,
        updatePlatform,
        clear,
        getState: () => ({ ...state })
    };

})();
