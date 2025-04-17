// Admin paneli için tüm fonksiyonlar ve istatistikler

// LocalStorage anahtarları - Global olarak tanımlandı
window.STORAGE_KEYS = {
    BLOG_POSTS: 'blogPosts',
    CATEGORIES: 'blogCategories'
};

// Admin Panel Namespace
const AdminPanel = {
    // LocalStorage keys for data
    STORAGE_KEYS: {
        CATEGORIES: 'blog_categories',
        POSTS: 'blog_posts'
    },

    // Panel initialization function
    init: function() {
        console.log('AdminPanel.init() çalıştı');
        this.loadStatistics();
        this.loadCategories();
        this.setupEventListeners();
    },

    // Statistics functions
    loadStatistics: function() {
        console.log('AdminPanel.loadStatistics() çalıştı');
        const categories = this.getCategories();
        const posts = this.getPosts();
        
        document.getElementById('total-posts').textContent = posts.length;
        document.getElementById('total-categories').textContent = categories.length;
        
        // Most popular category calculation
        if (categories.length > 0) {
            const categoryCounts = categories.map(category => {
                return {
                    name: category.name,
                    count: this.getPostCountByCategory(category.name)
                };
            });
            
            categoryCounts.sort((a, b) => b.count - a.count);
            
            if (categoryCounts[0]) {
                document.getElementById('popular-category').textContent = 
                    `${categoryCounts[0].name} (${categoryCounts[0].count} yazı)`;
            }
        }
        
        // Recent posts
        if (posts.length > 0) {
            const recentPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
            document.getElementById('recent-post').textContent = 
                recentPosts[0] ? recentPosts[0].title : 'Yazı bulunamadı';
        }
    },

    // Category management functions
    getCategories: function() {
        console.log('AdminPanel.getCategories() çalıştı');
        const categoriesJson = localStorage.getItem(this.STORAGE_KEYS.CATEGORIES);
        return categoriesJson ? JSON.parse(categoriesJson) : [];
    },
    
    getPosts: function() {
        console.log('AdminPanel.getPosts() çalıştı');
        const postsJson = localStorage.getItem(this.STORAGE_KEYS.POSTS);
        return postsJson ? JSON.parse(postsJson) : [];
    },
    
    loadCategories: function() {
        console.log('AdminPanel.loadCategories() çalıştı');
        const categoriesTable = document.getElementById('categoriesTable');
        if (!categoriesTable) return;
        
        const categories = this.getCategories();
        const posts = this.getPosts();
        
        // Tabloyu temizle
        categoriesTable.innerHTML = '';
        
        if (categories.length === 0) {
            // Kategori yoksa bilgi mesajı göster
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5" class="text-center">Henüz kategori bulunmuyor. Yeni kategori eklemek için "Yeni Kategori" butonuna tıklayın.</td>`;
            categoriesTable.appendChild(row);
            return;
        }
        
        // Her kategori için tablo satırı oluştur
        categories.forEach(category => {
            // Bu kategorideki yazı sayısını hesapla
            const postCount = posts.filter(post => post.category === category.name).length;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>
                    <span class="badge bg-${category.color}">${this.getColorName(category.color)}</span>
                </td>
                <td>${postCount}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1 edit-category-btn" data-id="${category.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-category-btn" data-id="${category.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            categoriesTable.appendChild(row);
        });
        
        // Düzenleme ve silme butonlarına event dinleyicileri ekle
        this.setupCategoryEventListeners();
        
        // Kategorileri dropdown listesine de ekle
        this.populateCategoryDropdown();
    },
    
    // Renk adını döndür
    getColorName(colorValue) {
        const colorMap = {
            'primary': 'Mavi',
            'secondary': 'Gri',
            'success': 'Yeşil',
            'danger': 'Kırmızı',
            'warning': 'Sarı',
            'info': 'Açık Mavi',
            'dark': 'Siyah'
        };
        
        return colorMap[colorValue] || colorValue;
    },
    
    saveCategory: function() {
        console.log('AdminPanel.saveCategory çalıştı', this);
        
        // Form verilerini al
        const categoryId = document.getElementById('category-id')?.value || '';
        const categoryNameInput = document.getElementById('category-name');
        const categoryColorInput = document.getElementById('category-color');
        
        if (!categoryNameInput || !categoryColorInput) {
            console.error('Form alanları bulunamadı!');
            alert('Form alanları bulunamadı! Lütfen sayfayı yenileyip tekrar deneyin.');
            return;
        }
        
        const categoryName = categoryNameInput.value.trim();
        const categoryColor = categoryColorInput.value;
        
        console.log('Kategori verileri:', { categoryId, categoryName, categoryColor });
        
        if (!categoryName) {
            alert('Kategori adı boş olamaz!');
            return;
        }
        
        try {
            const categories = this.getCategories();
            console.log('Mevcut kategoriler:', categories);
            
            // Kategori adının benzersiz olduğunu kontrol et (güncelleme durumunda kendisi hariç)
            const isDuplicate = categories.some(cat => 
                cat.name.toLowerCase() === categoryName.toLowerCase() && 
                (categoryId === '' || parseInt(categoryId) !== cat.id)
            );
            
            if (isDuplicate) {
                alert('Bu isimde bir kategori zaten mevcut!');
                return;
            }
            
            // Değişiklik yapılacak
            let updated = false;
            
            if (categoryId === '') {
                // Yeni kategori ekleniyor
                const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
                categories.push({
                    id: newId,
                    name: categoryName,
                    color: categoryColor
                });
                console.log('Yeni kategori eklendi:', { id: newId, name: categoryName, color: categoryColor });
                updated = true;
            } else {
                // Mevcut kategori güncelleniyor
                const index = categories.findIndex(c => c.id === parseInt(categoryId));
                if (index !== -1) {
                    // Eski kategori adını al
                    const oldName = categories[index].name;
                    
                    // Kategoriyi güncelle
                    categories[index] = {
                        ...categories[index],
                        name: categoryName,
                        color: categoryColor
                    };
                    
                    console.log('Kategori güncellendi:', { old: oldName, new: categoryName });
                    
                    // Bu kategoriyi kullanan tüm blog yazılarını güncelle
                    this.updatePostCategories(oldName, categoryName);
                    updated = true;
                } else {
                    console.error('Düzenlenecek kategori bulunamadı!', categoryId);
                }
            }
            
            if (updated) {
                // Kategorileri kaydet
                localStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
                console.log('Kategoriler kaydedildi:', categories);
                
                // İşlem sonrası başarılı mesajı
                alert(categoryId === '' ? 'Kategori başarıyla eklendi!' : 'Kategori başarıyla güncellendi!');
                
                // Bootstrap modalı kapat
                this.closeModal();
                
                // Kategori listesini güncelle
                this.loadCategories();
                this.loadStatistics();
            } else {
                console.error('Kategori güncellenemedi!');
                alert('Kategori güncellenemedi! Lütfen sayfayı yenileyip tekrar deneyin.');
            }
        } catch (error) {
            console.error('Kategori kaydetme sırasında hata oluştu:', error);
            alert('Kategori kaydedilirken bir hata oluştu! Lütfen sayfayı yenileyip tekrar deneyin.');
        }
    },
    
    // Modal'ı kapat
    closeModal() {
        try {
            const modalElement = document.getElementById('categoryModal');
            if (modalElement) {
                // Bootstrap 5 ile modal kapatma
                if (typeof bootstrap !== 'undefined') {
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    if (modalInstance) {
                        modalInstance.hide();
                        return;
                    }
                }
                
                // jQuery ile modal kapatma
                if (typeof $ !== 'undefined') {
                    $(modalElement).modal('hide');
                    return;
                }
                
                // Manuel kapatma
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        } catch (error) {
            console.error('Modal kapatma hatası:', error);
        }
    },
    
    // Kategori düzenleme
    editCategory(categoryId) {
        console.log('AdminPanel.editCategory çalıştı:', categoryId);
        const categories = this.getCategories();
        const category = categories.find(c => c.id === categoryId);
        
        if (!category) return;
        
        // Form alanlarını doldur
        document.getElementById('category-id').value = category.id;
        document.getElementById('category-name').value = category.name;
        document.getElementById('category-color').value = category.color;
        
        // Modal başlığını güncelle
        document.getElementById('categoryModalLabel').textContent = 'Kategori Düzenle';
        
        // Modal'ı aç
        this.openModal();
    },
    
    // Modal'ı aç
    openModal() {
        try {
            const modalElement = document.getElementById('categoryModal');
            if (modalElement) {
                // Bootstrap 5 ile modal açma
                if (typeof bootstrap !== 'undefined') {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                    return;
                }
                
                // jQuery ile modal açma
                if (typeof $ !== 'undefined') {
                    $(modalElement).modal('show');
                    return;
                }
                
                // Manuel açma
                modalElement.classList.add('show');
                modalElement.style.display = 'block';
                document.body.classList.add('modal-open');
            }
        } catch (error) {
            console.error('Modal açma hatası:', error);
        }
    },
    
    // Kategori sil
    deleteCategory(categoryId) {
        const categories = this.getCategories();
        const categoryIndex = categories.findIndex(c => c.id === categoryId);
        
        if (categoryIndex === -1) return;
        
        const categoryName = categories[categoryIndex].name;
        const postCount = this.getPostCountByCategory(categoryName);
        
        if (postCount > 0) {
            const confirmDelete = confirm(`Bu kategori ${postCount} yazı içeriyor. Silmek istediğinize emin misiniz? Bu işlem kategorideki yazıları etkilemeyecek, ancak onların kategorisi "Diğer" olarak değiştirilecektir.`);
            if (!confirmDelete) return;
            
            // Bu kategorideki tüm yazıların kategorisini "Diğer" olarak güncelle
            this.updatePostCategories(categoryName, 'Diğer');
        } else {
            const confirmDelete = confirm('Bu kategoriyi silmek istediğinize emin misiniz?');
            if (!confirmDelete) return;
        }
        
        // Kategoriyi sil
        categories.splice(categoryIndex, 1);
        localStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
        
        // Kategori listesini güncelle
        this.loadCategories();
        this.loadStatistics();
    },
    
    // Kategori değişikliğinde blog yazılarını güncelle
    updatePostCategories(oldCategory, newCategory) {
        const posts = this.getPosts();
        
        // Eski kategoriyi kullanan yazıları bul ve güncelle
        posts.forEach(post => {
            if (post.category === oldCategory) {
                post.category = newCategory;
            }
        });
        
        // Güncellenmiş yazıları kaydet
        localStorage.setItem(this.STORAGE_KEYS.POSTS, JSON.stringify(posts));
        
        // Blog yazıları listesini güncelle (eğer görünüyorsa)
        if (document.getElementById('allPostsTable')) {
            displayAllPosts(posts);
        }
    },
    
    // Kategori dropdown listesini doldur
    populateCategoryDropdown() {
        const categorySelect = document.getElementById('post-category');
        if (!categorySelect) return;
        
        const categories = this.getCategories();
        
        // Mevcut seçeneği koru
        const selectedValue = categorySelect.value;
        
        // Listeyi temizle (ilk seçenek hariç)
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }
        
        // Kategorileri ekle
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        
        // Önceki seçimi geri yükle
        if (selectedValue) {
            categorySelect.value = selectedValue;
        }
    },
    
    // Kategori yönetimi için olay dinleyicileri
    setupCategoryEventListeners() {
        // Düzenleme butonlarına tıklama olayları
        document.querySelectorAll('.edit-category-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const categoryId = parseInt(e.currentTarget.dataset.id);
                this.editCategory(categoryId);
            });
        });
        
        // Silme butonlarına tıklama olayları
        document.querySelectorAll('.delete-category-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const categoryId = parseInt(e.currentTarget.dataset.id);
                this.deleteCategory(categoryId);
            });
        });
    },
    
    // Kategorileri göre yazı sayısını hesapla
    getPostCountByCategory(categoryName) {
        const posts = this.getPosts();
        return posts.filter(post => post.category === categoryName).length;
    },
    
    // Kategori formunu temizle
    clearCategoryForm() {
        const idInput = document.getElementById('category-id');
        const nameInput = document.getElementById('category-name');
        const colorInput = document.getElementById('category-color');
        
        if (idInput) idInput.value = '';
        if (nameInput) nameInput.value = '';
        if (colorInput) colorInput.value = 'primary';
        
        // Modal başlığını güncelle
        const modalLabel = document.getElementById('categoryModalLabel');
        if (modalLabel) modalLabel.textContent = 'Yeni Kategori Ekle';
    },
    
    // Olay dinleyicilerini ayarla
    setupEventListeners() {
        console.log('AdminPanel.setupEventListeners çalıştı');
        
        // Kategori modal kaydet butonu
        const saveCategoryBtn = document.getElementById('saveCategoryBtn');
        if (saveCategoryBtn) {
            saveCategoryBtn.addEventListener('click', () => {
                console.log('Kaydet butonuna tıklandı (event listener)');
                this.saveCategory();
            });
        }
        
        // Kategori modal açılırken form temizliği
        const categoryModalElement = document.getElementById('categoryModal');
        if (categoryModalElement) {
            categoryModalElement.addEventListener('hidden.bs.modal', () => this.clearCategoryForm());
        }
        
        // Kategori ekle butonuna tıklandığında
        const newCategoryBtn = document.getElementById('newCategoryBtn');
        if (newCategoryBtn) {
            newCategoryBtn.addEventListener('click', () => {
                console.log('Yeni kategori butonuna tıklandı');
                this.clearCategoryForm();
            });
        }
    }
};

// DOM içeriği yüklendiğinde
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
    
    // Bootstrap Modal nesnesi
    let categoryModalInstance = null;
    
    // Demo verileri temizle
    clearDemoData();

    // Blog yazıları için fonksiyonlar
    // ... existing code ...

    // Analytics veri modeli ve yardımcı fonksiyonları
    // ... existing code ...

    // Blog ve analitik verilerini yükle
    if (checkLoginStatus()) {
        loadBlogPosts();
        
        // Admin panelini başlat
        AdminPanel.init();
    }
}); 

// Blog yazılarını yükle
function loadBlogPosts() {
    const blogPosts = JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOG_POSTS) || '[]');
    
    // Kontrol panelindeki sayıları güncelle
    updateDashboardNumbers(blogPosts);
    
    // Tüm yazıları listele
    displayAllPosts(blogPosts);
} 