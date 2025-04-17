// Admin login functionality
document.addEventListener('DOMContentLoaded', function() {
    // Önce giriş durumunu kontrol et
    checkLoginStatus();
    
    const adminLoginForm = document.getElementById('adminLoginForm');
    const loginMessage = document.getElementById('loginMessage');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    // Handle form submission
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Demo admin credentials - In a real application, this should be authenticated on server side
            const validUsername = 'admin';
            const validPassword = 'admin123';
            
            if (username === validUsername && password === validPassword) {
                // Store login status in localStorage
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminLoginTime', new Date().getTime());
                
                // Show success message
                showMessage('success', '<i class="fas fa-check-circle me-2"></i>Giriş başarılı! Yönlendiriliyorsunuz...');
                
                // Disable form elements during redirection
                disableFormElements(true);
                
                // Redirect to admin panel
                setTimeout(function() {
                    window.location.href = 'admin-panel.html';
                }, 1500);
            } else {
                // Show error message
                if (username === validUsername && password !== validPassword) {
                    showMessage('danger', '<i class="fas fa-exclamation-circle me-2"></i>Şifre hatalı! Lütfen tekrar deneyin.');
                } else if (username !== validUsername) {
                    showMessage('danger', '<i class="fas fa-exclamation-circle me-2"></i>Kullanıcı adı hatalı! Lütfen tekrar deneyin.');
                } else {
                    showMessage('danger', '<i class="fas fa-exclamation-circle me-2"></i>Kullanıcı adı veya şifre hatalı!');
                }
                
                // Shake the form to indicate error
                adminLoginForm.classList.add('shake');
                setTimeout(() => {
                    adminLoginForm.classList.remove('shake');
                }, 500);
                
                // Clear password field
                passwordInput.value = '';
                passwordInput.focus();
            }
        });
    }
    
    // Helper function to show message
    function showMessage(type, message) {
        loginMessage.className = 'alert alert-' + type + ' fade show';
        loginMessage.innerHTML = message;
        loginMessage.style.display = 'block';
        
        // Auto hide error messages after 3 seconds, but keep success messages
        if (type === 'danger') {
            setTimeout(function() {
                loginMessage.classList.remove('show');
                setTimeout(() => {
                    loginMessage.style.display = 'none';
                }, 200);
            }, 3000);
        }
    }
    
    // Helper function to disable/enable form elements
    function disableFormElements(disabled) {
        const formElements = adminLoginForm.querySelectorAll('input, button');
        formElements.forEach(element => {
            element.disabled = disabled;
        });
        
        // Add/remove loading spinner to login button
        const loginButton = adminLoginForm.querySelector('button[type="submit"]');
        if (disabled) {
            loginButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Giriş Yapılıyor...';
        } else {
            loginButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Giriş Yap';
        }
    }

    // Kullanıcı giriş durumunu kontrol et
    function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        const loginTime = parseInt(localStorage.getItem('adminLoginTime') || '0');
        const currentTime = new Date().getTime();
        const oneHour = 60 * 60 * 1000; // 1 saat (milisaniye cinsinden)
        
        // Oturum kontrolü: 1 saat geçerse oturumu sonlandır
        if (isLoggedIn && (currentTime - loginTime > oneHour)) {
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminLoginTime');
            
            // Oturum süresi doldu mesajını göster
            if (window.location.pathname.includes('admin.html')) {
                showMessage('warning', '<i class="fas fa-clock me-2"></i>Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
            }
            return false;
        }
        
        // Eğer giriş yapılmışsa ve admin.html sayfasındaysak, panel sayfasına yönlendir
        if (isLoggedIn && window.location.pathname.includes('admin.html')) {
            window.location.href = 'admin-panel.html';
            return true;
        }
        
        return isLoggedIn;
    }
}); 