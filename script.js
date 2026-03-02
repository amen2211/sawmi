// ========================================
// SWMI - صومي | Interactive Features
// JavaScript Functionality
// ========================================

// ===== MOBILE PHONE ACTIONS =====
const whatsappBtn = document.getElementById('whatsapp-btn');
const callBtn = document.getElementById('call-btn');
const shareBtn = document.getElementById('share-btn');
const emailBtn = document.getElementById('email-btn');

// WhatsApp Share
if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
        const message = encodeURIComponent('🌙 مرحباً! اكتشفت منصة Swmi - صومي\nمنصتك الشاملة للصيام والارتقاء الروحي\n\nاستكشف الآن: Swmi.com\n\n✨ أحكام الصيام | 📖 القرآن | 🤲 الأذكار | ⏱️ عداد الإفطار');
        window.open(`https://wa.me/+21628195859?text=${message}`, '_blank');
    });
}

// Call Button
if (callBtn) {
    callBtn.addEventListener('click', () => {
        window.location.href = 'tel:+21679727323';
    });
}

// Share Button
if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Swmi - صومي',
                    text: 'منصتك الشاملة للصيام والارتقاء الروحي',
                    url: window.location.href
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('تم نسخ الرابط! يمكنك مشاركته الآن');
            });
        }
    });
}

// Email Button
if (emailBtn) {
    emailBtn.addEventListener('click', () => {
        window.location.href = 'mailto:ameub57m@gmail.com?subject=استفسار عن Swmi - صومي&body=السلام عليكم ورحمة الله وبركاته';
    });
}

// ===== NAVIGATION =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== CITY AND PRAYER TIMES DATA =====
// Static default times as fallback (gets overridden by API)
// Updated for March 2, 2026 - Accurate times
let cities = {
    tunis: { name: 'تونس', fajr: '05:21', dhuhr: '12:29', asr: '15:43', maghrib: '18:13', isha: '19:37' },
    sfax: { name: 'صفاقس', fajr: '05:18', dhuhr: '12:24', asr: '15:38', maghrib: '18:08', isha: '19:32' },
    sousse: { name: 'سوسة', fajr: '05:19', dhuhr: '12:27', asr: '15:41', maghrib: '18:11', isha: '19:35' },
    djerba: { name: 'جربة', fajr: '05:12', dhuhr: '12:19', asr: '15:33', maghrib: '18:03', isha: '19:27' },
    kairouan: { name: 'القيروان', fajr: '05:24', dhuhr: '12:31', asr: '15:45', maghrib: '18:15', isha: '19:39' },
    bizerte: { name: 'بنزرت', fajr: '05:23', dhuhr: '12:31', asr: '15:45', maghrib: '18:15', isha: '19:39' },
    kasserine: { name: 'القصرين', fajr: '05:27', dhuhr: '12:34', asr: '15:48', maghrib: '18:18', isha: '19:42' },
    gafsa: { name: 'قفصة', fajr: '05:29', dhuhr: '12:36', asr: '15:50', maghrib: '18:20', isha: '19:44' },
    monastir: { name: 'المنستير', fajr: '05:20', dhuhr: '12:28', asr: '15:42', maghrib: '18:12', isha: '19:36' },
    hammamet: { name: 'الحمامات', fajr: '05:22', dhuhr: '12:30', asr: '15:44', maghrib: '18:14', isha: '19:38' }
};

// ===== IFTAR COUNTDOWN =====
const citySelect = document.getElementById('city-select');
let currentCity = null;
let countdownInterval = null;

if (citySelect) {
    citySelect.addEventListener('change', async (e) => {
        currentCity = e.target.value;
        if (currentCity) {
            await updatePrayerTimes(true);
            startCountdown();
        }
    });
}

async function updatePrayerTimes(useApi = true) {
    if (!currentCity || !cities[currentCity]) return;

    clearPrayerError();

    const city = cities[currentCity];
    document.getElementById('countdown-city').textContent = `أوقات الصلاة في ${city.name}`;

    // Display static times immediately
    document.getElementById('fajr-time').textContent = city.fajr;
    document.getElementById('dhuhr-time').textContent = city.dhuhr;
    document.getElementById('asr-time').textContent = city.asr;
    document.getElementById('maghrib-time').textContent = city.maghrib;
    document.getElementById('isha-time').textContent = city.isha;

    // Try to update from API
    if (useApi) {
        try {
            const apiTimes = await api.fetchPrayerTimesFromAPI(currentCity);
            if (apiTimes) {
                // Update with API times
                document.getElementById('fajr-time').textContent = apiTimes.fajr;
                document.getElementById('dhuhr-time').textContent = apiTimes.dhuhr;
                document.getElementById('asr-time').textContent = apiTimes.asr;
                document.getElementById('maghrib-time').textContent = apiTimes.maghrib;
                document.getElementById('isha-time').textContent = apiTimes.isha;

                // Update local cache for countdown
                cities[currentCity] = { ...city, ...apiTimes };

                // highlight current prayer
                highlightCurrentPrayer();
                if (!window._highlightInterval) {
                    window._highlightInterval = setInterval(highlightCurrentPrayer, 60 * 1000);
                }
            }
        } catch (err) {
            console.error('Prayer API error:', err);
            // Keep static times, no error message
        }
    }
}

