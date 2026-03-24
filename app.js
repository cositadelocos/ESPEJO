/**
 * EL HILO QUE NOS CONECTA
 * Museo de Trajes de Bogotá - Simulador de Espejo Interactivo
 *
 * Funcionalidades:
 * - MediaPipe para detección de cuerpo y gestos
 * - Face-api.js para detección de rostro
 * - Fotomontaje con Canvas API
 * - Navegación por gestos
 * - Datos curiosos animados
 */

// ========================================
// CONFIGURACIÓN Y ESTADO GLOBAL
// ========================================

const CONFIG = {
    // URLs de modelos de MediaPipe
    modelUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/',
    holisticModelUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/holistic/',

    // Configuración de cámara
    videoWidth: 640,
    videoHeight: 480,

    // Umbrales para gestos
    gestureThreshold: 0.3,      // Sensibilidad de gestos
    detectionConfidence: 0.5,   // Confianza mínima de detección
    personDetectionThreshold: 0.3,

    // Timing
    countdownDuration: 3000,    // 3 segundos para contador
    textAnimationInterval: 4000,
    dataCuriousInterval: 6000,

    // Rutas de trajes
    trajes: [
        {
            id: 'frac',
            nombre: 'Frac (Influencia Europea)',
            archivo: 'frak.png',
            region: 'Bogotá / Andes',
            anio: '1850–1950',
            datosCuriosos: [
                'Símbolo de la más alta alcurnia y noches de etiqueta inolvidables.',
                'Un reflejo de la elegancia victoriana, donde cada doblez ocultaba un secreto de la alta sociedad.'
            ],
            promptIA: `Atuendo masculino formal de etiqueta completa, estilo frac de influencia europea (mediados s. XIX - principios s. XX). Chaqueta de frac de lana negra de alta calidad con solapas de pico anchas, cuerpo frontal corto y colas traseras en picos simétricos. Chaleco de piqué de algodón blanco texturizado. Camisa blanca de algodón con cuello de pajarita rígido. Pantalón de vestir recto con raya diplomática fina en gris oscuro y negro. Corbatín de seda negra. Ajuste formal y elegante.`
        },
        {
            id: 'misak',
            nombre: 'Misak – Guambiano',
            archivo: 'misak.png',
            region: 'Cauca',
            anio: 'Actualidad',
            datosCuriosos: [
                'No es tela comprada, es el espíritu ancestral de una comunidad hilado a mano.',
                'Una prenda tejida con el corazón y la fuerza de los Andes Caucanos.'
            ],
            promptIA: `Atuendo femenino tradicional de la comunidad indígena Misak (Guambiano). Anaco de lana blanca con líneas horizontales azules y fucsia. Chumbe tejido a mano con diseños geométricos en azul, fucsia, verde y blanco. Rebozo de lana fucsia intenso que cubre hombros. Sombrero de fibra natural con pompones blancos, negros y fucsia. Collares de cuentas blancas densos. Botas de cuero. Texturas artesanales rústicas.`
        },
        {
            id: 'vestido',
            nombre: 'Mujer de San Andrés',
            archivo: 'vestido.png',
            region: 'Islas / Caribe',
            anio: '1850–1950',
            datosCuriosos: [
                'Una hermosa danza tejida entre las raíces africanas y la brisa europea del Caribe.',
                'De uso sagrado en ceremonias, sus pliegues marcan la identidad y el alma isleña.'
            ],
            promptIA: `Vestido femenino tradicional de gala de San Andrés, Región Insular colombiana. Vestido de una pieza en algodón blanco con rayas verticales verdes claras y lunares verdes. Mangas cortas abullonadas con gran volante doble cruzado en V sobre pecho y hombros, ribete verde esmeralda oscuro. Botonadura central de botones verdes. Falda larga con panel inferior de encaje verde claro translúcido con patrones florales y festoneado. Silueta elegante colonial caribeña.`
        },
        {
            id: 'campesino',
            nombre: 'Campesino de Boyacá',
            archivo: 'Campesino.png',
            region: 'Boyacá / Andes',
            anio: '1850–1950',
            datosCuriosos: [
                'Una prenda documentada desde 1850, testigo silencioso del trabajo duro en los campos.',
                'Escudo cálido e inquebrantable contra las heladas madrugadas del páramo.'
            ],
            promptIA: `Atuendo masculino tradicional campesino de Boyacá, Andes colombianos. Ruana cuadrada grande de lana virgen color crudo/hueso con textura áspera, densa y pesada, flecos cortos en borde inferior, cuello en V con cordón. Camisa blanca de algodón bajo la ruana. Pantalón de vestir recto color chocolate oscuro en paño de lana mate. Sombrero de paja color ocre claro con cinta negra. Pañolón de lana blanca con puntos calados cubriendo cuello y mandíbula. Alpargatas de fique crudo. Aspecto rústico andino.`
        },
        {
            id: 'barequera',
            nombre: 'Barequera del Río Guadalupe',
            archivo: 'barequera.png',
            region: 'Antioquia',
            anio: '1850–1950',
            datosCuriosos: [
                'La fiel armadura de las mujeres que buscaban tesoros en las aguas de Antioquia.',
                'Con oro en sus esperanzas y la batea en sus manos, forjaron la riqueza de toda una región.'
            ],
            promptIA: `Atuendo femenino tradicional de trabajo para minería de oro en ríos de Antioquia. Blusa de algodón ligero sin mangas, cuello redondo cerrado, color blanco puro, entallada en torso. Falda negra de tiro alto en algodón mate o lino, fruncida densamente en cintura, volumen de pliegues naturales que caen hasta debajo de rodillas, textura rugosa resistente. Pañuelo de cabeza triangular de algodón rojo escarlata vibrante cubriendo cabeza. Sombrero de fibra natural de ala ancha con cinta negra. Alpargatas de fique crudo. Contraste blanco-negro-rojo intenso.`
        }
    ]
};

