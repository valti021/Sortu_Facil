// navbar-responsive.js

class ResponsiveNavbar {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.navbarList = this.navbar?.querySelector('ul');
        this.iconeEngrenagem = document.querySelector('.icone-engrenagem');
        this.hamburgerBtn = null;
        this.overlay = null;
        this.isMobileMenuOpen = false;
        
        if (!this.navbar || !this.navbarList) {
            console.error('Navbar element not found!');
            return;
        }
        
        this.init();
    }
    
    init() {
        this.createHamburgerButton();
        this.setupUserRoles();
        this.setupEventListeners();
        this.handleResponsive();
        
        // Atualizar no carregamento
        window.addEventListener('load', () => this.handleResponsive());
    }
    
    createHamburgerButton() {
        // Criar botão hamburger
        this.hamburgerBtn = document.createElement('button');
        this.hamburgerBtn.className = 'navbar-hamburger';
        this.hamburgerBtn.setAttribute('aria-label', 'Menu de navegação');
        this.hamburgerBtn.setAttribute('aria-expanded', 'false');
        this.hamburgerBtn.setAttribute('aria-controls', 'navbar-menu');
        
        // Adicionar spans para as linhas do hamburger
        for (let i = 0; i < 3; i++) {
            const span = document.createElement('span');
            this.hamburgerBtn.appendChild(span);
        }
        
        // Adicionar ao navbar
        this.navbar.appendChild(this.hamburgerBtn);
        
        // Adicionar ID ao menu
        this.navbarList.id = 'navbar-menu';
    }
    
    setupUserRoles() {
        // Simulação: verificar se usuário é master
        const isUserMaster = localStorage.getItem('userRole') === 'master';
        const linkMaster = document.getElementById('link-master');
        
        if (linkMaster) {
            linkMaster.hidden = !isUserMaster;
        }
        
        // Simulação: verificar se usuário tem assinatura premium
        const hasPremium = localStorage.getItem('userSubscription') === 'premium';
        const linkAssinatura = document.getElementById('link-assinatura');
        
        if (linkAssinatura) {
            linkAssinatura.hidden = hasPremium;
        }
    }
    
    setupEventListeners() {
        // Hamburger button click
        this.hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu();
        });
        
        // Fechar menu ao clicar em links (mobile)
        const navLinks = this.navbarList.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 767) {
                    this.closeMobileMenu();
                }
            });
        });
        
        // Fechar menu ao clicar no overlay
        document.addEventListener('click', (e) => {
            if (this.isMobileMenuOpen && 
                !this.navbarList.contains(e.target) && 
                e.target !== this.hamburgerBtn) {
                this.closeMobileMenu();
            }
        });
        
        // Resize com debounce
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.handleResponsive();
            }, 150);
        });
        
        // Tecla Escape para fechar menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
            
            // Trap focus dentro do menu mobile quando aberto
            if (e.key === 'Tab' && this.isMobileMenuOpen) {
                this.handleFocusTrap(e);
            }
        });
        
        // Prevenir scroll quando menu mobile está aberto
        document.addEventListener('scroll', (e) => {
            if (this.isMobileMenuOpen && window.innerWidth <= 767) {
                e.preventDefault();
                window.scrollTo(0, 0);
            }
        }, { passive: false });
    }
    
    toggleMobileMenu() {
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    openMobileMenu() {
        this.isMobileMenuOpen = true;
        this.navbarList.classList.add('active');
        this.hamburgerBtn.setAttribute('aria-expanded', 'true');
        
        // Criar overlay
        this.createOverlay();
        
        // Adicionar classe ao body para prevenir scroll
        document.body.style.overflow = 'hidden';
        
        // Focar no primeiro link do menu para acessibilidade
        setTimeout(() => {
            const firstLink = this.navbarList.querySelector('a');
            if (firstLink) firstLink.focus();
        }, 100);
        
        console.log('Menu mobile aberto');
    }
    
    closeMobileMenu() {
        this.isMobileMenuOpen = false;
        this.navbarList.classList.remove('active');
        this.hamburgerBtn.setAttribute('aria-expanded', 'false');
        
        // Remover overlay
        this.removeOverlay();
        
        // Restaurar scroll do body
        document.body.style.overflow = '';
        
        // Focar no botão hamburger para acessibilidade
        this.hamburgerBtn.focus();
        
        console.log('Menu mobile fechado');
    }
    
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'navbar-overlay active';
        this.overlay.setAttribute('aria-hidden', 'true');
        
        // Adicionar evento de clique para fechar
        this.overlay.addEventListener('click', () => this.closeMobileMenu());
        
        document.body.appendChild(this.overlay);
        
        // Animar overlay
        setTimeout(() => {
            this.overlay.style.opacity = '1';
        }, 10);
    }
    
    removeOverlay() {
        if (this.overlay) {
            this.overlay.style.opacity = '0';
            
            setTimeout(() => {
                if (this.overlay && this.overlay.parentNode) {
                    this.overlay.parentNode.removeChild(this.overlay);
                    this.overlay = null;
                }
            }, 300);
        }
    }
    
    handleFocusTrap(e) {
        const focusableElements = this.navbarList.querySelectorAll(
            'a, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    handleResponsive() {
        const width = window.innerWidth;
        
        // Se for desktop e menu mobile estiver aberto, fechar
        if (width > 767 && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Ajustar posição da engrenagem baseado no tamanho da tela
        this.adjustGearPosition(width);
        
        // Ajustar margem do top-bar
        this.adjustTopBarMargin(width);
        
        console.log(`Tela ajustada para: ${width}px`);
    }
    
    adjustGearPosition(width) {
        if (!this.iconeEngrenagem) return;
        
        const gearLi = this.iconeEngrenagem.closest('li');
        if (!gearLi) return;
        
        if (width <= 767) {
            // Mobile: engrenagem fica no início do menu
            gearLi.style.order = '-1';
            gearLi.style.marginRight = 'auto';
        } else {
            // Desktop: engrenagem volta ao normal
            gearLi.style.order = '';
            gearLi.style.marginRight = '';
        }
    }
    
    adjustTopBarMargin(width) {
        const topBar = document.querySelector('.top-bar');
        if (!topBar) return;
        
        if (width <= 480) {
            topBar.style.marginTop = '64px';
        } else if (width <= 767) {
            topBar.style.marginTop = '70px';
        } else if (width <= 1023) {
            topBar.style.marginTop = '70px';
        } else {
            topBar.style.marginTop = '90px';
        }
    }
    
    // Métodos públicos para controle externo
    openMenu() {
        if (window.innerWidth <= 767) {
            this.openMobileMenu();
        }
    }
    
    closeMenu() {
        this.closeMobileMenu();
    }
    
    isMenuOpen() {
        return this.isMobileMenuOpen;
    }
    
    // Atualizar permissões do usuário
    updateUserPermissions(role, hasPremium) {
        const linkMaster = document.getElementById('link-master');
        const linkAssinatura = document.getElementById('link-assinatura');
        
        if (linkMaster) {
            linkMaster.hidden = role !== 'master';
        }
        
        if (linkAssinatura) {
            linkAssinatura.hidden = hasPremium;
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.responsiveNavbar = new ResponsiveNavbar();
    
    // Expor métodos globais se necessário
    window.toggleNavbarMenu = () => window.responsiveNavbar?.toggleMobileMenu();
    window.openNavbarMenu = () => window.responsiveNavbar?.openMenu();
    window.closeNavbarMenu = () => window.responsiveNavbar?.closeMenu();
});

// Export para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveNavbar;
}