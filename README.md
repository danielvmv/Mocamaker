# Mocamaker

<div align="center">

![Mocamaker Logo](https://img.shields.io/badge/Mocamaker-v2.1-6B46C1?style=for-the-badge&logo=whatsapp&logoColor=white)

**Generador de mockups conversacionales para WhatsApp Business y RCS**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Demo en Vivo](https://mocamaker.vercel.app) | [Documentacion](#documentacion) | [Contribuir](CONTRIBUTING.md)

</div>

---

## Que es Mocamaker?

Mocamaker es una herramienta web que permite crear mockups realistas de conversaciones de mensajeria empresarial en **30 segundos**. Diseñada para equipos de ventas, marketing y producto que necesitan visualizar flujos conversacionales antes de implementarlos.

### Casos de Uso

- **Equipos de Ventas**: Presentar propuestas de chatbots a clientes
- **Product Managers**: Prototipar flujos conversacionales rapidamente
- **Disenadores UX**: Crear mockups de alta fidelidad para presentaciones
- **Desarrolladores**: Visualizar implementaciones antes de codificar
- **Marketing**: Crear materiales visuales para campanas de mensajeria

---

## Caracteristicas Principales

### Plataformas Soportadas

| Plataforma | Estado | Caracteristicas |
|------------|--------|-----------------|
| **WhatsApp Business** | Completo | Texto, botones, listas, multimedia, ubicacion, productos |
| **RCS Business Messaging** | Completo | Rich cards, carruseles, sugerencias, CTAs |

### Modos de Creacion

#### Modo Manual
Construye mensajes uno por uno con controles visuales intuitivos:
- Selector de tipo de mensaje
- Campos dinamicos segun el tipo seleccionado
- Preview en tiempo real
- Eliminacion individual de mensajes

#### Modo AI (Beta)
Genera conversaciones completas describiendo el flujo:
```
"El banco envia un mensaje de bienvenida con 3 botones: Ver saldo,
Transferir, Ayuda. El usuario presiona Ver saldo y el banco
responde con el saldo actual."
```

### Fidelidad Visual

- **iOS**: Tipografia San Francisco, estilos nativos de iMessage/RCS
- **Android**: Tipografia Roboto, Material Design guidelines
- **Dark/Light Mode**: Tema de la app independiente del mockup
- **Exportacion HTML**: Mockups listos para presentaciones

---

## Inicio Rapido

### Requisitos Previos

- Node.js 16.x o superior
- npm 7.x o superior

### Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/mocamaker.git
cd mocamaker

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

El servidor estara disponible en `http://localhost:3000`

### Configuracion de API Key (Opcional)

Para usar el modo AI, necesitas una API key de Anthropic:

1. Obtén tu API key en [console.anthropic.com](https://console.anthropic.com)
2. Haz clic en el icono de llave en la esquina superior derecha
3. Ingresa tu API key

> **Nota**: La API key se almacena localmente en tu navegador y nunca se envia a servidores externos excepto a la API de Anthropic.

---

## Arquitectura

### Stack Tecnologico

| Capa | Tecnologia |
|------|------------|
| Frontend | Vanilla JavaScript (ES6+ Modules) |
| Estilos | CSS3 con Variables CSS |
| Backend | Node.js + Express |
| AI | Anthropic Claude API |
| Deploy | Vercel (Serverless) |

### Estructura del Proyecto

```
mocamaker/
├── api/
│   └── generate.js          # Serverless function para Anthropic API
├── scripts/
│   ├── app.js               # Orquestador principal
│   ├── constructor.js       # UI del modo manual
│   ├── renderer.js          # Renderizado de mockups
│   ├── message-types.js     # Catalogo de tipos de mensaje
│   └── ai-generator.js      # Integracion con Claude
├── styles/
│   ├── main.css             # Variables y estilos base
│   ├── constructor.css      # Panel de construccion
│   ├── whatsapp.css         # Estilos WhatsApp
│   └── rcs.css              # Estilos RCS
├── index.html               # Aplicacion principal
├── server.js                # Servidor de desarrollo
├── vercel.json              # Configuracion de deploy
└── package.json
```

### Flujo de Datos

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Constructor   │────>│    Mocamaker    │────>│    Renderer     │
│  (Form Input)   │     │  (State Mgmt)   │     │  (DOM Output)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               v
                        ┌─────────────────┐
                        │   AIGenerator   │
                        │ (Claude API)    │
                        └─────────────────┘
```

### Estructura de Mensaje

```javascript
{
  id: "msg_123456789",
  type: "buttons",           // text, buttons, list, rich_card, carousel, etc.
  sender: "brand",           // brand | user
  platform: "whatsapp",      // whatsapp | rcs
  content: {
    body: "Hola! Como podemos ayudarte?",
    buttons: ["Ver productos", "Hablar con asesor", "Ayuda"]
  },
  timestamp: "12:30",
  createdBy: "manual"        // manual | ai
}
```

---

## Tipos de Mensaje Soportados

### WhatsApp Business

| Tipo | Descripcion | Limites |
|------|-------------|---------|
| Texto | Mensaje simple | 4096 caracteres |
| Botones | Hasta 3 botones de accion | 20 chars/boton |
| Lista | Menu desplegable con secciones | 10 items max |
| Imagen | Con caption opcional | JPG, PNG, WebP |
| Video | Con caption opcional | MP4, 3GP |
| Audio | Mensaje de voz | MP3, AAC, OGG |
| Documento | Archivos adjuntos | PDF, DOC, XLS |
| Ubicacion | Mapa con coordenadas | Lat/Long |
| Producto | Tarjeta de producto | Imagen + detalles |

### RCS Business Messaging

| Tipo | Descripcion | Limites |
|------|-------------|---------|
| Texto | Mensaje simple | 3072 caracteres |
| Rich Card | Tarjeta multimedia | 1 imagen + 4 sugerencias |
| Carrusel | Galeria horizontal | 2-10 tarjetas |
| Sugerencias | Chips de accion | 11 sugerencias max |
| Imagen/Video/Audio | Multimedia standalone | Varios formatos |

#### Tipos de Sugerencias RCS

- **Respuesta**: Texto predefinido
- **URL**: Abrir enlace
- **Llamada**: Marcar numero
- **Ubicacion**: Ver en mapa
- **Compartir ubicacion**: Enviar ubicacion actual
- **Calendario**: Crear evento

---

## Deployment

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

O simplemente haz push a tu repositorio conectado a Vercel.

### Variables de Entorno

Para produccion, configura estas variables en Vercel:

| Variable | Descripcion | Requerida |
|----------|-------------|-----------|
| `ANTHROPIC_API_KEY` | API key para modo AI server-side | No |

---

## Desarrollo

### Scripts Disponibles

```bash
npm start       # Inicia servidor de desarrollo en puerto 3000
npm run dev     # Alias de npm start
```

### Agregar Nuevo Tipo de Mensaje

1. Define el tipo en `scripts/message-types.js`:

```javascript
{
  id: 'nuevo_tipo',
  name: 'Nuevo Tipo',
  icon: '🆕',
  description: 'Descripcion del tipo',
  category: 'categoria',
  fields: [
    { name: 'campo1', type: 'text', label: 'Campo 1', required: true }
  ]
}
```

2. Agrega el renderizado en `scripts/renderer.js`:

```javascript
renderWhatsAppNuevoTipo(message) {
  // Logica de renderizado
}
```

### Convenciones de Codigo

- **Modulos**: Patron IIFE con exposicion via `window`
- **Nombres**: camelCase para funciones/variables, PascalCase para modulos
- **Comentarios**: JSDoc para funciones publicas
- **CSS**: BEM modificado con prefijos por plataforma (wa-, rcs-)

---

## Troubleshooting

### El modo AI no funciona

1. Verifica que tu API key sea valida
2. Revisa la consola del navegador para errores
3. Asegurate de tener conexion a internet

### Los estilos no se ven correctamente

1. Limpia la cache del navegador
2. Verifica que todos los archivos CSS esten cargando
3. Revisa la consola para errores 404

### El servidor no inicia

1. Verifica que el puerto 3000 este disponible
2. Ejecuta `npm install` nuevamente
3. Verifica la version de Node.js (`node -v`)

---

## Roadmap

- [ ] Export a imagen (PNG/JPG)
- [ ] Guardado de conversaciones en la nube
- [ ] Colaboracion en tiempo real
- [ ] Mas plataformas (Telegram, Instagram DM)
- [ ] Templates predefinidos
- [ ] Integracion con Figma

---

## Contribuir

Las contribuciones son bienvenidas! Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre nuestro codigo de conducta y el proceso para enviar pull requests.

---

## Licencia

Este proyecto esta licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

## Creditos

Desarrollado con por [Daniel Villanueva](https://github.com/tu-usuario)

### Tecnologias Utilizadas

- [Express.js](https://expressjs.com/) - Framework web
- [Anthropic Claude](https://anthropic.com/) - AI para generacion de conversaciones
- [Vercel](https://vercel.com/) - Plataforma de deployment

---

<div align="center">

**[Reportar Bug](https://github.com/tu-usuario/mocamaker/issues)** | **[Solicitar Feature](https://github.com/tu-usuario/mocamaker/issues)**

</div>
