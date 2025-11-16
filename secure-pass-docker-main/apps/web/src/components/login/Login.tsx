import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import style from "../../styles/visits.module.css";
import { getAuthenticatedUser, loginUser } from "../../api/auth.api";
import {
  delToken,
  loadRememberMe,
  loadToken,
  saveRememberMe,
  saveToken,
  setAuthToken,
} from "../../services/auth.service";
import ThemeToggle from "../settings/ThemeToggle";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState({
    email: "", // Estado para errores de email
    password: "", // Estado para errrores de contraseña
    credentials: "", // Estado para errores de credenciales
  });
  const [rememberMe, setRememberMe] = useState("false");
  const [pageLoading, setPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Use Effect para verificar si hay un usuario autenticado antes de realizar Login
  useEffect(() => {
    const validateLogedOnUser = async () => {

      const checkRemember = loadRememberMe();
      if (checkRemember && checkRemember === "true") {
        try {
          setAuthToken(loadToken());
          const userLogedOn = await getAuthenticatedUser();
          if (userLogedOn) navigate("/home");
        } catch (error) {
          console.error("Sesión anterior no encontrada o expirada", error);
        } finally {
          setPageLoading(false);
        }
      } else {
        delToken();
        setPageLoading(false);
      }
    };
    validateLogedOnUser();
  }, [navigate]);

  const validateFields = () => {
    let valid = true;
    const newErrors = {
      email: "",
      password: "",
      credentials: "",
    };

    if (!email.trim()) {
      newErrors.email = "El email es requerido";
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "El email introducido no es válido";
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = "La contraseña es requerida";
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRememberMe = () => {
    rememberMe.includes("true")
      ? setRememberMe("false")
      : setRememberMe("true");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!validateFields()) {
      setIsLoading(false);
      return;
    }

    try {
      const { token } = await loginUser({ email, password });

      setAuthToken(token);
      saveRememberMe(rememberMe);
      saveToken(token);

      const verifiedUser = await getAuthenticatedUser();

      if (verifiedUser.role === "guardia")
        throw new Error("Usuario no puede ser un guardia");

      navigate("/home");
    } catch (error: any) {
      // Manejo específico de errores de credenciales
      if (error.message.includes("Credenciales inválidas")) {
        setErrors((prev) => ({
          ...prev,
          credentials: "Email o contraseña incorrectos",
        }));
      } else if (error.message.includes("Usuario no puede ser guardia")) {
        setErrors((prev) => ({
          ...prev,
          credentials: "El usuario no puede ser guardia",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          credentials: "Ocurrió un error al iniciar sesión",
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      ></div>
    );
  } else
    return (
      <div className={`${style.loginResidentContainer} ${style.fadein}`}>
        <div className={style.loginThemeToggle}><ThemeToggle /></div>
        <div className={`${style["loginCard"]}`}>
          <h2>SecurePass</h2>
          <h3>Residentes</h3>
          <form onSubmit={handleSubmit}>
            {errors.email && (
              <div className={style.errorMessage}>{errors.email}</div>
            )}
            <input
              placeholder="Correo Electrónico"
              value={email}
              className={`${style.loginInput}`}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />

            {errors.password && (
              <div className={style.errorMessage}>{errors.password}</div>
            )}
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              className={`${style.loginInput}`}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />

            <div className={style.options}>
              <label>
                <input
                  id="checkbox"
                  type="checkbox"
                  onClick={handleRememberMe}
                />
                Mantener Sesión Iniciada
              </label>
            </div>
            <button type="submit">
              {isLoading ? "CARGANDO..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className={style.divider}>
            <span>o continuar con</span>
          </div>

          <button
            type="button"
            className={style.googleButton}
            onClick={() => {
              const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
              window.location.href = `${backendUrl}/api/auth/google`;
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.8055 10.2292C19.8055 9.55156 19.75 8.86719 19.6319 8.19531H10.2V12.0492H15.6014C15.3773 13.2911 14.6571 14.3898 13.6153 15.0875V17.5867H16.8353C18.7125 15.8328 19.8055 13.2664 19.8055 10.2292Z" fill="#4285F4"/>
              <path d="M10.2 20C12.9 20 15.1714 19.1045 16.8389 17.5867L13.6189 15.0875C12.7403 15.6977 11.6097 16.0438 10.2036 16.0438C7.59474 16.0438 5.38809 14.2734 4.60893 11.9297H1.2793V14.5133C2.96741 17.8656 6.41951 20 10.2 20Z" fill="#34A853"/>
              <path d="M4.60527 11.9297C4.15999 10.6878 4.15999 9.31797 4.60527 8.07605V5.49219H1.27929C-0.160651 8.33792 -0.160651 11.6688 1.27929 14.5145L4.60527 11.9297Z" fill="#FBBC04"/>
              <path d="M10.2 3.95625C11.6819 3.93281 13.1097 4.47656 14.1889 5.48281L17.0286 2.64219C15.0786 0.792188 12.4806 -0.230469 10.2 -0.199219C6.41951 -0.199219 2.96741 1.93438 1.2793 5.49219L4.60527 8.07605C5.38076 5.72656 7.59108 3.95625 10.2 3.95625Z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>

          <button
            type="button"
            className={style.microsoftButton}
            onClick={() => {
              const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
              window.location.href = `${backendUrl}/api/auth/microsoft`;
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0H9.5V9.5H0V0Z" fill="#F25022"/>
              <path d="M10.5 0H20V9.5H10.5V0Z" fill="#7FBA00"/>
              <path d="M0 10.5H9.5V20H0V10.5Z" fill="#00A4EF"/>
              <path d="M10.5 10.5H20V20H10.5V10.5Z" fill="#FFB900"/>
            </svg>
            Continuar con Microsoft
          </button>

          {errors.credentials && (
            <div className={style.credentialsMessage}>{errors.credentials}</div>
          )}
        </div>
      </div>
    );
};

export default Login;
