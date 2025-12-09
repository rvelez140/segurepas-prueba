// ThemeToggle.tsx
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaSun, FaMoon, FaCog, FaClock, FaDesktop, FaHandPointer } from 'react-icons/fa';
import styles from '../../styles/themeToggle.module.css';

const ThemeToggle = () => {
  const { theme, themePreference, toggleTheme, setThemePreference } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const preferenceLabels = {
    manual: 'Manual',
    auto: 'Automático',
    system: 'Sistema',
  };

  const preferenceIcons = {
    manual: <FaHandPointer />,
    auto: <FaClock />,
    system: <FaDesktop />,
  };

  return (
    <div className={styles.themeToggleContainer}>
      <button
        onClick={toggleTheme}
        className={`${styles.toggleButton} ${theme === 'dark' ? styles.dark : styles.light}`}
        aria-label="Cambiar tema"
      >
        {theme === 'dark' ? <FaSun /> : <FaMoon />}
      </button>

      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`${styles.settingsButton} ${theme === 'dark' ? styles.dark : styles.light}`}
        aria-label="Configuración de tema"
      >
        <FaCog />
      </button>

      {showMenu && (
        <div className={`${styles.menuDropdown} ${theme === 'dark' ? styles.dark : styles.light}`}>
          <div className={styles.menuHeader}>Modo de tema</div>

          <button
            onClick={() => {
              setThemePreference('manual');
              setShowMenu(false);
            }}
            className={`${styles.menuItem} ${themePreference === 'manual' ? styles.active : ''}`}
          >
            <span className={styles.menuIcon}>{preferenceIcons.manual}</span>
            <span>{preferenceLabels.manual}</span>
          </button>

          <button
            onClick={() => {
              setThemePreference('auto');
              setShowMenu(false);
            }}
            className={`${styles.menuItem} ${themePreference === 'auto' ? styles.active : ''}`}
          >
            <span className={styles.menuIcon}>{preferenceIcons.auto}</span>
            <div className={styles.menuItemContent}>
              <span>{preferenceLabels.auto}</span>
              <span className={styles.menuItemDescription}>Cambia según la hora (6AM-6PM)</span>
            </div>
          </button>

          <button
            onClick={() => {
              setThemePreference('system');
              setShowMenu(false);
            }}
            className={`${styles.menuItem} ${themePreference === 'system' ? styles.active : ''}`}
          >
            <span className={styles.menuIcon}>{preferenceIcons.system}</span>
            <div className={styles.menuItemContent}>
              <span>{preferenceLabels.system}</span>
              <span className={styles.menuItemDescription}>Sigue la preferencia del sistema</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
