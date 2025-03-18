(function (document) {
    // Variables para rastrear el número de pruebas realizadas y si se encontró un formato compatible
    var checkCount = 0,
        formatFound = false;

    // Función para establecer la clase en el elemento <html> dependiendo del soporte de imagen
    function setHTMLClass(height, className) {
        checkCount++; // Incrementa el contador de formatos probados
        
        if (height == 2) {
            // Si la imagen de prueba tiene una altura de 2 píxeles, el formato es soportado
            formatFound = true;
            document.documentElement.className += " " + className; // Agrega la clase correspondiente (ej: "avif", "webp")
        } else {
            // Si la imagen no es soportada, agrega una clase indicando que NO lo es (ej: "notavif", "notwebp")
            document.documentElement.className += " not" + className;
            
            // Si ya se han probado 4 formatos y ninguno fue soportado, intenta verificar soporte de SVG o PNG
            if (checkCount == 4 && !formatFound) {
                if (document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1")) {
                    document.documentElement.className += " svg"; // Si el navegador soporta SVG, añade la clase "svg"
                } else {
                    document.documentElement.className += " notsvg png"; // Si no, asume que solo soporta PNG
                }
            }
        }
    }

    // Prueba de soporte para imágenes JXL (JPEG XL)
    var JXL = new Image();
    JXL.onload = JXL.onerror = function () {
        setHTMLClass(JXL.height, "jxl");
    };
    JXL.src = "data:image/jxl;base64,/woIELASCAgQAFwASxLFgkWAHL0xqnCBCV0qDp901Te/5QM=";

    // Prueba de soporte para imágenes AVIF
    var AVIF = new Image(); // Crea una imagen en memoria
    AVIF.onload = AVIF.onerror = function () {
        setHTMLClass(AVIF.height, "avif");
        /*
        Si la imagen se carga correctamente, significa que el navegador soporta AVIF.
        Si la imagen no se carga, el navegador no lo soporta.
        Se añade la clase correspondiente al <html>:
        - Si el navegador soporta AVIF: Se agrega .avif
        - Si no lo soporta: Se agrega .notavif
        */
    };
    AVIF.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";

    // Prueba de soporte para imágenes WebP
    var WebP = new Image();
    WebP.onload = WebP.onerror = function () {
        setHTMLClass(WebP.height, "webp");
    };
    WebP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";

    // Prueba de soporte para imágenes JPEG 2000 (JP2)
    var JP2 = new Image();
    JP2.onload = JP2.onerror = function () {
    setHTMLClass(JP2.height, "jp2");
    };
    JP2.src = "data:image/jp2;base64,/0//UQAyAAAAAAABAAAAAgAAAAAAAAAAAAAABAAAAAQAAAAAAAAAAAAEBwEBBwEBBwEBBwEB/1IADAAAAAEAAAQEAAH/XAAEQED/ZAAlAAFDcmVhdGVkIGJ5IE9wZW5KUEVHIHZlcnNpb24gMi4wLjD/kAAKAAAAAABYAAH/UwAJAQAABAQAAf9dAAUBQED/UwAJAgAABAQAAf9dAAUCQED/UwAJAwAABAQAAf9dAAUDQED/k8+kEAGvz6QQAa/PpBABr994EAk//9k=";

}) (
    // Permite que el código se ejecute dentro de un sandbox (si existe) o directamente en el `document`
    (window.sandboxApi && window.sandboxApi.parentWindow && window.sandboxApi.parentWindow.document) || document
);