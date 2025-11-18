import React, { useState } from "react";
import { createWorker } from "tesseract.js";
import styles from "../../styles/imageUpload.module.css";

interface ImageUploadOCRProps {
  onTextExtracted: (text: string, type: "cedula" | "placa") => void;
  type: "cedula" | "placa";
  label: string;
  currentValue?: string;
}

const ImageUploadOCR: React.FC<ImageUploadOCRProps> = ({
  onTextExtracted,
  type,
  label,
  currentValue,
}) => {
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const processImage = async (file: File) => {
    setProcessing(true);
    setProgress(0);

    try {
      // Crear worker de Tesseract
      const worker = await createWorker("spa", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      // Procesar imagen
      const {
        data: { text },
      } = await worker.recognize(file);
      await worker.terminate();

      // Extraer el valor según el tipo
      const extractedValue = extractValue(text, type);

      if (extractedValue) {
        setOcrResult(extractedValue);
        onTextExtracted(extractedValue, type);
      } else {
        setOcrResult("No se pudo detectar el " + (type === "cedula" ? "número de cédula" : "número de placa"));
      }
    } catch (error) {
      console.error("Error procesando imagen:", error);
      setOcrResult("Error procesando la imagen");
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const extractValue = (
    text: string,
    docType: "cedula" | "placa"
  ): string | null => {
    const cleanText = text.replace(/\s+/g, " ").trim().toUpperCase();

    if (docType === "cedula") {
      // Buscar números de 8-11 dígitos
      const cedulaMatches = cleanText.match(/\b\d{8,11}\b/g);
      if (cedulaMatches && cedulaMatches.length > 0) {
        return cedulaMatches.reduce((a, b) => (a.length >= b.length ? a : b));
      }
    }

    if (docType === "placa") {
      // Buscar patrón de placa: 3 letras + 3 dígitos
      const placaMatch = cleanText.match(/\b[A-Z]{3}\s*\d{3}\b/);
      if (placaMatch) {
        return placaMatch[0].replace(/\s+/g, "");
      }
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Procesar con OCR
      processImage(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setOcrResult(null);
    onTextExtracted("", type);
  };

  return (
    <div className={styles.uploadContainer}>
      <label className={styles.label}>{label}</label>

      {!preview ? (
        <div className={styles.uploadArea}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.fileInput}
            id={`upload-${type}`}
          />
          <label htmlFor={`upload-${type}`} className={styles.uploadLabel}>
            <svg
              className={styles.uploadIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>
              Subir foto de {type === "cedula" ? "cédula" : "placa"}
            </span>
            <span className={styles.hint}>
              Click para seleccionar o arrastrar imagen
            </span>
          </label>
        </div>
      ) : (
        <div className={styles.previewContainer}>
          <img src={preview} alt="Preview" className={styles.preview} />
          <button
            type="button"
            onClick={handleRemove}
            className={styles.removeBtn}
          >
            ✕
          </button>
        </div>
      )}

      {processing && (
        <div className={styles.processingContainer}>
          <div className={styles.spinner}></div>
          <span>Procesando imagen... {progress}%</span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {ocrResult && !processing && (
        <div className={styles.resultContainer}>
          <span className={styles.resultLabel}>
            {type === "cedula" ? "Cédula detectada:" : "Placa detectada:"}
          </span>
          <span className={styles.resultValue}>{ocrResult}</span>
        </div>
      )}

      {currentValue && !ocrResult && !processing && (
        <div className={styles.currentValue}>
          <span>Valor actual: {currentValue}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploadOCR;
