// Authentication Module for Clinicalab

class AuthSystem {
    constructor() {
        this.currentUser = this.loadUser();
        this.users = this.loadUsers();
        this.initializeAuthUI();
    }

    // Load current user from localStorage
    loadUser() {
        const storedUser = localStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    }

    // Load all users from localStorage
    loadUsers() {
        const storedUsers = localStorage.getItem('clinicalabUsers');
        return storedUsers ? JSON.parse(storedUsers) : [];
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('clinicalabUsers', JSON.stringify(this.users));
    }

    // Save current user to localStorage
    saveCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.updateAuthUI();
    }

    // Register a new user
    register(userData) {
        const { email, password, confirmPassword, fullName, phone, age, gender } = userData;

        // Validation
        const errors = [];
        if (!fullName || fullName.trim().length < 2) {
            errors.push('الاسم يجب أن يحتوي على حرفين على الأقل');
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('البريد الإلكتروني غير صالح');
        }
        if (!phone || !/^[0-9]{10}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
            errors.push('رقم الهاتف يجب أن يحتوي على 10 أرقام');
        }
        if (!password || password.length < 6) {
            errors.push('كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل');
        }
        if (password !== confirmPassword) {
            errors.push('كلمات المرور غير متطابقة');
        }

        if (errors.length > 0) {
            return { success: false, errors };
        }

        // Check if user already exists
        const userExists = this.users.some(user => user.email === email);
        if (userExists) {
            return { success: false, errors: ['البريد الإلكتروني مسجل بالفعل'] };
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            email,
            password: this.hashPassword(password),
            fullName,
            phone,
            age: age || null,
            gender: gender || null,
            createdAt: new Date().toISOString(),
            bookings: [],
            favorites: [],
            profileComplete: false
        };

        this.users.push(newUser);
        this.saveUsers();

        // Log user in
        const userToSave = { ...newUser };
        delete userToSave.password;
        this.saveCurrentUser(userToSave);

        return { success: true, user: userToSave };
    }

    // Login user
    login(email, password) {
        const errors = [];

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('البريد الإلكتروني غير صالح');
        }

        if (!password) {
            errors.push('كلمة المرور مطلوبة');
        }

        if (errors.length > 0) {
            return { success: false, errors };
        }

        // Find user
        const user = this.users.find(u => u.email === email);
        
        if (!user) {
            return { success: false, errors: ['البريد الإلكتروني أو كلمة المرور غير صحيحة'] };
        }

        // Check password
        if (user.password !== this.hashPassword(password)) {
            return { success: false, errors: ['البريد الإلكتروني أو كلمة المرور غير صحيحة'] };
        }

        // Log user in
        const userToSave = { ...user };
        delete userToSave.password;
        this.saveCurrentUser(userToSave);

        return { success: true, user: userToSave };
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateAuthUI();
        window.location.href = 'index.html';
    }

    // Simple hash function (in real app, use bcrypt or similar on backend)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'hash_' + Math.abs(hash).toString(36);
    }

    // Update user profile
    updateProfile(updates) {
        if (!this.currentUser) {
            return { success: false, errors: ['يجب تسجيل الدخول أولاً'] };
        }

        // Find user in users array
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) {
            return { success: false, errors: ['مستخدم غير موجود'] };
        }

        // Update user
        this.users[userIndex] = { ...this.users[userIndex], ...updates };
        this.saveUsers();

        // Update current user
        const updatedUser = { ...this.users[userIndex] };
        delete updatedUser.password;
        this.saveCurrentUser(updatedUser);

        return { success: true, user: updatedUser };
    }

    // Initialize auth UI
    initializeAuthUI() {
        this.updateAuthUI();
        this.attachAuthEventListeners();
    }

    // Update auth UI based on user state
    updateAuthUI() {
        const authButton = document.getElementById('auth-button');
        const userMenu = document.getElementById('user-menu');
        const userName = document.getElementById('user-name');
        const logoutBtn = document.getElementById('logout-btn');
        const profileLink = document.getElementById('profile-link');

        if (!authButton) return; // Not on a page with auth buttons

        if (this.currentUser) {
            // User is logged in
            if (authButton) {
                authButton.innerHTML = '
                    <img src="https://ui-avatars.com/api/?name=' + encodeURIComponent(this.currentUser.fullName) + '&background=2563EB&color=fff" 
                         alt="Avatar" class="w-10 h-10 rounded-full cursor-pointer" id="user-avatar">
                ';
                authButton.style.padding = '0.25rem';
            }

            if (userMenu) {
                userMenu.style.display = 'none'; // Hide login/register buttons
            }

            if (userName && this.currentUser.fullName) {
                userName.textContent = this.currentUser.fullName;
            }

            if (logoutBtn) {
                logoutBtn.style.display = 'block';
                logoutBtn.addEventListener('click', () => this.logout());
            }

            if (profileLink) {
                profileLink.style.display = 'block';
                profileLink.addEventListener('click', () => {
                    window.location.href = 'profile.html';
                });
            }

            // Add avatar click listener
            const avatar = document.getElementById('user-avatar');
            if (avatar) {
                avatar.addEventListener('click', () => {
                    const dropdown = document.getElementById('user-dropdown');
                    if (dropdown) {
                        dropdown.classList.toggle('hidden');
                    }
                });
            }
        } else {
            // User is not logged in
            if (authButton) {
                authButton.innerHTML = `
                    <button onclick="openLoginModal()" class="px-4 py-2 text-medical-blue border border-medical-blue rounded-lg hover:bg-medical-blue hover:text-white transition-all">
                        تسجيل دخول
                    </button>
                `;
                authButton.style.padding = 'inherit';
            }

            if (userMenu) {
                userMenu.style.display = 'flex';
            }

            if (logoutBtn) {
                logoutBtn.style.display = 'none';
            }

            if (profileLink) {
                profileLink.style.display = 'none';
            }
        }
    }

    // Attach auth event listeners
    attachAuthEventListeners() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;

                const result = this.login(email, password);
                if (result.success) {
                    showNotification('تم تسجيل الدخول بنجاح', 'success');
                    closeLoginModal();
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    showNotification(result.errors.join('\n'), 'error');
                }
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const fullName = document.getElementById('register-fullname').value;
                const email = document.getElementById('register-email').value;
                const phone = document.getElementById('register-phone').value;
                const password = document.getElementById('register-password').value;
                const confirmPassword = document.getElementById('register-confirm-password').value;
                const age = document.getElementById('register-age').value;
                const gender = document.getElementById('register-gender').value;

                const result = this.register({
                    email,
                    password,
                    confirmPassword,
                    fullName,
                    phone,
                    age,
                    gender
                });

                if (result.success) {
                    showNotification('تم إنشاء الحساب بنجاح', 'success');
                    closeRegisterModal();
                    setTimeout(() => {
                        window.location.href = 'profile.html';
                    }, 1000);
                } else {
                    showNotification(result.errors.join('\n'), 'error');
                }
            });
        }
    }

    // Get user bookings
    getBookings() {
        if (!this.currentUser) return [];
        const user = this.users.find(u => u.id === this.currentUser.id);
        return user ? user.bookings : [];
    }

    // Add booking
    addBooking(bookingData) {
        if (!this.currentUser) {
            return { success: false, errors: ['يجب تسجيل الدخول أولاً'] };
        }

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) {
            return { success: false, errors: ['مستخدم غير موجود'] };
        }

        const booking = {
            id: Date.now().toString(),
            ...bookingData,
            createdAt: new Date().toISOString(),
            status: 'confirmed'
        };

        this.users[userIndex].bookings.push(booking);
        this.saveUsers();

        const updatedUser = { ...this.users[userIndex] };
        delete updatedUser.password;
        this.saveCurrentUser(updatedUser);

        return { success: true, booking };
    }

    // Add favorite lab
    addFavorite(labId) {
        if (!this.currentUser) {
            return { success: false, errors: ['يجب تسجيل الدخول أولاً'] };
        }

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) {
            return { success: false, errors: ['مستخدم غير موجود'] };
        }

        if (!this.users[userIndex].favorites.includes(labId)) {
            this.users[userIndex].favorites.push(labId);
            this.saveUsers();

            const updatedUser = { ...this.users[userIndex] };
            delete updatedUser.password;
            this.saveCurrentUser(updatedUser);
        }

        return { success: true };
    }

    // Remove favorite lab
    removeFavorite(labId) {
        if (!this.currentUser) {
            return { success: false, errors: ['يجب تسجيل الدخول أولاً'] };
        }

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) {
            return { success: false, errors: ['مستخدم غير موجود'] };
        }

        this.users[userIndex].favorites = this.users[userIndex].favorites.filter(id => id !== labId);
        this.saveUsers();

        const updatedUser = { ...this.users[userIndex] };
        delete updatedUser.password;
        this.saveCurrentUser(updatedUser);

        return { success: true };
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth system
let authSystem = null;

