/**
 * Mocamaker v2.0 - Message Types Catalog
 * Complete catalog of message types for WhatsApp and RCS
 */

const MessageTypes = (function() {
    'use strict';

    /**
     * WhatsApp Business API - Complete Message Types
     */
    const WHATSAPP_TYPES = {
        // ============================================
        // BASIC MESSAGES
        // ============================================
        text: {
            id: 'text',
            name: 'Texto',
            icon: '💬',
            category: 'basic',
            description: 'Mensaje de texto simple con formato',
            fields: [
                {
                    name: 'text',
                    label: 'Mensaje',
                    type: 'textarea',
                    placeholder: 'Escribe tu mensaje aquí...\n\nFormato: *bold* _italic_ ~strike~ ```code```',
                    required: true,
                    maxLength: 4096
                }
            ]
        },

        image: {
            id: 'image',
            name: 'Imagen',
            icon: '🖼️',
            category: 'media',
            description: 'Imagen JPEG/PNG hasta 5MB',
            fields: [
                {
                    name: 'url',
                    label: 'URL de la imagen',
                    type: 'url',
                    placeholder: 'https://ejemplo.com/imagen.jpg',
                    required: true
                },
                {
                    name: 'caption',
                    label: 'Pie de imagen (opcional)',
                    type: 'textarea',
                    placeholder: 'Descripción de la imagen...',
                    required: false,
                    maxLength: 1024
                }
            ]
        },

        video: {
            id: 'video',
            name: 'Video',
            icon: '🎬',
            category: 'media',
            description: 'Video MP4/3GPP hasta 16MB',
            fields: [
                {
                    name: 'url',
                    label: 'URL del video',
                    type: 'url',
                    placeholder: 'https://ejemplo.com/video.mp4',
                    required: true
                },
                {
                    name: 'caption',
                    label: 'Pie de video (opcional)',
                    type: 'textarea',
                    placeholder: 'Descripción del video...',
                    required: false,
                    maxLength: 1024
                }
            ]
        },

        audio: {
            id: 'audio',
            name: 'Audio',
            icon: '🎵',
            category: 'media',
            description: 'Audio AAC/MP3/OGG hasta 16MB',
            fields: [
                {
                    name: 'url',
                    label: 'URL del audio',
                    type: 'url',
                    placeholder: 'https://ejemplo.com/audio.mp3',
                    required: true
                }
            ]
        },

        document: {
            id: 'document',
            name: 'Documento',
            icon: '📄',
            category: 'media',
            description: 'PDF/DOC/XLS hasta 100MB',
            fields: [
                {
                    name: 'url',
                    label: 'URL del documento',
                    type: 'url',
                    placeholder: 'https://ejemplo.com/documento.pdf',
                    required: true
                },
                {
                    name: 'filename',
                    label: 'Nombre del archivo',
                    type: 'text',
                    placeholder: 'documento.pdf',
                    required: true
                },
                {
                    name: 'caption',
                    label: 'Descripción (opcional)',
                    type: 'textarea',
                    placeholder: 'Descripción del documento...',
                    required: false,
                    maxLength: 1024
                }
            ]
        },

        sticker: {
            id: 'sticker',
            name: 'Sticker',
            icon: '😀',
            category: 'media',
            description: 'Sticker WebP estático o animado',
            fields: [
                {
                    name: 'url',
                    label: 'URL del sticker',
                    type: 'url',
                    placeholder: 'https://ejemplo.com/sticker.webp',
                    required: true
                }
            ]
        },

        // ============================================
        // INTERACTIVE MESSAGES
        // ============================================
        buttons: {
            id: 'buttons',
            name: 'Botones de Respuesta',
            icon: '🔘',
            category: 'interactive',
            description: 'Hasta 3 botones de respuesta rápida',
            fields: [
                {
                    name: 'text',
                    label: 'Mensaje',
                    type: 'textarea',
                    placeholder: '¿Qué deseas hacer?',
                    required: true,
                    maxLength: 1024
                },
                {
                    name: 'buttons',
                    label: 'Botones',
                    type: 'button_list',
                    required: true,
                    min: 1,
                    max: 3,
                    buttonMaxLength: 20
                }
            ]
        },

        list: {
            id: 'list',
            name: 'Menú de Lista',
            icon: '📋',
            category: 'interactive',
            description: 'Menú desplegable con secciones (hasta 10 items)',
            fields: [
                {
                    name: 'text',
                    label: 'Mensaje principal',
                    type: 'textarea',
                    placeholder: 'Selecciona una opción del menú',
                    required: true,
                    maxLength: 1024
                },
                {
                    name: 'buttonText',
                    label: 'Texto del botón de menú',
                    type: 'text',
                    placeholder: 'Ver opciones',
                    required: true,
                    maxLength: 20
                },
                {
                    name: 'sections',
                    label: 'Secciones del menú',
                    type: 'list_sections',
                    required: true,
                    maxSections: 10,
                    maxItemsPerSection: 10,
                    itemTitleMaxLength: 24,
                    itemDescriptionMaxLength: 72
                }
            ]
        },

        cta_url: {
            id: 'cta_url',
            name: 'Botón URL',
            icon: '🔗',
            category: 'interactive',
            description: 'Botón que abre una URL',
            fields: [
                {
                    name: 'text',
                    label: 'Mensaje',
                    type: 'textarea',
                    placeholder: 'Visita nuestro sitio web',
                    required: true,
                    maxLength: 1024
                },
                {
                    name: 'buttonText',
                    label: 'Texto del botón',
                    type: 'text',
                    placeholder: 'Visitar sitio',
                    required: true,
                    maxLength: 20
                },
                {
                    name: 'url',
                    label: 'URL destino',
                    type: 'url',
                    placeholder: 'https://ejemplo.com',
                    required: true
                }
            ]
        },

        cta_call: {
            id: 'cta_call',
            name: 'Botón Llamada',
            icon: '📞',
            category: 'interactive',
            description: 'Botón que inicia una llamada',
            fields: [
                {
                    name: 'text',
                    label: 'Mensaje',
                    type: 'textarea',
                    placeholder: 'Llámanos para más información',
                    required: true,
                    maxLength: 1024
                },
                {
                    name: 'buttonText',
                    label: 'Texto del botón',
                    type: 'text',
                    placeholder: 'Llamar ahora',
                    required: true,
                    maxLength: 20
                },
                {
                    name: 'phoneNumber',
                    label: 'Número de teléfono',
                    type: 'tel',
                    placeholder: '+52 55 1234 5678',
                    required: true
                }
            ]
        },

        // ============================================
        // LOCATION & CONTACT
        // ============================================
        location: {
            id: 'location',
            name: 'Ubicación',
            icon: '📍',
            category: 'location',
            description: 'Enviar ubicación con mapa',
            fields: [
                {
                    name: 'latitude',
                    label: 'Latitud',
                    type: 'number',
                    placeholder: '19.4326',
                    required: true,
                    step: 'any'
                },
                {
                    name: 'longitude',
                    label: 'Longitud',
                    type: 'number',
                    placeholder: '-99.1332',
                    required: true,
                    step: 'any'
                },
                {
                    name: 'name',
                    label: 'Nombre del lugar',
                    type: 'text',
                    placeholder: 'Oficinas Centrales',
                    required: false
                },
                {
                    name: 'address',
                    label: 'Dirección',
                    type: 'text',
                    placeholder: 'Av. Reforma 123, CDMX',
                    required: false
                }
            ]
        },

        location_request: {
            id: 'location_request',
            name: 'Solicitar Ubicación',
            icon: '🗺️',
            category: 'location',
            description: 'Pedir la ubicación al usuario',
            fields: [
                {
                    name: 'text',
                    label: 'Mensaje',
                    type: 'textarea',
                    placeholder: 'Por favor comparte tu ubicación para encontrar la sucursal más cercana',
                    required: true,
                    maxLength: 1024
                }
            ]
        },

        contact: {
            id: 'contact',
            name: 'Contacto',
            icon: '👤',
            category: 'location',
            description: 'Compartir tarjeta de contacto',
            fields: [
                {
                    name: 'name',
                    label: 'Nombre completo',
                    type: 'text',
                    placeholder: 'Juan Pérez',
                    required: true
                },
                {
                    name: 'phone',
                    label: 'Teléfono',
                    type: 'tel',
                    placeholder: '+52 55 1234 5678',
                    required: true
                },
                {
                    name: 'email',
                    label: 'Email (opcional)',
                    type: 'email',
                    placeholder: 'juan@ejemplo.com',
                    required: false
                },
                {
                    name: 'organization',
                    label: 'Empresa (opcional)',
                    type: 'text',
                    placeholder: 'Empresa SA',
                    required: false
                }
            ]
        },

        // ============================================
        // PRODUCTS (CATALOG)
        // ============================================
        product: {
            id: 'product',
            name: 'Producto',
            icon: '🛍️',
            category: 'commerce',
            description: 'Mostrar un producto del catálogo',
            fields: [
                {
                    name: 'text',
                    label: 'Mensaje introductorio',
                    type: 'textarea',
                    placeholder: 'Mira este producto que te puede interesar:',
                    required: false,
                    maxLength: 1024
                },
                {
                    name: 'productImage',
                    label: 'Imagen del producto',
                    type: 'url',
                    placeholder: 'https://ejemplo.com/producto.jpg',
                    required: true
                },
                {
                    name: 'productName',
                    label: 'Nombre del producto',
                    type: 'text',
                    placeholder: 'iPhone 15 Pro',
                    required: true
                },
                {
                    name: 'productPrice',
                    label: 'Precio',
                    type: 'text',
                    placeholder: '$999.00 USD',
                    required: true
                },
                {
                    name: 'productDescription',
                    label: 'Descripción',
                    type: 'textarea',
                    placeholder: 'Descripción del producto...',
                    required: false
                }
            ]
        },

        product_list: {
            id: 'product_list',
            name: 'Lista de Productos',
            icon: '🛒',
            category: 'commerce',
            description: 'Mostrar múltiples productos',
            fields: [
                {
                    name: 'text',
                    label: 'Mensaje introductorio',
                    type: 'textarea',
                    placeholder: 'Estos son nuestros productos destacados:',
                    required: true,
                    maxLength: 1024
                },
                {
                    name: 'products',
                    label: 'Productos',
                    type: 'product_list',
                    required: true,
                    min: 1,
                    max: 30
                }
            ]
        },

        // ============================================
        // WHATSAPP FLOWS
        // ============================================
        flow: {
            id: 'flow',
            name: 'WhatsApp Flow',
            icon: '📝',
            category: 'flows',
            description: 'Formulario interactivo (encuestas, reservas, etc.)',
            fields: [
                {
                    name: 'text',
                    label: 'Mensaje de introducción',
                    type: 'textarea',
                    placeholder: 'Completa el siguiente formulario:',
                    required: true,
                    maxLength: 1024
                },
                {
                    name: 'buttonText',
                    label: 'Texto del botón',
                    type: 'text',
                    placeholder: 'Abrir formulario',
                    required: true,
                    maxLength: 20
                },
                {
                    name: 'flowType',
                    label: 'Tipo de Flow',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'survey', label: 'Encuesta' },
                        { value: 'appointment', label: 'Agendar cita' },
                        { value: 'registration', label: 'Registro' },
                        { value: 'feedback', label: 'Feedback' },
                        { value: 'order', label: 'Pedido' },
                        { value: 'support', label: 'Soporte' },
                        { value: 'custom', label: 'Personalizado' }
                    ]
                },
                {
                    name: 'flowFields',
                    label: 'Campos del formulario',
                    type: 'flow_fields',
                    required: true
                }
            ]
        },

        // ============================================
        // USER RESPONSES (for simulation)
        // ============================================
        user_text: {
            id: 'user_text',
            name: 'Respuesta de Usuario',
            icon: '👤',
            category: 'user',
            description: 'Simular respuesta del usuario',
            senderLocked: 'user',
            fields: [
                {
                    name: 'text',
                    label: 'Mensaje del usuario',
                    type: 'textarea',
                    placeholder: 'Respuesta del usuario...',
                    required: true,
                    maxLength: 4096
                }
            ]
        },

        user_button_reply: {
            id: 'user_button_reply',
            name: 'Usuario presiona botón',
            icon: '👆',
            category: 'user',
            description: 'Simular que el usuario presiona un botón',
            senderLocked: 'user',
            fields: [
                {
                    name: 'buttonText',
                    label: 'Texto del botón presionado',
                    type: 'text',
                    placeholder: 'Ver saldo',
                    required: true
                }
            ]
        },

        user_list_reply: {
            id: 'user_list_reply',
            name: 'Usuario selecciona de lista',
            icon: '☑️',
            category: 'user',
            description: 'Simular selección de menú de lista',
            senderLocked: 'user',
            fields: [
                {
                    name: 'selectedItem',
                    label: 'Opción seleccionada',
                    type: 'text',
                    placeholder: 'Opción 1',
                    required: true
                }
            ]
        }
    };

    /**
     * Categories for organizing the UI
     */
    const WHATSAPP_CATEGORIES = [
        { id: 'basic', name: 'Mensajes Básicos', icon: '💬' },
        { id: 'media', name: 'Multimedia', icon: '🖼️' },
        { id: 'interactive', name: 'Interactivos', icon: '🔘' },
        { id: 'location', name: 'Ubicación y Contacto', icon: '📍' },
        { id: 'commerce', name: 'Comercio', icon: '🛍️' },
        { id: 'flows', name: 'WhatsApp Flows', icon: '📝' },
        { id: 'user', name: 'Respuestas de Usuario', icon: '👤' }
    ];

    /**
     * RCS Business Messaging - Complete Message Types
     * Based on Google's official RCS Business Messaging API
     */
    const RCS_TYPES = {
        // ============================================
        // BASIC MESSAGES
        // ============================================
        text: {
            id: 'text',
            name: 'Texto',
            icon: '💬',
            category: 'basic',
            description: 'Mensaje de texto simple (hasta 1000 caracteres)',
            fields: [
                {
                    name: 'text',
                    label: 'Mensaje',
                    type: 'textarea',
                    placeholder: 'Escribe tu mensaje aquí...',
                    required: true,
                    maxLength: 1000
                },
                {
                    name: 'suggestions',
                    label: 'Sugerencias (opcional)',
                    type: 'rcs_suggestions',
                    required: false,
                    max: 11
                }
            ]
        },

        // ============================================
        // MEDIA MESSAGES
        // ============================================
        image: {
            id: 'image',
            name: 'Imagen',
            icon: '🖼️',
            category: 'media',
            description: 'Imagen JPEG/PNG/GIF/WebP',
            fields: [
                {
                    name: 'url',
                    label: 'Imagen',
                    type: 'media_source',
                    mediaType: 'image',
                    accept: 'image/jpeg,image/png,image/gif,image/webp',
                    placeholder: 'https://ejemplo.com/imagen.jpg',
                    required: true
                },
                {
                    name: 'thumbnailUrl',
                    label: 'URL miniatura (opcional)',
                    type: 'url',
                    placeholder: 'https://ejemplo.com/thumb.jpg',
                    required: false
                },
                {
                    name: 'suggestions',
                    label: 'Sugerencias (opcional)',
                    type: 'rcs_suggestions',
                    required: false,
                    max: 11
                }
            ]
        },

        video: {
            id: 'video',
            name: 'Video',
            icon: '🎬',
            category: 'media',
            description: 'Video MP4/WebM',
            fields: [
                {
                    name: 'url',
                    label: 'Video',
                    type: 'media_source',
                    mediaType: 'video',
                    accept: 'video/mp4,video/webm,video/quicktime',
                    placeholder: 'https://ejemplo.com/video.mp4',
                    required: true
                },
                {
                    name: 'thumbnailUrl',
                    label: 'URL miniatura (opcional)',
                    type: 'url',
                    placeholder: 'https://ejemplo.com/thumb.jpg',
                    required: false
                },
                {
                    name: 'suggestions',
                    label: 'Sugerencias (opcional)',
                    type: 'rcs_suggestions',
                    required: false,
                    max: 11
                }
            ]
        },

        audio: {
            id: 'audio',
            name: 'Audio',
            icon: '🎵',
            category: 'media',
            description: 'Audio MP3/AAC/OGG/WAV',
            fields: [
                {
                    name: 'url',
                    label: 'Audio',
                    type: 'media_source',
                    mediaType: 'audio',
                    accept: 'audio/mpeg,audio/mp3,audio/ogg,audio/wav,audio/aac',
                    placeholder: 'https://ejemplo.com/audio.mp3',
                    required: true
                },
                {
                    name: 'suggestions',
                    label: 'Sugerencias (opcional)',
                    type: 'rcs_suggestions',
                    required: false,
                    max: 11
                }
            ]
        },

        document: {
            id: 'document',
            name: 'Archivo',
            icon: '📄',
            category: 'media',
            description: 'PDF y otros documentos',
            fields: [
                {
                    name: 'url',
                    label: 'URL del archivo',
                    type: 'url',
                    placeholder: 'https://ejemplo.com/documento.pdf',
                    required: true
                },
                {
                    name: 'filename',
                    label: 'Nombre del archivo',
                    type: 'text',
                    placeholder: 'documento.pdf',
                    required: true
                },
                {
                    name: 'suggestions',
                    label: 'Sugerencias (opcional)',
                    type: 'rcs_suggestions',
                    required: false,
                    max: 11
                }
            ]
        },

        // ============================================
        // RICH CARDS
        // ============================================
        rich_card: {
            id: 'rich_card',
            name: 'Rich Card',
            icon: '🃏',
            category: 'cards',
            description: 'Tarjeta rica con imagen, título y botones',
            fields: [
                {
                    name: 'mediaUrl',
                    label: 'URL de imagen/video (opcional)',
                    type: 'url',
                    placeholder: 'https://ejemplo.com/imagen.jpg',
                    required: false
                },
                {
                    name: 'mediaHeight',
                    label: 'Altura del media',
                    type: 'select',
                    required: false,
                    options: [
                        { value: 'SHORT', label: 'Corta (112dp)' },
                        { value: 'MEDIUM', label: 'Media (168dp)' },
                        { value: 'TALL', label: 'Alta (264dp)' }
                    ],
                    default: 'MEDIUM'
                },
                {
                    name: 'title',
                    label: 'Título',
                    type: 'text',
                    placeholder: 'Título de la tarjeta',
                    required: false,
                    maxLength: 200
                },
                {
                    name: 'description',
                    label: 'Descripción',
                    type: 'textarea',
                    placeholder: 'Descripción detallada de la tarjeta...',
                    required: false,
                    maxLength: 2000
                },
                {
                    name: 'suggestions',
                    label: 'Botones de acción',
                    type: 'rcs_suggestions',
                    required: false,
                    max: 4
                }
            ]
        },

        carousel: {
            id: 'carousel',
            name: 'Carrusel',
            icon: '🎠',
            category: 'cards',
            description: 'Carrusel de 2-10 tarjetas deslizables',
            fields: [
                {
                    name: 'cardWidth',
                    label: 'Ancho de tarjetas',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'SMALL', label: 'Pequeño (136dp)' },
                        { value: 'MEDIUM', label: 'Mediano (232dp)' }
                    ],
                    default: 'MEDIUM'
                },
                {
                    name: 'cards',
                    label: 'Tarjetas del carrusel',
                    type: 'rcs_carousel_cards',
                    required: true,
                    min: 2,
                    max: 10
                }
            ]
        },

        // ============================================
        // SUGGESTED ACTIONS
        // ============================================
        suggestions_only: {
            id: 'suggestions_only',
            name: 'Solo Sugerencias',
            icon: '💡',
            category: 'suggestions',
            description: 'Chips de sugerencias sin mensaje',
            fields: [
                {
                    name: 'suggestions',
                    label: 'Sugerencias',
                    type: 'rcs_suggestions',
                    required: true,
                    min: 1,
                    max: 11
                }
            ]
        },

        // ============================================
        // CALL TO ACTION TYPES
        // ============================================
        cta_url: {
            id: 'cta_url',
            name: 'Abrir URL',
            icon: '🔗',
            category: 'actions',
            description: 'Mensaje con botón que abre URL',
            fields: [
                {
                    name: 'text',
                    label: 'Mensaje',
                    type: 'textarea',
                    placeholder: 'Visita nuestro sitio web',
                    required: true,
                    maxLength: 1000
                },
                {
                    name: 'buttonText',
                    label: 'Texto del botón',
                    type: 'text',
                    placeholder: 'Ver más',
                    required: true,
                    maxLength: 25
                },
                {
                    name: 'url',
                    label: 'URL destino',
                    type: 'url',
                    placeholder: 'https://ejemplo.com',
                    required: true
                },
                {
                    name: 'openInWebview',
                    label: 'Abrir en webview',
                    type: 'checkbox',
                    required: false,
                    default: false
                }
            ]
        },

        cta_dial: {
            id: 'cta_dial',
            name: 'Llamar',
            icon: '📞',
            category: 'actions',
            description: 'Mensaje con botón para llamar',
            fields: [
                {
                    name: 'text',
                    label: 'Mensaje',
                    type: 'textarea',
                    placeholder: 'Llámanos para más información',
                    required: true,
                    maxLength: 1000
                },
                {
                    name: 'buttonText',
                    label: 'Texto del botón',
                    type: 'text',
                    placeholder: 'Llamar ahora',
                    required: true,
                    maxLength: 25
                },
                {
                    name: 'phoneNumber',
                    label: 'Número de teléfono',
                    type: 'tel',
                    placeholder: '+52 55 1234 5678',
                    required: true
                }
            ]
        },

        cta_location: {
            id: 'cta_location',
            name: 'Ver Ubicación',
            icon: '📍',
            category: 'actions',
            description: 'Mensaje con botón para ver ubicación en mapa',
            fields: [
                {
                    name: 'text',
                    label: 'Mensaje',
                    type: 'textarea',
                    placeholder: 'Encuentra nuestra ubicación',
                    required: true,
                    maxLength: 1000
                },
                {
                    name: 'buttonText',
                    label: 'Texto del botón',
                    type: 'text',
                    placeholder: 'Ver en mapa',
                    required: true,
                    maxLength: 25
                },
                {
                    name: 'latitude',
                    label: 'Latitud',
                    type: 'number',
                    placeholder: '19.4326',
                    required: true,
                    step: 'any'
                },
                {
                    name: 'longitude',
                    label: 'Longitud',
                    type: 'number',
                    placeholder: '-99.1332',
                    required: true,
                    step: 'any'
                },
                {
                    name: 'label',
                    label: 'Etiqueta del lugar (opcional)',
                    type: 'text',
                    placeholder: 'Oficinas Centrales',
                    required: false
                }
            ]
        },

        cta_share_location: {
            id: 'cta_share_location',
            name: 'Solicitar Ubicación',
            icon: '🗺️',
            category: 'actions',
            description: 'Pedir al usuario que comparta su ubicación',
            fields: [
                {
                    name: 'text',
                    label: 'Mensaje',
                    type: 'textarea',
                    placeholder: 'Comparte tu ubicación para encontrar la sucursal más cercana',
                    required: true,
                    maxLength: 1000
                },
                {
                    name: 'buttonText',
                    label: 'Texto del botón',
                    type: 'text',
                    placeholder: 'Compartir ubicación',
                    required: true,
                    maxLength: 25
                }
            ]
        },

        cta_calendar: {
            id: 'cta_calendar',
            name: 'Crear Evento',
            icon: '📅',
            category: 'actions',
            description: 'Agregar evento al calendario del usuario',
            fields: [
                {
                    name: 'text',
                    label: 'Mensaje',
                    type: 'textarea',
                    placeholder: 'Guarda la fecha de tu cita',
                    required: true,
                    maxLength: 1000
                },
                {
                    name: 'buttonText',
                    label: 'Texto del botón',
                    type: 'text',
                    placeholder: 'Agregar al calendario',
                    required: true,
                    maxLength: 25
                },
                {
                    name: 'eventTitle',
                    label: 'Título del evento',
                    type: 'text',
                    placeholder: 'Cita médica',
                    required: true
                },
                {
                    name: 'eventDescription',
                    label: 'Descripción',
                    type: 'textarea',
                    placeholder: 'Detalles del evento...',
                    required: false
                },
                {
                    name: 'startTime',
                    label: 'Fecha y hora de inicio',
                    type: 'datetime',
                    required: true
                },
                {
                    name: 'endTime',
                    label: 'Fecha y hora de fin',
                    type: 'datetime',
                    required: true
                }
            ]
        },

        // ============================================
        // USER RESPONSES (for simulation)
        // ============================================
        user_text: {
            id: 'user_text',
            name: 'Respuesta de Usuario',
            icon: '👤',
            category: 'user',
            description: 'Simular respuesta del usuario',
            senderLocked: 'user',
            fields: [
                {
                    name: 'text',
                    label: 'Mensaje del usuario',
                    type: 'textarea',
                    placeholder: 'Respuesta del usuario...',
                    required: true,
                    maxLength: 1000
                }
            ]
        },

        user_suggestion_reply: {
            id: 'user_suggestion_reply',
            name: 'Usuario toca sugerencia',
            icon: '👆',
            category: 'user',
            description: 'Simular que el usuario toca una sugerencia',
            senderLocked: 'user',
            fields: [
                {
                    name: 'suggestionText',
                    label: 'Texto de la sugerencia tocada',
                    type: 'text',
                    placeholder: 'Ver ofertas',
                    required: true,
                    maxLength: 25
                }
            ]
        },

        user_location: {
            id: 'user_location',
            name: 'Usuario comparte ubicación',
            icon: '📍',
            category: 'user',
            description: 'Simular que el usuario comparte su ubicación',
            senderLocked: 'user',
            fields: [
                {
                    name: 'latitude',
                    label: 'Latitud',
                    type: 'number',
                    placeholder: '19.4326',
                    required: true,
                    step: 'any'
                },
                {
                    name: 'longitude',
                    label: 'Longitud',
                    type: 'number',
                    placeholder: '-99.1332',
                    required: true,
                    step: 'any'
                }
            ]
        }
    };

    /**
     * RCS Categories
     */
    const RCS_CATEGORIES = [
        { id: 'basic', name: 'Mensajes Básicos', icon: '💬' },
        { id: 'media', name: 'Multimedia', icon: '🖼️' },
        { id: 'cards', name: 'Rich Cards', icon: '🃏' },
        { id: 'actions', name: 'Acciones', icon: '⚡' },
        { id: 'suggestions', name: 'Sugerencias', icon: '💡' },
        { id: 'user', name: 'Respuestas de Usuario', icon: '👤' }
    ];

    /**
     * Get message types for a platform
     */
    function getTypes(platform) {
        return platform === 'whatsapp' ? WHATSAPP_TYPES : RCS_TYPES;
    }

    /**
     * Get categories for a platform
     */
    function getCategories(platform) {
        return platform === 'whatsapp' ? WHATSAPP_CATEGORIES : RCS_CATEGORIES;
    }

    /**
     * Get a specific message type
     */
    function getType(platform, typeId) {
        const types = getTypes(platform);
        return types[typeId] || null;
    }

    /**
     * Get types by category
     */
    function getTypesByCategory(platform, categoryId) {
        const types = getTypes(platform);
        return Object.values(types).filter(t => t.category === categoryId);
    }

    /**
     * Validate message content against type definition
     */
    function validateContent(platform, typeId, content) {
        const type = getType(platform, typeId);
        if (!type) return { valid: false, errors: ['Tipo de mensaje no válido'] };

        const errors = [];

        type.fields.forEach(field => {
            const value = content[field.name];

            if (field.required && (!value || value.toString().trim() === '')) {
                errors.push(`${field.label} es requerido`);
            }

            if (value && field.maxLength && value.length > field.maxLength) {
                errors.push(`${field.label} excede el máximo de ${field.maxLength} caracteres`);
            }
        });

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Public API
    return {
        getTypes,
        getCategories,
        getType,
        getTypesByCategory,
        validateContent,
        WHATSAPP_TYPES,
        WHATSAPP_CATEGORIES,
        RCS_TYPES,
        RCS_CATEGORIES
    };

})();