// Estado global de la aplicación
const State = {
    faseActual: 'espejo',       // 'espejo', 'preparacion', 'traje'
    trajeActual: 0,             // Índice del traje actual
    trajeSeleccionado: null,    // Traje seleccionado inicialmente
    fotoCapturada: null,        // DataURL de la foto
    rostroDetectado: null,      // Datos del rostro detectado
    cuerpoDetectado: false,     // Hay cuerpo completo en frame
    contadorActivo: false,      // Contador corriendo
    gestoCooldown: false,       // Cooldown entre gestos
    datosCuriososInterval: null,
    camera: null,
    pose: null,
    holistic: null,
    videoElement: null,
    canvasElement: null,
    ctx: null,
    bodyPixNet: null,           // Modelo BodyPix cargado
    segmentacionData: null,     // Datos de segmentación del cuerpo
    ultimoLandmarks: null,      // Últimos landmarks detectados
    fotoLandmarks: null,        // Landmarks guardados al tomar la foto
    historialDespedida: []      // Seguimiento del movimiento de la muñeca para despedida
};

// Variable para el control del volumen de la música
let fadeInterval = null;

function fadeAudio(audioElement, targetVolume, duration) {
    if (!audioElement) return;
    
    if (fadeInterval) clearInterval(fadeInterval);
    
    const startVolume = audioElement.volume;
    const volumeChange = targetVolume - startVolume;
    const ticks = 20; // 20 pasos de animación
    const tickTime = duration / ticks;
    let currentTick = 0;
    
    fadeInterval = setInterval(() => {
        currentTick++;
        let newVol = startVolume + (volumeChange * (currentTick / ticks));
        if (newVol > 1) newVol = 1;
        if (newVol < 0) newVol = 0;
        
        audioElement.volume = newVol;
        
        if (currentTick >= ticks) {
            audioElement.volume = targetVolume;
            clearInterval(fadeInterval);
            fadeInterval = null;
        }
    }, tickTime);
}

// ========================================
// UTILIDADES
// ========================================

function $(selector) { return document.querySelector(selector); }
function $$(selector) { return document.querySelectorAll(selector); }

function showElement(el) {
    if (typeof el === 'string') el = $(el);
    if (el) el.classList.remove('hidden');
}

function hideElement(el) {
    if (typeof el === 'string') el = $(el);
    if (el) el.classList.add('hidden');
}

function cambiarFase(nuevaFase) {
    // Ocultar todas las fases
    $$('.fase').forEach(fase => fase.classList.remove('active'));

    // Mostrar nueva fase
    const faseEl = $(`#fase-${nuevaFase}`);
    if (faseEl) {
        faseEl.classList.add('active');
        State.faseActual = nuevaFase;
    }
}

function createFlash() {
    const flash = document.createElement('div');
    flash.className = 'flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
}

function showGestureIndicator(emoji) {
    const indicator = document.createElement('div');
    indicator.className = 'gesto-detectado';
    indicator.textContent = emoji;
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 500);
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎭 El Hilo que Nos Conecta - Iniciando...');

    // Verificar recursos
    checkResources();

    // Inicializar event listeners
    initEventListeners();

    // Inicializar MediaPipe y cámara
    initMediaPipe();
});

function checkResources() {
    console.log('📦 Verificando recursos de trajes...');
    CONFIG.trajes.forEach(traje => {
        const img = new Image();
        img.onload = () => console.log(`✅ ${traje.archivo} cargado`);
        img.onerror = () => console.error(`❌ Error cargando ${traje.archivo}`);
        img.src = traje.archivo;
    });
}

function initEventListeners() {
    // Botones de telas
    $$('.btn-tela').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tela = btn.dataset.tela;
            const trajeId = btn.dataset.traje;
            console.log(`🧵 Tela seleccionada: ${tela}, Traje: ${trajeId}`);

            // Encontrar índice del traje
            const trajeIndex = CONFIG.trajes.findIndex(t => t.id === trajeId);
            if (trajeIndex !== -1) {
                State.trajeSeleccionado = trajeIndex;
                State.trajeActual = trajeIndex;
                iniciarFasePreparacion();
            }
        });
    });

    // Botón volver
    $('#btn-volver').addEventListener('click', () => {
        resetearExperiencia();
    });

    // Botones del modal
    $('#btn-descargar').addEventListener('click', descargarRecuerdo);
    $('#btn-cerrar-modal').addEventListener('click', () => {
        hideElement('#modal-foto');
    });
}

// ========================================
// MEDIAPIPE - INICIALIZACIÓN
// ========================================

