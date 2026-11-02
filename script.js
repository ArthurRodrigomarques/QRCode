const qrForm = document.getElementById("qr-form");
const websiteInput = document.getElementById("website");
const qrContainer = document.getElementById("qrcode-container");
const qrDisplay = document.getElementById("qrcode");
const resolutionSelect = document.getElementById("resolution-select");
const formatSelect = document.getElementById("format-select");

qrForm.addEventListener("submit", function (event) {
    event.preventDefault();
    generateQRCode();
});

function generateQRCode() {
    const websiteValue = websiteInput.value.trim();

    if (!websiteValue) {
        alert("Por favor, insira uma URL ou texto válido.");
        websiteInput.focus();
        return;
    }

    qrDisplay.innerHTML = "";

    new QRCode(qrDisplay, {
        text: websiteValue,
        width: 220,
        height: 220,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    qrContainer.style.display = "flex";
}

function createHighResolutionCanvas(text, resolution) {
    const margin = Math.round(resolution * 0.08);
    const innerSize = resolution - (margin * 2);

    const temporaryContainer = document.createElement("div");
    temporaryContainer.style.position = "absolute";
    temporaryContainer.style.left = "-99999px";
    temporaryContainer.style.top = "-99999px";
    temporaryContainer.style.visibility = "hidden";
    document.body.appendChild(temporaryContainer);

    new QRCode(temporaryContainer, {
        text: text,
        width: innerSize,
        height: innerSize,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    const sourceCanvas = temporaryContainer.querySelector("canvas");
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = resolution;
    outputCanvas.height = resolution;

    const context = outputCanvas.getContext("2d");
    if (!context) {
        document.body.removeChild(temporaryContainer);
        throw new Error("Canvas context initialization failed");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, resolution, resolution);
    context.imageSmoothingEnabled = false;
    context.drawImage(sourceCanvas, margin, margin, innerSize, innerSize);

    document.body.removeChild(temporaryContainer);

    return outputCanvas;
}

function getSanitizedFileName(text, resolution, format) {
    try {
        const parsedUrl = new URL(text.startsWith("http") ? text : `https://${text}`);
        const host = parsedUrl.hostname.replace(/[^a-zA-Z0-9]/g, "-");
        return `qrcode-${host}-${resolution}x${resolution}.${format}`;
    } catch {
        return `qrcode-${resolution}x${resolution}.${format}`;
    }
}

function downloadQRCode() {
    const websiteValue = websiteInput.value.trim();

    if (!websiteValue) {
        alert("Por favor, gere um QR Code primeiro.");
        websiteInput.focus();
        return;
    }

    const selectedResolution = parseInt(resolutionSelect.value, 10) || 1024;
    const selectedFormat = formatSelect.value === "jpeg" ? "jpeg" : "png";
    const mimeType = selectedFormat === "jpeg" ? "image/jpeg" : "image/png";
    const quality = selectedFormat === "jpeg" ? 0.95 : 1.0;

    const highResCanvas = createHighResolutionCanvas(websiteValue, selectedResolution);

    highResCanvas.toBlob(function (blob) {
        if (!blob) {
            return;
        }

        const downloadUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = downloadUrl;
        downloadLink.download = getSanitizedFileName(websiteValue, selectedResolution, selectedFormat);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadUrl);
    }, mimeType, quality);
}
