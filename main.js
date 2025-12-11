// Clinicalab Platform - Main JavaScript File

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTypedText();
    initializeParticles();
    initializeCarousels();
    initializeAnimations();
    initializeSearch();
    initializeScrollEffects();
});

// Typed.js initialization for hero text
function initializeTypedText() {
    if (document.getElementById('typed-text')) {
        new Typed('#typed-text', {
            strings: [
                'للتحاليل الطبية',
                'للخدمات الصحية',
                'للرعاية الطبية',
                'للشفافية والجودة'
            ],
            typeSpeed: 80,
            backSpeed: 50,
            backDelay: 2000,
            loop: true,
            showCursor: true,
            cursorChar: '|',
            autoInsertCss: true
        });
    }
}

// P5.js particles for hero background
function initializeParticles() {
    if (document.getElementById('particles-container')) {
        new p5(function(p) {
            let particles = [];
            let numParticles = 50;
            
            p.setup = function() {
                let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                canvas.parent('particles-container');
                
                // Create particles
                for (let i = 0; i < numParticles; i++) {
                    particles.push({
                        x: p.random(p.width),
                        y: p.random(p.height),
                        vx: p.random(-0.5, 0.5),
                        vy: p.random(-0.5, 0.5),
                        size: p.random(2, 6),
                        alpha: p.random(0.1, 0.3)
                    });
                }
            };
            
            p.draw = function() {
                p.clear();
                
                // Update and draw particles
                for (let particle of particles) {
                    // Update position
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    
                    // Wrap around edges
                    if (particle.x < 0) particle.x = p.width;
                    if (particle.x > p.width) particle.x = 0;
                    if (particle.y < 0) particle.y = p.height;
                    if (particle.y > p.height) particle.y = 0;
                    
                    // Draw particle
                    p.fill(37, 99, 235, particle.alpha * 255);
                    p.noStroke();
                    p.ellipse(particle.x, particle.y, particle.size);
                }
                
                // Draw connections
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        let d = p.dist(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                        if (d < 100) {
                            p.stroke(37, 99, 235, (1 - d/100) * 50);
                            p.strokeWeight(1);
                            p.line(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                        }
                    }
                }
            };
            
            p.windowResized = function() {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
            };
        });
    }
}

// Initialize Splide carousels
function initializeCarousels() {
    // Labs carousel
    if (document.getElementById('labs-carousel')) {
        new Splide('#labs-carousel', {
            type: 'loop',
            perPage: 3,
            perMove: 1,
            gap: '2rem',
            autoplay: true,
            interval: 4000,
            pauseOnHover: true,
            breakpoints: {
                1024: {
                    perPage: 2,
                },
                640: {
                    perPage: 1,
                }
            }
        }).mount();
    }
    
    // Testimonials carousel (if exists)
    if (document.getElementById('testimonials-carousel')) {
        new Splide('#testimonials-carousel', {
            type: 'loop',
            perPage: 1,
            autoplay: true,
            interval: 5000,
            pauseOnHover: true
        }).mount();
    }
}

// Initialize animations with Anime.js
function initializeAnimations() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateElement(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.lab-card, .service-icon, .floating-element').forEach(el => {
        observer.observe(el);
    });
    
    // Hero section animation
    anime({
        targets: '.hero-content > div',
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 1000,
        delay: 500,
        easing: 'easeOutQuart'
    });
}

// Animate individual elements
function animateElement(element) {
    if (element.classList.contains('lab-card')) {
        anime({
            targets: element,
            translateY: [30, 0],
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutQuart'
        });
    } else if (element.classList.contains('service-icon')) {
        anime({
            targets: element,
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutBack'
        });
    }
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performLiveSearch(e.target.value);
            }, 300);
        });
    }
}

// Live search function
function performLiveSearch(query) {
    if (query.length < 2) return;
    
    // Simulate search results (in real app, this would be an API call)
    console.log('Searching for:', query);
    
    // Show search suggestions (mock data)
    const suggestions = [
        'تحاليل الدم الشاملة',
        'فحص الكلى والكبد',
        'تحاليل الهرمونات',
        'فحص السكري',
        'أشعة الرنين المغناطيسي'
    ].filter(item => item.includes(query));
    
    // In a real implementation, you would show these suggestions in a dropdown
    console.log('Suggestions:', suggestions);
}