async function initMediaPipe() {
    console.log('🎥 Inicializando MediaPipe...');

    // Configurar elementos de video
    State.videoElement = $('#input-video');
    State.canvasElement = $('#output-canvas');
    State.ctx = State.canvasElement.getContext('2d');

    // Configurar canvas
    State.canvasElement.width = CONFIG.videoWidth;
    State.canvasElement.height = CONFIG.videoHeight;

    // Configurar overlay global de manos
    State.overlayCanvas = $('#overlay-canvas');
    if (State.overlayCanvas) {
        State.overlayCtx = State.overlayCanvas.getContext('2d');
        State.overlayCanvas.width = CONFIG.videoWidth;
        State.overlayCanvas.height = CONFIG.videoHeight;
    }

    // Inicializar Pose
    State.pose = new Pose({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
    });

    State.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: CONFIG.detectionConfidence,
        minTrackingConfidence: CONFIG.detectionConfidence
    });

    State.pose.onResults(onPoseResults);

    // Inicializar cámara
    try {
        State.camera = new Camera(State.videoElement, {
            onFrame: async () => {
                // Siempre enviar frames: fase 1/2 para detectar cuerpo, fase 3 para gestos
                await State.pose.send({ image: State.videoElement });
            },
            width: CONFIG.videoWidth,
            height: CONFIG.videoHeight
        });

        await State.camera.start();
        console.log('✅ Cámara iniciada');

        // Cargar BodyPix para segmentación (gratis, corre en el navegador)
        await cargarBodyPix();

        // Actualizar estado
        $('#status-text').textContent = 'Cámara activa - Acércate al espejo';

        // Iniciar música de fondo suavemente
        const bgMusic = $('#bg-music');
        if (bgMusic) {
            bgMusic.volume = 0.15;
            bgMusic.play().catch(e => console.log('Autoplay bloqueado. La música iniciará al toque de pantalla.'));
            
            // Por si el navegador bloqueó el autoplay, iniciar al primer click
            document.body.addEventListener('click', () => {
                if (bgMusic.paused) {
                    bgMusic.volume = 0.15;
                    bgMusic.play();
                }
            }, { once: true });
        }

    } catch (error) {
        console.error('❌ Error al iniciar cámara:', error);
        $('#status-text').textContent = 'Error de cámara - Recarga la página';
    }
}

// ========================================
// BODYPIX - CARGA Y SEGMENTACIÓN
// ========================================

async function cargarBodyPix() {
    console.log('🤖 Cargando BodyPix...');
    try {
        // Cargar modelo de segmentación de cuerpo
        State.bodyPixNet = await bodyPix.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            multiplier: 0.5,  // 0.5 = más rápido, 1.0 = más preciso
            quantBytes: 2     // 2 = buen balance precisión/velocidad
        });
        console.log('✅ BodyPix cargado');
    } catch (error) {
        console.error('❌ Error cargando BodyPix:', error);
    }
}

async function segmentarPersona(imagen) {
    if (!State.bodyPixNet) {
        console.log('⚠️ BodyPix no disponible, usando fotomontaje simple');
        return null;
    }

    console.log('🔍 Segmentando persona...');
    try {
        const segmentacion = await State.bodyPixNet.segmentPerson(imagen, {
            internalResolution: 'medium',
            segmentationThreshold: 0.7
        });

        console.log('✅ Persona segmentada');
        return segmentacion;
    } catch (error) {
        console.error('❌ Error en segmentación:', error);
        return null;
    }
}

// ========================================
// MEDIAPIPE - RESULTADOS
// ========================================

function onPoseResults(results) {
    // Limpiar canvas principal
    State.ctx.clearRect(0, 0, State.canvasElement.width, State.canvasElement.height);
    
    // Limpiar y alinear lienzo del overlay track
    if (State.overlayCtx && State.videoElement.videoWidth) {
        // MUY IMPORTANTE: Sincronizar el aspect ratio EXACTO de la cámara de video real
        // para que object-fit: cover mueva y recorte la cámara y el dibujo por igual.
        if (State.overlayCanvas.width !== State.videoElement.videoWidth) {
            State.overlayCanvas.width = State.videoElement.videoWidth;
            State.overlayCanvas.height = State.videoElement.videoHeight;
        }
        State.overlayCtx.clearRect(0, 0, State.overlayCanvas.width, State.overlayCanvas.height);
    }

    if (results.poseLandmarks) {
        State.ultimoLandmarks = results.poseLandmarks;

        // Dibujar elementos interactivos de la pantalla
        if (State.overlayCtx && State.videoElement.videoWidth) {
            if (State.faseActual === 'traje') {
                updateAndDrawCloud(results.poseLandmarks, State.overlayCtx, State.overlayCanvas.width, State.overlayCanvas.height);
            }
            drawHandTracking(results.poseLandmarks, State.overlayCtx, State.overlayCanvas.width, State.overlayCanvas.height);
        }

        // Verificar si hay persona completa
        const personaDetectada = detectarPersonaCompleta(results.poseLandmarks);

        if (personaDetectada !== State.cuerpoDetectado) {
            State.cuerpoDetectado = personaDetectada;
            onPersonaDetectada(personaDetectada);
        }

        // Si estamos en fase traje, detectar gestos
        if (State.faseActual === 'traje' && !State.gestoCooldown) {
            detectarGestos(results.poseLandmarks);
        }
    } else {
        if (State.cuerpoDetectado) {
            State.cuerpoDetectado = false;
            onPersonaDetectada(false);
        }
    }
}

