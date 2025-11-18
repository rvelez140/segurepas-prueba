import React from "react";
import styles from "../../styles/visitForm.module.css";
import { VisitResponse } from "../../types/visit.types";
import ImageUploadOCR from "../common/ImageUploadOCR";

type VisitFormContentProps = {
  formData: {
    name: string;
    email: string;
    document: string;
    reason: string;
    vehiclePlate: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onNameChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onDocumentChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onLastVisitChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  success: boolean;
  loading: boolean;
  lastVisits: VisitResponse[] | null;
  resetError: () => void;
  resetSuccess: () => void;
  onCedulaExtracted: (text: string, type: "cedula" | "placa") => void;
  onPlacaExtracted: (text: string, type: "cedula" | "placa") => void;
};

const VisitFormContent: React.FC<VisitFormContentProps> = ({
  formData,
  onChange,
  onNameChange,
  onDocumentChange,
  onLastVisitChange,
  onSubmit,
  error,
  success,
  loading,
  lastVisits,
  resetError,
  resetSuccess,
  onCedulaExtracted,
  onPlacaExtracted,
}) => {
  const setCustomRequired = (e: React.FormEvent<Element>) => {
    (e.target as HTMLInputElement | HTMLSelectElement).setCustomValidity(
      "Por favor completa este campo"
    );
  };

  const clearCustomValidity = (e: React.FormEvent<Element>) => {
    (e.target as HTMLInputElement | HTMLSelectElement).setCustomValidity("");
  };

  return (
    <>
      <h2 className={styles.title}>Autorizar Visitante</h2>

      {error && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <span className={styles.closeBtn} onClick={resetError}>
            &times;
          </span>
          {error}
        </div>
      )}

      {success && (
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          <span className={styles.closeBtn} onClick={resetSuccess}>
            &times;
          </span>
          ¡Entrada registrada exitosamente! QR generado.
        </div>
      )}

      {lastVisits && lastVisits.length > 0 && (
        <div className={styles.formGroup}>
          <label htmlFor="lastVisit" className={styles.label}>
            Visitante Anterior:
          </label>
          <select
            id="lastVisit"
            name="lastVisit"
            onChange={onLastVisitChange}
            className={styles.select}
          >
            <option value="-1">Seleccione una visita anterior</option>
            {lastVisits.map((v, i) => (
              <option key={i} value={i}>
                {`${v.visit.name} - ${v.visit.document}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <form onSubmit={onSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Nombre Visitante*:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={onNameChange}
            required
            onInvalid={setCustomRequired}
            onInput={clearCustomValidity}
            placeholder="Nombre completo"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email Visitante*:
          </label>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            required
            onInvalid={setCustomRequired}
            onInput={clearCustomValidity}
            placeholder="me@example.com"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="document" className={styles.label}>
            Documento de Identidad*:
          </label>
          <input
            type="text"
            id="document"
            name="document"
            value={formData.document}
            onChange={onDocumentChange}
            required
            onInvalid={setCustomRequired}
            onInput={clearCustomValidity}
            placeholder="Número de documento"
            className={styles.input}
          />
        </div>

        <ImageUploadOCR
          type="cedula"
          label="Foto de Cédula (Opcional - Auto-rellena documento)"
          onTextExtracted={onCedulaExtracted}
          currentValue={formData.document}
        />

        <div className={styles.formGroup}>
          <label htmlFor="vehiclePlate" className={styles.label}>
            Placa del Vehículo (Opcional):
          </label>
          <input
            type="text"
            id="vehiclePlate"
            name="vehiclePlate"
            value={formData.vehiclePlate}
            onChange={onChange}
            placeholder="ABC123"
            className={styles.input}
            maxLength={6}
          />
        </div>

        <ImageUploadOCR
          type="placa"
          label="Foto de Placa (Opcional - Auto-rellena placa)"
          onTextExtracted={onPlacaExtracted}
          currentValue={formData.vehiclePlate}
        />

        <div className={styles.formGroup}>
          <label htmlFor="reason" className={styles.label}>
            Motivo de Visita*:
          </label>
          <select
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={onChange}
            required
            onInvalid={setCustomRequired}
            onInput={clearCustomValidity}
            className={styles.select}
          >
            <option value="">Seleccione un motivo</option>
            <option value="Entrega">Entrega de paquete</option>
            <option value="Visita">Visita familiar</option>
            <option value="Servicio">Servicio técnico</option>
            <option value="Reunión">Reunión</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Procesando...
              </>
            ) : (
              "Solicitar Autorización"
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default VisitFormContent;
