/**
 * Mocamaker v1.0 - AI Generator
 * Handles communication with Claude API via local proxy
 */

const AIGenerator = (function() {
    'use strict';

    // API Configuration
    let API_KEY = '';
    const PROXY_URL = '/api/generate';

    /**
     * Set the API key
     */
    function setApiKey(key) {
        API_KEY = key.trim();
    }

    /**
     * Get current API key
     */
    function getApiKey() {
        return API_KEY;
    }

    /**
     * Check if API key is configured
     */
    function hasApiKey() {
        return API_KEY && API_KEY.length > 0;
    }

    /**
     * Generate structured conversation data from natural language description
     * @param {string} description - Natural language description of the conversation
     * @param {string} platform - 'whatsapp' or 'rcs'
     * @returns {Promise<Object>} Structured conversation data
     */
    async function generate(description, platform) {
        // Use demo mode if no API key
        if (!hasApiKey()) {
            console.log('No API key set, using demo mode');
            return generateDemoData(description, platform);
        }

        const systemPrompt = buildSystemPrompt(platform);
        const userPrompt = buildUserPrompt(description);

        try {
            const response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    apiKey: API_KEY,
                    system: systemPrompt,
                    messages: [
                        { role: 'user', content: userPrompt }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error:', errorData);
                throw new Error(errorData.error || `API error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.content[0].text;

            // Parse JSON from response
            const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[1] || jsonMatch[0];
                return JSON.parse(jsonStr);
            }

            throw new Error('Could not parse response');

        } catch (error) {
            console.error('AI Generation error:', error);
            throw error;
        }
    }

    /**
     * Build system prompt for Claude
     */
    function buildSystemPrompt(platform) {
        return `Eres un experto en diseño de conversaciones para ${platform === 'whatsapp' ? 'WhatsApp Business' : 'RCS'}.

Tu tarea es convertir descripciones en español natural a un JSON estructurado que represente el flujo conversacional.

FORMATO DE SALIDA (JSON):
{
  "header": {
    "name": "Nombre del negocio/contacto",
    "avatar": "Inicial o URL de imagen",
    "status": "en línea" | "escribiendo..." | ""
  },
  "messages": [
    {
      "id": "msg_1",
      "type": "text" | "image" | "buttons" | "carousel",
      "sender": "brand" | "user",
      "content": {
        "text": "Texto del mensaje",
        "image": "URL o placeholder de imagen",
        "buttons": ["Botón 1", "Botón 2"],
        "cards": [
          {
            "image": "URL",
            "title": "Título",
            "description": "Descripción",
            "button": "Texto del botón"
          }
        ]
      },
      "timestamp": "12:30"
    }
  ]
}

REGLAS:
1. "brand" = mensajes de la empresa (burbujas verdes en WhatsApp, a la derecha)
2. "user" = mensajes del usuario (burbujas blancas, a la izquierda)
3. Los botones siempre van en mensajes de la marca
4. Genera timestamps realistas y consecutivos
5. Interpreta la descripción del usuario y crea un flujo natural
6. Si el usuario dice "presiona" o "selecciona" un botón, el siguiente mensaje es del usuario con ese texto
7. Sé creativo e interpreta la intención del usuario aunque la descripción sea vaga

Responde SOLO con el JSON, sin explicaciones adicionales.`;
    }

    /**
     * Build user prompt
     */
    function buildUserPrompt(description) {
        return `Convierte esta descripción de conversación a JSON estructurado:

"${description}"

Responde con el JSON dentro de bloques de código:
\`\`\`json
{...}
\`\`\``;
    }

    /**
     * Generate demo data for testing without API
     * Enhanced with more variety and keywords
     */
    function generateDemoData(description, platform) {
        const lowerDesc = description.toLowerCase();

        // Detect conversation type
        const types = {
            otp: /otp|código|verificación|verificar|autenticación|2fa|pin|seguridad/i.test(lowerDesc),
            welcome: /bienvenida|bienvenido|hola|saludo|inicio|onboarding/i.test(lowerDesc),
            bank: /banco|saldo|transferir|cuenta|dinero|pago|tarjeta/i.test(lowerDesc),
            ecommerce: /compra|pedido|orden|envío|producto|tienda|carrito/i.test(lowerDesc),
            support: /soporte|ayuda|problema|queja|reclamo|asistencia/i.test(lowerDesc),
            appointment: /cita|reserva|agendar|turno|horario|disponibilidad/i.test(lowerDesc),
            notification: /notificación|aviso|alerta|recordatorio|promoción/i.test(lowerDesc)
        };

        const hasButtons = /botón|botones|opcion|opciones|menú/i.test(lowerDesc);
        const hasImage = /imagen|foto|picture|adjunto/i.test(lowerDesc);
        const hasUserResponse = /usuario|cliente|presiona|selecciona|responde|elige/i.test(lowerDesc);

        let data;

        if (types.otp) {
            data = generateOTPFlow(hasUserResponse);
        } else if (types.welcome) {
            data = generateWelcomeFlow(hasButtons);
        } else if (types.bank) {
            data = generateBankFlow(hasButtons, hasImage, hasUserResponse);
        } else if (types.ecommerce) {
            data = generateEcommerceFlow(hasButtons, hasUserResponse);
        } else if (types.support) {
            data = generateSupportFlow(hasButtons, hasUserResponse);
        } else if (types.appointment) {
            data = generateAppointmentFlow(hasButtons, hasUserResponse);
        } else if (types.notification) {
            data = generateNotificationFlow(hasButtons);
        } else {
            data = generateGenericFlow(lowerDesc, hasButtons, hasUserResponse);
        }

        return data;
    }

    /**
     * Generate OTP/Verification flow
     */
    function generateOTPFlow(hasUserResponse) {
        const data = {
            header: {
                name: 'Verificación',
                avatar: 'V',
                status: ''
            },
            messages: [
                {
                    id: 'msg_1',
                    type: 'text',
                    sender: 'brand',
                    content: {
                        text: '🔐 Tu código de verificación es:\n\n*847291*\n\nEste código expira en 5 minutos. No compartas este código con nadie.'
                    },
                    timestamp: '14:22'
                }
            ]
        };

        if (hasUserResponse) {
            data.messages.push({
                id: 'msg_2',
                type: 'text',
                sender: 'user',
                content: { text: '847291' },
                timestamp: '14:23'
            });
            data.messages.push({
                id: 'msg_3',
                type: 'text',
                sender: 'brand',
                content: { text: '✅ ¡Código verificado correctamente!\n\nTu cuenta ha sido verificada exitosamente.' },
                timestamp: '14:23'
            });
        }

        return data;
    }

    /**
     * Generate Welcome flow
     */
    function generateWelcomeFlow(hasButtons) {
        const data = {
            header: {
                name: 'Mi Empresa',
                avatar: 'ME',
                status: 'en línea'
            },
            messages: [
                {
                    id: 'msg_1',
                    type: hasButtons ? 'buttons' : 'text',
                    sender: 'brand',
                    content: {
                        text: '👋 ¡Hola! Bienvenido a Mi Empresa.\n\nSoy tu asistente virtual y estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?'
                    },
                    timestamp: '10:00'
                }
            ]
        };

        if (hasButtons) {
            data.messages[0].content.buttons = ['Ver productos', 'Soporte técnico', 'Hablar con agente'];
        }

        return data;
    }

    /**
     * Generate Bank flow
     */
    function generateBankFlow(hasButtons, hasImage, hasUserResponse) {
        const data = {
            header: {
                name: 'Banco Nacional',
                avatar: 'BN',
                status: 'en línea'
            },
            messages: [
                {
                    id: 'msg_1',
                    type: hasButtons ? 'buttons' : 'text',
                    sender: 'brand',
                    content: {
                        text: '🏦 ¡Hola! Soy tu asistente de Banco Nacional.\n\n¿En qué puedo ayudarte hoy?'
                    },
                    timestamp: '12:30'
                }
            ]
        };

        if (hasButtons) {
            data.messages[0].content.buttons = ['Ver saldo', 'Transferir', 'Hablar con asesor'];
        }

        if (hasUserResponse) {
            data.messages.push({
                id: 'msg_2',
                type: 'text',
                sender: 'user',
                content: { text: 'Ver saldo' },
                timestamp: '12:31'
            });

            const responseMsg = {
                id: 'msg_3',
                type: hasImage ? 'image' : 'text',
                sender: 'brand',
                content: {
                    text: '💰 Tu saldo actual es:\n\n*$5,240.00 MXN*\n\nÚltimo movimiento: -$150.00 (Spotify)'
                },
                timestamp: '12:31'
            };

            if (hasImage) {
                responseMsg.content.image = 'https://via.placeholder.com/300x150/DCF8C6/333333?text=Estado+de+Cuenta';
            }

            data.messages.push(responseMsg);
        }

        return data;
    }

    /**
     * Generate E-commerce flow
     */
    function generateEcommerceFlow(hasButtons, hasUserResponse) {
        const data = {
            header: {
                name: 'TuTienda',
                avatar: 'TT',
                status: 'en línea'
            },
            messages: [
                {
                    id: 'msg_1',
                    type: 'text',
                    sender: 'brand',
                    content: {
                        text: '📦 ¡Tu pedido #12847 está en camino!\n\nEstado: En tránsito\nEntrega estimada: Hoy entre 2:00 PM - 6:00 PM\n\nRepartidor: Juan M.'
                    },
                    timestamp: '11:45'
                }
            ]
        };

        if (hasButtons) {
            data.messages[0].type = 'buttons';
            data.messages[0].content.buttons = ['Rastrear envío', 'Contactar repartidor', 'Cambiar dirección'];
        }

        if (hasUserResponse) {
            data.messages.push({
                id: 'msg_2',
                type: 'text',
                sender: 'user',
                content: { text: 'Rastrear envío' },
                timestamp: '11:46'
            });
            data.messages.push({
                id: 'msg_3',
                type: 'text',
                sender: 'brand',
                content: {
                    text: '📍 Tu paquete está a 2.3 km de tu ubicación.\n\nEl repartidor llegará en aproximadamente 15 minutos.'
                },
                timestamp: '11:46'
            });
        }

        return data;
    }

    /**
     * Generate Support flow
     */
    function generateSupportFlow(hasButtons, hasUserResponse) {
        const data = {
            header: {
                name: 'Soporte',
                avatar: 'S',
                status: 'en línea'
            },
            messages: [
                {
                    id: 'msg_1',
                    type: hasButtons ? 'buttons' : 'text',
                    sender: 'brand',
                    content: {
                        text: '🛟 ¡Hola! Soy tu asistente de soporte.\n\n¿En qué podemos ayudarte?'
                    },
                    timestamp: '15:00'
                }
            ]
        };

        if (hasButtons) {
            data.messages[0].content.buttons = ['Problema técnico', 'Facturación', 'Hablar con agente'];
        }

        return data;
    }

    /**
     * Generate Appointment flow
     */
    function generateAppointmentFlow(hasButtons, hasUserResponse) {
        const data = {
            header: {
                name: 'Clínica Salud',
                avatar: 'CS',
                status: 'en línea'
            },
            messages: [
                {
                    id: 'msg_1',
                    type: 'text',
                    sender: 'brand',
                    content: {
                        text: '📅 Recordatorio de cita\n\nTienes una cita programada:\n\n👨‍⚕️ Dr. García - Medicina General\n📆 Mañana, 15 de Enero\n🕐 10:30 AM\n📍 Consultorio 204'
                    },
                    timestamp: '09:00'
                }
            ]
        };

        if (hasButtons) {
            data.messages[0].type = 'buttons';
            data.messages[0].content.buttons = ['Confirmar cita', 'Reagendar', 'Cancelar'];
        }

        if (hasUserResponse) {
            data.messages.push({
                id: 'msg_2',
                type: 'text',
                sender: 'user',
                content: { text: 'Confirmar cita' },
                timestamp: '09:01'
            });
            data.messages.push({
                id: 'msg_3',
                type: 'text',
                sender: 'brand',
                content: { text: '✅ ¡Cita confirmada!\n\nTe esperamos mañana. Recuerda llegar 10 minutos antes.' },
                timestamp: '09:01'
            });
        }

        return data;
    }

    /**
     * Generate Notification flow
     */
    function generateNotificationFlow(hasButtons) {
        const data = {
            header: {
                name: 'Promociones',
                avatar: 'P',
                status: ''
            },
            messages: [
                {
                    id: 'msg_1',
                    type: hasButtons ? 'buttons' : 'text',
                    sender: 'brand',
                    content: {
                        text: '🎉 ¡Oferta especial solo para ti!\n\n*30% de descuento* en toda la tienda.\n\nUsa el código: PROMO30\nVálido hasta el 31 de enero.'
                    },
                    timestamp: '18:00'
                }
            ]
        };

        if (hasButtons) {
            data.messages[0].content.buttons = ['Ver productos', 'No me interesa'];
        }

        return data;
    }

    /**
     * Generate Generic flow based on description
     */
    function generateGenericFlow(description, hasButtons, hasUserResponse) {
        // Extract potential brand name from description
        let brandName = 'Mi Empresa';
        const brandMatch = description.match(/(?:de|para|desde)\s+["']?([A-Za-zÀ-ÿ\s]+)["']?/i);
        if (brandMatch) {
            brandName = brandMatch[1].trim().substring(0, 20);
        }

        const data = {
            header: {
                name: brandName,
                avatar: brandName.charAt(0).toUpperCase(),
                status: 'en línea'
            },
            messages: [
                {
                    id: 'msg_1',
                    type: hasButtons ? 'buttons' : 'text',
                    sender: 'brand',
                    content: {
                        text: `¡Hola! 👋\n\nGracias por contactarnos. ¿En qué podemos ayudarte hoy?`
                    },
                    timestamp: '12:00'
                }
            ]
        };

        if (hasButtons) {
            data.messages[0].content.buttons = ['Información', 'Soporte', 'Otro'];
        }

        if (hasUserResponse) {
            data.messages.push({
                id: 'msg_2',
                type: 'text',
                sender: 'user',
                content: { text: 'Información' },
                timestamp: '12:01'
            });
            data.messages.push({
                id: 'msg_3',
                type: 'text',
                sender: 'brand',
                content: { text: '¡Con gusto te ayudo! ¿Qué información necesitas?' },
                timestamp: '12:01'
            });
        }

        return data;
    }

    // Public API
    return {
        generate,
        setApiKey,
        getApiKey,
        hasApiKey
    };

})();