function detectarPersonaCompleta(landmarks) {
    // Verificar puntos clave del cuerpo
    const puntosClave = [
        0,   // Nariz
        11,  // Hombro izquierdo
        12,  // Hombro derecho
        23,  // Cadera izquierda
        24,  // Cadera derecha
        27,  // Tobillo izquierdo
        28   // Tobillo derecho
    ];

    let puntosVisibles = 0;
    puntosClave.forEach(idx => {
        if (landmarks[idx] && landmarks[idx].visibility > CONFIG.personDetectionThreshold) {
            puntosVisibles++;
        }
    });

    let estaCentrado = true;
    if (State.faseActual === 'preparacion') {
        const hombroIzq = landmarks[11];
        const hombroDer = landmarks[12];
        const nariz = landmarks[0];

        if (hombroIzq && hombroDer && nariz) {
            // En fase de preparación, requerimos estar centrados en la silueta (centro X cercano a 0.5)
            // MediaPipe: x=0 es izquierda, x=1 es derecha. La cámara está en espejo, pero MediaPipe da coordenadas en el frame.
            const hombroX = (hombroIzq.x + hombroDer.x) / 2;
            const hombroY = (hombroIzq.y + hombroDer.y) / 2;
            
            // Permitimos un margen en el centro, MÁS ESTRICTO ahora (ej. entre 0.40 y 0.60)
            if (hombroX < 0.38 || hombroX > 0.62) estaCentrado = false;

            // Anchura de hombros estricta para asegurar distancia correcta
            const anchoHombros = Math.abs(hombroIzq.x - hombroDer.x);
            if (anchoHombros < 0.17 || anchoHombros > 0.38) estaCentrado = false;

            // La altura de los hombros debe coincidir con la silueta (usualmente entre 0.25 y 0.50)
            if (hombroY < 0.25 || hombroY > 0.50) estaCentrado = false;
        } else {
            estaCentrado = false;
        }
    }

    // Necesitamos al menos 5 puntos y estar centrado si estamos en preparación
    return puntosVisibles >= 5 && estaCentrado;
}

function onPersonaDetectada(detectada) {
    const pulse = $('.pulse');
    const statusText = $('#status-text');
    const bgMusic = $('#bg-music');

    if (detectada) {
        pulse.classList.add('detected');
        statusText.textContent = '¡Persona detectada!';
        
        // Sube volumen levemente
        if (bgMusic && !bgMusic.paused) fadeAudio(bgMusic, 0.4, 2000);

        // Mostrar textos flotantes en fase espejo
        if (State.faseActual === 'espejo') {
            showElement('#textos-flotantes');
            showElement('#botones-telas');
        }

        // En fase preparación, verificar si iniciar contador
        if (State.faseActual === 'preparacion' && !State.contadorActivo) {
            iniciarContador();
        }
    } else {
        pulse.classList.remove('detected');
        statusText.textContent = 'Acércate al espejo...';

        // Baja volumen de nuevo a suave
        if (bgMusic && !bgMusic.paused) fadeAudio(bgMusic, 0.15, 2000);

        if (State.faseActual === 'espejo') {
            hideElement('#textos-flotantes');
            hideElement('#botones-telas');
        }
    }
}

// ========================================
// FASE PREPARACIÓN
// ========================================

function iniciarFasePreparacion() {
    console.log('🎯 Iniciando fase de preparación');
    cambiarFase('preparacion');

    // Configurar video de preparación
    const prepVideo = $('#prep-video');
    const stream = State.videoElement.srcObject;
    if (stream) {
        prepVideo.srcObject = stream;
    }

    // Reiniciar estado
    State.contadorActivo = false;
    hideElement('#contador-container');
    showElement('#guia-cuerpo');
    showElement('#anuncios-prep');
}

function iniciarContador() {
    if (State.contadorActivo) return;

    console.log('⏱️ Iniciando contador');
    State.contadorActivo = true;

    hideElement('#guia-cuerpo');
    hideElement('#anuncios-prep');
    showElement('#contador-container');

    let cuenta = 3;
    const contadorEl = $('#contador');
    contadorEl.textContent = cuenta;

    const interval = setInterval(() => {
        cuenta--;

        if (cuenta > 0) {
            contadorEl.textContent = cuenta;
            // Reiniciar animación
            contadorEl.style.animation = 'none';
            contadorEl.offsetHeight; // Trigger reflow
            contadorEl.style.animation = 'contador-pulse 1s ease-in-out';
        } else {
            clearInterval(interval);
            contadorEl.textContent = '¡Listo!';
            setTimeout(capturarFoto, 500);
        }
    }, 1000);
}

// ========================================
// CAPTURA DE FOTO
// ========================================

function capturarFoto() {
    console.log('📸 Capturando foto...');

    createFlash();

    // Crear canvas temporal para la captura
    const canvas = document.createElement('canvas');
    canvas.width = State.videoElement.videoWidth || CONFIG.videoWidth;
    canvas.height = State.videoElement.videoHeight || CONFIG.videoHeight;
    const ctx = canvas.getContext('2d');

    // Dibujar frame actual del video (invertido para modo espejo)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(State.videoElement, 0, 0, canvas.width, canvas.height);

    // Guardar foto
    State.fotoCapturada = canvas.toDataURL('image/jpeg', 0.9);
    
    // Guardar landmarks del momento de la foto
    State.fotoLandmarks = State.ultimoLandmarks;

    // Mostrar en imagen oculta
    $('#img-capturada').src = State.fotoCapturada;

    console.log('✅ Foto capturada');

    // Procesar con IA
    procesarConIA();
}

// ========================================
// PROCESAMIENTO CON IA (GRATIS - BODYPIX)
// ========================================