function startCountdown() {
    if (!currentCity || !cities[currentCity] || !cities[currentCity].maghrib) return;

    if (countdownInterval) clearInterval(countdownInterval);

    const updateTimer = () => {
        const now = new Date();
        const maghribTime = cities[currentCity].maghrib;

        const [maghribHour, maghribMin] = maghribTime.split(':').map(Number);
        let maghribDate = new Date();
        maghribDate.setHours(maghribHour, maghribMin, 0);

        if (maghribDate < now) {
            maghribDate.setDate(maghribDate.getDate() + 1);
        }

        const diff = maghribDate - now;

        if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            document.getElementById('countdown-hours').textContent = 
                String(hours).padStart(2, '0');
            document.getElementById('countdown-minutes').textContent = 
                String(minutes).padStart(2, '0');
            document.getElementById('countdown-seconds').textContent = 
                String(seconds).padStart(2, '0');
        } else {
            document.getElementById('countdown-hours').textContent = '00';
            document.getElementById('countdown-minutes').textContent = '00';
            document.getElementById('countdown-seconds').textContent = '00';
        }
        // refresh prayer highlight continuously
        highlightCurrentPrayer();
    };

    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

// ===== ERROR / UTILITY HELPERS =====

function showPrayerError(msg) {
    const err = document.getElementById('prayer-error');
    if (err) {
        err.textContent = msg;
        err.style.display = 'block';
    }
    const table = document.getElementById('prayer-table');
    if (table) table.style.display = 'none';
}

function clearPrayerError() {
    const err = document.getElementById('prayer-error');
    if (err) {
        err.style.display = 'none';
    }
    const table = document.getElementById('prayer-table');
    if (table) table.style.display = '';
}

// ===== ADHKAR TABS =====
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// ===== TASBEEH COUNTER =====
let counter = 0;
const counterDisplay = document.getElementById('counter');

function incrementCounter() {
    counter++;
    if (counterDisplay) {
        counterDisplay.textContent = counter;
        counterDisplay.parentElement.style.animation = 'none';
        setTimeout(() => {
            counterDisplay.parentElement.style.animation = 'pulse 0.5s ease';
        }, 10);
    }
}

function resetCounter() {
    counter = 0;
    if (counterDisplay) {
        counterDisplay.textContent = '0';
    }
}

function changePhrase(phrase) {
    const phraseElement = document.getElementById('tasbeeh-phrase');
    if (phraseElement) {
        phraseElement.textContent = phrase;
    }
}

// ===== FAQ ACCORDION =====
const faqHeaders = document.querySelectorAll('.faq-header');

faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const faqItem = header.parentElement;
        const isActive = faqItem.classList.contains('active');

        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });

        // Open clicked item if it wasn't active
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// ===== DAILY CONTENT =====
const dailyVerses = [
    {
        text: "قُلْ يَا عِبَادِ الَّذِينَ آمَنُوا اتَّقُوا رَبَّكُمْ ۚ لِلَّذِينَ أَحْسَنُوا فِي هَٰذِهِ الدُّنْيَا حَسَنَةٌ",
        source: "سورة الزمر"
    },
    {
        text: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
        source: "سورة الأنفال"
    },
    {
        text: "وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ",
        source: "سورة البقرة"
    },
    {
        text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
        source: "سورة الشرح"
    },
    {
        text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
        source: "سورة الطلاق"
    }
];

const dailyHadiths = [
    {
        text: "الراحمون يرحمهم الرحمن، تحننوا على أهل الأرض يحنن عليكم من في السماء",
        source: "رواه الترمذي"
    },
    {
        text: "من صام رمضان إيماناً واحتساباً غفر له ما تقدم من ذنبه",
        source: "رواه البخاري ومسلم"
    },
    {
        text: "الصيام جنة، فإذا كان يوم صوم أحدكم فلا يرفث ولا يصخب",
        source: "رواه البخاري"
    },
    {
        text: "للصائم فرحتان: فرحة عند إفطاره، وفرحة عند لقاء ربه",
        source: "رواه البخاري"
    }
];

