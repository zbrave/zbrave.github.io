console.log('Debug script yüklendi');

// AdminPanel objesine olan referansı izole edelim
let adminPanelRef;

// DOM yüklendikten sonra butonlara event listener'ları manuel olarak bağla
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM yüklendi, butonlara event listener ekleniyor');
    
    // AdminPanel objesini bulmak için
    setTimeout(function() {
        adminPanelRef = window.AdminPanel;
        console.log('AdminPanel referansı:', adminPanelRef);
        
        // saveCategory fonksiyonunu global scope'a çıkar
        window.saveCategory = function() {
            console.log('Global saveCategory fonksiyonu çağrıldı');
            if (adminPanelRef && typeof adminPanelRef.saveCategory === 'function') {
                adminPanelRef.saveCategory();
            } else {
                console.error('AdminPanel veya saveCategory fonksiyonu bulunamadı');
                alert('Kategori kaydetme fonksiyonu bulunamadı, lütfen sayfayı yenileyip tekrar deneyin');
            }
        };
        
        // Kaydet butonunu manuel olarak dinle
        const saveCategoryBtn = document.getElementById('saveCategoryBtn');
        if (saveCategoryBtn) {
            console.log('Kategori kaydet butonu bulundu, event listener ekleniyor');
            saveCategoryBtn.addEventListener('click', function() {
                console.log('Kategori kaydet butonuna tıklandı');
                window.saveCategory();
            });
        } else {
            console.error('Kategori kaydet butonu bulunamadı');
        }
    }, 1000); // 1 saniye bekle, sayfanın tam yüklenmesi için
});