async function procesarConIA() {
    console.log('🤖 Procesando con BodyPix (IA local gratuita)...');

    // Mostrar loading
    cambiarFase('traje');
    showElement('#loading-ia');

    // Cargar imagen del traje
    const traje = CONFIG.trajes[State.trajeActual];
    $('#img-traje').src = traje.archivo;

    // Esperar carga
    await new Promise((resolve) => {
        $('#img-traje').onload = resolve;
        setTimeout(resolve, 1000);
    });

    // Generar fotomontaje con BodyPix
    try {
        await generarFotomontajeMejorado();
        hideElement('#loading-ia');
        iniciarExperienciaTraje();
    } catch (error) {
        console.error('❌ Error en fotomontaje:', error);
        hideElement('#loading-ia');
        // Fallback simple
        generarFotomontaje();
        iniciarExperienciaTraje();
    }
}

// ========================================
// FOTOMONTAJE CON BODYPIX (GRATIS)
// ========================================

async function generarFotomontajeMejorado() {
    const traje = CONFIG.trajes[State.trajeActual];
    const canvas = $('#traje-canvas');
    const ctx = canvas.getContext('2d');

    // Cargar imágenes
    const imgPersona = new Image();
    const imgTraje = new Image();

    imgPersona.crossOrigin = 'anonymous';
    imgTraje.crossOrigin = 'anonymous';

    await new Promise((resolve) => {
        imgPersona.onload = resolve;
        imgPersona.src = State.fotoCapturada;
    });

    await new Promise((resolve) => {
        imgTraje.onload = resolve;
        imgTraje.src = traje.archivo;
    });

    // Ajustar canvas al tamaño de la foto
    canvas.width = imgPersona.width;
    canvas.height = imgPersona.height;

    // Segmentar persona con BodyPix
    const segmentacion = await segmentarPersona(imgPersona);

    if (segmentacion) {
        // ========================================
        // MODO AVANZADO: Con segmentación BodyPix
        // ========================================
        await aplicarFotomontajeConSegmentacion(
            canvas, ctx, imgPersona, imgTraje, segmentacion
        );
    } else {
        // ========================================
        // MODO SIMPLE: Sin segmentación
        // ========================================
        aplicarFotomontajeSimple(canvas, ctx, imgPersona, imgTraje);
    }
}

function dibujarTrajeAjustado(ctx, imgTraje, width, height, landmarks) {
    if (!landmarks || landmarks.length === 0) {
        ctx.drawImage(imgTraje, 0, 0, width, height);
        return;
    }

    const hombroIzq = landmarks[11];
    const hombroDer = landmarks[12];
    const caderaIzq = landmarks[23];
    const caderaDer = landmarks[24];

    if (!hombroIzq || !hombroDer || !caderaIzq || !caderaDer || 
        hombroIzq.visibility < 0.5 || hombroDer.visibility < 0.5) {
        ctx.drawImage(imgTraje, 0, 0, width, height);
        return;
    }

    // Calcular centro del torso superior
    const centroTorsoX = (hombroIzq.x + hombroDer.x) / 2;
    // Poner el centro Y un poco más abajo de los hombros (pecho)
    const centroTorsoY = (hombroIzq.y + hombroDer.y) / 2 + 0.05;

    // Distancias
    const anchoHombros = Math.abs(hombroIzq.x - hombroDer.x);
    const altoTorso = Math.abs(((hombroIzq.y + hombroDer.y) / 2) - ((caderaIzq.y + caderaDer.y) / 2));

    // Escalas de ajuste (el PNG suele ser más ancho y largo que los landmarks base)
    const scaleX = 2.8; 
    const scaleY = 3.0; // Cubre piernas

    const suitWidth = anchoHombros * width * scaleX;
    // Si no detecta bien cadera/torso, usamos proporción sobre hombros
    const altoReferencia = altoTorso > 0.1 ? altoTorso : anchoHombros * 1.5;
    const suitHeight = altoReferencia * height * scaleY;

    // Calcular X e Y (esquina superior izquierda del recorte)
    const suitX = (centroTorsoX * width) - (suitWidth / 2);
    // Subir un poco el traje (25% de su altura) para que el cuello coincida
    const suitY = (centroTorsoY * height) - (suitHeight * 0.25); 

    ctx.drawImage(imgTraje, suitX, suitY, suitWidth, suitHeight);
}

