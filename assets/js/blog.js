// Blog page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

    // Load blog posts
    loadBlogPosts();

    // Setup newsletter form
    setupNewsletterForm();
    
    // Highlight active category
    highlightActiveCategory();
});

// Load blog posts from localStorage
function loadBlogPosts() {
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    const blogPostsContainer = document.getElementById('blogPostsContainer');
    
    if (blogPostsContainer && blogPosts.length > 0) {
        // Clear container
        blogPostsContainer.innerHTML = '';
        
        // Check if category filter is applied
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFilter = urlParams.get('kategori');
        
        // Sort posts by date (newest first)
        const sortedPosts = [...blogPosts].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        // Filter by category if needed
        const filteredPosts = categoryFilter 
            ? sortedPosts.filter(post => post.category === categoryFilter) 
            : sortedPosts;
        
        // Update page title if category filter is applied
        if (categoryFilter) {
            document.title = `${categoryFilter} | Dyt. Kevser Sare Ateş`;
            
            // Add category heading
            const categoryHeading = document.createElement('div');
            categoryHeading.className = 'mb-4';
            categoryHeading.innerHTML = `
                <h2 class="mb-3">${categoryFilter}</h2>
                <p>Bu kategorideki blog yazıları (${filteredPosts.length})</p>
                <hr class="mb-4">
            `;
            blogPostsContainer.appendChild(categoryHeading);
        }
        
        // Display message if no posts in category
        if (filteredPosts.length === 0 && categoryFilter) {
            const noPostsMessage = document.createElement('div');
            noPostsMessage.className = 'alert alert-info';
            noPostsMessage.innerHTML = `
                <h4 class="alert-heading">Henüz yazı yok!</h4>
                <p>Bu kategoride henüz yayınlanmış blog yazısı bulunmamaktadır.</p>
                <hr>
                <p class="mb-0">
                    <a href="blog.html" class="alert-link">Tüm yazıları görüntülemek için tıklayın</a>
                </p>
            `;
            blogPostsContainer.appendChild(noPostsMessage);
        } else {
            // Create HTML for each post
            filteredPosts.forEach(post => {
                const postHTML = createPostHTML(post);
                blogPostsContainer.innerHTML += postHTML;
            });
        }
        
        // Update pagination
        updatePagination(filteredPosts.length);
    }
    
    // Update category counts
    updateCategoryCounts(blogPosts);
    
    // Update recent posts
    updateRecentPosts(blogPosts);
}

// Create HTML for a blog post
function createPostHTML(post) {
    return `
        <div class="col-12" data-aos="fade-up">
            <div class="card border-0 shadow-sm mb-4">
                <img src="${post.image}" class="card-img-top" alt="${post.title}">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="badge ${getCategoryBadgeClass(post.category)}">${post.category}</span>
                        <small class="text-muted">${post.date}</small>
                    </div>
                    <h3 class="card-title">${post.title}</h3>
                    <p class="card-text">${post.summary}</p>
                    <a href="blog-post.html?id=${post.id}" class="btn btn-outline-primary">Devamını Oku</a>
                </div>
            </div>
        </div>
    `;
}

