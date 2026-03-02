// ========================================
// SWMI API - Gestion des données et API
// ========================================

class SwmiAPI {
    constructor() {
        this.baseURL = './';
        this.dataCache = null;
        this.init();
    }

    async init() {
        await this.loadData();
    }

    // Charger les données depuis data.json
    async loadData() {
        try {
            const response = await fetch('./data.json');
            if (!response.ok) throw new Error('Failed to load data');
            this.dataCache = await response.json();
            console.log('✓ Données chargées avec succès');
            return this.dataCache;
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            return null;
        }
    }

    // Récupérer toutes les données
    async getData() {
        if (!this.dataCache) {
            await this.loadData();
        }
        return this.dataCache;
    }

    // Récupérer les règles du jeûne
    async getFastingRules() {
        const data = await this.getData();
        return data?.fasting_rules || [];
    }

    // Récupérer un hadith par ID
    async getHadith(id) {
        const data = await this.getData();
        return data?.hadiths?.find(h => h.id === id) || null;
    }

    // Récupérer tous les hadiths
    async getAllHadiths() {
        const data = await this.getData();
        return data?.hadiths || [];
    }

    // Récupérer les villes
    async getCities() {
        const data = await this.getData();
        return data?.cities || [];
    }

    // Récupérer les horaires de prière pour une ville
    async getPrayerTimes(cityId) {
        const data = await this.getData();
        return data?.prayer_times?.[cityId] || null;
    }

