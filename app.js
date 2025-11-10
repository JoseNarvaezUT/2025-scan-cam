// La ID del elemento HTML donde se mostrará el lector
const lectorId = "reader"; 
// Opciones de configuración para el escáner
const config = { 
    fps: 10,                 // Frames por segundo para el escaneo
    qrbox: { width: 250, height: 250 }, // Tamaño del área de escaneo (QR box)
    // Es preferible la cámara trasera en móviles para mejor enfoque
    supportedScanTypes: [Html5QrcodeSupportedScanTypes.SCAN_TYPE_CAMERA] 
};

// Crear una instancia del objeto Html5QrcodeScanner
const html5QrCodeScanner = new Html5QrcodeScanner(
    lectorId,
    config,
    /* verbose= */ false
);

/**
 * Función que se ejecuta cuando se escanea un código con éxito.
 * @param {string} decodedText - El contenido decodificado del código.
 * @param {object} decodedResult - Objeto con más detalles del escaneo.
 */
function onScanSuccess(decodedText, decodedResult) {
    // 1. Detener el escaneo una vez que se detecta el primer código
    html5QrCodeScanner.clear(); 
    
    // 2. Mostrar el resultado en el elemento HTML
    document.getElementById('resultado').textContent = decodedText;
    
    // Opcional: mostrar una alerta con el resultado
    alert(`Código Escaneado: ${decodedText}`);

    console.log(`Código detectado: ${decodedText}`, decodedResult);
}

/**
 * Función que se ejecuta en caso de error durante el escaneo.
 * @param {string} errorMessage - Mensaje de error.
 */
function onScanFailure(errorMessage) {
    // Puedes dejarlo vacío o mostrar un mensaje de depuración
    // console.warn(`Error de escaneo: ${errorMessage}`);
}

// Iniciar el escáner de la cámara
html5QrCodeScanner.render(onScanSuccess, onScanFailure);