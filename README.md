# 🎭 El Hilo que Nos Conecta
## Museo de Trajes de Bogotá - Simulador de Espejo Interactivo

Aplicación web móvil que simula un espejo mágico interactivo para la exposición "El Hilo que Nos Conecta" del Museo de Trajes de Bogotá.

---

## 📋 Características

### Fase 1: El Espejo
- Cámara frontal a pantalla completa con modo espejo
- MediaPipe detecta presencia de persona
- Textos flotantes animados cuando hay presencia
- 3 botones de telas (Algodón, Lana, Encaje)

### Fase 2: Preparación
- Detección de cuerpo completo con MediaPipe
- Anuncios animados de preparación
- Contador regresivo 3-2-1
- Captura automática de foto

### Fase 3: Experiencia del Traje
- Fotomontaje con Canvas API
- 5 trajes históricos colombianos:
  1. **Frac** (Bogotá/Andes, 1850-1950)
  2. **Misak – Guambiano** (Cauca, Actualidad)
  3. **Mujer de San Andrés** (Islas/Caribe, 1850-1950)
  4. **Campesino de Boyacá** (Boyacá/Andes, 1850-1950)
  5. **Barequera del Río Guadalupe** (Antioquia, 1850-1950)

- Datos curiosos flotantes animados
- Mapa de Colombia con pin de ubicación
- Navegación por gestos (MediaPipe)

### Navegación por Gestos
- 👉 **Brazo derecho en arco** → Siguiente traje
- 👈 **Brazo izquierdo en arco** → Traje anterior
- 📸 **Dos manos arriba** → Tomar foto/recuerdo

---

## 🚀 Cómo usar

### Requisitos
- Navegador moderno con soporte para WebRTC (Chrome, Firefox, Safari, Edge)
- Cámara frontal disponible
- Conexión a Internet (para cargar MediaPipe)

### Instalación local
1. Abre el archivo `index.html` en tu navegador
2. Permite acceso a la cámara cuando se solicite
3. Espera a que carguen los modelos de MediaPipe

### O usar un servidor local
```bash
# Python 3
python -m http.server 8000

# Node.js (con npx)
npx serve .

# PHP
php -S localhost:8000
```

Luego abre `http://localhost:8000` en tu navegador.

---

## 📱 Uso en móvil

Para la mejor experiencia en dispositivos móviles:

1. Usa **orientación vertical (portrait)**
2. Asegúrate de tener buena iluminación
3. Mantén el dispositivo a la altura del pecho
4. Colócate a unos 1.5-2 metros de distancia
5. Asegúrate de que todo tu cuerpo sea visible

---

## 🏗️ Estructura del proyecto

```
📁 ESpejo2/
├── 📄 index.html          # Estructura principal
├── 📄 styles.css          # Estilos y animaciones
├── 📄 app.js              # Lógica y MediaPipe
├── 🖼️ frak.png           # Traje 1: Frac
├── 🖼️ misak.png          # Traje 2: Misak
├── 🖼️ vestido.png        # Traje 3: Mujer de San Andrés
├── 🖼️ Campesino.png      # Traje 4: Campesino de Boyacá
├── 🖼️ barequera.png      # Traje 5: Barequera
└── 📄 README.md          # Este archivo
```

---

## 🛠️ Stack Tecnológico

- **HTML5** + **CSS3** + **JavaScript (ES6+)**
- **MediaPipe Pose** - Detección de cuerpo y gestos
- **MediaPipe Camera Utils** - Acceso a cámara
- **Face-API.js** - Detección facial (cargado, listo para uso)
- **Canvas API** - Composición de imágenes

---

## 🎨 Diseño

### Paleta de colores
- **Primario:** `#2c1810` (Marrón oscuro)
- **Secundario:** `#8b4513` (Marrón arcilla)
- **Acento:** `#d4a574` (Dorado/Dorado viejo)
- **Texto:** `#f5f5f5` (Blanco hueso)

### Tipografías
- **Títulos:** Playfair Display / Georgia (serif)
- **Cuerpo:** Lato / sistema sans-serif

---

## 📝 Notas técnicas

### MediaPipe
Los modelos de MediaPipe se cargan desde CDN, por lo que se requiere conexión a Internet en la primera carga. Una vez cargados, la aplicación puede funcionar offline si el navegador tiene caché.

### Fotomontaje
La aplicación usa **Canvas API** para el fotomontaje. La imagen capturada se superpone con la imagen del traje seleccionado. Los prompts de IA están incluidos en la configuración para futura integración con APIs de generación de imágenes.

### Rendimiento
- Resolución de video: 640x480
- Frame rate objetivo: 30fps
- Se recomienda dispositivo con al menos 4GB RAM

---

## 🔮 Futuras mejoras

- [ ] Integración con API de IA (Claude/Nano Banana) para fotomontaje mejorado
- [ ] Mapeo de rostro más preciso con Face-API.js
- [ ] Más trajes de diferentes regiones
- [ ] Modo "foto de época" con filtros vintage
- [ ] Compartir directo a redes sociales
- [ ] Soporte para pantallas táctiles grandes

---

## 📞 Soporte

Para el Museo de Trajes de Bogotá

Proyecto: **Módulo Museográfico Itinerante - El Hilo que Nos Conecta**
Enfoque: Identidad, Cuerpo y Memoria

---

## 📄 Licencia

Este proyecto es propiedad del Museo de Trajes de Bogotá.

Tecnologías de terceros:
- MediaPipe: Apache License 2.0
- Face-API.js: MIT License

---

**Desarrollado con ❤️ para la preservación de la memoria textil colombiana**
