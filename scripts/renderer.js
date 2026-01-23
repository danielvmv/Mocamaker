/**
 * Mocamaker v2.1 - Renderer
 * Renders messages into visual mockups for WhatsApp and RCS
 */

const Renderer = (function() {
    'use strict';

    // Current render options
    let currentOptions = {
        brandName: 'Mi Empresa',
        brandAvatar: null,
        os: 'ios'
    };

    /**
     * Render empty state (no messages)
     */
    function renderEmpty(platform, options) {
        currentOptions = { ...currentOptions, ...normalizeOptions(options) };
        if (platform === 'whatsapp') {
            return renderWhatsAppEmpty(currentOptions);
        }
        return renderRCSEmpty(currentOptions);
    }

    /**
     * Render full conversation
     */
    function renderFull(messages, platform, options) {
        currentOptions = { ...currentOptions, ...normalizeOptions(options) };
        if (platform === 'whatsapp') {
            return renderWhatsAppFull(messages, currentOptions);
        }
        return renderRCSFull(messages, currentOptions);
    }

    /**
     * Normalize options (support both old string format and new object format)
     */
    function normalizeOptions(options) {
        if (typeof options === 'string') {
            return { brandName: options };
        }
        return options || {};
    }

    /**
     * Render WhatsApp empty state
     */
    function renderWhatsAppEmpty(options) {
        const osClass = options.os === 'android' ? 'whatsapp-phone--android' : 'whatsapp-phone--ios';
        return `
            <div class="whatsapp-phone ${osClass}">
                ${renderWhatsAppStatusBar(options.os)}
                ${renderWhatsAppHeader(options)}
                <div class="wa-chat">
                    <div class="wa-empty-chat">
                        <div class="wa-empty-icon">💬</div>
                        <p>Agrega mensajes para construir tu mockup</p>
                    </div>
                </div>
                ${renderWhatsAppInputBar()}
            </div>
        `;
    }

    /**
     * Render WhatsApp full conversation
     */
    function renderWhatsAppFull(messages, options) {
        const osClass = options.os === 'android' ? 'whatsapp-phone--android' : 'whatsapp-phone--ios';
        return `
            <div class="whatsapp-phone ${osClass}">
                ${renderWhatsAppStatusBar(options.os)}
                ${renderWhatsAppHeader(options)}
                <div class="wa-chat">
                    ${messages.map((msg, index) => renderWhatsAppMessage(msg, index)).join('')}
                </div>
                ${renderWhatsAppInputBar()}
            </div>
        `;
    }

    /**
     * Render WhatsApp status bar
     */
    function renderWhatsAppStatusBar(os) {
        const time = os === 'android' ? '9:41' : '9:41';
        return `
            <div class="wa-status-bar">
                <span class="wa-status-time">${time}</span>
                <div class="wa-status-icons">
                    <svg viewBox="0 0 24 24"><path d="M12 21.5c5.523 0 10-1.12 10-2.5V5c0-1.38-4.477-2.5-10-2.5S2 3.62 2 5v14c0 1.38 4.477 2.5 10 2.5z"/></svg>
                    <svg viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                    <svg viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
                </div>
            </div>
        `;
    }

    /**
     * Render WhatsApp header
     */
    function renderWhatsAppHeader(options) {
        const brandName = options.brandName || 'Mi Empresa';
        const initial = brandName.charAt(0).toUpperCase();
        const avatarContent = options.brandAvatar
            ? `<img src="${options.brandAvatar}" alt="${escapeHtml(brandName)}">`
            : initial;

        return `
            <div class="wa-header">
                <div class="wa-header-back">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                </div>
                <div class="wa-header-avatar ${options.brandAvatar ? 'wa-header-avatar--image' : ''}">${avatarContent}</div>
                <div class="wa-header-info">
                    <div class="wa-header-name">${escapeHtml(brandName)}</div>
                    <div class="wa-header-status">en línea</div>
                </div>
                <div class="wa-header-actions">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 12c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3zm9-.449s-4.252 8.449-12 8.449-12-8.449-12-8.449S4.252 3.551 12 3.551s12 8 12 8z"/></svg>
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                </div>
            </div>
        `;
    }

    /**
     * Render WhatsApp message
     */
    function renderWhatsAppMessage(msg, index) {
        const isOutgoing = msg.sender === 'brand';
        const directionClass = isOutgoing ? 'wa-message--outgoing' : 'wa-message--incoming';

        let contentHtml = '';

        switch (msg.type) {
            case 'text':
            case 'user_text':
                contentHtml = renderWAText(msg, isOutgoing);
                break;
            case 'image':
                contentHtml = renderWAImage(msg, isOutgoing);
                break;
            case 'video':
                contentHtml = renderWAVideo(msg, isOutgoing);
                break;
            case 'audio':
                contentHtml = renderWAAudio(msg, isOutgoing);
                break;
            case 'document':
                contentHtml = renderWADocument(msg, isOutgoing);
                break;
            case 'sticker':
                contentHtml = renderWASticker(msg);
                break;
            case 'buttons':
            case 'user_button_reply':
                contentHtml = renderWAButtons(msg, isOutgoing);
                break;
            case 'list':
            case 'user_list_reply':
                contentHtml = renderWAList(msg, isOutgoing);
                break;
            case 'cta_url':
                contentHtml = renderWACTAUrl(msg, isOutgoing);
                break;
            case 'cta_call':
                contentHtml = renderWACTACall(msg, isOutgoing);
                break;
            case 'location':
                contentHtml = renderWALocation(msg, isOutgoing);
                break;
            case 'location_request':
                contentHtml = renderWALocationRequest(msg, isOutgoing);
                break;
            case 'contact':
                contentHtml = renderWAContact(msg, isOutgoing);
                break;
            case 'product':
                contentHtml = renderWAProduct(msg, isOutgoing);
                break;
            case 'flow':
                contentHtml = renderWAFlow(msg, isOutgoing);
                break;
            default:
                contentHtml = renderWAText(msg, isOutgoing);
        }

        return `
            <div class="wa-message-wrapper" data-message-id="${msg.id}">
                <div class="wa-message ${directionClass}" style="animation-delay: ${index * 100}ms">
                    ${contentHtml}
                </div>
                <button class="message-delete-btn" data-message-id="${msg.id}" title="Eliminar mensaje">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;
    }

    /**
     * Render WA Text message
     */
    function renderWAText(msg, isOutgoing) {
        const text = msg.content.text || msg.content.buttonText || msg.content.selectedItem || '';
        return `
            <div class="wa-bubble">
                <span class="wa-bubble-text">${formatWhatsAppText(text)}</span>
                ${renderWAFooter(msg.timestamp, isOutgoing)}
            </div>
        `;
    }

    /**
     * Render WA Image message
     */
    function renderWAImage(msg, isOutgoing) {
        const url = msg.content.url || msg.content.image || 'https://via.placeholder.com/300x200/DCF8C6/333333?text=Imagen';
        const caption = msg.content.caption || '';

        return `
            <div class="wa-bubble wa-bubble--media">
                <div class="wa-media-container">
                    <img src="${escapeHtml(url)}" alt="Imagen" class="wa-media-image" loading="lazy">
                </div>
                ${caption ? `<span class="wa-bubble-text">${formatWhatsAppText(caption)}</span>` : ''}
                ${renderWAFooter(msg.timestamp, isOutgoing)}
            </div>
        `;
    }

    /**
     * Render WA Video message
     */
    function renderWAVideo(msg, isOutgoing) {
        const url = msg.content.url || '';
        const caption = msg.content.caption || '';

        return `
            <div class="wa-bubble wa-bubble--media">
                <div class="wa-media-container wa-video-container">
                    <video src="${escapeHtml(url)}" class="wa-media-video" controls preload="metadata"></video>
                    <div class="wa-video-play-overlay">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                </div>
                ${caption ? `<span class="wa-bubble-text">${formatWhatsAppText(caption)}</span>` : ''}
                ${renderWAFooter(msg.timestamp, isOutgoing)}
            </div>
        `;
    }

    /**
     * Render WA Audio message
     */
    function renderWAAudio(msg, isOutgoing) {
        const url = msg.content.url || '';

        return `
            <div class="wa-bubble wa-bubble--audio">
                <div class="wa-audio-container">
                    <div class="wa-audio-avatar">🎵</div>
                    <div class="wa-audio-waveform">
                        <audio src="${escapeHtml(url)}" controls class="wa-audio-player"></audio>
                    </div>
                </div>
                ${renderWAFooter(msg.timestamp, isOutgoing)}
            </div>
        `;
    }

    /**
     * Render WA Document message
     */
    function renderWADocument(msg, isOutgoing) {
        const filename = msg.content.filename || 'documento.pdf';
        const caption = msg.content.caption || '';

        return `
            <div class="wa-bubble wa-bubble--document">
                <div class="wa-document-container">
                    <div class="wa-document-icon">📄</div>
                    <div class="wa-document-info">
                        <span class="wa-document-name">${escapeHtml(filename)}</span>
                        <span class="wa-document-type">PDF</span>
                    </div>
                    <div class="wa-document-download">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                        </svg>
                    </div>
                </div>
                ${caption ? `<span class="wa-bubble-text">${formatWhatsAppText(caption)}</span>` : ''}
                ${renderWAFooter(msg.timestamp, isOutgoing)}
            </div>
        `;
    }

    /**
     * Render WA Sticker
     */
    function renderWASticker(msg) {
        const url = msg.content.url || '';
        return `
            <div class="wa-sticker">
                <img src="${escapeHtml(url)}" alt="Sticker" class="wa-sticker-image">
            </div>
        `;
    }

    /**
     * Render WA Buttons message
     */
    function renderWAButtons(msg, isOutgoing) {
        const text = msg.content.text || '';
        const buttons = msg.content.buttons || [];

        let buttonsHtml = '';
        if (buttons.length > 0 && isOutgoing) {
            buttonsHtml = `
                <div class="wa-buttons">
                    ${buttons.map(btn => `<div class="wa-button">${escapeHtml(typeof btn === 'string' ? btn : btn.text || btn)}</div>`).join('')}
                </div>
            `;
        }

        return `
            <div class="wa-bubble">
                <span class="wa-bubble-text">${formatWhatsAppText(text)}</span>
                ${renderWAFooter(msg.timestamp, isOutgoing)}
            </div>
            ${buttonsHtml}
        `;
    }

    /**
     * Render WA List message
     */
    function renderWAList(msg, isOutgoing) {
        const text = msg.content.text || '';
        const buttonText = msg.content.buttonText || 'Ver opciones';

        return `
            <div class="wa-bubble">
                <span class="wa-bubble-text">${formatWhatsAppText(text)}</span>
                ${renderWAFooter(msg.timestamp, isOutgoing)}
            </div>
            ${isOutgoing ? `
                <div class="wa-list-button">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
                    ${escapeHtml(buttonText)}
                </div>
            ` : ''}
        `;
    }

    /**
     * Render WA CTA URL
     */
    function renderWACTAUrl(msg, isOutgoing) {
        const text = msg.content.text || '';
        const buttonText = msg.content.buttonText || 'Abrir enlace';

        return `
            <div class="wa-bubble">
                <span class="wa-bubble-text">${formatWhatsAppText(text)}</span>
                ${renderWAFooter(msg.timestamp, isOutgoing)}
            </div>
            ${isOutgoing ? `
                <div class="wa-cta-button wa-cta-url">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                    </svg>
                    ${escapeHtml(buttonText)}
                </div>
            ` : ''}
        `;
    }

    /**
     * Render WA CTA Call
     */
    function renderWACTACall(msg, isOutgoing) {
        const text = msg.content.text || '';
        const buttonText = msg.content.buttonText || 'Llamar';

        return `
            <div class="wa-bubble">
                <span class="wa-bubble-text">${formatWhatsAppText(text)}</span>
                ${renderWAFooter(msg.timestamp, isOutgoing)}
            </div>
            ${isOutgoing ? `
                <div class="wa-cta-button wa-cta-call">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                    ${escapeHtml(buttonText)}
                </div>
            ` : ''}
        `;
    }

    /**
     * Render WA Location
     */
    function renderWALocation(msg, isOutgoing) {
        const name = msg.content.name || 'Ubicación';
        const address = msg.content.address || '';

        return `
            <div class="wa-bubble wa-bubble--location">
                <div class="wa-location-map">
                    <div class="wa-location-pin">📍</div>
                </div>
                <div class="wa-location-info">
                    <span class="wa-location-name">${escapeHtml(name)}</span>
                    ${address ? `<span class="wa-location-address">${escapeHtml(address)}</span>` : ''}
                </div>
                ${renderWAFooter(msg.timestamp, isOutgoing)}
            </div>
        `;
    }

    /**
     * Render WA Location Request
     */
    function renderWALocationRequest(msg, isOutgoing) {
        const text = msg.content.text || 'Comparte tu ubicación';

        return `
            <div class="wa-bubble">
                <span class="wa-bubble-text">${formatWhatsAppText(text)}</span>
                ${renderWAFooter(msg.timestamp, isOutgoing)}
            </div>
            ${isOutgoing ? `
                <div class="wa-location-request-button">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Enviar ubicación
                </div>
            ` : ''}
        `;
    }

    /**
     * Render WA Contact
     */
    function renderWAContact(msg, isOutgoing) {
        const name = msg.content.name || 'Contacto';
        const phone = msg.content.phone || '';

        return `
            <div class="wa-bubble wa-bubble--contact">
                <div class="wa-contact-container">
                    <div class="wa-contact-avatar">👤</div>
                    <div class="wa-contact-info">
                        <span class="wa-contact-name">${escapeHtml(name)}</span>
                        ${phone ? `<span class="wa-contact-phone">${escapeHtml(phone)}</span>` : ''}
                    </div>
                </div>
                <div class="wa-contact-actions">
                    <button class="wa-contact-action">Mensaje</button>
                    <button class="wa-contact-action">Agregar</button>
                </div>
                ${renderWAFooter(msg.timestamp, isOutgoing)}
            </div>
        `;
    }

    /**
     * Render WA Product
     */
    function renderWAProduct(msg, isOutgoing) {
        const text = msg.content.text || '';
        const productImage = msg.content.productImage || 'https://via.placeholder.com/100x100/f0f0f0/333?text=Producto';
        const productName = msg.content.productName || 'Producto';
        const productPrice = msg.content.productPrice || '$0.00';

        return `
            <div class="wa-bubble wa-bubble--product">
                ${text ? `<span class="wa-bubble-text">${formatWhatsAppText(text)}</span>` : ''}
                <div class="wa-product-card">
                    <img src="${escapeHtml(productImage)}" alt="${escapeHtml(productName)}" class="wa-product-image">
                    <div class="wa-product-info">
                        <span class="wa-product-name">${escapeHtml(productName)}</span>
                        <span class="wa-product-price">${escapeHtml(productPrice)}</span>
                    </div>
                </div>
                ${renderWAFooter(msg.timestamp, isOutgoing)}
            </div>
        `;
    }

    /**
     * Render WA Flow
     */
    function renderWAFlow(msg, isOutgoing) {
        const text = msg.content.text || '';
        const buttonText = msg.content.buttonText || 'Abrir formulario';

        return `
            <div class="wa-bubble">
                <span class="wa-bubble-text">${formatWhatsAppText(text)}</span>
                ${renderWAFooter(msg.timestamp, isOutgoing)}
            </div>
            ${isOutgoing ? `
                <div class="wa-flow-button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                    </svg>
                    ${escapeHtml(buttonText)}
                </div>
            ` : ''}
        `;
    }

    /**
     * Render WA Footer (timestamp + checks)
     */
    function renderWAFooter(timestamp, isOutgoing) {
        return `
            <span class="wa-bubble-footer">
                <span class="wa-bubble-time">${timestamp || '12:00'}</span>
                ${isOutgoing ? '<span class="wa-bubble-check">✓✓</span>' : ''}
            </span>
        `;
    }

    /**
     * Render WhatsApp input bar
     */
    function renderWhatsAppInputBar() {
        return `
            <div class="wa-input-bar">
                <div class="wa-input-emoji">😊</div>
                <div class="wa-input-field">Escribe un mensaje</div>
                <div class="wa-input-actions">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>
                </div>
                <div class="wa-input-mic">🎤</div>
            </div>
        `;
    }

    /**
     * Format WhatsApp text with markdown-like syntax
     */
    function formatWhatsAppText(text) {
        if (!text) return '';

        let formatted = escapeHtml(text);

        // Bold: *text*
        formatted = formatted.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');

        // Italic: _text_
        formatted = formatted.replace(/_([^_]+)_/g, '<em>$1</em>');

        // Strikethrough: ~text~
        formatted = formatted.replace(/~([^~]+)~/g, '<del>$1</del>');

        // Code: ```text```
        formatted = formatted.replace(/```([^`]+)```/g, '<code>$1</code>');

        // Line breaks
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    /**
     * Render RCS empty state
     */
    function renderRCSEmpty(options) {
        const osClass = options.os === 'android' ? 'rcs-phone--android' : 'rcs-phone--ios';
        return `
            <div class="rcs-phone ${osClass}">
                ${renderRCSStatusBar(options.os)}
                ${renderRCSHeader(options)}
                <div class="rcs-chat">
                    <div class="rcs-empty-state">
                        <div class="rcs-empty-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                        </div>
                        <p class="rcs-empty-title">Sin mensajes</p>
                        <p class="rcs-empty-text">Agrega mensajes para construir tu mockup RCS</p>
                    </div>
                </div>
                ${renderRCSInputBar(options.os)}
            </div>
        `;
    }

    /**
     * Render RCS full conversation
     */
    function renderRCSFull(messages, options) {
        const osClass = options.os === 'android' ? 'rcs-phone--android' : 'rcs-phone--ios';

        // Collect suggestions from the last brand message
        let suggestionsHtml = '';
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].sender === 'brand' && messages[i].content.suggestions && messages[i].content.suggestions.length > 0) {
                suggestionsHtml = renderRCSSuggestionChips(messages[i].content.suggestions);
                break;
            }
        }

        return `
            <div class="rcs-phone ${osClass}">
                ${renderRCSStatusBar(options.os)}
                ${renderRCSHeader(options)}
                <div class="rcs-chat">
                    ${messages.map((msg, index) => renderRCSMessage(msg, index)).join('')}
                </div>
                ${suggestionsHtml}
                ${renderRCSInputBar(options.os)}
            </div>
        `;
    }

    /**
     * Render RCS status bar
     */
    function renderRCSStatusBar(os) {
        const time = '9:41';
        return `
            <div class="rcs-status-bar">
                <span class="rcs-status-time">${time}</span>
                <div class="rcs-status-icons">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
                </div>
            </div>
        `;
    }

    /**
     * Render RCS header
     */
    function renderRCSHeader(options) {
        const brandName = options.brandName || 'Mi Empresa';
        const initial = brandName.charAt(0).toUpperCase();
        const avatarContent = options.brandAvatar
            ? `<img src="${options.brandAvatar}" alt="${escapeHtml(brandName)}">`
            : initial;

        return `
            <div class="rcs-header">
                <button class="rcs-header-back">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                </button>
                <div class="rcs-header-avatar ${options.brandAvatar ? 'rcs-header-avatar--image' : ''}">${avatarContent}</div>
                <div class="rcs-header-info">
                    <div class="rcs-header-name">${escapeHtml(brandName)}</div>
                    <div class="rcs-header-verified">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                        Verificado por Google
                    </div>
                </div>
                <button class="rcs-header-menu">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                </button>
            </div>
        `;
    }

    /**
     * Render RCS message
     */
    function renderRCSMessage(msg, index) {
        const isOutgoing = msg.sender === 'brand';
        const directionClass = isOutgoing ? 'rcs-message--outgoing' : 'rcs-message--incoming';

        let contentHtml = '';

        switch (msg.type) {
            case 'text':
            case 'user_text':
                contentHtml = renderRCSText(msg, isOutgoing);
                break;
            case 'image':
                contentHtml = renderRCSImage(msg, isOutgoing);
                break;
            case 'video':
                contentHtml = renderRCSVideo(msg, isOutgoing);
                break;
            case 'audio':
                contentHtml = renderRCSAudio(msg, isOutgoing);
                break;
            case 'document':
                contentHtml = renderRCSDocument(msg, isOutgoing);
                break;
            case 'rich_card':
                contentHtml = renderRCSRichCard(msg, isOutgoing);
                break;
            case 'carousel':
                contentHtml = renderRCSCarousel(msg, isOutgoing);
                break;
            case 'cta_url':
                contentHtml = renderRCSCTAUrl(msg, isOutgoing);
                break;
            case 'cta_dial':
                contentHtml = renderRCSCTADial(msg, isOutgoing);
                break;
            case 'cta_location':
                contentHtml = renderRCSCTALocation(msg, isOutgoing);
                break;
            case 'cta_share_location':
            case 'user_location':
                contentHtml = renderRCSCTAShareLocation(msg, isOutgoing);
                break;
            case 'cta_calendar':
                contentHtml = renderRCSCTACalendar(msg, isOutgoing);
                break;
            case 'suggestions_only':
                contentHtml = ''; // Suggestions are rendered separately
                break;
            case 'user_suggestion_reply':
                contentHtml = renderRCSUserSuggestion(msg);
                break;
            default:
                contentHtml = renderRCSText(msg, isOutgoing);
        }

        if (!contentHtml) return '';

        return `
            <div class="rcs-message-wrapper" data-message-id="${msg.id}">
                <div class="rcs-message ${directionClass}" style="animation-delay: ${index * 100}ms">
                    ${contentHtml}
                </div>
                <button class="message-delete-btn" data-message-id="${msg.id}" title="Eliminar mensaje">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;
    }

    /**
     * Render RCS Text message
     */
    function renderRCSText(msg, isOutgoing) {
        const text = msg.content.text || msg.content.suggestionText || '';
        return `
            <div class="rcs-bubble">
                <span class="rcs-bubble-text">${escapeHtml(text)}</span>
                ${renderRCSTimestamp(msg.timestamp, isOutgoing)}
            </div>
        `;
    }

    /**
     * Render RCS Image message
     */
    function renderRCSImage(msg, isOutgoing) {
        const url = msg.content.url || 'https://via.placeholder.com/300x200/E3F2FD/1A73E8?text=Imagen';
        return `
            <div class="rcs-bubble rcs-bubble--media">
                <div class="rcs-media-container">
                    <img src="${escapeHtml(url)}" alt="Imagen" class="rcs-media-image" loading="lazy">
                </div>
                ${renderRCSTimestamp(msg.timestamp, isOutgoing)}
            </div>
        `;
    }

    /**
     * Render RCS Video message
     */
    function renderRCSVideo(msg, isOutgoing) {
        const url = msg.content.url || '';
        const thumbnail = msg.content.thumbnailUrl || '';
        return `
            <div class="rcs-bubble rcs-bubble--media">
                <div class="rcs-media-container rcs-video-container">
                    ${thumbnail ? `<img src="${escapeHtml(thumbnail)}" alt="Video" class="rcs-video-thumb">` : ''}
                    <video src="${escapeHtml(url)}" class="rcs-media-video" controls preload="metadata" ${thumbnail ? 'style="display:none"' : ''}></video>
                    <div class="rcs-video-play-btn">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                </div>
                ${renderRCSTimestamp(msg.timestamp, isOutgoing)}
            </div>
        `;
    }

    /**
     * Render RCS Audio message
     */
    function renderRCSAudio(msg, isOutgoing) {
        const url = msg.content.url || '';
        return `
            <div class="rcs-bubble rcs-bubble--audio">
                <div class="rcs-audio-container">
                    <button class="rcs-audio-play">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                    <div class="rcs-audio-waveform">
                        <div class="rcs-audio-progress"></div>
                    </div>
                    <span class="rcs-audio-duration">0:00</span>
                </div>
                ${renderRCSTimestamp(msg.timestamp, isOutgoing)}
            </div>
        `;
    }

    /**
     * Render RCS Document message
     */
    function renderRCSDocument(msg, isOutgoing) {
        const filename = msg.content.filename || 'documento.pdf';
        const ext = filename.split('.').pop().toUpperCase();
        return `
            <div class="rcs-bubble rcs-bubble--document">
                <div class="rcs-document-container">
                    <div class="rcs-document-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>
                        <span class="rcs-document-ext">${ext}</span>
                    </div>
                    <div class="rcs-document-info">
                        <span class="rcs-document-name">${escapeHtml(filename)}</span>
                        <span class="rcs-document-size">PDF • Toca para descargar</span>
                    </div>
                </div>
                ${renderRCSTimestamp(msg.timestamp, isOutgoing)}
            </div>
        `;
    }

    /**
     * Render RCS Rich Card
     */
    function renderRCSRichCard(msg, isOutgoing) {
        const { mediaUrl, mediaHeight, title, description, suggestions } = msg.content;
        const heightClass = mediaHeight === 'SHORT' ? 'rcs-card--short' : mediaHeight === 'TALL' ? 'rcs-card--tall' : 'rcs-card--medium';

        return `
            <div class="rcs-rich-card ${heightClass}">
                ${mediaUrl ? `
                    <div class="rcs-card-media">
                        <img src="${escapeHtml(mediaUrl)}" alt="" loading="lazy">
                    </div>
                ` : ''}
                <div class="rcs-card-content">
                    ${title ? `<h4 class="rcs-card-title">${escapeHtml(title)}</h4>` : ''}
                    ${description ? `<p class="rcs-card-description">${escapeHtml(description)}</p>` : ''}
                </div>
                ${suggestions && suggestions.length > 0 ? `
                    <div class="rcs-card-actions">
                        ${suggestions.map(sug => renderRCSCardAction(sug)).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render RCS Carousel
     */
    function renderRCSCarousel(msg, isOutgoing) {
        const { cardWidth, cards } = msg.content;
        const widthClass = cardWidth === 'SMALL' ? 'rcs-carousel--small' : 'rcs-carousel--medium';

        return `
            <div class="rcs-carousel ${widthClass}">
                <div class="rcs-carousel-track">
                    ${(cards || []).map(card => `
                        <div class="rcs-carousel-card">
                            ${card.mediaUrl ? `
                                <div class="rcs-card-media">
                                    <img src="${escapeHtml(card.mediaUrl)}" alt="" loading="lazy">
                                </div>
                            ` : ''}
                            <div class="rcs-card-content">
                                ${card.title ? `<h4 class="rcs-card-title">${escapeHtml(card.title)}</h4>` : ''}
                                ${card.description ? `<p class="rcs-card-description">${escapeHtml(card.description)}</p>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render RCS CTA URL
     */
    function renderRCSCTAUrl(msg, isOutgoing) {
        const text = msg.content.text || '';
        const buttonText = msg.content.buttonText || 'Abrir';
        return `
            <div class="rcs-bubble">
                <span class="rcs-bubble-text">${escapeHtml(text)}</span>
                ${renderRCSTimestamp(msg.timestamp, isOutgoing)}
            </div>
            <div class="rcs-action-buttons">
                <button class="rcs-action-btn rcs-action-btn--url">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
                    ${escapeHtml(buttonText)}
                </button>
            </div>
        `;
    }

    /**
     * Render RCS CTA Dial
     */
    function renderRCSCTADial(msg, isOutgoing) {
        const text = msg.content.text || '';
        const buttonText = msg.content.buttonText || 'Llamar';
        return `
            <div class="rcs-bubble">
                <span class="rcs-bubble-text">${escapeHtml(text)}</span>
                ${renderRCSTimestamp(msg.timestamp, isOutgoing)}
            </div>
            <div class="rcs-action-buttons">
                <button class="rcs-action-btn rcs-action-btn--dial">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                    ${escapeHtml(buttonText)}
                </button>
            </div>
        `;
    }

    /**
     * Render RCS CTA Location
     */
    function renderRCSCTALocation(msg, isOutgoing) {
        const text = msg.content.text || '';
        const buttonText = msg.content.buttonText || 'Ver ubicación';
        const label = msg.content.label || '';
        return `
            <div class="rcs-bubble">
                <span class="rcs-bubble-text">${escapeHtml(text)}</span>
                ${renderRCSTimestamp(msg.timestamp, isOutgoing)}
            </div>
            <div class="rcs-action-buttons">
                <button class="rcs-action-btn rcs-action-btn--location">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    ${escapeHtml(buttonText)}
                </button>
            </div>
        `;
    }

    /**
     * Render RCS CTA Share Location
     */
    function renderRCSCTAShareLocation(msg, isOutgoing) {
        const text = msg.content.text || 'Comparte tu ubicación';
        const buttonText = msg.content.buttonText || 'Compartir ubicación';

        if (msg.type === 'user_location') {
            return `
                <div class="rcs-bubble rcs-bubble--location">
                    <div class="rcs-location-map">
                        <div class="rcs-location-pin">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        </div>
                    </div>
                    <div class="rcs-location-label">Mi ubicación</div>
                    ${renderRCSTimestamp(msg.timestamp, isOutgoing)}
                </div>
            `;
        }

        return `
            <div class="rcs-bubble">
                <span class="rcs-bubble-text">${escapeHtml(text)}</span>
                ${renderRCSTimestamp(msg.timestamp, isOutgoing)}
            </div>
            <div class="rcs-action-buttons">
                <button class="rcs-action-btn rcs-action-btn--share-location">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
                    ${escapeHtml(buttonText)}
                </button>
            </div>
        `;
    }

    /**
     * Render RCS CTA Calendar
     */
    function renderRCSCTACalendar(msg, isOutgoing) {
        const text = msg.content.text || '';
        const buttonText = msg.content.buttonText || 'Agregar al calendario';
        const eventTitle = msg.content.eventTitle || 'Evento';
        return `
            <div class="rcs-bubble">
                <span class="rcs-bubble-text">${escapeHtml(text)}</span>
                <div class="rcs-event-preview">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                    <span>${escapeHtml(eventTitle)}</span>
                </div>
                ${renderRCSTimestamp(msg.timestamp, isOutgoing)}
            </div>
            <div class="rcs-action-buttons">
                <button class="rcs-action-btn rcs-action-btn--calendar">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>
                    ${escapeHtml(buttonText)}
                </button>
            </div>
        `;
    }

    /**
     * Render RCS User Suggestion reply
     */
    function renderRCSUserSuggestion(msg) {
        const text = msg.content.suggestionText || '';
        return `
            <div class="rcs-bubble rcs-bubble--suggestion-reply">
                <span class="rcs-bubble-text">${escapeHtml(text)}</span>
                ${renderRCSTimestamp(msg.timestamp, false)}
            </div>
        `;
    }

    /**
     * Render RCS card action button
     */
    function renderRCSCardAction(suggestion) {
        const icons = {
            reply: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>',
            url: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>',
            dial: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>',
            location: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>',
            calendar: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>'
        };
        const icon = icons[suggestion.type] || icons.reply;
        return `<button class="rcs-card-action-btn">${icon} ${escapeHtml(suggestion.text)}</button>`;
    }

    /**
     * Render RCS suggestion chips
     */
    function renderRCSSuggestionChips(suggestions) {
        if (!suggestions || suggestions.length === 0) return '';

        const icons = {
            reply: '',
            url: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>',
            dial: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>',
            location: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>',
            share_location: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/></svg>',
            calendar: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>'
        };

        return `
            <div class="rcs-suggestions">
                <div class="rcs-suggestions-track">
                    ${suggestions.map(sug => {
                        const icon = icons[sug.type] || '';
                        return `<button class="rcs-suggestion-chip">${icon}${escapeHtml(sug.text)}</button>`;
                    }).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render RCS timestamp
     */
    function renderRCSTimestamp(timestamp, isOutgoing) {
        return `
            <span class="rcs-bubble-footer">
                <span class="rcs-bubble-time">${timestamp || '12:00'}</span>
                ${isOutgoing ? '<span class="rcs-bubble-status">✓</span>' : ''}
            </span>
        `;
    }

    /**
     * Render RCS input bar
     */
    function renderRCSInputBar(os) {
        return `
            <div class="rcs-input-bar">
                <button class="rcs-input-add">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                </button>
                <div class="rcs-input-field">
                    <span>Mensaje</span>
                </div>
                <button class="rcs-input-emoji">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
                </button>
                <button class="rcs-input-send">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
            </div>
        `;
    }

    /**
     * Generate standalone HTML for download
     */
    function generateStandaloneHTML(mockupHtml, platform, os) {
        const styles = platform === 'whatsapp' ? getWhatsAppStyles() : getRCSStyles();
        const osLabel = os === 'android' ? 'Android' : 'iOS';

        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mockup ${platform === 'whatsapp' ? 'WhatsApp' : 'RCS'} (${osLabel}) - Mocamaker</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .message-delete-btn, .wa-message-wrapper:hover .message-actions { display: none !important; }
        .wa-header-avatar--image img, .rcs-header-avatar--image img {
            width: 100%; height: 100%; object-fit: cover; border-radius: 50%;
        }
        ${styles}
    </style>
</head>
<body>
    ${mockupHtml}
</body>
</html>`;
    }

    /**
     * Get WhatsApp CSS styles
     */
    function getWhatsAppStyles() {
        return `
:root {
    --wa-bg: #ECE5DD;
    --wa-bubble-outgoing: #DCF8C6;
    --wa-bubble-incoming: #FFFFFF;
    --wa-header-bg: #075E54;
    --wa-text: #303030;
    --wa-text-secondary: rgba(0, 0, 0, 0.45);
    --wa-check: #34B7F1;
    --wa-button-text: #00A5F4;
}

.whatsapp-phone {
    width: 375px;
    background: var(--wa-bg);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.wa-status-bar {
    height: 24px;
    background: var(--wa-header-bg);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    font-size: 12px;
    color: white;
}

.wa-status-icons { display: flex; gap: 4px; }
.wa-status-icons svg { width: 14px; height: 14px; fill: white; }

.wa-header {
    background: var(--wa-header-bg);
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.wa-header-back svg { width: 24px; height: 24px; fill: white; }
.wa-header-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: #128C7E;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
}

.wa-header-info { flex: 1; }
.wa-header-name { color: white; font-size: 16px; font-weight: 500; display: block; }
.wa-header-status { color: rgba(255,255,255,0.7); font-size: 13px; }
.wa-header-actions { display: flex; gap: 20px; }
.wa-header-actions svg { width: 22px; height: 22px; fill: white; }

.wa-chat {
    min-height: 400px;
    max-height: 500px;
    overflow-y: auto;
    padding: 8px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.wa-message-wrapper { position: relative; }
.wa-message {
    display: flex;
    flex-direction: column;
    max-width: 75%;
    animation: messageIn 0.3s ease-out;
}

@keyframes messageIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.wa-message--outgoing { align-self: flex-end; }
.wa-message--incoming { align-self: flex-start; }

.wa-bubble {
    padding: 6px 7px 8px 9px;
    border-radius: 7.5px;
    box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
    background: var(--wa-bubble-incoming);
}

.wa-message--outgoing .wa-bubble {
    background: var(--wa-bubble-outgoing);
    border-top-right-radius: 0;
}

.wa-message--incoming .wa-bubble {
    border-top-left-radius: 0;
}

.wa-bubble-text {
    font-size: 14.2px;
    line-height: 1.4;
    color: var(--wa-text);
    word-wrap: break-word;
}

.wa-bubble-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 3px;
    margin-top: 2px;
    float: right;
    padding-left: 8px;
}

.wa-bubble-time { font-size: 11px; color: var(--wa-text-secondary); }
.wa-bubble-check { color: var(--wa-check); font-size: 16px; }

.wa-buttons {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin-top: 4px;
    background: rgba(0,0,0,0.08);
    border-radius: 0 0 7.5px 7.5px;
    overflow: hidden;
}

.wa-button {
    background: #F7F8FA;
    padding: 10px 16px;
    text-align: center;
    font-size: 14.2px;
    color: var(--wa-button-text);
}

.wa-list-button, .wa-cta-button, .wa-flow-button, .wa-location-request-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 4px;
    padding: 10px 16px;
    background: #F7F8FA;
    border-radius: 7.5px;
    font-size: 14.2px;
    color: var(--wa-button-text);
    box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
}

.wa-list-button svg, .wa-cta-button svg, .wa-flow-button svg, .wa-location-request-button svg {
    width: 18px;
    height: 18px;
}

.wa-bubble--media .wa-media-container {
    margin: -6px -7px 6px -9px;
    border-radius: 7.5px 7.5px 0 0;
    overflow: hidden;
}

.wa-media-image, .wa-media-video {
    width: 100%;
    display: block;
    max-height: 300px;
    object-fit: cover;
}

.wa-bubble--document .wa-document-container {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
}

.wa-document-icon { font-size: 32px; }
.wa-document-info { flex: 1; }
.wa-document-name { display: block; font-weight: 500; font-size: 14px; }
.wa-document-type { font-size: 12px; color: var(--wa-text-secondary); }

.wa-bubble--location .wa-location-map {
    height: 120px;
    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    margin: -6px -7px 8px -9px;
    border-radius: 7.5px 7.5px 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.wa-location-pin { font-size: 32px; }
.wa-location-name { display: block; font-weight: 500; }
.wa-location-address { font-size: 12px; color: var(--wa-text-secondary); }

.wa-bubble--contact .wa-contact-container {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(0,0,0,0.1);
    margin-bottom: 8px;
}

.wa-contact-avatar {
    width: 48px;
    height: 48px;
    background: #e0e0e0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
}

.wa-contact-name { display: block; font-weight: 500; }
.wa-contact-phone { font-size: 12px; color: var(--wa-text-secondary); }

.wa-contact-actions {
    display: flex;
    gap: 8px;
}

.wa-contact-action {
    flex: 1;
    padding: 8px;
    background: transparent;
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 4px;
    font-size: 12px;
    color: var(--wa-button-text);
}

.wa-bubble--product .wa-product-card {
    display: flex;
    gap: 12px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(0,0,0,0.1);
}

.wa-product-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
}

.wa-product-name { display: block; font-weight: 500; font-size: 14px; }
.wa-product-price { font-size: 16px; font-weight: 600; color: #075E54; }

.wa-input-bar {
    background: #F0F0F0;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.wa-input-emoji { font-size: 24px; }
.wa-input-field {
    flex: 1;
    background: white;
    border-radius: 21px;
    padding: 9px 12px;
    font-size: 15px;
    color: rgba(0,0,0,0.45);
}

.wa-input-actions svg { width: 24px; height: 24px; fill: #8696A0; }
.wa-input-mic {
    width: 42px;
    height: 42px;
    background: #128C7E;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}

.wa-empty-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba(0,0,0,0.45);
    text-align: center;
    padding: 40px;
}

.wa-empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
`;
    }

    /**
     * Get RCS CSS styles
     */
    function getRCSStyles() {
        return `
.rcs-phone {
    width: 375px;
    height: 667px;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    display: flex;
    flex-direction: column;
}

.rcs-status-bar {
    height: 24px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    font-size: 12px;
    color: #202124;
    font-weight: 500;
}

.rcs-status-icons { display: flex; gap: 4px; }
.rcs-status-icons svg { width: 16px; height: 16px; fill: #202124; }

.rcs-header {
    padding: 12px 8px;
    border-bottom: 1px solid #E8EAED;
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
}

.rcs-header-back {
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    background: none; border: none;
}

.rcs-header-back svg { width: 24px; height: 24px; fill: #5F6368; }

.rcs-header-avatar {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #1A73E8 0%, #4285F4 100%);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 600; font-size: 18px;
}

.rcs-header-info { flex: 1; }
.rcs-header-name { display: block; font-weight: 500; color: #202124; font-size: 16px; }
.rcs-header-verified {
    display: flex; align-items: center; gap: 4px;
    font-size: 12px; color: #1A73E8;
}
.rcs-header-verified svg { width: 14px; height: 14px; fill: #1A73E8; }

.rcs-header-menu {
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    background: none; border: none;
}
.rcs-header-menu svg { width: 24px; height: 24px; fill: #5F6368; }

.rcs-chat {
    flex: 1;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    background: #FAFAFA;
}

.rcs-message-wrapper { position: relative; }
.rcs-message { max-width: 80%; animation: rcsMessageIn 0.3s ease-out; }

@keyframes rcsMessageIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.rcs-message--outgoing { margin-left: auto; }
.rcs-message--incoming { margin-right: auto; }

.rcs-bubble {
    padding: 10px 14px;
    border-radius: 20px;
    font-size: 15px;
    line-height: 1.4;
    position: relative;
}

.rcs-message--outgoing .rcs-bubble {
    background: #1A73E8;
    color: white;
    border-bottom-right-radius: 4px;
}

.rcs-message--incoming .rcs-bubble {
    background: white;
    color: #202124;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.rcs-bubble-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    margin-top: 4px;
    font-size: 11px;
}

.rcs-message--outgoing .rcs-bubble-footer { color: rgba(255,255,255,0.7); }
.rcs-message--incoming .rcs-bubble-footer { color: #5F6368; }

.rcs-bubble-status { font-size: 12px; }

.rcs-bubble--media { padding: 0; overflow: hidden; }
.rcs-bubble--media .rcs-bubble-footer { padding: 8px 14px 10px; margin-top: 0; }

.rcs-media-container { position: relative; }
.rcs-media-image { width: 100%; display: block; max-height: 250px; object-fit: cover; }

.rcs-video-container { position: relative; }
.rcs-video-thumb, .rcs-media-video { width: 100%; display: block; }
.rcs-video-play-btn {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 56px; height: 56px;
    background: rgba(0,0,0,0.6);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
}
.rcs-video-play-btn svg { width: 28px; height: 28px; fill: white; margin-left: 4px; }

.rcs-bubble--audio { padding: 10px 14px; }
.rcs-audio-container { display: flex; align-items: center; gap: 12px; }
.rcs-audio-play {
    width: 36px; height: 36px;
    background: #1A73E8; border-radius: 50%; border: none;
    display: flex; align-items: center; justify-content: center;
}
.rcs-audio-play svg { width: 18px; height: 18px; fill: white; margin-left: 2px; }
.rcs-audio-waveform { flex: 1; height: 4px; background: #E8EAED; border-radius: 2px; }
.rcs-audio-progress { width: 30%; height: 100%; background: #1A73E8; border-radius: 2px; }
.rcs-audio-duration { font-size: 12px; color: #5F6368; }

.rcs-bubble--document { padding: 12px 14px; }
.rcs-document-container { display: flex; align-items: center; gap: 12px; }
.rcs-document-icon {
    width: 48px; height: 48px;
    background: #E8EAED; border-radius: 8px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
}
.rcs-document-icon svg { width: 24px; height: 24px; fill: #5F6368; }
.rcs-document-ext { font-size: 8px; font-weight: 700; color: #5F6368; margin-top: -4px; }
.rcs-document-info { flex: 1; }
.rcs-document-name { display: block; font-weight: 500; font-size: 14px; color: #202124; }
.rcs-document-size { font-size: 12px; color: #5F6368; }

.rcs-rich-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    max-width: 280px;
}

.rcs-card-media { width: 100%; }
.rcs-card--short .rcs-card-media { height: 112px; }
.rcs-card--medium .rcs-card-media { height: 168px; }
.rcs-card--tall .rcs-card-media { height: 264px; }
.rcs-card-media img { width: 100%; height: 100%; object-fit: cover; }

.rcs-card-content { padding: 12px 16px; }
.rcs-card-title { font-size: 16px; font-weight: 500; color: #202124; margin: 0 0 4px; }
.rcs-card-description { font-size: 14px; color: #5F6368; margin: 0; line-height: 1.4; }

.rcs-card-actions { border-top: 1px solid #E8EAED; }
.rcs-card-action-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 12px 16px;
    background: none; border: none; border-top: 1px solid #E8EAED;
    font-size: 14px; font-weight: 500; color: #1A73E8;
    cursor: pointer;
}
.rcs-card-action-btn:first-child { border-top: none; }
.rcs-card-action-btn svg { width: 18px; height: 18px; fill: #1A73E8; }

.rcs-carousel { max-width: 100%; overflow: hidden; }
.rcs-carousel-track {
    display: flex; gap: 8px;
    overflow-x: auto; scroll-snap-type: x mandatory;
    padding: 4px;
}
.rcs-carousel-track::-webkit-scrollbar { display: none; }
.rcs-carousel-card {
    flex-shrink: 0;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    scroll-snap-align: start;
}
.rcs-carousel--small .rcs-carousel-card { width: 136px; }
.rcs-carousel--medium .rcs-carousel-card { width: 232px; }
.rcs-carousel-card .rcs-card-media { height: 120px; }

.rcs-action-buttons { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 8px; }
.rcs-action-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 16px;
    background: white;
    border: 1px solid #DADCE0;
    border-radius: 20px;
    font-size: 14px; font-weight: 500; color: #1A73E8;
    cursor: pointer;
}
.rcs-action-btn svg { width: 18px; height: 18px; fill: #1A73E8; }

.rcs-bubble--location { padding: 0; overflow: hidden; }
.rcs-location-map {
    height: 120px;
    background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
    display: flex; align-items: center; justify-content: center;
}
.rcs-location-pin svg { width: 36px; height: 36px; fill: #D93025; }
.rcs-location-label { padding: 10px 14px; font-weight: 500; }

.rcs-event-preview {
    display: flex; align-items: center; gap: 8px;
    margin-top: 8px; padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.2);
    font-size: 13px;
}
.rcs-event-preview svg { width: 18px; height: 18px; fill: currentColor; }

.rcs-suggestions {
    padding: 8px 16px;
    background: white;
    border-top: 1px solid #E8EAED;
}
.rcs-suggestions-track {
    display: flex; gap: 8px;
    overflow-x: auto;
}
.rcs-suggestions-track::-webkit-scrollbar { display: none; }
.rcs-suggestion-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    background: white;
    border: 1px solid #DADCE0;
    border-radius: 18px;
    font-size: 14px; color: #1A73E8;
    white-space: nowrap;
    cursor: pointer;
}
.rcs-suggestion-chip svg { width: 16px; height: 16px; fill: #1A73E8; }

.rcs-input-bar {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px;
    background: white;
    border-top: 1px solid #E8EAED;
}
.rcs-input-add, .rcs-input-emoji {
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    background: none; border: none;
}
.rcs-input-add svg, .rcs-input-emoji svg { width: 24px; height: 24px; fill: #5F6368; }
.rcs-input-field {
    flex: 1;
    padding: 10px 16px;
    background: #F1F3F4;
    border-radius: 24px;
    font-size: 15px; color: #5F6368;
}
.rcs-input-send {
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    background: #1A73E8; border: none; border-radius: 50%;
}
.rcs-input-send svg { width: 20px; height: 20px; fill: white; }

.rcs-empty-state {
    flex: 1;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 40px;
}
.rcs-empty-icon {
    width: 80px; height: 80px;
    background: #F1F3F4; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px;
}
.rcs-empty-icon svg { width: 40px; height: 40px; color: #5F6368; }
.rcs-empty-title { font-size: 16px; font-weight: 500; color: #202124; margin: 0 0 8px; }
.rcs-empty-text { font-size: 14px; color: #5F6368; margin: 0; text-align: center; }
`;
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public API
    return {
        renderEmpty,
        renderFull,
        generateStandaloneHTML
    };

})();
