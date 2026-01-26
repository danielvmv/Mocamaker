# CHANGELOG.md

## [v2.1.0] - En Desarrollo

### 🎨 Theming
- **[FEATURE]** ✅ Implementación de Dark Mode/Light Mode
  - ✅ Toggle de tema en la interfaz principal
  - ✅ Modo claro/oscuro NO afecta los mockups de WhatsApp y RCS
  - ✅ Los mockups mantienen su look & feel nativo independiente del tema de la app
  - ✅ Persistencia de preferencia de tema en localStorage

### 📱 Plataformas & Fidelidad Visual

#### [PRIORITY: TOP] Selector de Sistema Operativo
- **[FEATURE]** ✅ Control iOS/Android en sección principal
  - ✅ Posicionado a la misma altura que controles RCS/WhatsApp
  - ✅ Diseño natural e integrado con controles existentes
  - ✅ Switch sin pérdida de datos al cambiar entre plataformas

#### [CRITICAL] Fidelidad de Diseño
- **[ENHANCEMENT]** ✅ Mockups RCS 100% fieles a diseño original de cada plataforma
  - ✅ iOS: Basado en última versión de iOS (tipografía San Francisco)
  - ✅ Android: Basado en última versión de Material Design (tipografía Roboto)
  - ✅ Referencias visuales actualizadas a estándares 2025
  - ✅ Respeto estricto a guidelines de cada OS (border-radius, spacing)

### 🖼️ Personalización de Marca

- **[FEATURE]** ✅ Upload de imagen de perfil de empresa
  - ✅ Soporte para formatos: JPG, PNG, WebP
  - ✅ Preview en tiempo real en el mockup
  - ⏳ Compresión/optimización automática de imágenes
  - ✅ Validación de dimensiones recomendadas (max 2MB)

### 🔄 UX Improvements

#### Switching Dinámico iOS/Android
- **[FEATURE]** ✅ Cambio de plataforma sin pérdida de datos
  - ✅ Preservación de todo el contenido al hacer switch
  - ✅ Transición visual elegante entre diseños
  - ✅ Estado del mockup persistente entre cambios

#### Controles Contextuales Inteligentes
- **[FEATURE]** ✅ Desvanecimiento elegante de controles incompatibles (RCS)
  - **Trigger:** Cuando usuario selecciona "Texto"
  - **Comportamiento:**
    - ❌ Desvanece sección "Multimedia" (imagen, video, audio, archivo)
    - ❌ Desvanece "Rich Card" y "Carrusel"
    - ✅ Mantiene visible "Acciones"
    - ✅ Mantiene visible "Sugerencias"
  - **Razón:** Texto y multimedia son mutuamente excluyentes en RCS
  - ✅ Transición suave con fade-out/fade-in (opacity + scale)
  - ✅ Estados de UI claros con indicador "(no disponible)"

#### Carga de Multimedia Local
- **[FEATURE]** ✅ Selector de archivos local para multimedia (RCS)
  - ✅ Soporte para URL y archivo local en el mismo control
  - ✅ Interfaz con tabs para alternar entre URL y archivo
  - ✅ Drag & drop de archivos
  - ✅ Preview en tiempo real (imagen, video, audio)
  - ✅ Formatos soportados:
    - Imagen: JPEG, PNG, GIF, WebP
    - Video: MP4, WebM, QuickTime
    - Audio: MP3, AAC, OGG, WAV
  - ✅ Validación de tamaño (10MB imágenes, 50MB video/audio)
  - ✅ Soporte Dark Mode

### 🎯 Objetivos de Fidelidad

#### Google RCS Compliance
- Adherencia estricta a controles oficiales de Google RCS Business Messaging
- Validación de capabilities según especificaciones actuales
- Restricciones de contenido según reglas de la plataforma

#### OS Native Experience
- Mockups indistinguibles de capturas reales de cada OS
- Tipografías nativas (San Francisco para iOS, Roboto para Android)
- Esquemas de color según Human Interface Guidelines (iOS) y Material Design (Android)
- Espaciados, bordes y sombras según guidelines oficiales

---

## [v2.0.0] - Versión Actual

### Características Base
- Generador de mockups para RCS y WhatsApp
- Editor de mensajes con texto y multimedia
- Sistema de sugerencias y acciones
- Rich Cards y carruseles
- Export de mockups

---

## Notas de Migración

### Para Desarrolladores
- Verificar compatibilidad de componentes con tema dual
- Actualizar assets de UI según últimas versiones de iOS/Android
- Implementar lógica de desvanecimiento condicional
- Validar persistencia de estado entre switches de plataforma

### Testing Requerido
- [ ] Verificar fidelidad visual iOS vs screenshots reales
- [ ] Verificar fidelidad visual Android vs screenshots reales
- [ ] Validar todas las combinaciones de controles RCS
- [ ] Probar switching iOS/Android con contenido complejo
- [ ] Validar comportamiento de upload de imágenes
- [ ] Testing de dark/light mode en diferentes dispositivos

---

**Última actualización:** Enero 2025  
**Responsable:** Daniel Villanueva  
**Proyecto:** Mocamaker v2.0 - Mockups Conversacionales