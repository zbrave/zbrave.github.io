// Analytics veri modeli ve yardımcı fonksiyonları
const Analytics = {
    // LocalStorage anahtarları
    KEYS: {
        VISITS: 'site_visits',
        PAGES: 'page_visits',
        REFERRERS: 'referrers',
        COUNTRIES: 'visitor_countries',
        BROWSERS: 'visitor_browsers',
        DEVICES: 'visitor_devices',
        SOCIAL_CLICKS: 'social_media_clicks'
    },

    // Ziyaret verilerini kaydet
    recordVisit: function(page) {
        const now = new Date();
        const visitData = {
            timestamp: now.getTime(),
            date: now.toISOString(),
            page: page || window.location.pathname,
            referrer: document.referrer || 'direct',
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            device: this.getDeviceType(),
            browser: this.getBrowserInfo()
        };

        // Sayfa yenileme kontrolü (son 10 saniye içinde aynı sayfaya erişim var mı?)
        const isPageRefresh = this.checkPageRefresh(visitData.page);
        
        // Sadece sayfa yenileme değilse ziyaret sayısını artır
        if (!isPageRefresh) {
            // IP ve konum bilgisini asenkron olarak al ve ziyareti kaydet
            this.getLocationData().then(locationData => {
                visitData.ip = locationData.ip || 'unknown';
                visitData.country = locationData.country_name || 'unknown';
                visitData.city = locationData.city || 'unknown';
                
                // Ziyaret verilerini kaydet
                this.storeVisitData(visitData);
                
                // Sayfa ziyaret sayısını artır (konum bilgisi alındıktan sonra)
                this.incrementPageVisit(visitData.page);
                
                // Referrer kaydını tut
                if (visitData.referrer && visitData.referrer !== 'direct') {
                    this.recordReferrer(visitData.referrer);
                }
            });
        } else {
            console.log("Sayfa yenileme tespit edildi, ziyaret sayısı artırılmadı.");
        }
    },
    
    // Sayfa yenileme kontrolü
    checkPageRefresh: function(page) {
        const visits = JSON.parse(localStorage.getItem(this.KEYS.VISITS) || '[]');
        const now = new Date().getTime();
        const refreshTimeThreshold = 10 * 1000; // 10 saniye
        
        // Son ziyareti kontrol et
        if (visits.length > 0) {
            const lastVisit = visits[visits.length - 1];
            
            // Aynı sayfa mı ve son 10 saniye içinde mi?
            if (lastVisit.page === page && (now - lastVisit.timestamp) < refreshTimeThreshold) {
                return true; // Sayfa yenileme tespit edildi
            }
        }
        
        return false; // Yeni ziyaret
    },

    // Konum bilgisini API üzerinden al
    getLocationData: async function() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            return await response.json();
        } catch (error) {
            console.error('Konum bilgisi alınamadı:', error);
            return { ip: 'unknown', country_name: 'unknown', city: 'unknown' };
        }
    },

    // Cihaz tipini belirle
    getDeviceType: function() {
        const userAgent = navigator.userAgent;
        if (/Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(userAgent)) {
            return 'mobile';
        } else if (/Tablet|iPad/i.test(userAgent)) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    },

    // Tarayıcı bilgisini al
    getBrowserInfo: function() {
        const userAgent = navigator.userAgent;
        let browser = 'other';
        
        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
            browser = 'Chrome';
        } else if (userAgent.includes('Firefox')) {
            browser = 'Firefox';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browser = 'Safari';
        } else if (userAgent.includes('Edg')) {
            browser = 'Edge';
        } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
            browser = 'Internet Explorer';
        }
        
        return browser;
    },

    // Ziyaret verilerini sakla
    storeVisitData: function(visitData) {
        let visits = JSON.parse(localStorage.getItem(this.KEYS.VISITS) || '[]');
        visits.push(visitData);
        
        // En fazla 200 ziyaret kaydı tutmak için eski kayıtları sil
        if (visits.length > 200) {
            visits = visits.slice(-200);
        }
        
        localStorage.setItem(this.KEYS.VISITS, JSON.stringify(visits));
        
        // Ülke istatistiklerini güncelle
        this.incrementCountryVisit(visitData.country);
        
        // Tarayıcı istatistiklerini güncelle
        this.incrementBrowserVisit(visitData.browser);
        
        // Cihaz istatistiklerini güncelle
        this.incrementDeviceVisit(visitData.device);
    },

    // Sayfa ziyaret sayısını artır
    incrementPageVisit: function(page) {
        const pages = JSON.parse(localStorage.getItem(this.KEYS.PAGES) || '{}');
        pages[page] = (pages[page] || 0) + 1;
        localStorage.setItem(this.KEYS.PAGES, JSON.stringify(pages));
    },

    // Referrer kaydını tut
    recordReferrer: function(referrer) {
        const referrers = JSON.parse(localStorage.getItem(this.KEYS.REFERRERS) || '{}');
        let domain = 'unknown';
        
        try {
            domain = new URL(referrer).hostname;
        } catch (e) {
            domain = referrer;
        }
        
        referrers[domain] = (referrers[domain] || 0) + 1;
        localStorage.setItem(this.KEYS.REFERRERS, JSON.stringify(referrers));
    },

    // Ülke ziyaret sayısını artır
    incrementCountryVisit: function(country) {
        const countries = JSON.parse(localStorage.getItem(this.KEYS.COUNTRIES) || '{}');
        countries[country] = (countries[country] || 0) + 1;
        localStorage.setItem(this.KEYS.COUNTRIES, JSON.stringify(countries));
    },

    // Tarayıcı ziyaret sayısını artır
    incrementBrowserVisit: function(browser) {
        const browsers = JSON.parse(localStorage.getItem(this.KEYS.BROWSERS) || '{}');
        browsers[browser] = (browsers[browser] || 0) + 1;
        localStorage.setItem(this.KEYS.BROWSERS, JSON.stringify(browsers));
    },

    // Cihaz ziyaret sayısını artır
    incrementDeviceVisit: function(device) {
        const devices = JSON.parse(localStorage.getItem(this.KEYS.DEVICES) || '{}');
        devices[device] = (devices[device] || 0) + 1;
        localStorage.setItem(this.KEYS.DEVICES, JSON.stringify(devices));
    },

    // Sosyal medya tıklamalarını kaydet
    recordSocialClick: function(platform) {
        const socialClicks = JSON.parse(localStorage.getItem(this.KEYS.SOCIAL_CLICKS) || '{}');
        socialClicks[platform] = (socialClicks[platform] || 0) + 1;
        localStorage.setItem(this.KEYS.SOCIAL_CLICKS, JSON.stringify(socialClicks));
    },

    // Toplam ziyaret sayısını al
    getTotalVisits: function() {
        const visits = JSON.parse(localStorage.getItem(this.KEYS.VISITS) || '[]');
        return visits.length;
    },

    // Sayfa ziyaret istatistiklerini al
    getPageVisits: function() {
        return JSON.parse(localStorage.getItem(this.KEYS.PAGES) || '{}');
    },

    // Ülke ziyaret istatistiklerini al
    getCountryVisits: function() {
        return JSON.parse(localStorage.getItem(this.KEYS.COUNTRIES) || '{}');
    },

    // Son ziyaretleri al
    getRecentVisits: function(limit = 10) {
        const visits = JSON.parse(localStorage.getItem(this.KEYS.VISITS) || '[]');
        return visits.slice(-limit).reverse();
    },

    // Zaman aralığına göre ziyaretleri al
    getVisitsByDateRange: function(startDate, endDate) {
        const visits = JSON.parse(localStorage.getItem(this.KEYS.VISITS) || '[]');
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        
        return visits.filter(visit => {
            const visitTime = visit.timestamp;
            return visitTime >= start && visitTime <= end;
        });
    },

    // Sosyal medya tıklama verilerini al
    getSocialClicks: function() {
        return JSON.parse(localStorage.getItem(this.KEYS.SOCIAL_CLICKS) || '{}');
    },

    // Tüm tarayıcı verilerini al
    getBrowserStats: function() {
        return JSON.parse(localStorage.getItem(this.KEYS.BROWSERS) || '{}');
    },

    // Tüm cihaz verilerini al
    getDeviceStats: function() {
        return JSON.parse(localStorage.getItem(this.KEYS.DEVICES) || '{}');
    },

    // Tüm referrer verilerini al
    getReferrerStats: function() {
        return JSON.parse(localStorage.getItem(this.KEYS.REFERRERS) || '{}');
    },

    // Tüm verileri temizle
    clearAllData: function() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
};

// Sayfa yüklendiğinde ziyareti kaydet
document.addEventListener('DOMContentLoaded', function() {
    // Ana sitedeki ziyareti kaydet
    if (!window.location.pathname.includes('admin.html')) {
        Analytics.recordVisit();
        
        // Sosyal medya bağlantılarına tıklama olaylarını dinle
        document.querySelectorAll('a[href*="facebook.com"], a[href*="instagram.com"], a[href*="twitter.com"], a[href*="linkedin.com"]').forEach(link => {
            link.addEventListener('click', function(e) {
                let platform = 'other';
                const href = this.href.toLowerCase();
                
                if (href.includes('facebook.com')) {
                    platform = 'Facebook';
                } else if (href.includes('instagram.com')) {
                    platform = 'Instagram';
                } else if (href.includes('twitter.com')) {
                    platform = 'Twitter';
                } else if (href.includes('linkedin.com')) {
                    platform = 'LinkedIn';
                }
                
                Analytics.recordSocialClick(platform);
            });
        });
    }
}); 