const dailyTips = [
    "احذر من هدر الوقت في رمضان على ما لا ينفع، واستثمر هذا الشهر الكريم في طاعة الله وقراءة القرآن والدعاء.",
    "احرص على الإمساك عن السخط والغضب والكلام البذيء، فالصيام ليس عن الطعام والشراب فقط.",
    "استغل أوقات الفراغ في رمضان بذكر الله تعالى والدعاء, فهي أنفس اللحظات.",
    "عامل والديك وجيرانك بلطف وحنان، وتذكر أن رمضان شهر الرحمة والمحبة.",
    "لا تبالغ في الأكل عند الإفطار, بل تناول باعتدال لتحافظ على صحتك."
];

const dailyTafseers = [
    "التقوى: هي امتثال أوامر الله واجتناب نواهيه، والصيام مدرسة للتقوى لأنه يعلم الإنسان ضبط نفسه وشهواته.",
    "الصبر: هو احتمال المشقة والتحمل بصبر، وللصيام أثر عظيم في تدريب النفس على الصبر والتحمل.",
    "الرحمة: يُعلم الصيام الإنسان الشعور بجوع الفقراء، فيزيد من رحمته بهم وإحسانه.",
    "النية: أساس كل عمل، والصيام بدون نية صحيحة لا يثمر الثمار المرجوة.",
    "العلم الشرعي: يجب على الصائم أن يتعلم أحكام الصيام ليصومه على الوجه الصحيح."
];

function updateDailyContent() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

    // Rotate content based on day
    const verseIndex = dayOfYear % dailyVerses.length;
    const hadithIndex = dayOfYear % dailyHadiths.length;
    const tipIndex = dayOfYear % dailyTips.length;
    const tafseerIndex = dayOfYear % dailyTafseers.length;

    const verseElement = document.getElementById('daily-verse');
    const verseSourceElement = document.getElementById('verse-source');
    if (verseElement && verseSourceElement) {
        verseElement.textContent = dailyVerses[verseIndex].text;
        verseSourceElement.textContent = dailyVerses[verseIndex].source;
    }

    const hadithElement = document.getElementById('daily-hadith');
    const hadithSourceElement = document.getElementById('hadith-source');
    if (hadithElement && hadithSourceElement) {
        hadithElement.textContent = dailyHadiths[hadithIndex].text;
        hadithSourceElement.textContent = dailyHadiths[hadithIndex].source;
    }

    const tipElement = document.getElementById('daily-tip');
    if (tipElement) {
        tipElement.textContent = dailyTips[tipIndex];
    }

    const tafseerElement = document.getElementById('daily-tafsir');
    if (tafseerElement) {
        tafseerElement.textContent = dailyTafseers[tafseerIndex];
    }
}

// Update daily content when page loads
updateDailyContent();

// ===== COPY TO CLIPBOARD =====
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('تم نسخ الدعاء بنجاح! ✓');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// ===== CAROUSEL =====
let currentCarouselSlide = 0;
const carouselSlides = document.querySelectorAll('.carousel-slide');

function showCarouselSlide() {
    carouselSlides.forEach((slide, index) => {
        slide.style.display = index === currentCarouselSlide ? 'block' : 'none';
    });
}

function nextCarouselSlide() {
    currentCarouselSlide = (currentCarouselSlide + 1) % carouselSlides.length;
    showCarouselSlide();
}

// Auto-rotate carousel every 5 seconds
if (carouselSlides.length > 0) {
    showCarouselSlide();
    setInterval(nextCarouselSlide, 5000);
}

// ===== CONTACT FORM =====
function handleContact(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    const message = event.target.querySelector('textarea').value;

    if (email && message) {
        alert('شكراً لتواصلك معنا! سنرد عليك قريباً إن شاء الله. ✓');
        event.target.reset();
        return false;
    }
}

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.8s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.guide-card, .ramadan-card, .health-card, .daily-card, .community-card').forEach(el => {
    observer.observe(el);
});

// ===== PRAYER HIGHLIGHT =====

function highlightCurrentPrayer() {
    const prayers = ['fajr','dhuhr','asr','maghrib','isha'];
    const now = new Date();
    const currentMinutes = now.getHours()*60 + now.getMinutes();
    let current = null;
    const times = prayers.map(p => {
        const td = document.getElementById(p + '-time');
        const text = td ? td.textContent : '';
        const [h,m] = text.split(':').map(Number);
        return {name:p, minutes: h*60 + m};
    });
    for (let i = 0; i < times.length; i++) {
        if (!isNaN(times[i].minutes)) {
            if (currentMinutes >= times[i].minutes &&
                (i === times.length - 1 || currentMinutes < times[i+1].minutes)) {
                current = times[i].name;
                break;
            }
        }
    }
    prayers.forEach(p => {
        const td = document.getElementById(p + '-time');
        if (td) td.classList.toggle('current-prayer', p === current);
    });
}

