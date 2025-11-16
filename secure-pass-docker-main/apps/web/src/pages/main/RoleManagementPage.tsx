import React, { useEffect, useState } from "react";
import Sidebar from "../../components/visits/Sidebar";
import Header from "../../components/visits/Header";
import styles from "../../styles/visits.module.css";
import { useSidebar } from "../../contexts/SidebarContext";
import { useNavigate } from "react-router-dom";
import {
  delRememberMe,
  delToken,
  loadToken,
  setAuthToken,
} from "../../services/auth.service";
import { LogoutModal } from "../../components/login/LogoutModal";
import { getAuthenticatedUser } from "../../api/auth.api";
import { User } from "../../types/user.types";
import { RoleManagement } from "../../components/roles/RoleManagement";

const RoleManagementPage: React.FC = () => {
  const { isOpen } = useSidebar();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const validateUser = async () => {
      try {
        const token = loadToken();
        setAuthToken(token);
        const authenticatedUser = await getAuthenticatedUser();
        setUser(authenticatedUser);

        // Solo admin puede acceder a gestión de roles
        if (authenticatedUser.role !== "admin") {
          navigate("/home");
        }
      } catch (error) {
        navigate("/");
      }
    };

    validateUser();
  }, [navigate]);

  const handleLogout = () => {
    navigate("/");
    delToken();
    delRememberMe();
    setShowLogoutModal(false);
  };

  return (
    user && (
      <div className={styles.dashboardContainer}>
        <Sidebar />
        <div
          className={`${styles.mainContent} ${
            isOpen ? styles.sidebarOpen : styles.sidebarClosed
          }`}
        >
          <Header
            title="Gestión de Roles"
            onLogout={() => setShowLogoutModal(true)}
          />

          <div className={styles.content}>
            <RoleManagement />
          </div>

          {showLogoutModal && (
            <LogoutModal
              onConfirm={handleLogout}
              onCancel={() => setShowLogoutModal(false)}
            />
          )}
        </div>
      </div>
    )
  );
};

export default RoleManagementPage;