async function aplicarFotomontajeConSegmentacion(canvas, ctx, imgPersona, imgTraje, segmentacion) {
    console.log('🎨 Aplicando efecto BodyPix...');

    // Crear canvas temporal para la máscara
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');

    // Dibujar la máscara de segmentación (persona = blanco, fondo = negro)
    const maskImageData = maskCtx.createImageData(canvas.width, canvas.height);
    const data = maskImageData.data;

    for (let i = 0; i < segmentacion.data.length; i++) {
        const pixelIndex = i * 4;
        if (segmentacion.data[i] === 1) {
            // Persona - blanco
            data[pixelIndex] = 255;
            data[pixelIndex + 1] = 255;
            data[pixelIndex + 2] = 255;
            data[pixelIndex + 3] = 255;
        } else {
            // Fondo - transparente
            data[pixelIndex] = 0;
            data[pixelIndex + 1] = 0;
            data[pixelIndex + 2] = 0;
            data[pixelIndex + 3] = 0;
        }
    }
    maskCtx.putImageData(maskImageData, 0, 0);

    // PASO 1: Fondo degradado elegante
    const fondoGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    fondoGradient.addColorStop(0, '#2c1810');
    fondoGradient.addColorStop(0.5, '#1a1a2e');
    fondoGradient.addColorStop(1, '#16213e');
    ctx.fillStyle = fondoGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // PASO 2: Crear imagen de la persona con fondo transparente
    const personaCanvas = document.createElement('canvas');
    personaCanvas.width = canvas.width;
    personaCanvas.height = canvas.height;
    const personaCtx = personaCanvas.getContext('2d');

    // Aplicar máscara a la persona
    personaCtx.drawImage(imgPersona, 0, 0);
    personaCtx.globalCompositeOperation = 'destination-in';
    personaCtx.drawImage(maskCanvas, 0, 0);

    // PASO 3: Dibujar traje ajustado al cuerpo
    const trajeCanvas = document.createElement('canvas');
    trajeCanvas.width = canvas.width;
    trajeCanvas.height = canvas.height;
    const trajeCtx = trajeCanvas.getContext('2d');
    dibujarTrajeAjustado(trajeCtx, imgTraje, canvas.width, canvas.height, State.fotoLandmarks);

    // PASO 4: Componer la imagen final
    // Primero: dibujar la persona
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1); // Espejo
    ctx.drawImage(personaCanvas, 0, 0);
    ctx.restore();

    // Segundo: aplicar el traje sobre la persona usando la máscara
    // Solo donde hay persona (efecto de ropa)
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = 0.85;
    ctx.drawImage(trajeCanvas, 0, 0);

    // Tercero: restaurar composición y agregar suavizado
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;

    // PASO 5: Iluminación y efectos finales
    // Vignette sutil
    const vignette = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2,
        canvas.height * 0.3,
        canvas.width / 2, canvas.height / 2,
        canvas.height * 0.8
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    console.log('✅ Fotomontaje con BodyPix completado');
}

function aplicarFotomontajeSimple(canvas, ctx, imgPersona, imgTraje) {
    console.log('🎨 Aplicando fotomontaje simple...');

    // PASO 1: Fondo
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // PASO 2: Dibujar persona (espejo)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(imgPersona, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // PASO 3: Mezclar traje ajustado al cuerpo
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.9;
    dibujarTrajeAjustado(ctx, imgTraje, canvas.width, canvas.height, State.fotoLandmarks);
    ctx.globalAlpha = 1;

    console.log('✅ Fotomontaje simple completado');
}

// Función original mantenida por compatibilidad - ahora redirige a la mejorada
function generarFotomontaje() {
    // Redirige a la versión con BodyPix
    generarFotomontajeMejorado();
}

// ========================================
// EXPERIENCIA DEL TRAJE
// ========================================

function iniciarExperienciaTraje() {
    console.log('👘 Iniciando experiencia del traje');

    const traje = CONFIG.trajes[State.trajeActual];

    // Actualizar información
    $('#nombre-traje').textContent = traje.nombre;
    $('#region-traje').textContent = traje.region;
    $('#anio-traje').textContent = traje.anio;
    $('#traje-actual').textContent = State.trajeActual + 1;

    // Iniciar datos curiosos
    iniciarDatosCuriosos(traje);

    // Asegurar que los hints de gestos estén visibles permanentemente
    $('#gestos-hint').style.opacity = '1';
    showElement('#gestos-hint');
}

function iniciarDatosCuriosos(traje) {
    if (!traje.datosCuriosos || traje.datosCuriosos.length === 0) return;
    
    // Configurar nube flotante e interactiva
    State.nube = {
        x: CONFIG.videoWidth ? CONFIG.videoWidth / 2 - 190 : 200,
        y: 100,
        width: 380,
        height: 120,
        vx: (Math.random() > 0.5 ? 1 : -1) * 1.8,
        vy: (Math.random() > 0.5 ? 1 : -1) * 1.5,
        textIndex: 0,
        timer: 0,
        texts: traje.datosCuriosos,
        active: true
    };
}

// ========================================
// DETECCIÓN DE GESTOS
// ========================================

function detectarGestos(landmarks) {
    if (!landmarks) return;

    // Obtener puntos clave
    const leftWrist = landmarks[15];   // Muñeca izquierda
    const rightWrist = landmarks[16];  // Muñeca derecha
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const nose = landmarks[0];

    if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder || !nose) return;

    // Calcular posiciones relativas
    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const shoulderX = (leftShoulder.x + rightShoulder.x) / 2;

    // Gesto de Salida: APLAUSO (juntar las muñecas)
    if (leftWrist.visibility > 0.4 && rightWrist.visibility > 0.4) {
        const dx = leftWrist.x - rightWrist.x;
        const dy = leftWrist.y - rightWrist.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Si las muñecas están muy juntas
        if (dist < 0.09) {
            console.log("👏 Aplauso detectado (Salir)");
            showGestureIndicator('👏');
            State.gestoCooldown = true;
            
            setTimeout(() => {
                resetearExperiencia();
            }, 1000);
            return;
        }
    }

    // Gesto: Brazo derecho extendido (siguiente traje)
    // En la imagen no reflejada (MediaPipe logic), el brazo derecho físico (16) está hacia la izquierda (x cercano a 0)
    // Así que para alejarlo del cuerpo, debe tener un X MENOR al del hombro derecho.
    const rightArmUp = rightWrist.y < shoulderY;
    const rightArmRight = rightWrist.x < rightShoulder.x - 0.18; // Extendida a la derecha del usuario

    if (rightArmUp && rightArmRight) {
        cambiarTraje('siguiente');
        return;
    }

    // Gesto: Brazo izquierdo extendido (traje anterior)
    // El brazo izquierdo físico (15) está hacia la derecha de la imagen no reflejada (x cercano a 1)
    const leftArmUp = leftWrist.y < shoulderY;
    const leftArmLeft = leftWrist.x > leftShoulder.x + 0.18; // Extendida a la izquierda del usuario

    if (leftArmUp && leftArmLeft) {
        cambiarTraje('anterior');
        return;
    }

    // Gesto: Dos manos arriba (tomar foto)
    const bothArmsUp = leftWrist.y < nose.y && rightWrist.y < nose.y;

    if (bothArmsUp) {
        tomarFotoRecuerdo();
    }
}

