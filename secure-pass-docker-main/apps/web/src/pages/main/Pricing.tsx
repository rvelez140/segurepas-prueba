import { useEffect, useState } from "react";
import { getAllPlans, Plan } from "../../api/subscription.api";
import Sidebar from "../../components/visits/Sidebar";
import Header from "../../components/visits/Header";
import styles from "../../styles/pricing.module.css";
import { useSidebar } from "../../contexts/SidebarContext";
import { useNavigate } from "react-router-dom";
import { loadToken, setAuthToken } from "../../services/auth.service";

const Pricing = () => {
  const navigate = useNavigate();
  const { isOpen } = useSidebar();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateUser = async () => {
      try {
        const token = loadToken();
        setAuthToken(token);
      } catch (error) {
        navigate("/");
      }
    };

    validateUser();
  }, [navigate]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansData = await getAllPlans();
        setPlans(plansData);
      } catch (error) {
        console.error("Error al cargar planes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getPlanIcon = (index: number) => {
    const icons = ["🔒", "🔐", "🏢"];
    return icons[index] || "📦";
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando planes...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar setShowLogoutModal={() => {}} />

      <div
        className={`${styles.mainContent} ${
          !isOpen ? styles.mainContentFull : ""
        }`}
      >
        <Header />

        <div className={styles.pricingContainer}>
          <div className={styles.pricingHeader}>
            <h1>Planes de Suscripción B2B SaaS</h1>
            <p>Elige el plan que mejor se adapte a las necesidades de tu residencial</p>
          </div>

          <div className={styles.plansGrid}>
            {plans.map((plan, index) => (
              <div key={index} className={styles.planCard}>
                <div className={styles.planIcon}>{getPlanIcon(index)}</div>
                <h2 className={styles.planName}>{plan.name}</h2>
                <p className={styles.planDescription}>{plan.description}</p>

                <div className={styles.planPrice}>
                  {plan.pricing.amount > 0 ? (
                    <>
                      <span className={styles.currency}>$</span>
                      <span className={styles.amount}>{plan.pricing.amount}</span>
                      <span className={styles.period}>/mes</span>
                    </>
                  ) : (
                    <span className={styles.customPrice}>Personalizado</span>
                  )}
                </div>

                <ul className={styles.featuresList}>
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className={styles.featureItem}>
                      <span className={styles.checkIcon}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={
                    index === 1
                      ? styles.planButtonPrimary
                      : styles.planButtonSecondary
                  }
                  onClick={() => {
                    // TODO: Implementar lógica de suscripción
                    console.log(`Seleccionado plan: ${plan.name}`);
                  }}
                >
                  {plan.pricing.amount > 0 ? "Seleccionar Plan" : "Contactar Ventas"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
