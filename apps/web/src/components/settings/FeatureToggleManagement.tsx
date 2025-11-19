import React, { useEffect, useState } from "react";
import {
  getAllFeatures,
  toggleFeature,
  createFeature,
  deleteFeature,
  updateFeature,
  initializeDefaultFeatures,
  FeatureToggle,
} from "../../api/featureToggle.api";
import styles from "../../styles/featureToggle.module.css";

const FeatureToggleManagement: React.FC = () => {
  const [features, setFeatures] = useState<FeatureToggle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState<FeatureToggle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [formData, setFormData] = useState({
    key: "",
    name: "",
    description: "",
    enabled: false,
    category: "general",
    enabledForRoles: [] as string[],
  });

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const data = await getAllFeatures();
      setFeatures(data);
      setError(null);
    } catch (err: any) {
      setError("Error cargando features: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string) => {
    try {
      await toggleFeature(key);
      await loadFeatures();
    } catch (err: any) {
      setError("Error al cambiar estado de la feature: " + err.message);
    }
  };

  const handleDelete = async (key: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta funcionalidad?")) {
      try {
        await deleteFeature(key);
        await loadFeatures();
      } catch (err: any) {
        setError("Error al eliminar feature: " + err.message);
      }
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFeature) {
        await updateFeature(editingFeature.key, formData);
      } else {
        await createFeature(formData);
      }
      setShowCreateModal(false);
      setEditingFeature(null);
      resetForm();
      await loadFeatures();
    } catch (err: any) {
      setError("Error al guardar feature: " + err.message);
    }
  };

  const handleInitializeDefaults = async () => {
    if (window.confirm("¿Deseas inicializar las funcionalidades por defecto?")) {
      try {
        await initializeDefaultFeatures();
        await loadFeatures();
      } catch (err: any) {
        setError("Error al inicializar features: " + err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      key: "",
      name: "",
      description: "",
      enabled: false,
      category: "general",
      enabledForRoles: [],
    });
  };

  const openEditModal = (feature: FeatureToggle) => {
    setEditingFeature(feature);
    setFormData({
      key: feature.key,
      name: feature.name,
      description: feature.description,
      enabled: feature.enabled,
      category: feature.category || "general",
      enabledForRoles: feature.enabledForRoles || [],
    });
    setShowCreateModal(true);
  };

  const handleRoleToggle = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      enabledForRoles: prev.enabledForRoles.includes(role)
        ? prev.enabledForRoles.filter((r) => r !== role)
        : [...prev.enabledForRoles, role],
    }));
  };

  const categories = ["all", ...Array.from(new Set(features.map((f) => f.category || "general")))];
  const filteredFeatures =
    selectedCategory === "all"
      ? features
      : features.filter((f) => f.category === selectedCategory);

  if (loading) return <div className={styles.loading}>Cargando...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Gestión de Funcionalidades</h2>
        <div className={styles.headerActions}>
          <button
            className={styles.btnSecondary}
            onClick={handleInitializeDefaults}
          >
            Inicializar por Defecto
          </button>
          <button
            className={styles.btnPrimary}
            onClick={() => {
              resetForm();
              setEditingFeature(null);
              setShowCreateModal(true);
            }}
          >
            + Nueva Funcionalidad
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className={styles.filters}>
        <label>Categoría:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={styles.select}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "Todas" : cat}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.featureGrid}>
        {filteredFeatures.map((feature) => (
          <div key={feature.key} className={styles.featureCard}>
            <div className={styles.featureHeader}>
              <h3>{feature.name}</h3>
              <div className={styles.featureActions}>
                <button
                  className={`${styles.toggleBtn} ${
                    feature.enabled ? styles.enabled : styles.disabled
                  }`}
                  onClick={() => handleToggle(feature.key)}
                >
                  {feature.enabled ? "Habilitado" : "Deshabilitado"}
                </button>
              </div>
            </div>

            <p className={styles.description}>{feature.description}</p>

            <div className={styles.metadata}>
              <span className={styles.badge}>{feature.category || "general"}</span>
              <span className={styles.key}>{feature.key}</span>
            </div>

            {feature.enabledForRoles && feature.enabledForRoles.length > 0 && (
              <div className={styles.roles}>
                <strong>Roles:</strong>{" "}
                {feature.enabledForRoles.map((role) => (
                  <span key={role} className={styles.roleBadge}>
                    {role}
                  </span>
                ))}
              </div>
            )}

            <div className={styles.cardActions}>
              <button
                className={styles.btnEdit}
                onClick={() => openEditModal(feature)}
              >
                Editar
              </button>
              <button
                className={styles.btnDelete}
                onClick={() => handleDelete(feature.key)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFeatures.length === 0 && (
        <div className={styles.empty}>
          No hay funcionalidades en esta categoría
        </div>
      )}

      {showCreateModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingFeature ? "Editar Funcionalidad" : "Nueva Funcionalidad"}</h3>
              <button
                className={styles.closeBtn}
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingFeature(null);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdate}>
              <div className={styles.formGroup}>
                <label>Clave (ID único):</label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData({ ...formData, key: e.target.value })
                  }
                  disabled={!!editingFeature}
                  required
                  placeholder="ej: payment_module"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Nombre:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="ej: Módulo de Pagos"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Descripción:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  placeholder="Describe qué hace esta funcionalidad"
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Categoría:</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className={styles.select}
                >
                  <option value="general">General</option>
                  <option value="pagos">Pagos</option>
                  <option value="reportes">Reportes</option>
                  <option value="autorizaciones">Autorizaciones</option>
                  <option value="usuarios">Usuarios</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) =>
                      setFormData({ ...formData, enabled: e.target.checked })
                    }
                  />
                  Habilitado
                </label>
              </div>

              <div className={styles.formGroup}>
                <label>Roles con acceso:</label>
                <div className={styles.rolesCheckboxes}>
                  {["admin", "guardia", "residente"].map((role) => (
                    <label key={role} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.enabledForRoles.includes(role)}
                        onChange={() => handleRoleToggle(role)}
                      />
                      {role}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingFeature(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  {editingFeature ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureToggleManagement;