// Perform search (called from search button)
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput ? searchInput.value : '';
    
    if (query.trim()) {
        // Redirect to search page with query
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    } else {
        // Redirect to search page without query
        window.location.href = 'search.html';
    }
}

// Scroll effects
function initializeScrollEffects() {
    let ticking = false;
    
    function updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-particles');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 ${
        type === 'success' ? 'bg-success-green text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-medical-blue text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(full)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Lab booking functions
function bookLab(labId) {
    showNotification('جاري تحويلك إلى صفحة الحجز...', 'info');
    setTimeout(() => {
        window.location.href = `booking.html?lab=${labId}`;
    }, 1000);
}

function viewLabDetails(labId) {
    window.location.href = `lab-details.html?id=${labId}`;
}

// Comparison functions
function addToComparison(labId) {
    let comparisonList = JSON.parse(localStorage.getItem('comparisonList') || '[]');
    
    if (comparisonList.includes(labId)) {
        showNotification('المختبر already in comparison list', 'info');
        return;
    }
    
    if (comparisonList.length >= 3) {
        showNotification('يمكنك مقارنة 3 مختبرات كحد أقصى', 'error');
        return;
    }
    
    comparisonList.push(labId);
    localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
    showNotification('تمت إضافة المختبر إلى قائمة المقارنة', 'success');
}

function removeFromComparison(labId) {
    let comparisonList = JSON.parse(localStorage.getItem('comparisonList') || '[]');
    comparisonList = comparisonList.filter(id => id !== labId);
    localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
    showNotification('تمت إزالة المختبر من قائمة المقارنة', 'info');
}

// User authentication functions
function showLoginModal() {
    showNotification('جاري فتح نافذة تسجيل الدخول...', 'info');
    // In a real app, this would show a login modal
}

function showRegisterModal() {
    showNotification('جاري فتح نافذة إنشاء الحساب...', 'info');
    // In a real app, this would show a register modal
}

// Mobile menu toggle
function toggleMobileMenu() {
    const menu = document.querySelector('.mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Language toggle
function toggleLanguage() {
    const currentLang = document.documentElement.lang;
    const newLang = currentLang === 'ar' ? 'fr' : 'ar';
    
    // In a real app, this would switch the language
    showNotification(`Switching to ${newLang === 'ar' ? 'العربية' : 'Français'}`, 'info');
}

// Initialize tooltips and popovers
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(event) {
    const element = event.target;
    const tooltipText = element.getAttribute('data-tooltip');
    
    const tooltip = document.createElement('div');
    tooltip.className = 'absolute z-50 px-2 py-1 text-sm bg-gray-900 text-white rounded shadow-lg';
    tooltip.textContent = tooltipText;
    tooltip.id = 'tooltip';
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
        document.body.removeChild(tooltip);
    }
}

// Form validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function validateForm(formData) {
    const errors = [];
    
    if (!formData.name || formData.name.trim().length < 2) {
        errors.push('الاسم يجب أن يحتوي على حرفين على الأقل');
    }
    
    if (!validateEmail(formData.email)) {
        errors.push('البريد الإلكتروني غير صالح');
    }
    
    if (!validatePhone(formData.phone)) {
        errors.push('رقم الهاتف يجب أن يحتوي على 10 أرقام');
    }
    
    return errors;
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeTooltips();
    
    // Add click handlers for buttons that don't have specific functions yet
    document.querySelectorAll('button').forEach(button => {
        if (!button.onclick && !button.getAttribute('onclick')) {
            button.addEventListener('click', function() {
                const buttonText = this.textContent.trim();
                if (buttonText.includes('حجز') || buttonText.includes('booking')) {
                    showNotification('جاري تحويلك إلى صفحة الحجز...', 'info');
                } else if (buttonText.includes('تفاصيل') || buttonText.includes('details')) {
                    showNotification('جاري تحويلك إلى صفحة التفاصيل...', 'info');
                } else {
                    showNotification('تم النقر على الزر: ' + buttonText, 'info');
                }
            });
        }
    });
});