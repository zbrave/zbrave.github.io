// AOS Animasyon Başlatma
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('shadow');
    } else {
        navbar.classList.remove('shadow');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Navbar yüksekliğini hesapla
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            // Element pozisyonunu al
            const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
            // Navbar yüksekliğini hesaba katarak scroll yap
            const offsetPosition = elementPosition - navbarHeight;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Testimonial Slider
const testimonialSlider = new Swiper('.testimonial-slider', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    breakpoints: {
        768: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        }
    }
});

// Form submission handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Form validation
        const formData = new FormData(this);
        let isValid = true;
        
        // Basic validation
        formData.forEach((value, key) => {
            if (!value.trim()) {
                isValid = false;
                const input = this.querySelector(`[name="${key}"]`);
                if (input) {
                    input.classList.add('is-invalid');
                }
            }
        });

        if (isValid) {
            // Form gönderme animasyonu
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
            submitButton.disabled = true;

            // Simüle edilmiş form gönderimi
            setTimeout(() => {
                // Başarılı gönderim animasyonu
                submitButton.innerHTML = '<i class="fas fa-check"></i> Gönderildi!';
                submitButton.classList.add('btn-success');
                
                // Formu sıfırla
                this.reset();
                
                // 3 saniye sonra butonu eski haline getir
                setTimeout(() => {
                    submitButton.innerHTML = originalText;
                    submitButton.classList.remove('btn-success');
                    submitButton.disabled = false;
                }, 3000);
            }, 1500);
        } else {
            // Hata animasyonu
            this.classList.add('shake');
            setTimeout(() => {
                this.classList.remove('shake');
            }, 500);
        }
    });
}

// Remove invalid class on input focus
document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('focus', function() {
        this.classList.remove('is-invalid');
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        const scrolled = window.pageYOffset;
        heroVideo.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Expertise items hover effect
document.querySelectorAll('.expertise-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Service cards hover effect
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Blog cards hover effect
document.querySelectorAll('.blog-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// WhatsApp button hover effect
const whatsappButton = document.querySelector('.whatsapp-button');
if (whatsappButton) {
    whatsappButton.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    
    whatsappButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
}

// Initialize tooltips
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
}); 