// ===== THEME INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    updateDailyContent();

    // Add scroll animation to elements
    const elements = document.querySelectorAll('section');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.animation = `fadeIn 0.8s ease ${index * 0.1}s forwards`;
    });
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Increment counter with Spacebar when counter is focused
    if (e.code === 'Space' && document.activeElement === document.getElementById('counter')) {
        e.preventDefault();
        incrementCounter();
    }
});

// ===== LOADING OPTIMIZATION =====
window.addEventListener('load', () => {
    // Hide loading state if any
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.display = 'none';
    }
});

// ===== BUTTON HANDLERS =====
const startBtn = document.getElementById('startBtn');
const guideBtn = document.getElementById('guideBtn');

if (startBtn) {
    startBtn.addEventListener('click', () => {
        document.getElementById('adhkar').scrollIntoView({ behavior: 'smooth' });
    });
}

if (guideBtn) {
    guideBtn.addEventListener('click', () => {
        document.getElementById('guide').scrollIntoView({ behavior: 'smooth' });
    });
}

// ===== CONSOLE MESSAGE =====
console.log('%c🌙 Swmi - صومي 🌙', 'font-size: 20px; color: #d4a574; font-weight: bold;');
console.log('%cمنصتك الشاملة للصيام والارتقاء الروحي', 'font-size: 14px; color: #1a5c4a;');
console.log('© Swmi 2026 - جميع الحقوق محفوظة');

// ===== DAILY REFRESH SCHEDULER =====

function scheduleDailyRefresh() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1);
    const ms = tomorrow - now + 1000;
    setTimeout(async () => {
        if (currentCity) {
            await updatePrayerTimes(true);
            startCountdown();
        }
        scheduleDailyRefresh();
    }, ms);
}

// ===== AUTHENTICATION UI =====
function openAuthModal() {
    document.getElementById('auth-modal').classList.add('active');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
}

function switchAuthTab(tab) {
    // Set active tab
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    // Set active form
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById(tab + '-form').classList.add('active');
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const result = auth.login(email, password);
    
    if (result.success) {
        alert('🎉 مرحباً! تم تسجيل الدخول بنجاح');
        closeAuthModal();
        updateAuthUI();
        // إعادة توجيه إلى لوحة التحكم بعد ثانية
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        alert('❌ خطأ: ' + result.error);
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const city = document.getElementById('register-city').value;
    const password = document.getElementById('register-password').value;

    const result = auth.register({
        name,
        email,
        city,
        phone: '',
        avatar: auth.auth?.generateAvatar?.() || '👨'
    });

    if (result.success) {
        alert('✅ تم التسجيل بنجاح! مرحباً بك في Swmi');
        closeAuthModal();
        updateAuthUI();
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        alert('❌ خطأ في التسجيل: ' + result.error);
    }
}

function updateAuthUI() {
    const authBtn = document.getElementById('auth-nav-btn');
    
    if (auth.isLoggedIn()) {
        const user = auth.getCurrentUser();
        authBtn.textContent = user.name;
        authBtn.onclick = () => {
            const menu = document.createElement('div');
            menu.innerHTML = `
                <a href="profile.html" style="display: block; padding: 0.5rem; color: var(--primary-green); text-decoration: none;">ملفي الشخصي</a>
                <a href="dashboard.html" style="display: block; padding: 0.5rem; color: var(--primary-green); text-decoration: none;">لوحة التحكم</a>
                <button onclick="logout()" style="width: 100%; padding: 0.5rem; background: #e74c3c; color: white; border: none; cursor: pointer; border-radius: 4px;">تسجيل الخروج</button>
            `;
        };
    } else {
        authBtn.textContent = 'دخول';
        authBtn.onclick = openAuthModal;
    }
}

function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        auth.logout();
        updateAuthUI();
        alert('✓ تم تسجيل الخروج');
    }
}

// ===== INITIALIZE AUTH UI =====
document.addEventListener('DOMContentLoaded', async () => {
    updateAuthUI();
    
    // Close modal on outside click
    document.getElementById('auth-modal').addEventListener('click', (e) => {
        if (e.target.id === 'auth-modal') {
            closeAuthModal();
        }
    });

    // default city selection
    if (citySelect) {
        citySelect.value = 'tunis';
        currentCity = 'tunis';
        await updatePrayerTimes(true);
        startCountdown();
        scheduleDailyRefresh();
    }
});
