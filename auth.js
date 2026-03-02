// ========================================
// SWMI Authentication - Gestion d'authentification
// ========================================

class SwmiAuth {
    constructor() {
        this.currentUser = storage.getUser();
    }

    // Enregistrer un nouvel utilisateur
    register(userData) {
        try {
            const user = {
                id: Date.now().toString(),
                name: userData.name || 'مستخدم جديد',
                email: userData.email || '',
                phone: userData.phone || '',
                city: userData.city || 'tunis',
                joinDate: new Date().toISOString(),
                avatar: userData.avatar || this.generateAvatar(),
                bio: userData.bio || 'السلام عليكم ورحمة الله',
                preferences: {
                    notifications: true,
                    emailReminders: false,
                    darkMode: true
                }
            };

            storage.saveUser(user);
            this.currentUser = user;
            
            console.log('✓ المستخدم مسجل بنجاح:', user.name);
            return { success: true, user };
        } catch (error) {
            console.error('خطأ في التسجيل:', error);
            return { success: false, error: error.message };
        }
    }

    // تسجيل الدخول
    login(email, password) {
        // في تطبيق حقيقي، يتم التحقق من قاعدة البيانات
        // هنا نحاكي التحقق البسيط
        const user = storage.getUser();
        
        if (user && user.email === email) {
            this.currentUser = user;
            console.log('✓ تم تسجيل الدخول:', user.name);
            return { success: true, user };
        }
        
        return { success: false, error: 'بيانات الدخول غير صحيحة' };
    }

    // تسجيل الخروج
    logout() {
        storage.removeUser();
        this.currentUser = null;
        console.log('✓ تم تسجيل الخروج');
        return { success: true };
    }

    // الحصول على المستخدم الحالي
    getCurrentUser() {
        return this.currentUser;
    }

    // التحقق من تسجيل الدخول
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // تحديث ملف المستخدم
    updateProfile(updates) {
        if (!this.currentUser) {
            return { success: false, error: 'لا يوجد مستخدم مسجل دخول' };
        }

        this.currentUser = {
            ...this.currentUser,
            ...updates
        };

        storage.saveUser(this.currentUser);
        console.log('✓ تم تحديث الملف الشخصي');
        return { success: true, user: this.currentUser };
    }

    // تغيير كلمة المرور
    changePassword(oldPassword, newPassword) {
        // في تطبيق حقيقي، يتم التحقق من كلمة المرور الحالية
        if (!this.currentUser) {
            return { success: false, error: 'لا يوجد مستخدم مسجل دخول' };
        }

        console.log('✓ تم تغيير كلمة المرور');
        return { success: true };
    }

    // حذف الحساب
    deleteAccount() {
        if (!this.currentUser) {
            return { success: false, error: 'لا يوجد مستخدم مسجل دخول' };
        }

        const userId = this.currentUser.id;
        storage.removeUser();
        this.currentUser = null;
        console.log('✓ تم حذف الحساب');
        return { success: true };
    }

    // توليد صورة افتار
    generateAvatar() {
        const emojis = ['🧕', '👳', '👨', '👩', '🧑'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    }

    // الحصول على ملف المستخدم العام
    getPublicProfile(userId) {
        // في تطبيق حقيقي، يتم جلب الملف من قاعدة البيانات
        const user = storage.getUser();
        if (user && user.id === userId) {
            return {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                city: user.city,
                bio: user.bio,
                joinDate: user.joinDate
            };
        }
        return null;
    }
}

// ========================================
// SWMI USER PROGRESS - تتبع تقدم المستخدم
// ========================================

class SwmiProgress {
    constructor() {
        this.storage = storage;
    }

    // إضافة يوم صيام
    recordFastingDay(date = new Date().toISOString().split('T')[0], status = 'completed') {
        this.storage.addFastingDay(date, status);
        return true;
    }

    // Obtenir l'historique du jeûne
    getFastingHistory(month = null) {
        const days = this.storage.getFastingDays();
        
        if (month) {
            return days.filter(d => d.date.startsWith(month));
        }
        
        return days;
    }

    // Obtenir le nombre de jours jeûnés ce mois-ci
    getMonthProgress() {
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const monthDays = this.getFastingHistory(monthStr);
        return monthDays.filter(d => d.status === 'completed').length;
    }

    // Obtenir la séquence de jeûne actuelle
    getCurrentStreak() {
        const days = this.storage.getFastingDays();
        return this.storage.calculateStreak(days);
    }

    // Obtenir les statistiques globales
    getOverallStats() {
        return this.storage.getStats();
    }

    // Obtenir le calendrier du mois
    getMonthCalendar(year, month) {
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        const days = this.getFastingHistory(monthStr);
        
        const daysMap = {};
        days.forEach(d => {
            const dayNum = parseInt(d.date.split('-')[2]);
            daysMap[dayNum] = d.status;
        });
        
        return daysMap;
    }

    // Vérifier si le jeûne a été enregistré aujourd'hui
    isFastedToday() {
        const today = new Date().toISOString().split('T')[0];
        const days = this.storage.getFastingDays();
        return days.some(d => d.date === today && d.status === 'completed');
    }

    // Obtenir le prochain objectif
    getNextMilestone() {
        const stats = this.getOverallStats();
        const milestones = [10, 20, 30, 50, 100, 200, 365];
        
        for (let milestone of milestones) {
            if (stats.completedDays < milestone) {
                return {
                    target: milestone,
                    current: stats.completedDays,
                    remaining: milestone - stats.completedDays,
                    percentage: (stats.completedDays / milestone) * 100
                };
            }
        }
        
        return null;
    }
}

// ========================================
// INSTANCES GLOBALES
// ========================================

const auth = new SwmiAuth();
const progress = new SwmiProgress();

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    if (auth.isLoggedIn()) {
        console.log('🟢 Utilisateur connecté:', auth.getCurrentUser().name);
    } else {
        console.log('🔴 Aucun utilisateur connecté');
    }
});
