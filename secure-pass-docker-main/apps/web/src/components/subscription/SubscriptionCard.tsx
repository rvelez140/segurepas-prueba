import { useEffect, useState } from "react";
import { Subscription, getSubscription } from "../../api/subscription.api";
import styles from "./SubscriptionCard.module.css";

interface SubscriptionCardProps {
  subscriptionId?: string;
}

const SubscriptionCard = ({ subscriptionId }: SubscriptionCardProps) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!subscriptionId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getSubscription(subscriptionId);
        setSubscription(data);
      } catch (error) {
        console.error("Error al cargar suscripción:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [subscriptionId]);

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.loadingSpinner}>Cargando...</div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className={styles.card}>
        <div className={styles.noSubscription}>
          <h3>Sin suscripción activa</h3>
          <p>No hay una suscripción asociada a este residencial</p>
          <a href="/pricing" className={styles.upgradeButton}>
            Ver Planes
          </a>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: "Activa", className: styles.statusActive },
      trial: { label: "Periodo de prueba", className: styles.statusTrial },
      cancelled: { label: "Cancelada", className: styles.statusCancelled },
      suspended: { label: "Suspendida", className: styles.statusSuspended },
      inactive: { label: "Inactiva", className: styles.statusInactive },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      className: styles.statusDefault,
    };

    return (
      <span className={`${styles.statusBadge} ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getPlanName = (planType: string) => {
    const planNames: Record<string, string> = {
      basico: "Plan Básico 🔒",
      pro: "Plan Pro 🔐",
      enterprise: "Plan Enterprise 🏢",
    };
    return planNames[planType] || planType;
  };

  const usagePercentage =
    (subscription.currentUsage.unitsCount / subscription.limits.maxUnits) * 100;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.planTitle}>
            {getPlanName(subscription.planType)}
          </h3>
          <p className={styles.residentialName}>
            {subscription.residentialName}
          </p>
        </div>
        {getStatusBadge(subscription.status)}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.priceSection}>
          <span className={styles.price}>
            ${subscription.pricing.amount} {subscription.pricing.currency}
          </span>
          <span className={styles.period}>/ {subscription.pricing.billingCycle}</span>
        </div>

        <div className={styles.usageSection}>
          <div className={styles.usageHeader}>
            <span>Uso de viviendas</span>
            <span className={styles.usageCount}>
              {subscription.currentUsage.unitsCount} /{" "}
              {subscription.limits.maxUnits}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${Math.min(usagePercentage, 100)}%`,
                backgroundColor:
                  usagePercentage > 90
                    ? "#ef4444"
                    : usagePercentage > 70
                    ? "#f59e0b"
                    : "#10b981",
              }}
            ></div>
          </div>
        </div>

        <div className={styles.featuresSection}>
          <h4>Características incluidas:</h4>
          <ul className={styles.featuresList}>
            <li className={subscription.limits.advancedReports ? styles.enabled : styles.disabled}>
              {subscription.limits.advancedReports ? "✓" : "✗"} Reportes
              avanzados
            </li>
            <li className={subscription.limits.multipleEntries ? styles.enabled : styles.disabled}>
              {subscription.limits.multipleEntries ? "✓" : "✗"} Múltiples
              entradas
            </li>
            <li className={subscription.limits.apiAccess ? styles.enabled : styles.disabled}>
              {subscription.limits.apiAccess ? "✓" : "✗"} Acceso a API
            </li>
            <li className={subscription.limits.whiteLabel ? styles.enabled : styles.disabled}>
              {subscription.limits.whiteLabel ? "✓" : "✗"} Marca blanca
            </li>
          </ul>
        </div>

        {subscription.paymentInfo?.nextPaymentDate && (
          <div className={styles.paymentInfo}>
            <p>
              Próximo pago:{" "}
              {new Date(subscription.paymentInfo.nextPaymentDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {subscription.trialEndDate && subscription.status === "trial" && (
          <div className={styles.trialInfo}>
            <p>
              Periodo de prueba hasta:{" "}
              {new Date(subscription.trialEndDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        <a href="/pricing" className={styles.upgradeButton}>
          Mejorar Plan
        </a>
      </div>
    </div>
  );
};

export default SubscriptionCard;
