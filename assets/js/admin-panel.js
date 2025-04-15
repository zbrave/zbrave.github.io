// Admin paneli için tüm fonksiyonlar ve istatistikler
document.addEventListener('DOMContentLoaded', () => {
    // Kullanıcı giriş durumunu kontrol et
    if (!checkLoginStatus()) return;

    // Menü geçişlerini dinle
    setupMenuTransitions();

    // Admin paneli için sabitler
    const ANALYTICS_KEYS = {
        VISITS: 'site_visits',
        PAGES: 'page_visits',
        REFERRERS: 'referrers',
        COUNTRIES: 'visitor_countries',
        BROWSERS: 'visitor_browsers',
        DEVICES: 'visitor_devices',
        SOCIAL_CLICKS: 'social_media_clicks'
    };
    
    // Demo verileri temizle
    clearDemoData();

    // Blog yazıları için fonksiyonlar
    // ... existing code ...

    // Analytics veri modeli ve yardımcı fonksiyonları
    const Analytics = {
        // LocalStorage anahtarları
        KEYS: ANALYTICS_KEYS,

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

            // IP ve konum bilgisini asenkron olarak al
            this.getLocationData().then(locationData => {
                visitData.ip = locationData.ip || 'unknown';
                visitData.country = locationData.country_name || 'unknown';
                visitData.city = locationData.city || 'unknown';
                
                // Ziyaret verilerini kaydet
                this.storeVisitData(visitData);
            });

            // Sayfa ziyaret sayısını artır
            this.incrementPageVisit(visitData.page);
            
            // Referrer kaydını tut
            if (visitData.referrer && visitData.referrer !== 'direct') {
                this.recordReferrer(visitData.referrer);
            }
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

    // Admin paneli fonksiyonları
    const AdminPanel = {
        // Tüm istatistikleri yükle ve göster
        init() {
            // Panel açıldığında hemen istatistikleri yükle
            this.loadStats();
            
            // Menü geçişleri için olay dinleyicileri kurulumu
            this.setupEventListeners();
        },

        // İstatistik verilerini localStorage'dan yükle
        loadStats() {
            // Dashboard sayfasında istatistikleri göster
            if (document.getElementById('dashboard-section')) {
                this.displayVisitStats();
                this.displayPageStats();
                this.displayReferrerStats();
                this.displayCountryStats();
                this.displayBrowserStats();
                this.displayDeviceStats();
                this.displaySocialStats();
            }
        },

        // Ziyaret istatistiklerini göster
        displayVisitStats() {
            const visitsContainer = document.getElementById('visit-stats-container');
            if (!visitsContainer) return;
            
            const visitsData = JSON.parse(localStorage.getItem(ANALYTICS_KEYS.VISITS) || '[]');
            const totalVisits = visitsData.length;
            const uniqueVisitors = new Set(visitsData.map(visit => visit.visitorId || visit.ip)).size;
            
            // İstatistik özetini hazırla
            visitsContainer.innerHTML = `
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Ziyaret İstatistikleri</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4 text-center mb-3">
                                <h3 id="total-visits">${totalVisits}</h3>
                                <p class="text-muted">Toplam Ziyaret</p>
                            </div>
                            <div class="col-md-4 text-center mb-3">
                                <h3 id="unique-visitors">${uniqueVisitors}</h3>
                                <p class="text-muted">Tekil Ziyaretçi</p>
                            </div>
                            <div class="col-md-4 text-center mb-3">
                                <h3 id="visits-last-7-days">0</h3>
                                <p class="text-muted">Son 7 Gün</p>
                            </div>
                        </div>
                        <div class="mt-4">
                            <canvas id="visits-chart" height="250"></canvas>
                        </div>
                    </div>
                </div>
            `;
            
            // Son 7 günlük ziyaretleri hesapla
            const last7Days = new Date();
            last7Days.setDate(last7Days.getDate() - 7);
            const visitsLast7Days = visitsData.filter(visit => new Date(visit.timestamp) > last7Days).length;
            document.getElementById('visits-last-7-days').textContent = visitsLast7Days;
            
            // Ziyaret grafiği için veri hazırla
            this.renderVisitsChart(visitsData);
        },

        // Ziyaret grafiği oluştur
        renderVisitsChart(visitsData) {
            const chartElement = document.getElementById('visits-chart');
            if (!chartElement) return;
            
            const ctx = chartElement.getContext('2d');
            
            // Son 7 günlük veriyi hazırla
            const dates = [];
            const visitCounts = [];
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);
                
                const nextDate = new Date(date);
                nextDate.setDate(nextDate.getDate() + 1);
                
                const count = visitsData.filter(visit => {
                    const visitDate = new Date(visit.timestamp);
                    return visitDate >= date && visitDate < nextDate;
                }).length;
                
                dates.push(date.toLocaleDateString('tr-TR', { weekday: 'short' }));
                visitCounts.push(count);
            }
            
            // Chart.js varsa grafiği oluştur
            if (typeof Chart !== 'undefined') {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [{
                            label: 'Günlük Ziyaretler',
                            data: visitCounts,
                            borderColor: '#4CAF50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
            }
        },

        // Sayfa istatistiklerini göster
        displayPageStats() {
            const pageStatsContainer = document.getElementById('page-stats-container');
            if (!pageStatsContainer) return;
            
            const pagesData = JSON.parse(localStorage.getItem(ANALYTICS_KEYS.PAGES) || '{}');
            
            // Tablo HTML'ini oluştur
            pageStatsContainer.innerHTML = `
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Sayfa Görüntülenmeleri</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Sayfa</th>
                                        <th>Görüntülenme</th>
                                    </tr>
                                </thead>
                                <tbody id="pages-stats-body">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            
            const pagesTable = document.getElementById('pages-stats-body');
            
            // Sayfa verilerini sırala
            const sortedPages = Object.entries(pagesData)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            sortedPages.forEach(([page, count]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${page}</td>
                    <td>${count}</td>
                `;
                pagesTable.appendChild(row);
            });
        },

        // Referrer istatistiklerini göster
        displayReferrerStats() {
            const referrerStatsContainer = document.getElementById('referrer-stats-container');
            if (!referrerStatsContainer) return;
            
            const referrersData = JSON.parse(localStorage.getItem(ANALYTICS_KEYS.REFERRERS) || '{}');
            
            // Tablo HTML'ini oluştur
            referrerStatsContainer.innerHTML = `
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Referans Kaynakları</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Kaynak</th>
                                        <th>Ziyaret</th>
                                    </tr>
                                </thead>
                                <tbody id="referrers-stats-body">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            
            const referrersTable = document.getElementById('referrers-stats-body');
            
            // Referrer verilerini sırala
            const sortedReferrers = Object.entries(referrersData)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            sortedReferrers.forEach(([referrer, count]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${referrer || 'Doğrudan'}</td>
                    <td>${count}</td>
                `;
                referrersTable.appendChild(row);
            });
        },

        // Ülke istatistiklerini göster
        displayCountryStats() {
            const countryStatsContainer = document.getElementById('country-stats-container');
            if (!countryStatsContainer) return;
            
            const countriesData = JSON.parse(localStorage.getItem(ANALYTICS_KEYS.COUNTRIES) || '{}');
            
            // Tablo HTML'ini oluştur
            countryStatsContainer.innerHTML = `
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Ülke Dağılımı</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Ülke</th>
                                        <th>Ziyaret</th>
                                    </tr>
                                </thead>
                                <tbody id="countries-stats-body">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            
            const countriesTable = document.getElementById('countries-stats-body');
            
            // Ülke verilerini sırala
            const sortedCountries = Object.entries(countriesData)
                .sort((a, b) => b[1] - a[1]);
            
            sortedCountries.forEach(([country, count]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${country || 'Bilinmiyor'}</td>
                    <td>${count}</td>
                `;
                countriesTable.appendChild(row);
            });
        },

        // Tarayıcı istatistiklerini göster
        displayBrowserStats() {
            const browserStatsContainer = document.getElementById('browser-stats-container');
            if (!browserStatsContainer) return;
            
            const browsersData = JSON.parse(localStorage.getItem(ANALYTICS_KEYS.BROWSERS) || '{}');
            
            // Grafik HTML'ini oluştur
            browserStatsContainer.innerHTML = `
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Tarayıcı Dağılımı</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="browsers-chart" height="250"></canvas>
                    </div>
                </div>
            `;
            
            const chartElement = document.getElementById('browsers-chart');
            if (!chartElement || typeof Chart === 'undefined') return;
            
            const ctx = chartElement.getContext('2d');
            
            const browsers = Object.keys(browsersData);
            const counts = Object.values(browsersData);
            
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: browsers,
                    datasets: [{
                        data: counts,
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        },

        // Cihaz istatistiklerini göster
        displayDeviceStats() {
            const deviceStatsContainer = document.getElementById('device-stats-container');
            if (!deviceStatsContainer) return;
            
            const devicesData = JSON.parse(localStorage.getItem(ANALYTICS_KEYS.DEVICES) || '{}');
            
            // Grafik HTML'ini oluştur
            deviceStatsContainer.innerHTML = `
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Cihaz Dağılımı</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="devices-chart" height="250"></canvas>
                    </div>
                </div>
            `;
            
            const chartElement = document.getElementById('devices-chart');
            if (!chartElement || typeof Chart === 'undefined') return;
            
            const ctx = chartElement.getContext('2d');
            
            const devices = Object.keys(devicesData);
            const counts = Object.values(devicesData);
            
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: devices,
                    datasets: [{
                        data: counts,
                        backgroundColor: [
                            '#4CAF50', '#2196F3', '#FFC107'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        },

        // Sosyal medya tıklama istatistiklerini göster
        displaySocialStats() {
            const socialStatsContainer = document.getElementById('social-stats-container');
            if (!socialStatsContainer) return;
            
            const socialData = JSON.parse(localStorage.getItem(ANALYTICS_KEYS.SOCIAL_CLICKS) || '{}');
            
            // Tablo HTML'ini oluştur
            socialStatsContainer.innerHTML = `
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Sosyal Medya Tıklamaları</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Platform</th>
                                        <th>Tıklama</th>
                                    </tr>
                                </thead>
                                <tbody id="social-stats-body">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            
            const socialTable = document.getElementById('social-stats-body');
            
            // Sosyal medya verilerini sırala
            const sortedSocial = Object.entries(socialData)
                .sort((a, b) => b[1] - a[1]);
            
            sortedSocial.forEach(([platform, count]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${platform}</td>
                    <td>${count}</td>
                `;
                socialTable.appendChild(row);
            });
        },

        // Verileri temizle
        clearData() {
            if (confirm('Tüm analitik verilerini silmek istediğinizden emin misiniz?')) {
                Object.values(ANALYTICS_KEYS).forEach(key => {
                    localStorage.removeItem(key);
                });
                alert('Tüm analitik verileri silindi.');
                this.loadStats();
            }
        },

        // Verileri JSON olarak dışa aktar
        exportData() {
            const analyticsData = {};
            
            Object.entries(ANALYTICS_KEYS).forEach(([key, storageKey]) => {
                analyticsData[key] = JSON.parse(localStorage.getItem(storageKey) || '{}');
            });
            
            const dataStr = JSON.stringify(analyticsData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportLink = document.createElement('a');
            exportLink.setAttribute('href', dataUri);
            exportLink.setAttribute('download', 'analytics_data.json');
            exportLink.click();
        },

        // Olay dinleyicilerini ayarla
        setupEventListeners() {
            const clearDataBtn = document.getElementById('clear-data-btn');
            if (clearDataBtn) {
                clearDataBtn.addEventListener('click', () => this.clearData());
            }
            
            const exportDataBtn = document.getElementById('export-data-btn');
            if (exportDataBtn) {
                exportDataBtn.addEventListener('click', () => this.exportData());
            }
            
            // Hızlı yazı ekleme bağlantısı
            const quickAddLink = document.getElementById('quickAddLink');
            if (quickAddLink) {
                quickAddLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Tüm bölümleri gizle
                    const sections = document.querySelectorAll('.section');
                    sections.forEach(section => section.classList.add('d-none'));
                    
                    // Yeni yazı ekleme bölümünü göster
                    const addPostSection = document.getElementById('add-post-section');
                    if (addPostSection) {
                        addPostSection.classList.remove('d-none');
                    }
                    
                    // Menü linklerini güncelle
                    const menuLinks = document.querySelectorAll('.nav-link');
                    menuLinks.forEach(link => link.classList.remove('active'));
                    
                    const addPostLink = document.getElementById('addPostLink');
                    if (addPostLink) {
                        addPostLink.classList.add('active');
                    }
                });
            }
            
            // Yeni yazı ekleme butonu
            const newPostBtn = document.getElementById('newPostBtn');
            if (newPostBtn) {
                newPostBtn.addEventListener('click', function() {
                    // Tüm bölümleri gizle
                    const sections = document.querySelectorAll('.section');
                    sections.forEach(section => section.classList.add('d-none'));
                    
                    // Yeni yazı ekleme bölümünü göster
                    const addPostSection = document.getElementById('add-post-section');
                    if (addPostSection) {
                        addPostSection.classList.remove('d-none');
                    }
                    
                    // Menü linklerini güncelle
                    const menuLinks = document.querySelectorAll('.nav-link');
                    menuLinks.forEach(link => link.classList.remove('active'));
                    
                    const addPostLink = document.getElementById('addPostLink');
                    if (addPostLink) {
                        addPostLink.classList.add('active');
                    }
                });
            }
        }
    };

    // Kullanıcı giriş durumunu kontrol et
    function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        
        // Eğer giriş yapılmamışsa ve admin sayfalarındaysak, giriş sayfasına yönlendir
        if (!isLoggedIn && (window.location.pathname.includes('admin-panel.html'))) {
            window.location.href = 'admin.html';
            return false;
        }
        
        return isLoggedIn;
    }

    // Çıkış fonksiyonu
    window.logoutAdmin = function() {
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'admin.html';
    };

    // Menü geçişlerini ayarla
    function setupMenuTransitions() {
        // Önce giriş durumunu kontrol et
        if (!checkLoginStatus()) return;
        
        const menuLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.section');
        
        // Çıkış butonunu özel olarak ele al
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logoutAdmin();
            });
        }
        
        menuLinks.forEach(link => {
            if (link.id === 'logoutBtn') return; // Çıkış butonunu atla
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Aktif menü linkini güncelle
                menuLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Hedef bölümü göster
                const targetId = this.getAttribute('href').substring(1) + '-section';
                
                sections.forEach(section => {
                    section.classList.add('d-none');
                });
                
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.remove('d-none');
                    
                    // Eğer istatistikler bölümüne geçildiyse, verileri yükle
                    if (targetId === 'analytics-section') {
                        AdminPanel.loadStats();
                    }
                }
            });
        });
    }

    // Demo verileri silme fonksiyonu
    function clearDemoData() {
        // Mevcut verileri kontrol et ve demo veri olma ihtimali varsa temizle
        const visits = JSON.parse(localStorage.getItem(ANALYTICS_KEYS.VISITS) || '[]');
        
        // Demo veri var mı kontrol et, genellikle rastgele üretilmiş çok sayıda veri varsa demo veridir
        if (visits.length > 0 && visits.length >= 100) {
            // Eğer demo veriler varsa, tüm analitik verilerini temizle
            Object.values(ANALYTICS_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            console.log('Demo veriler temizlendi. Artık sadece gerçek ziyaret verileri toplanacak.');
        }
    }

    // Blog yazılarını yükle
    function loadBlogPosts() {
        const blogPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        
        // Kontrol panelindeki sayıları güncelle
        updateDashboardNumbers(blogPosts);
        
        // Tüm yazıları listele
        displayAllPosts(blogPosts);
    }
    
    // Dashboard sayılarını güncelle
    function updateDashboardNumbers(posts) {
        const totalPostsElement = document.getElementById('totalPosts');
        const totalViewsElement = document.getElementById('totalViews');
        
        if (totalPostsElement) {
            totalPostsElement.textContent = posts.length;
        }
        
        if (totalViewsElement) {
            const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
            totalViewsElement.textContent = totalViews;
        }
    }
    
    // Tüm yazıları göster
    function displayAllPosts(posts) {
        const allPostsTable = document.getElementById('allPostsTable');
        if (!allPostsTable) return;
        
        allPostsTable.innerHTML = '';
        
        // Yazıları ekleme tarihine göre sırala (en yeniden en eskiye)
        const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (sortedPosts.length === 0) {
            // Blog yazısı yoksa bilgi mesajı göster
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="6" class="text-center">Henüz blog yazısı bulunmuyor. Yeni yazı eklemek için "Yeni Yazı" butonuna tıklayın.</td>`;
            allPostsTable.appendChild(row);
            return;
        }
        
        sortedPosts.forEach(post => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td><span class="badge ${getCategoryBadgeClass(post.category)}">${post.category}</span></td>
                <td>${new Date(post.date).toLocaleDateString('tr-TR')}</td>
                <td>${post.views || 0}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editPost(${post.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deletePost(${post.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            allPostsTable.appendChild(row);
        });
    }
    
    // Get badge class for category
    function getCategoryBadgeClass(category) {
        switch(category) {
            case 'Sağlıklı Tarifler':
                return 'bg-primary';
            case 'Diyet':
                return 'bg-info';
            case 'Sağlıklı Yaşam':
                return 'bg-success';
            case 'Spor':
                return 'bg-warning';
            case 'Hamilelik':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    }

    // Yazı düzenleme fonksiyonu
    window.editPost = function(postId) {
        const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        const post = posts.find(p => p.id === postId);
        
        if (!post) return;
        
        // Formu doldur
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-category').value = post.category;
        document.getElementById('post-image').value = post.image || '';
        document.getElementById('post-summary').value = post.summary;
        
        // CKEditor yoksa doğrudan textarea'ya değeri ata
        if (typeof ClassicEditor === 'undefined') {
            document.getElementById('post-content').value = post.content;
        } else {
            // CKEditor varsa içeriği setData ile ata
            window.editor.setData(post.content);
        }
        
        // Düzenleme modunu ayarla
        document.getElementById('addPostForm').dataset.mode = 'edit';
        document.getElementById('addPostForm').dataset.postId = postId;
        
        // Kaydet butonunun metnini güncelle
        document.getElementById('savePostBtn').innerHTML = '<i class="fas fa-save me-1"></i> Güncelle';
        
        // Yazı ekleme bölümüne git
        const menuLinks = document.querySelectorAll('.nav-link');
        menuLinks.forEach(link => link.classList.remove('active'));
        
        const addPostLink = document.getElementById('addPostLink');
        if (addPostLink) {
            addPostLink.classList.add('active');
            
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => section.classList.add('d-none'));
            
            const addPostSection = document.getElementById('add-post-section');
            if (addPostSection) {
                addPostSection.classList.remove('d-none');
            }
        }
    };
    
    // Yazı silme fonksiyonu
    window.deletePost = function(postId) {
        if (!confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return;
        
        const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        const filteredPosts = posts.filter(p => p.id !== postId);
        
        localStorage.setItem('blogPosts', JSON.stringify(filteredPosts));
        
        // Tabloları güncelle
        loadBlogPosts();
    };
    
    // Form gönderimini dinle
    const addPostForm = document.getElementById('addPostForm');
    if (addPostForm) {
        addPostForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('post-title').value;
            const category = document.getElementById('post-category').value;
            const image = document.getElementById('post-image').value;
            const summary = document.getElementById('post-summary').value;
            
            // İçeriği CKEditor veya normal textarea'dan al
            let content = '';
            if (typeof ClassicEditor === 'undefined' || !window.editor) {
                content = document.getElementById('post-content').value;
            } else {
                content = window.editor.getData();
            }
            
            const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
            
            if (addPostForm.dataset.mode === 'edit') {
                // Düzenleme modu
                const postId = parseInt(addPostForm.dataset.postId);
                const postIndex = posts.findIndex(p => p.id === postId);
                
                if (postIndex !== -1) {
                    posts[postIndex] = {
                        ...posts[postIndex],
                        title,
                        category,
                        image,
                        summary,
                        content,
                        date: new Date().toISOString() // Güncelleme tarihi
                    };
                }
            } else {
                // Ekleme modu
                const newPost = {
                    id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
                    title,
                    category,
                    image,
                    summary,
                    content,
                    date: new Date().toISOString(),
                    views: 0
                };
                
                posts.push(newPost);
            }
            
            localStorage.setItem('blogPosts', JSON.stringify(posts));
            
            // Formu sıfırla
            addPostForm.reset();
            addPostForm.dataset.mode = 'add';
            delete addPostForm.dataset.postId;
            
            // Kaydet butonunun metnini güncelle
            document.getElementById('savePostBtn').innerHTML = '<i class="fas fa-save me-1"></i> Kaydet';
            
            // İçeriği CKEditor için temizle
            if (typeof ClassicEditor !== 'undefined' && window.editor) {
                window.editor.setData('');
            }
            
            // Blog yazıları listesini güncelle
            loadBlogPosts();
            
            // Blog yazıları sayfasına git
            const menuLinks = document.querySelectorAll('.nav-link');
            menuLinks.forEach(link => link.classList.remove('active'));
            
            const blogPostsLink = document.getElementById('blogPostsLink');
            if (blogPostsLink) {
                blogPostsLink.classList.add('active');
                
                const sections = document.querySelectorAll('.section');
                sections.forEach(section => section.classList.add('d-none'));
                
                const blogPostsSection = document.getElementById('blog-posts-section');
                if (blogPostsSection) {
                    blogPostsSection.classList.remove('d-none');
                }
            }
            
            alert(addPostForm.dataset.mode === 'edit' ? 'Yazı başarıyla güncellendi!' : 'Yeni yazı başarıyla eklendi!');
        });
        
        // İptal butonunu dinle
        const cancelAddPostBtn = document.getElementById('cancelAddPost');
        if (cancelAddPostBtn) {
            cancelAddPostBtn.addEventListener('click', function() {
                // Formu sıfırla
                addPostForm.reset();
                addPostForm.dataset.mode = 'add';
                delete addPostForm.dataset.postId;
                
                // Kaydet butonunun metnini güncelle
                document.getElementById('savePostBtn').innerHTML = '<i class="fas fa-save me-1"></i> Kaydet';
                
                // İçeriği CKEditor için temizle
                if (typeof ClassicEditor !== 'undefined' && window.editor) {
                    window.editor.setData('');
                }
                
                // Blog yazıları sayfasına git
                const menuLinks = document.querySelectorAll('.nav-link');
                menuLinks.forEach(link => link.classList.remove('active'));
                
                const blogPostsLink = document.getElementById('blogPostsLink');
                if (blogPostsLink) {
                    blogPostsLink.click();
                }
            });
        }
    }
    
    // CKEditor'ı etkinleştir
    const contentEditor = document.getElementById('post-content');
    if (contentEditor && typeof ClassicEditor !== 'undefined') {
        ClassicEditor
            .create(contentEditor, {
                toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo']
            })
            .then(editor => {
                window.editor = editor;
            })
            .catch(error => {
                console.error('CKEditor yüklenirken hata oluştu:', error);
            });
    }

    // Blog ve analitik verilerini yükle
    if (checkLoginStatus()) {
        loadBlogPosts();
        
        // Admin panelini başlat
        AdminPanel.init();
    }
}); 