# Guia de Contribucion

Gracias por tu interes en contribuir a Mocamaker! Este documento proporciona las directrices y mejores practicas para contribuir al proyecto.

## Tabla de Contenidos

- [Codigo de Conducta](#codigo-de-conducta)
- [Como Contribuir](#como-contribuir)
- [Configuracion del Entorno](#configuracion-del-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Convenciones de Codigo](#convenciones-de-codigo)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Solicitar Features](#solicitar-features)

---

## Codigo de Conducta

### Nuestro Compromiso

Nos comprometemos a hacer de la participacion en este proyecto una experiencia libre de acoso para todos, independientemente de la edad, tamaño corporal, discapacidad, etnia, identidad de genero, nivel de experiencia, nacionalidad, apariencia personal, raza, religion u orientacion sexual.

### Comportamiento Esperado

- Usar un lenguaje acogedor e inclusivo
- Respetar los diferentes puntos de vista y experiencias
- Aceptar criticas constructivas con gracia
- Enfocarse en lo que es mejor para la comunidad
- Mostrar empatia hacia otros miembros de la comunidad

---

## Como Contribuir

### Tipos de Contribuciones

1. **Bug Fixes**: Correcciones de errores existentes
2. **Features**: Nuevas funcionalidades
3. **Documentacion**: Mejoras al README, comentarios de codigo, etc.
4. **Refactoring**: Mejoras de codigo sin cambiar funcionalidad
5. **Tests**: Agregar o mejorar pruebas
6. **Design**: Mejoras visuales o de UX

### Primeros Pasos

1. **Fork** el repositorio
2. **Clona** tu fork localmente
3. **Crea una rama** para tu contribucion
4. **Haz tus cambios** siguiendo las convenciones
5. **Prueba** tus cambios localmente
6. **Commit** con mensajes descriptivos
7. **Push** a tu fork
8. **Abre un Pull Request**

---

## Configuracion del Entorno

### Requisitos

- Node.js 16.x o superior
- npm 7.x o superior
- Git
- Editor de codigo (recomendado: VS Code)

### Instalacion

```bash
# Fork y clona el repositorio
git clone https://github.com/TU-USUARIO/mocamaker.git
cd mocamaker

# Instala dependencias
npm install

# Inicia el servidor de desarrollo
npm start

# El servidor estara en http://localhost:3000
```

### Extensiones Recomendadas (VS Code)

- ESLint
- Prettier
- Live Server
- CSS Peek

---

## Estructura del Proyecto

```
mocamaker/
├── api/                    # Funciones serverless
│   └── generate.js         # Endpoint para AI generation
│
├── scripts/                # JavaScript del frontend
│   ├── app.js              # Orquestador principal (Mocamaker)
│   ├── constructor.js      # Panel de construccion manual
│   ├── renderer.js         # Renderizado de mockups
│   ├── message-types.js    # Catalogo de tipos de mensaje
│   └── ai-generator.js     # Integracion con Claude AI
│
├── styles/                 # CSS
│   ├── main.css            # Variables CSS y estilos globales
│   ├── constructor.css     # Estilos del panel constructor
│   ├── whatsapp.css        # Estilos especificos WhatsApp
│   └── rcs.css             # Estilos especificos RCS
│
├── index.html              # Punto de entrada de la app
├── server.js               # Servidor Express para desarrollo
├── vercel.json             # Configuracion de Vercel
└── package.json            # Dependencias y scripts
```

### Arquitectura de Modulos

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│                   (Carga todos los modulos)                 │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        v                     v                     v
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ MessageTypes  │    │  Constructor  │    │   Renderer    │
│  (Catalogo)   │    │  (UI Manual)  │    │  (Mockups)    │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              v
                    ┌───────────────┐
                    │   Mocamaker   │
                    │ (Orquestador) │
                    └───────────────┘
                              │
                              v
                    ┌───────────────┐
                    │  AIGenerator  │
                    │  (Claude AI)  │
                    └───────────────┘
```

---

## Convenciones de Codigo

### JavaScript

#### Modulos IIFE

Todos los modulos usan el patron IIFE (Immediately Invoked Function Expression):

```javascript
const MiModulo = (function() {
    'use strict';

    // Estado privado
    const state = {};

    // Funciones privadas
    function funcionPrivada() {
        // ...
    }

    // Funciones publicas
    function funcionPublica() {
        // ...
    }

    // API publica
    return {
        funcionPublica,
        getState: () => ({ ...state })
    };
})();
```

#### Nomenclatura

- **Variables/Funciones**: `camelCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Modulos/Clases**: `PascalCase`
- **Archivos**: `kebab-case.js`

#### Documentacion

Usa JSDoc para funciones publicas:

```javascript
/**
 * Renderiza un mensaje de WhatsApp
 * @param {Object} message - Objeto de mensaje
 * @param {string} message.type - Tipo de mensaje
 * @param {Object} message.content - Contenido del mensaje
 * @returns {string} HTML del mensaje renderizado
 */
function renderWhatsAppMessage(message) {
    // ...
}
```

### CSS

#### Variables CSS

Usa variables definidas en `main.css`:

```css
.mi-componente {
    color: var(--text-primary);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    padding: var(--spacing-4);
}
```

#### Nomenclatura BEM Modificada

```css
/* Bloque */
.wa-message { }

/* Elemento */
.wa-message-content { }
.wa-message-timestamp { }

/* Modificador */
.wa-message--incoming { }
.wa-message--outgoing { }

/* Estado */
.wa-message.is-selected { }
```

#### Prefijos por Plataforma

- `wa-` para WhatsApp
- `rcs-` para RCS
- Sin prefijo para componentes generales

### HTML

- Usa atributos `data-*` para datos de JavaScript
- IDs en `kebab-case`
- Clases semanticas siguiendo BEM

---

## Proceso de Pull Request

### 1. Crear Rama

```bash
# Para features
git checkout -b feature/nombre-del-feature

# Para bug fixes
git checkout -b fix/descripcion-del-bug

# Para documentacion
git checkout -b docs/que-se-documenta
```

### 2. Commits

Usa mensajes de commit descriptivos siguiendo Conventional Commits:

```
feat: agregar soporte para mensajes de audio en WhatsApp
fix: corregir desplazamiento al agregar tarjetas al carrusel
docs: actualizar README con instrucciones de instalacion
refactor: simplificar logica de renderizado de botones
style: formatear codigo del constructor
```

### 3. Antes del PR

- [ ] El codigo sigue las convenciones del proyecto
- [ ] No hay errores en la consola
- [ ] Los cambios funcionan en Chrome, Firefox y Safari
- [ ] Se actualizo la documentacion si es necesario
- [ ] Se actualizo el CHANGELOG.md

### 4. Descripcion del PR

```markdown
## Descripcion
Breve descripcion de los cambios realizados.

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentacion

## Como probar
1. Paso 1
2. Paso 2
3. Paso 3

## Screenshots (si aplica)
[Agregar capturas de pantalla]

## Checklist
- [ ] Mi codigo sigue las convenciones del proyecto
- [ ] He probado mis cambios localmente
- [ ] He actualizado la documentacion
```

---

## Reportar Bugs

### Antes de Reportar

1. Verifica que el bug no haya sido reportado antes
2. Verifica que puedes reproducir el bug consistentemente
3. Verifica que estas usando la ultima version

### Formato del Reporte

```markdown
## Descripcion del Bug
Descripcion clara y concisa del bug.

## Pasos para Reproducir
1. Ir a '...'
2. Hacer clic en '...'
3. Scrollear hasta '...'
4. Ver error

## Comportamiento Esperado
Que esperabas que pasara.

## Comportamiento Actual
Que paso realmente.

## Screenshots
Si aplica, agrega capturas de pantalla.

## Entorno
- OS: [ej. Windows 11, macOS Sonoma]
- Navegador: [ej. Chrome 120, Firefox 121]
- Version de Mocamaker: [ej. v2.1.1]
```

---

## Solicitar Features

### Formato de Solicitud

```markdown
## Descripcion del Feature
Descripcion clara de la funcionalidad solicitada.

## Problema que Resuelve
Que problema resuelve este feature?

## Solucion Propuesta
Como imaginas que deberia funcionar?

## Alternativas Consideradas
Has considerado otras soluciones?

## Contexto Adicional
Informacion adicional que pueda ser util.
```

---

## Recursos Adicionales

### Documentacion de Plataformas

- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Google RCS Business Messaging](https://developers.google.com/business-communications/rcs-business-messaging)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Guidelines](https://material.io/design)

### Herramientas Utiles

- [Can I Use](https://caniuse.com/) - Compatibilidad de navegadores
- [CSS Tricks](https://css-tricks.com/) - Referencias CSS
- [MDN Web Docs](https://developer.mozilla.org/) - Documentacion web

---

## Preguntas?

Si tienes preguntas sobre como contribuir, no dudes en abrir un issue con la etiqueta `question`.

Gracias por contribuir a Mocamaker!