async function cambiarTraje(direccion) {
    if (State.gestoCooldown) return;

    State.gestoCooldown = true;

    if (direccion === 'siguiente') {
        State.trajeActual = (State.trajeActual + 1) % CONFIG.trajes.length;
        showGestureIndicator('👉');
    } else {
        State.trajeActual = (State.trajeActual - 1 + CONFIG.trajes.length) % CONFIG.trajes.length;
        showGestureIndicator('👈');
    }

    console.log(`🔄 Cambiando a traje ${State.trajeActual + 1}`);

    // Regenerar fotomontaje con nueva imagen
    showElement('#loading-ia');

    try {
        await generarFotomontajeMejorado();
        hideElement('#loading-ia');
        iniciarExperienciaTraje();
    } catch (error) {
        console.error('❌ Error:', error);
        hideElement('#loading-ia');
        generarFotomontaje();
        iniciarExperienciaTraje();
    }

    // Cooldown de 1.5 segundos
    setTimeout(() => {
        State.gestoCooldown = false;
    }, 1500);
}

// Configuración de Cloudinary (Reemplazar con tus datos)
const CLOUDINARY_CONFIG = {
    cloudName: 'dqvzl4lgp',      // Cloud Name de la cuenta del usuario
    uploadPreset: 'espejo_museo' // Upload preset que el usuario debe crear como Unsigned
};

async function subirFotoCloudinary(dataUrl) {
    if (CLOUDINARY_CONFIG.cloudName === 'TU_CLOUD_NAME') {
        throw new Error('Falta configuración de Cloudinary');
    }

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
    
    // Cloudinary upload requiere FormData
    const formData = new FormData();
    formData.append('file', dataUrl);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Error HTTP al subir la imagen');
    }

    const data = await response.json();
    return data.secure_url;
}

async function tomarFotoRecuerdo() {
    if (State.gestoCooldown) return;

    State.gestoCooldown = true;
    showGestureIndicator('📸');

    console.log('📸 Tomando foto de recuerdo');

    // Crear canvas de recuerdo
    const canvasOriginal = $('#traje-canvas');
    const canvasRecuerdo = $('#canvas-recuerdo');
    const ctx = canvasRecuerdo.getContext('2d');

    // Configurar dimensiones
    canvasRecuerdo.width = 800;
    canvasRecuerdo.height = 1200;

    // Dibujar imagen actual
    ctx.drawImage(canvasOriginal, 0, 0, canvasRecuerdo.width, canvasRecuerdo.height);

    // Añadir marca de agua del museo (caja más grande para el texto nuevo)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(15, canvasRecuerdo.height - 160, canvasRecuerdo.width - 30, 145);

    ctx.fillStyle = '#2c1810';
    ctx.textAlign = 'center';
    
    ctx.font = 'bold 28px Georgia';
    ctx.fillText('El Hilo que Nos Conecta', canvasRecuerdo.width / 2, canvasRecuerdo.height - 120);
    
    ctx.font = 'italic 20px Georgia';
    ctx.fillText('Museo de Trajes de Bogotá', canvasRecuerdo.width / 2, canvasRecuerdo.height - 90);

    ctx.font = '18px Arial';
    ctx.fillText('Conoce y pruébate más trajes en nuestro museo:', canvasRecuerdo.width / 2, canvasRecuerdo.height - 60);
    
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Calle 10 # 6-26, Bogotá', canvasRecuerdo.width / 2, canvasRecuerdo.height - 35);

    // Mostrar modal
    showElement('#modal-foto');

    // Preparar UI del QR
    $('#qr-container').innerHTML = '';
    $('#qr-container').style.display = 'none';
    $('#qr-loading').textContent = '⏳ Subiendo foto para escanear...';
    $('#qr-loading').style.color = '#d4a574';
    showElement('#qr-loading');
    hideElement('#qr-instructions');

    // Intentar subir imagen de forma asíncrona
    try {
        const dataUrl = canvasRecuerdo.toDataURL('image/jpeg', 0.8);
        const imageUrl = await subirFotoCloudinary(dataUrl);

        hideElement('#qr-loading');
        $('#qr-container').style.display = 'block';
        showElement('#qr-instructions');

        // Generar QR
        new QRCode($('#qr-container'), {
            text: imageUrl,
            width: 160,
            height: 160,
            colorDark : "#2c1810",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.L
        });
    } catch (error) {
        console.error('Error generando QR:', error);
        $('#qr-loading').textContent = '⚠️ Falta configurar Cloud Name y Upload Preset en app.js';
        $('#qr-loading').style.color = '#ff4444';
    }

    setTimeout(() => {
        State.gestoCooldown = false;
    }, 2000);
}

