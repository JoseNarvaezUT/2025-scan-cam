// La ID del elemento HTML donde se mostrará el lector
const lectorId = "reader"; 

// Variable global para mantener la instancia del escáner
let html5QrCode = null;
let escaneando = false;

// Referencias a elementos del DOM
const btnIniciar = document.getElementById('btnIniciar');
const btnDetener = document.getElementById('btnDetener');
const divReader = document.getElementById('reader');
const spanResultado = document.getElementById('resultado');
const spanEstado = document.getElementById('estado');

// Opciones de configuración para el escáner optimizadas para iOS
const config = { 
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    // Configuración para dispositivos iOS
    rememberLastUsedCamera: true,
    // Soporte para múltiples formatos
    formatsToSupport: [
        Html5QrcodeScanType.SCAN_TYPE_CAMERA
    ]
};

/**
 * Función que se ejecuta cuando se escanea un código con éxito.
 * @param {string} decodedText - El contenido decodificado del código.
 * @param {object} decodedResult - Objeto con más detalles del escaneo.
 */
function onScanSuccess(decodedText, decodedResult) {
    // Mostrar el resultado en el elemento HTML
    spanResultado.textContent = decodedText;
    spanEstado.textContent = '✅ Escaneo exitoso';
    spanEstado.style.color = '#4CAF50';
    
    // Opcional: vibración en dispositivos móviles
    if ('vibrate' in navigator) {
        navigator.vibrate(200);
    }

    // Sonido de éxito (opcional)
    console.log(`✅ Código detectado: ${decodedText}`, decodedResult);
    
    // Detener el escaneo automáticamente después de detectar un código
    setTimeout(() => {
        detenerEscaneo();
    }, 1000);
}

/**
 * Función que se ejecuta en caso de error durante el escaneo.
 * @param {string} errorMessage - Mensaje de error.
 */
function onScanFailure(errorMessage) {
    // No mostrar errores continuos, solo en consola para debug
    // console.warn(`Error de escaneo: ${errorMessage}`);
}

/**
 * Inicia el escaneo de códigos QR/Barras
 */
async function iniciarEscaneo() {
    try {
        spanEstado.textContent = '🔄 Iniciando cámara...';
        spanEstado.style.color = '#666';
        btnIniciar.disabled = true;

        // Crear instancia del escáner si no existe
        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode(lectorId);
        }

        // Configuración de la cámara - priorizar cámara trasera en móviles
        const cameraConfig = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            // Importante para iOS: especificar constraints de video
            videoConstraints: {
                facingMode: { ideal: "environment" }, // Cámara trasera
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        // Intentar obtener la cámara trasera
        try {
            const cameras = await Html5Qrcode.getCameras();
            
            if (cameras && cameras.length > 0) {
                // Buscar cámara trasera
                let cameraId = cameras[0].id;
                
                // En iOS, buscar la cámara con 'back' o 'rear' en el label
                for (let camera of cameras) {
                    if (camera.label.toLowerCase().includes('back') || 
                        camera.label.toLowerCase().includes('rear') ||
                        camera.label.toLowerCase().includes('trasera')) {
                        cameraId = camera.id;
                        break;
                    }
                }

                // Iniciar el escáner con la cámara seleccionada
                await html5QrCode.start(
                    cameraId,
                    cameraConfig,
                    onScanSuccess,
                    onScanFailure
                );

                // Actualizar UI
                escaneando = true;
                divReader.style.display = 'block';
                btnIniciar.style.display = 'none';
                btnDetener.style.display = 'inline-block';
                spanResultado.textContent = 'Apunta la cámara al código...';
                spanEstado.textContent = '📷 Cámara activa';
                spanEstado.style.color = '#4CAF50';

            } else {
                throw new Error('No se encontraron cámaras disponibles');
            }

        } catch (err) {
            // Fallback: intentar con facingMode directamente
            console.log('Intentando método alternativo para iOS...');
            await html5QrCode.start(
                { facingMode: "environment" },
                cameraConfig,
                onScanSuccess,
                onScanFailure
            );

            escaneando = true;
            divReader.style.display = 'block';
            btnIniciar.style.display = 'none';
            btnDetener.style.display = 'inline-block';
            spanResultado.textContent = 'Apunta la cámara al código...';
            spanEstado.textContent = '📷 Cámara activa';
            spanEstado.style.color = '#4CAF50';
        }

    } catch (err) {
        console.error('Error al iniciar el escáner:', err);
        spanResultado.textContent = 'Error al acceder a la cámara';
        spanEstado.textContent = '❌ ' + err.message;
        spanEstado.style.color = '#f44336';
        btnIniciar.disabled = false;
        
        // Mensaje específico para iOS
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
            spanEstado.textContent = '❌ Asegúrate de permitir el acceso a la cámara en Configuración > Safari';
        }
    }
}

/**
 * Detiene el escaneo de códigos
 */
async function detenerEscaneo() {
    try {
        if (html5QrCode && escaneando) {
            await html5QrCode.stop();
            escaneando = false;
            
            // Actualizar UI
            divReader.style.display = 'none';
            btnIniciar.style.display = 'inline-block';
            btnIniciar.disabled = false;
            btnDetener.style.display = 'none';
            spanEstado.textContent = '⏸️ Escaneo detenido';
            spanEstado.style.color = '#666';
        }
    } catch (err) {
        console.error('Error al detener el escáner:', err);
    }
}

// Event listeners para los botones
btnIniciar.addEventListener('click', iniciarEscaneo);
btnDetener.addEventListener('click', detenerEscaneo);

// Prevenir zoom en iOS al hacer doble tap
document.addEventListener('dblclick', function(e) {
    e.preventDefault();
}, { passive: false });

// Información del dispositivo en consola para debugging
console.log('User Agent:', navigator.userAgent);
console.log('Plataforma:', navigator.platform);
console.log('Es iOS?', /iPhone|iPad|iPod/.test(navigator.userAgent));