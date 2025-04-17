// Blog post functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

    // Get post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get('id'));

    if (postId) {
        // Load blog post
        loadBlogPost(postId);
        
        // Update category counts
        updateCategoryCounts();
        
        // Setup share buttons
        setupShareButtons();
        
        // Setup newsletter form
        setupNewsletterForm();
    } else {
        // If no post ID, redirect to blog page
        window.location.href = 'blog.html';
    }
});

// Load blog post from localStorage
function loadBlogPost(postId) {
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    const post = blogPosts.find(p => p.id === postId);
    
    if (post) {
        // Update post views
        updatePostViews(postId);
        
        // Update page title
        document.title = `${post.title} | Dyt. Kevser Sare Ateş`;
        
        // Update blog post header
        document.getElementById('blogTitle').textContent = post.title;
        document.getElementById('blogCategory').textContent = post.category;
        document.getElementById('blogCategory').className = `badge ${getCategoryBadgeClass(post.category)} me-3`;
        document.getElementById('blogDate').innerHTML = `<i class="far fa-calendar-alt me-1"></i> ${post.date}`;
        document.getElementById('blogViews').innerHTML = `<i class="far fa-eye me-1"></i> ${post.views} Görüntülenme`;
        
        // Update blog post image
        document.getElementById('blogImage').src = post.image;
        document.getElementById('blogImage').alt = post.title;
        
        // Update blog post content
        document.getElementById('blogContent').innerHTML = post.content;
        
        // Load related posts
        loadRelatedPosts(post);
        
        // Update recent posts
        updateRecentPosts(blogPosts);
    } else {
        // If post not found, redirect to blog page
        window.location.href = 'blog.html';
    }
}

// Update post views
function updatePostViews(postId) {
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    const postIndex = blogPosts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
        // Increment views
        blogPosts[postIndex].views += 1;
        
        // Save to localStorage
        localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
        
        // Update views count in UI
        document.getElementById('blogViews').innerHTML = `<i class="far fa-eye me-1"></i> ${blogPosts[postIndex].views} Görüntülenme`;
    }
}

// Load related posts
function loadRelatedPosts(currentPost) {
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    const relatedPostsContainer = document.getElementById('relatedPostsContainer');
    
    if (relatedPostsContainer && blogPosts.length > 0) {
        // Clear container
        relatedPostsContainer.innerHTML = '';
        
        // Find related posts (same category or similar title)
        const relatedPosts = blogPosts.filter(post => {
            return (post.id !== currentPost.id) && 
                   (post.category === currentPost.category || 
                    post.title.toLowerCase().includes(currentPost.title.toLowerCase().split(' ')[0]));
        });
        
        // If no related posts found, show random posts
        let postsToShow = relatedPosts;
        if (relatedPosts.length < 2) {
            const otherPosts = blogPosts.filter(post => post.id !== currentPost.id && !relatedPosts.includes(post));
            postsToShow = [...relatedPosts, ...otherPosts].slice(0, 2);
        }
        
        // Show up to 2 related posts
        postsToShow.slice(0, 2).forEach(post => {
            const relatedPostHTML = `
                <div class="col-md-6">
                    <div class="card border-0 shadow-sm">
                        <img src="${post.image}" class="card-img-top" alt="${post.title}">
                        <div class="card-body">
                            <h5 class="card-title"><a href="blog-post.html?id=${post.id}" class="text-decoration-none text-dark">${post.title}</a></h5>
                            <p class="card-text">${post.summary}</p>
                        </div>
                    </div>
                </div>
            `;
            relatedPostsContainer.innerHTML += relatedPostHTML;
        });
    }
}

// Update category counts
function updateCategoryCounts() {
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    const categories = {
        'Sağlıklı Tarifler': 0,
        'Diyet': 0,
        'Sağlıklı Yaşam': 0,
        'Spor': 0,
        'Hamilelik': 0
    };
    
    // Count posts in each category
    blogPosts.forEach(post => {
        if (categories.hasOwnProperty(post.category)) {
            categories[post.category]++;
        }
    });
    
    // Update category badges
    const categoryList = document.querySelectorAll('.list-group-item');
    categoryList.forEach(item => {
        const categoryName = item.querySelector('a').textContent;
        const badge = item.querySelector('.badge');
        
        if (categories.hasOwnProperty(categoryName)) {
            badge.textContent = categories[categoryName];
        }
    });
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

// Setup share buttons
function setupShareButtons() {
    const shareButtons = document.querySelectorAll('.social-share-buttons a');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const pageUrl = encodeURIComponent(window.location.href);
            const pageTitle = encodeURIComponent(document.getElementById('blogTitle').textContent);
            let shareUrl = '';
            
            if (this.querySelector('i').classList.contains('fa-facebook-f')) {
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
            } else if (this.querySelector('i').classList.contains('fa-twitter')) {
                shareUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
            } else if (this.querySelector('i').classList.contains('fa-whatsapp')) {
                shareUrl = `https://api.whatsapp.com/send?text=${pageTitle} ${pageUrl}`;
            } else if (this.querySelector('i').classList.contains('fa-pinterest')) {
                const imageUrl = encodeURIComponent(document.getElementById('blogImage').src);
                shareUrl = `https://pinterest.com/pin/create/button/?url=${pageUrl}&media=${imageUrl}&description=${pageTitle}`;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
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