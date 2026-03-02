# 🛠️ Guide du Développeur - Swmi
## Extend & Customize Swmi - صومي

---

## 📚 Table des matières

1. [Architecture Générale](#AABI STUDIO DEVELOP)
2. [Ajouter de Nouvelles Données](#AABI STUDIO DEVELOP)
3. [Créer de Nouvelles Pages](#AABI STUDIO DEVELOP)
4. [Étendre l'Authentification](#AABI STUDIO DEVELOP)
5. [Personnaliser le Thème](#AABI STUDIO DEVELOP)
6. [Debugging & Troubleshooting](#AABI STUDIO DEVELOP)

---

## Architecture Générale

### Classes Principales

#### 1. **SwmiAPI** (api.js)
Gère toutes les données statiques

```javascript
// Instanciation
const api = new SwmiAPI();

// Méthodes disponibles
await api.getData()           // Récupérer toutes les données
await api.getFastingRules()   // Récupérer les règles
await api.getHadiths()        // Récupérer les hadiths
await api.getQuranVerses()    // Récupérer les versets
await api.getPrayerTimes(city) // Horaires prière

// L'application ne contient plus de données statiques :
// - `fetchPrayerTimesFromAPI` interroge Aladhan avec method=3 et timezonestring=Africa/Tunis.
// - Les villes sont listées dans data.json (latitude/longitude pour la requête).
// - En cas d'échec, la fonction renvoie null et l'interface affiche un message d'erreur.
```

#### 2. **SwmiStorage** (api.js)
Gère le stockage local

```javascript
const storage = new SwmiStorage();

// Utilisateurs
storage.saveUser(user)
storage.getUser()
storage.removeUser()

// Jours de jeûne
storage.addFastingDay(date, status)
storage.getFastingDays()

// Dua favoris
storage.addFavoriteDua(dua)
storage.getFavoriteDuas()

// Paramètres
storage.getSettings()
storage.saveSettings(settings)
```

#### 3. **SwmiAuth** (auth.js)
Gère l'authentification

```javascript
const auth = new SwmiAuth();

// Inscription & Connexion
auth.register(userData)
auth.login(email, password)
auth.logout()

// Vérifications
auth.isLoggedIn()
auth.getCurrentUser()
auth.getPublicProfile(userId)
```

#### 4. **SwmiProgress** (auth.js)
Suivi de la progression

```javascript
const progress = new SwmiProgress();

// Enregistrement
progress.recordFastingDay(date, status)

// Statistiques
progress.getOverallStats()
progress.getCurrentStreak()
progress.getMonthProgress()
progress.getNextMilestone()
```

---

## Ajouter de Nouvelles Données

### Étape 1: Modifier data.json

```json
{
  "new_section": [
    {
      "id": 1,
      "title": "Mon Titre",
      "content": "Mon contenu",
      "icon": "💡"
    }
  ]
}
```

### Étape 2: Créer une méthode dans SwmiAPI

```javascript
async getNewSection() {
    const data = await this.getData();
    return data?.new_section || [];
}
```

### Étape 3: Utiliser dans votre page

```javascript
// Charger les données
const items = await api.getNewSection();

// Afficher dans le DOM
items.map(item => {
    console.log(item.title);
});
```

### Exemple Complet: Ajouter une nouvelle sourate

```json
// data.json
"surahs": [
  {
    "id": 1,
    "name": "الفاتحة",
    "verses": 7,
    "category": "مكية"
  }
]

// Code JavaScript
async function loadSurahs() {
    const surahs = await api.getSurahs?.() || [];
    // Afficher...
}
```

---

## Créer de Nouvelles Pages

### Template basique

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ma Page - Swmi | صومي</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <nav class="navbar">
            <div class="nav-container">
                <div class="logo">
                    <i class="fas fa-mosque"></i>
                    <span>Swmi</span>
                </div>
                <ul class="nav-menu">
                    <li><a href="index.html" class="nav-link">الرئيسية</a></li>
                    <li><a href="profile.html" class="nav-link">ملفي</a></li>
                </ul>
                <div class="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>
    </header>

    <!-- Content -->
    <section class="your-section">
        <div class="section-header">
            <h2>عنواني</h2>
        </div>
        <div class="content">
            <!-- Votre contenu -->
        </div>
    </section>

    <!-- Scripts -->
    <script src="api.js"></script>
    <script src="auth.js"></script>
    <script src="script.js"></script>
    <script>
        // Votre code personnalisé
    </script>
</body>
</html>
```

---

## Étendre l'Authentification

### Ajouter des champs utilisateur

```javascript
// Dans auth.js - fonction register()
const user = {
    id: Date.now().toString(),
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    city: userData.city,
    // AJOUTER DE NOUVEAUX CHAMPS
    gender: userData.gender,
    age: userData.age,
    interests: userData.interests,
    // ...
    joinDate: new Date().toISOString(),
    avatar: userData.avatar || this.generateAvatar()
};
```

### Créer un système de rôles

```javascript
// Ajouter dans user
const user = {
    // ...
    role: 'user', // 'user', 'admin', 'moderator'
    permissions: ['read', 'write']
};

// Vérifier les permissions
function hasPermission(permission) {
    const user = auth.getCurrentUser();
    return user?.permissions?.includes(permission);
}
```

### Intégration avec un serveur

```javascript
// Remplacer les localStorage par API calls
async login(email, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
        storage.saveUser(data.user);
        this.currentUser = data.user;
    }
    return data;
}
```

---

## Personnaliser le Thème

### Modifier les couleurs

Dans `styles.css`, éditer les variables CSS:

```css
:root {
    --primary-green: #1a5c4a;    /* Changer ici */
    --secondary-green: #2d8f7c;   /* Ou ici */
    --gold: #d4a574;             /* Ou ici */
    --white: #ffffff;
    --dark-text: #1a1a1a;
}
```

### Créer un système de thème dynamique

```javascript
function setTheme(themeName) {
    const themes = {
        light: {
            '--primary-green': '#1a5c4a',
            '--gold': '#d4a574'
        },
        dark: {
            '--primary-green': '#0d4a3d',
            '--gold': '#b8860b'
        }
    };

    const theme = themes[themeName];
    Object.entries(theme).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
    });

    storage.saveSettings({ theme: themeName });
}
```

### Ajouter les polices personnalisées

```css
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');

body {
    font-family: 'Cairo', 'Segoe UI', sans-serif;
}
```

---

## Debugging & Troubleshooting

### Outils de debugging

```javascript
// Afficher toutes les données en DB
console.log(storage.exportData());

// Afficher l'utilisateur actuel
console.log(auth.getCurrentUser());

// Afficher les paramètres
console.log(storage.getSettings());

// Vérifier si connecté
console.log('Connecté:', auth.isLoggedIn());

// Afficher le cache de l'API
api.loadData().then(() => {
    console.log('Cache:', api.dataCache);
});
```

### Erreurs courantes

#### 1. "data.json not found"
```
Solution: Assurez-vous que data.json est dans le même dossier que index.html
```

#### 2. "localStorage quota exceeded"
```javascript
// Nettoyer les anciennes données
storage.clearAllData();
```

#### 3. "User undefined"
```javascript
// Vérifier si l'utilisateur est connecté
if (!auth.isLoggedIn()) {
    alert('Veuillez d\'abord vous connecter');
    openAuthModal();
}
```

#### 4. "API returns undefined"
```javascript
// Attendre le chargement des données
await api.loadData();
const data = await api.getData();
```

---

## Ajouter des Notifications

```javascript
class SwmiNotifications {
    constructor() {
        this.notifications = [];
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, duration);
    }
}

const notify = new SwmiNotifications();
notify.show('✅ Succès!', 'success');
notify.show('❌ Erreur!', 'error');
notify.show('ℹ️ Info', 'info');
```

---

## Déployer sur un serveur

### Option 1: GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/swmi.git
git push -u origin main
```

Ensuite aller dans Settings > Pages et sélectionner `main` comme source.

### Option 2: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=.
```

### Option 3: Vercel
```bash
npm install -g vercel
vercel
```

---

## Contribuer au projet

1. Fork le repo
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📖 Ressources utiles

- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript.info](https://javascript.info/)
- [W3Schools](https://www.w3schools.com/)
- [CSS-Tricks](https://css-tricks.com/)

---

## 📞 Support

Pour les questions, ouvrir une issue ou contacter: contact@swmi.com

---

© 2026 Swmi Team | Tous droits réservés