    // Récupérer les horaires de prière en utilisant l'API Aladhan (plus précis)
    // retourne un objet { fajr, dhuhr, asr, maghrib, isha }
    async fetchPrayerTimesFromAPI(cityId) {
        const city = await this.getCities().then(cities => cities.find(c => c.id === cityId));
        if (!city) return null;
        
        const { lat, lng } = city;
        const timestamp = Math.floor(Date.now() / 1000);
        // Use method 3 (Muslim World League) and Tunisia timezone
        const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=3&timezonestring=Africa/Tunis`;

        try {
            const resp = await fetch(url);
            const result = await resp.json();
            if (result.code === 200 && result.data && result.data.timings) {
                const t = result.data.timings;
                // formater hh:mm
                return {
                    fajr: t.Fajr,
                    dhuhr: t.Dhuhr,
                    asr: t.Asr,
                    maghrib: t.Maghrib,
                    isha: t.Isha
                };
            }
        } catch (err) {
            console.error('Erreur API prière:', err);
        }
        return null;
    }

    // Récupérer tous les adhkar
    async getAllAdhkar() {
        const data = await this.getData();
        return data?.adhkar || [];
    }

    // Récupérer les versets coraniques
    async getQuranVerses() {
        const data = await this.getData();
        return data?.quran_verses || [];
    }

    // Récupérer les FAQs
    async getFAQs() {
        const data = await this.getData();
        return data?.faqs || [];
    }

    // Récupérer les conseils santé
    async getHealthTips() {
        const data = await this.getData();
        return data?.health_tips || [];
    }
}

// ========================================
// SWMI LOCAL STORAGE - Gestion du stockage
// ========================================

class SwmiStorage {
    constructor() {
        this.prefix = 'swmi_';
    }

    // Sauvegarder les données utilisateur
    saveUser(user) {
        localStorage.setItem(this.prefix + 'user', JSON.stringify(user));
        return true;
    }

    // Récupérer l'utilisateur actuel
    getUser() {
        const user = localStorage.getItem(this.prefix + 'user');
        return user ? JSON.parse(user) : null;
    }

    // Supprimer l'utilisateur (déconnexion)
    removeUser() {
        localStorage.removeItem(this.prefix + 'user');
        return true;
    }

    // Sauvegarder l'historique du jeûne
    saveFastingDays(days) {
        localStorage.setItem(this.prefix + 'fasting_days', JSON.stringify(days));
        return true;
    }

    // Récupérer l'historique du jeûne
    getFastingDays() {
        const days = localStorage.getItem(this.prefix + 'fasting_days');
        return days ? JSON.parse(days) : [];
    }

    // Ajouter un jour de jeûne
    addFastingDay(date, status = 'completed') {
        const days = this.getFastingDays();
        const existingDay = days.find(d => d.date === date);
        
        if (existingDay) {
            existingDay.status = status;
        } else {
            days.push({ date, status, timestamp: Date.now() });
        }
        
        this.saveFastingDays(days);
        return true;
    }

    // Sauvegarder les dua/adhkar favoris
    saveFavoriteDuas(duas) {
        localStorage.setItem(this.prefix + 'favorite_duas', JSON.stringify(duas));
        return true;
    }

    // Récupérer les dua/adhkar favoris
    getFavoriteDuas() {
        const duas = localStorage.getItem(this.prefix + 'favorite_duas');
        return duas ? JSON.parse(duas) : [];
    }

    // Ajouter un dua aux favoris
    addFavoriteDua(dua) {
        const duas = this.getFavoriteDuas();
        if (!duas.find(d => d.id === dua.id)) {
            duas.push(dua);
            this.saveFavoriteDuas(duas);
        }
        return true;
    }

    // Supprimer un dua des favoris
    removeFavoriteDua(duaId) {
        let duas = this.getFavoriteDuas();
        duas = duas.filter(d => d.id !== duaId);
        this.saveFavoriteDuas(duas);
        return true;
    }

    // Sauvegarder les paramètres utilisateur
    saveSettings(settings) {
        localStorage.setItem(this.prefix + 'settings', JSON.stringify(settings));
        return true;
    }

    // Récupérer les paramètres
    getSettings() {
        const settings = localStorage.getItem(this.prefix + 'settings');
        return settings ? JSON.parse(settings) : {
            city: 'tunis',
            theme: 'dark',
            notifications: true,
            language: 'ar'
        };
    }

    // Sauvegarder le compteur de tasbeeh
    saveTasbeehCount(count) {
        localStorage.setItem(this.prefix + 'tasbeeh_count', count);
        return true;
    }

    // Récupérer le compteur de tasbeeh
    getTasbeehCount() {
        return parseInt(localStorage.getItem(this.prefix + 'tasbeeh_count') || '0');
    }

    // Réinitialiser le compteur de tasbeeh
    resetTasbeehCount() {
        localStorage.removeItem(this.prefix + 'tasbeeh_count');
        return true;
    }

    // Obtenir les statistiques globales
    getStats() {
        const user = this.getUser();
        const fastingDays = this.getFastingDays();
        const completedDays = fastingDays.filter(d => d.status === 'completed').length;
        
        return {
            username: user?.name || 'زائر',
            totalFastingDays: fastingDays.length,
            completedDays: completedDays,
            joinDate: user?.joinDate || new Date().toISOString(),
            streak: this.calculateStreak(fastingDays)
        };
    }

    // Calculer la séquence de jeûne
    calculateStreak(fastingDays) {
        if (fastingDays.length === 0) return 0;
        
        const sorted = [...fastingDays].sort((a, b) => new Date(b.date) - new Date(a.date));
        let streak = 0;
        let currentDate = new Date();
        
        for (let day of sorted) {
            const dayDate = new Date(day.date);
            const diffDays = Math.floor((currentDate - dayDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays <= streak + 1 && day.status === 'completed') {
                streak++;
                currentDate = dayDate;
            } else {
                break;
            }
        }
        
        return streak;
    }

    // Exporter les données utilisateur
    exportData() {
        return {
            user: this.getUser(),
            fastingDays: this.getFastingDays(),
            favoriteDuas: this.getFavoriteDuas(),
            settings: this.getSettings(),
            stats: this.getStats()
        };
    }

    // Importer les données (pour sauvegarde/restauration)
    importData(data) {
        if (data.user) this.saveUser(data.user);
        if (data.fastingDays) this.saveFastingDays(data.fastingDays);
        if (data.favoriteDuas) this.saveFavoriteDuas(data.favoriteDuas);
        if (data.settings) this.saveSettings(data.settings);
        return true;
    }

    // Effacer toutes les données
    clearAllData() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
        return true;
    }
}

// ========================================
// INSTANCES GLOBALES
// ========================================

const api = new SwmiAPI();
const storage = new SwmiStorage();

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌙 Swmi API ready - صومي جاهزة');
});
