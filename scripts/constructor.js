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
        rcsCarouselCards: [{ mediaUrl: '', title: '', description: '', suggestions: [] }]
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
        state.rcsCarouselCards = [{ mediaUrl: '', title: '', description: '', suggestions: [] }];

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
     */
    function renderRcsCarouselBuilder(field) {
        const maxCards = field.max || 10;
        const minCards = field.min || 2;
        return `
            <div class="rcs-carousel-builder" id="rcs-carousel-builder">
                ${state.rcsCarouselCards.map((card, index) => `
                    <div class="rcs-card-item" data-index="${index}">
                        <div class="rcs-card-header">
                            <span class="rcs-card-number">Tarjeta ${index + 1}</span>
                            <button type="button" class="button-item-remove card-remove" ${state.rcsCarouselCards.length <= minCards ? 'disabled' : ''}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <div class="rcs-card-fields">
                            <input type="url"
                                   class="card-media-input"
                                   value="${card.mediaUrl || ''}"
                                   placeholder="URL imagen (opcional)">
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
                `).join('')}
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

        // RCS carousel builder
        setupRcsCarouselListeners();
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
        const platform = window.Mocamaker?.state?.platform || 'whatsapp';
        const type = MessageTypes.getType(platform, state.selectedType);
        const field = type.fields.find(f => f.type === 'button_list');

        const builder = document.getElementById('button-list-builder');
        if (builder && field) {
            builder.outerHTML = renderButtonListBuilder(field);
            setupButtonListListeners();
        }
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
                    state.listSections[sIndex].items.splice(iIndex, 1);
                    rerenderListSections();
                }
            });
        });

        // Add item buttons
        builder.querySelectorAll('.add-item-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
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
                state.listSections.push({ title: '', items: [{ title: '', description: '' }] });
                rerenderListSections();
            });
        }
    }

    /**
     * Re-render list sections
     */
    function rerenderListSections() {
        const platform = window.Mocamaker?.state?.platform || 'whatsapp';
        const type = MessageTypes.getType(platform, state.selectedType);
        const field = type.fields.find(f => f.type === 'list_sections');

        const builder = document.getElementById('list-sections-builder');
        if (builder && field) {
            builder.outerHTML = renderListSectionsBuilder(field);
            setupListSectionsListeners();
        }
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
                    state.rcsSuggestions.push({ type: 'reply', text: '' });
                    rerenderRcsSuggestions();
                }
            });
        }
    }

    /**
     * Re-render RCS suggestions
     */
    function rerenderRcsSuggestions() {
        const platform = window.Mocamaker?.state?.platform || 'whatsapp';
        const type = MessageTypes.getType(platform, state.selectedType);
        const field = type?.fields.find(f => f.type === 'rcs_suggestions');

        const builder = document.getElementById('rcs-suggestions-builder');
        if (builder && field) {
            builder.outerHTML = renderRcsSuggestionsBuilder(field);
            setupRcsSuggestionsListeners();
        }
    }

    /**
     * Setup RCS carousel builder listeners
     */
    function setupRcsCarouselListeners() {
        const builder = document.getElementById('rcs-carousel-builder');
        if (!builder) return;

        // Card media inputs
        builder.querySelectorAll('.card-media-input').forEach((input) => {
            const item = input.closest('.rcs-card-item');
            const index = parseInt(item.dataset.index);
            input.addEventListener('input', (e) => {
                state.rcsCarouselCards[index].mediaUrl = e.target.value;
            });
        });

        // Card title inputs
        builder.querySelectorAll('.card-title-input').forEach((input) => {
            const item = input.closest('.rcs-card-item');
            const index = parseInt(item.dataset.index);
            input.addEventListener('input', (e) => {
                state.rcsCarouselCards[index].title = e.target.value;
            });
        });

        // Card description inputs
        builder.querySelectorAll('.card-desc-input').forEach((input) => {
            const item = input.closest('.rcs-card-item');
            const index = parseInt(item.dataset.index);
            input.addEventListener('input', (e) => {
                state.rcsCarouselCards[index].description = e.target.value;
            });
        });

        // Remove card buttons
        builder.querySelectorAll('.card-remove').forEach((btn) => {
            const item = btn.closest('.rcs-card-item');
            const index = parseInt(item.dataset.index);
            btn.addEventListener('click', () => {
                const platform = window.Mocamaker?.state?.platform || 'whatsapp';
                const type = MessageTypes.getType(platform, state.selectedType);
                const field = type?.fields.find(f => f.type === 'rcs_carousel_cards');
                const minCards = field?.min || 2;

                if (state.rcsCarouselCards.length > minCards) {
                    state.rcsCarouselCards.splice(index, 1);
                    rerenderRcsCarousel();
                }
            });
        });

        // Add card button
        const addBtn = document.getElementById('add-card-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const platform = window.Mocamaker?.state?.platform || 'whatsapp';
                const type = MessageTypes.getType(platform, state.selectedType);
                const field = type?.fields.find(f => f.type === 'rcs_carousel_cards');
                const maxCards = field?.max || 10;

                if (state.rcsCarouselCards.length < maxCards) {
                    state.rcsCarouselCards.push({ mediaUrl: '', title: '', description: '', suggestions: [] });
                    rerenderRcsCarousel();
                }
            });
        }
    }

    /**
     * Re-render RCS carousel
     */
    function rerenderRcsCarousel() {
        const platform = window.Mocamaker?.state?.platform || 'whatsapp';
        const type = MessageTypes.getType(platform, state.selectedType);
        const field = type?.fields.find(f => f.type === 'rcs_carousel_cards');

        const builder = document.getElementById('rcs-carousel-builder');
        if (builder && field) {
            builder.outerHTML = renderRcsCarouselBuilder(field);
            setupRcsCarouselListeners();
        }
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
        state.formData = {};
        state.buttonsList = [''];
        state.listSections = [{ title: '', items: [{ title: '', description: '' }] }];
        state.rcsSuggestions = [{ type: 'reply', text: '' }];
        state.rcsCarouselCards = [{ mediaUrl: '', title: '', description: '', suggestions: [] }];

        // Clear form inputs
        elements.dynamicFields.querySelectorAll('input, textarea, select').forEach(input => {
            input.value = '';
        });

        // Re-render special fields
        if (state.selectedType) {
            const platform = window.Mocamaker?.state?.platform || 'whatsapp';
            renderDynamicForm(state.selectedType, platform);
        }
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
        state.rcsCarouselCards = [{ mediaUrl: '', title: '', description: '', suggestions: [] }];

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
