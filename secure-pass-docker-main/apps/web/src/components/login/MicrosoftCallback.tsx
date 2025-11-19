import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { saveToken, saveRememberMe, setAuthToken } from "../../services/auth.service";
import { getAuthenticatedUser } from "../../api/auth.api";
import style from "../../styles/visits.module.css";

const MicrosoftCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleMicrosoftCallback = async () => {
      try {
        const token = searchParams.get("token");
        const userStr = searchParams.get("user");

        if (!token || !userStr) {
          throw new Error("No se recibió el token de autenticación");
        }

        // Guardar el token
        setAuthToken(token);
        saveToken(token);
        saveRememberMe("true");

        // Verificar el usuario
        const verifiedUser = await getAuthenticatedUser();

        if (verifiedUser.role === "guardia") {
          throw new Error("El usuario no puede ser guardia");
        }

        // Redirigir al home
        navigate("/home");
      } catch (error: any) {
        console.error("Error en Microsoft callback:", error);
        setError(error.message || "Error al autenticar con Microsoft");
        setIsLoading(false);

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    };

    handleMicrosoftCallback();
  }, [searchParams, navigate]);

  if (isLoading && !error) {
    return (
      <div className={style.loginResidentContainer}>
        <div className={style.loginCard}>
          <h2>SecurePass</h2>
          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            Procesando autenticación con Microsoft...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={style.loginResidentContainer}>
        <div className={style.loginCard}>
          <h2>SecurePass</h2>
          <div className={style.errorMessage} style={{ marginTop: "1rem" }}>
            {error}
          </div>
          <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.9rem" }}>
            Redirigiendo al login...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default MicrosoftCallback;