document.addEventListener('DOMContentLoaded', function() {
    authSystem = new AuthSystem();
});

// Modal functions
function openLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function openRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Switch between login and register modals
function switchToRegister() {
    closeLoginModal();
    openRegisterModal();
}

function switchToLogin() {
    closeRegisterModal();
    openLoginModal();
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');

    if (loginModal && event.target === loginModal) {
        closeLoginModal();
    }

    if (registerModal && event.target === registerModal) {
        closeRegisterModal();
    }
});

// Close modal with escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeLoginModal();
        closeRegisterModal();
    }
});
// auth.js - ملف جديد لحفظ حالة المصادقة
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // تحميل بيانات المستخدم من localStorage
        const userData = localStorage.getItem('clinicalab_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUI();
        }
    }

    // تسجيل الدخول
    login(userData) {
        this.currentUser = userData;
        localStorage.setItem('clinicalab_user', JSON.stringify(userData));
        this.updateUI();
    }

    // تسجيل الخروج
    logout() {
        this.currentUser = null;
        localStorage.removeItem('clinicalab_user');
        this.updateUI();
        window.location.href = 'index.html';
    }

    // التحقق من حالة تسجيل الدخول
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // تحديث واجهة المستخدم بناءً على حالة المصادقة
    updateUI() {
        const userMenuDesktop = document.getElementById('user-menu-desktop');
        const userMenuMobile = document.querySelector('.mobile-menu .auth-buttons');
        const profileLinks = document.querySelectorAll('.profile-link');

        if (this.isLoggedIn()) {
            // إخفاء أزرار تسجيل الدخول/إنشاء حساب
            if (userMenuDesktop) {
                userMenuDesktop.innerHTML = this.createUserMenuDesktop();
            }
            
            if (userMenuMobile) {
                userMenuMobile.innerHTML = this.createUserMenuMobile();
            }

            // إضافة روابط الملف الشخصي في القائمة المتنقلة
            profileLinks.forEach(link => {
                if (link) {
                    link.style.display = 'block';
                }
            });
        } else {
            // إظهار أزرار تسجيل الدخول العادية
            if (userMenuDesktop) {
                userMenuDesktop.innerHTML = `
                    <button class="px-4 py-2 text-medical-blue border border-medical-blue rounded-lg hover:bg-medical-blue hover:text-white transition-all" onclick="window.location.href='login.html'">
                        تسجيل دخول
                    </button>
                    <button class="px-4 py-2 bg-medical-blue text-white rounded-lg hover:bg-blue-700 transition-all" onclick="window.location.href='register.html'">
                        إنشاء حساب
                    </button>
                `;
            }

            // إخفاء روابط الملف الشخصي في القائمة المتنقلة
            profileLinks.forEach(link => {
                if (link) {
                    link.style.display = 'none';
                }
            });
        }
    }

    // إنشاء قائمة المستخدم لسطح المكتب
    createUserMenuDesktop() {
        return `
            <div class="relative group">
                <button class="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 text-cool-gray hover:text-medical-blue transition-colors">
                    <i class="fas fa-user-circle text-xl"></i>
                    <span>${this.currentUser.name || 'المستخدم'}</span>
                    <i class="fas fa-chevron-down text-xs"></i>
                </button>
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-50">
                    <div class="py-2">
                        <a href="profile.html" class="block px-4 py-2 text-cool-gray hover:bg-gray-50 hover:text-medical-blue transition-colors">
                            <i class="fas fa-user ml-2"></i> الملف الشخصي
                        </a>
                        <a href="bookings.html" class="block px-4 py-2 text-cool-gray hover:bg-gray-50 hover:text-medical-blue transition-colors">
                            <i class="fas fa-calendar-alt ml-2"></i> حجوزاتي
                        </a>
                        <div class="border-t border-gray-200 mt-2">
                            <button onclick="auth.logout()" class="w-full text-right px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors">
                                <i class="fas fa-sign-out-alt ml-2"></i> تسجيل الخروج
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // إنشاء قائمة المستخدم للجوال
    createUserMenuMobile() {
        return `
            <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center mb-3">
                    <i class="fas fa-user-circle text-2xl text-medical-blue ml-3"></i>
                    <div>
                        <p class="font-semibold">${this.currentUser.name || 'المستخدم'}</p>
                        <p class="text-sm text-cool-gray">${this.currentUser.email || ''}</p>
                    </div>
                </div>
                <button onclick="auth.logout()" class="w-full py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-all">
                    <i class="fas fa-sign-out-alt ml-2"></i> تسجيل الخروج
                </button>
            </div>
        `;
    }
}

// إنشاء كائن عالمي للمصادقة
const auth = new AuthManager();
// داخل دالة updateUI() في auth.js
updateUI() {
    const userMenuDesktop = document.getElementById('user-menu-desktop');
    const authButtonsMobile = document.querySelector('.mobile-menu .auth-buttons');
    
    if (this.isLoggedIn()) {
        // حالة المستخدم المسجل
        
        // تحديث القائمة العلوية لسطح المكتب
        if (userMenuDesktop) {
            userMenuDesktop.innerHTML = this.createUserMenuDesktop();
        }
        
        // تحديث قسم الأزرار في القائمة المتنقلة
        if (authButtonsMobile) {
            authButtonsMobile.innerHTML = this.createUserMenuMobile();
        }
        
    } else {
        // حالة المستخدم غير المسجل
        
        // إعادة أزرار التسجيل الأصلية للقائمة العلوية
        if (userMenuDesktop) {
            userMenuDesktop.innerHTML = `
                <button class="px-4 py-2 text-medical-blue border border-medical-blue rounded-lg hover:bg-medical-blue hover:text-white transition-all" onclick="window.location.href='login.html'">
                    تسجيل دخول
                </button>
                <button class="px-4 py-2 bg-medical-blue text-white rounded-lg hover:bg-blue-700 transition-all" onclick="window.location.href='register.html'">
                    إنشاء حساب
                </button>
            `;
        }
        
        // إعادة أزرار التسجيل الأصلية للقائمة المتنقلة
        if (authButtonsMobile) {
            authButtonsMobile.innerHTML = `
                <button onclick="window.location.href='login.html'" class="w-full py-3 text-medical-blue border-2 border-medical-blue rounded-lg font-semibold hover:bg-medical-blue hover:text-white transition-all">
                    تسجيل دخول
                </button>
                <button onclick="window.location.href='register.html'" class="w-full py-3 bg-gradient-to-r from-medical-blue to-soft-teal text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                    إنشاء حساب
                </button>
            `;
        }
    }
}