function descargarRecuerdo() {
    const canvas = $('#canvas-recuerdo');
    const link = document.createElement('a');
    link.download = `recuerdo-museo-trajes-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// ========================================
// RESETEAR EXPERIENCIA
// ========================================

function resetearExperiencia() {
    console.log('🔄 Reseteando experiencia');

    // Desactivar nube
    if (State.nube) State.nube.active = false;

    // Resetear estado
    State.trajeActual = 0;
    State.trajeSeleccionado = null;
    State.fotoCapturada = null;
    State.contadorActivo = false;
    State.gestoCooldown = false;

    // Volver a fase espejo
    cambiarFase('espejo');

    // Ocultar elementos
    hideElement('#textos-flotantes');
    hideElement('#botones-telas');
    hideElement('#loading-ia');
    hideElement('#modal-foto');

    // Resetear UI
    $('#status-text').textContent = 'Acércate al espejo...';
    $('.pulse').classList.remove('detected');

    console.log('✅ Experiencia reseteada');
}

// ========================================
// UTILIDADES ADICIONALES
// ========================================

// Prevenir zoom en móviles
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
document.addEventListener('gestureend', (e) => e.preventDefault());

// Prevenir scroll
window.addEventListener('scroll', (e) => {
    window.scrollTo(0, 0);
});

// ========================================
// TRACKING VISUAL (MANOS)
// ========================================

function drawHandTracking(landmarks, ctx, width, height) {
    if (!ctx) return;

    const p = (idx) => {
        const lm = landmarks[idx];
        if (!lm || lm.visibility < 0.5) return null;
        return { x: lm.x * width, y: lm.y * height };
    };

    const drawLine = (p1, p2) => {
        if (!p1 || !p2) return;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    };

    const drawPoint = (pt, isWrist = false) => {
        if (!pt) return;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isWrist ? 10 : 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    };

    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillStyle = 'rgba(212, 165, 116, 0.9)'; // Color de la marca del museo
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Obtener puntos principales de los brazos
    const lShoulder = p(11), lElbow = p(13), lWrist = p(15);
    const rShoulder = p(12), rElbow = p(14), rWrist = p(16);

    // Índices de los dedos
    const lPinky = p(17), lIndex = p(19), lThumb = p(21);
    const rPinky = p(18), rIndex = p(20), rThumb = p(22);

    // Dibujar Brazo Izquierdo (Físico)
    drawLine(lShoulder, lElbow); drawLine(lElbow, lWrist);
    drawLine(lWrist, lPinky); drawLine(lWrist, lIndex); drawLine(lWrist, lThumb);
    drawPoint(lShoulder); drawPoint(lElbow); drawPoint(lWrist, true);

    // Dibujar Brazo Derecho (Físico)
    drawLine(rShoulder, rElbow); drawLine(rElbow, rWrist);
    drawLine(rWrist, rPinky); drawLine(rWrist, rIndex); drawLine(rWrist, rThumb);
    drawPoint(rShoulder); drawPoint(rElbow); drawPoint(rWrist, true);

    ctx.restore();
}

function updateAndDrawCloud(landmarks, ctx, width, height) {
    if (!State.nube || !State.nube.active) return;
    const n = State.nube;

    // Actualizar timer rotación texto
    n.timer++;
    if (n.timer > 300) { // ~10s
        n.textIndex = (n.textIndex + 1) % n.texts.length;
        n.timer = 0;
    }

    // Físicas básicas con limitador del canvas
    n.x += n.vx;
    n.y += n.vy;

    if (n.x < 10) { n.x = 10; n.vx *= -1; }
    if (n.x + n.width > width - 10) { n.x = width - n.width - 10; n.vx *= -1; }
    if (n.y < 10) { n.y = 10; n.vy *= -1; }
    // Dejar un margen debajo para no tapar los controles o info abajo
    if (n.y + n.height > height * 0.75) { n.y = height * 0.75 - n.height; n.vy *= -1; }

    // Interacción / Colisión con las manos
    if (landmarks) {
        const wrists = [landmarks[15], landmarks[16]];
        wrists.forEach(w => {
            if (w && w.visibility > 0.4) {
                const wx = w.x * width;
                const wy = w.y * height;
                
                const cnx = n.x + n.width/2;
                const cny = n.y + n.height/2;
                
                const dx = cnx - wx;
                const dy = cny - wy;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 150) { // Empuje
                    n.vx += (dx / dist) * 1.8;
                    n.vy += (dy / dist) * 1.8;
                }
            }
        });
    }

    // Fricción
    const speed = Math.sqrt(n.vx*n.vx + n.vy*n.vy);
    if (speed > 3) {
        n.vx *= 0.95;
        n.vy *= 0.95;
    } else if (speed < 0.6) {
        n.vx *= 1.05;
        n.vy *= 1.05;
    }

    // --- Dibujo Visual de la Nube ---
    ctx.save();
    ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';
    ctx.strokeStyle = 'rgba(212, 165, 116, 0.8)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.roundRect(n.x, n.y, n.width, n.height, 25);
    ctx.fill();
    ctx.stroke();

    // Texto de la Nube
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#d4a574';
    ctx.font = 'italic 18px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☁️ ¿Sabías que?', n.x + n.width/2, n.y + 25);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    
    // Envoltura de texto
    const text = n.texts[n.textIndex];
    const words = text.split(' ');
    let line = '';
    let currentY = n.y + 55;
    const maxWidth = n.width - 40;

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, n.x + n.width/2, currentY);
            line = words[i] + ' ';
            currentY += 22;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, n.x + n.width/2, currentY);

    ctx.restore();
}

console.log('✅ App.js cargado correctamente');
