# Saint-Remèze Frontend v7.2.10

## Installation
```bash
npm install
npm start
```

http://localhost:3000

## Historique des versions

### v7.2.10
- Bouton "✏️ Modifier" affiché directement sur la ligne du statut dans le document
- Correction chargement : Cache-Control no-cache sur index.html (Vercel)
- Service worker : CACHE_NAME versionné pour invalidation propre à chaque déploiement

### v7.2.9
- Correction de remarque par le citoyen : bouton "Modifier" sur la page de détail
  - Visible uniquement pour le propriétaire de la remarque
  - Disponible si statut "En attente" ou "Vue"
  - Modal d'édition : titre, catégorie, description
  - Mise à jour immédiate sans rechargement de page

### v7.2.8
- Support 3 photos par signalement
- Refonte visuelle design system Navy/Gold/Beige
- Badge version + modale changelog
- Caméra : remplacement de l'input fichier par getUserMedia (plus de crash mémoire)
- Admin : filtre temporel (Du / Au) sur les exports PDF et CSV

### v7.2.1
- Ajout statut "Vue" pour les signalements consultés par l'admin
- Réinitialisation de mot de passe par email (token sécurisé)
- Support PWA (Progressive Web App) sur iOS et Android
- Notifications citoyens lors des changements de statut

### v7.2.0
- Mise en production PROD (Render + Vercel + MongoDB Atlas)
- Authentification JWT + rôles admin/user
- Upload photos via Cloudinary, géolocalisation GPS