// Update category counts
function updateCategoryCounts(posts) {
    // Kategorileri ve sayılarını takip et
    const categoryCounts = {};
    
    // Kategorileri localStorage'dan al
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    
    // Her kategorinin başlangıç sayısını 0 yap
    categories.forEach(cat => {
        categoryCounts[cat.name] = 0;
    });
    
    // Her yazının kategorisini say
    posts.forEach(post => {
        if (categoryCounts.hasOwnProperty(post.category)) {
            categoryCounts[post.category]++;
        } else {
            // Eğer kategori tanımlı değilse, yeni ekle
            categoryCounts[post.category] = 1;
        }
    });
    
    // Kategori listesi elementini bul
    const categoryListContainer = document.querySelector('.card-header + .card-body .list-group');
    if (!categoryListContainer) return;
    
    // Kategori listesini temizle
    categoryListContainer.innerHTML = '';
    
    // Her kategori için liste öğesi oluştur
    Object.entries(categoryCounts).forEach(([categoryName, count]) => {
        // Kategorinin rengini bul
        let categoryColor = 'secondary'; // varsayılan renk
        const category = categories.find(cat => cat.name === categoryName);
        if (category && category.color) {
            categoryColor = category.color;
        }
        
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
            <a href="blog.html?kategori=${encodeURIComponent(categoryName)}" class="text-decoration-none text-dark">${categoryName}</a>
            <span class="badge bg-${categoryColor} rounded-pill">${count}</span>
        `;
        categoryListContainer.appendChild(listItem);
    });
    
    // Tüm kategoriler seçeneğini ekle
    const totalPosts = posts.length;
    const allCategories = document.createElement('li');
    allCategories.className = 'list-group-item d-flex justify-content-between align-items-center';
    allCategories.innerHTML = `
        <a href="blog.html" class="text-decoration-none text-dark">Tüm Kategoriler</a>
        <span class="badge bg-secondary rounded-pill">${totalPosts}</span>
    `;
    categoryListContainer.appendChild(allCategories);
    
    // Aktif kategoriyi vurgula
    highlightActiveCategory();
}

// Update recent posts
function updateRecentPosts(posts) {
    const recentPostsDiv = document.querySelector('.card-body .recent-post').parentElement;
    
    if (recentPostsDiv && posts.length > 0) {
        // Clear container
        recentPostsDiv.innerHTML = '';
        
        // Sort posts by date (newest first)
        const sortedPosts = [...posts].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        // Display up to 3 recent posts
        const recentPosts = sortedPosts.slice(0, 3);
        
        // Create HTML for each recent post
        recentPosts.forEach(post => {
            const recentPostHTML = `
                <div class="recent-post d-flex mb-3">
                    <img src="${post.image}" alt="${post.title}" class="recent-post-img">
                    <div class="ms-3">
                        <h6 class="mb-1"><a href="blog-post.html?id=${post.id}" class="text-decoration-none text-dark">${post.title}</a></h6>
                        <small class="text-muted">${post.date}</small>
                    </div>
                </div>
            `;
            recentPostsDiv.innerHTML += recentPostHTML;
        });
    }
}

// Setup newsletter form
function setupNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value;
            
            if (email) {
                // Store subscribed email (in a real application, this would be sent to a server)
                const subscribers = JSON.parse(localStorage.getItem('subscribers')) || [];
                
                // Check if email already exists
                if (!subscribers.includes(email)) {
                    subscribers.push(email);
                    localStorage.setItem('subscribers', JSON.stringify(subscribers));
                    
                    // Show success message
                    alert('Bültene başarıyla abone oldunuz!');
                    
                    // Reset form
                    this.reset();
                } else {
                    alert('Bu e-posta adresi zaten aboneler listesinde!');
                }
            }
        });
    }
}

// Get badge class for category
function getCategoryBadgeClass(category) {
    // Kategorileri localStorage'dan al
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    
    // Kategori adına göre kategori nesnesini bul
    const categoryObj = categories.find(cat => cat.name === category);
    
    // Eğer kategori bulunduysa, onun rengini kullan
    if (categoryObj && categoryObj.color) {
        return `bg-${categoryObj.color}`;
    }
    
    // Kategori bulunamadıysa veya rengi yoksa, varsayılan renk kullan
    return 'bg-secondary';
}

// Update pagination
function updatePagination(postCount) {
    const pagination = document.querySelector('.pagination');
    if (pagination) {
        // Basic pagination logic - can be expanded for real pagination
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFilter = urlParams.get('kategori');
        
        // Current URL base for category filter
        const baseUrl = categoryFilter 
            ? `blog.html?kategori=${encodeURIComponent(categoryFilter)}&page=` 
            : 'blog.html?page=';
            
        // Simple display/hide logic based on post count
        if (postCount <= 3) {
            pagination.style.display = 'none';
        } else {
            pagination.style.display = 'flex';
            
            // Update page links
            const pageLinks = pagination.querySelectorAll('.page-link');
            pageLinks.forEach((link, index) => {
                if (index > 0 && index < pageLinks.length - 1) {
                    // Page number links
                    link.href = baseUrl + (index);
                } else if (index === 0) {
                    // Previous link
                    link.href = baseUrl + '1';
                } else {
                    // Next link
                    link.href = baseUrl + '2';
                }
            });
        }
    }
}

// Highlight active category
function highlightActiveCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFilter = urlParams.get('kategori');
    
    if (categoryFilter) {
        // Find the category link
        const categoryLinks = document.querySelectorAll('.list-group-item a');
        categoryLinks.forEach(link => {
            if (link.textContent === categoryFilter) {
                link.classList.add('fw-bold', 'text-primary');
            }
        });
    } else {
        // Highlight "All Categories" link
        const allCategoriesLink = document.querySelector('.list-group-item a[href="blog.html"]');
        if (allCategoriesLink) {
            allCategoriesLink.classList.add('fw-bold', 'text-primary');
        }
    }
} 