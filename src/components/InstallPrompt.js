import React, { useState, useEffect } from 'react';
import './InstallPrompt.css';

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Ne pas afficher si l'app est déjà installée (mode standalone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    // Ne pas réafficher si déjà fermé dans cette session
    if (sessionStorage.getItem('pwa-install-dismissed')) return;

    // Détection iOS (iPhone / iPad / iPod)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (ios) {
      setIsIos(true);
      setShowBanner(true);
      return;
    }

    // Cas 1 : l'événement a déjà été capturé dans index.html avant le montage React
    if (window.__pwaInstallPrompt) {
      setDeferredPrompt(window.__pwaInstallPrompt);
      setShowBanner(true);
      return;
    }

    // Cas 2 : l'événement arrive après le montage (via l'événement custom)
    const onReady = () => {
      if (window.__pwaInstallPrompt) {
        setDeferredPrompt(window.__pwaInstallPrompt);
        setShowBanner(true);
      }
    };
    window.addEventListener('pwaInstallReady', onReady);
    return () => window.removeEventListener('pwaInstallReady', onReady);
  }, []);

  const handleInstall = async () => {
    if (isIos) {
      setShowIosModal(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    window.__pwaInstallPrompt = null;
    setShowBanner(false);
    if (outcome === 'accepted') {
      sessionStorage.setItem('pwa-install-dismissed', '1');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa-install-dismissed', '1');
  };

  const handleIosDone = () => {
    setShowIosModal(false);
    setShowBanner(false);
    sessionStorage.setItem('pwa-install-dismissed', '1');
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="install-banner">
        <span className="install-banner-icon">📲</span>
        <span className="install-banner-text">Installer l'application</span>
        <button className="install-banner-btn" onClick={handleInstall}>
          Installer
        </button>
        <button className="install-banner-close" onClick={handleDismiss} aria-label="Fermer">
          ✕
        </button>
      </div>

      {showIosModal && (
        <div className="ios-install-overlay" onClick={handleIosDone}>
          <div className="ios-install-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Installer sur iPhone / iPad</h3>
            <ol className="ios-install-steps">
              <li>
                Ouvrez cette page dans <strong>Safari</strong>
              </li>
              <li>
                Appuyez sur l'icône <strong>Partager</strong>{' '}
                <span className="ios-share-icon">⬆</span> en bas de l'écran
              </li>
              <li>
                Faites défiler et appuyez sur{' '}
                <strong>« Sur l'écran d'accueil »</strong>
              </li>
              <li>
                Confirmez en appuyant sur <strong>Ajouter</strong>
              </li>
            </ol>
            <button className="ios-install-done" onClick={handleIosDone}>
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default InstallPrompt;
