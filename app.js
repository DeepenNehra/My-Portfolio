/**
 * THE CINEMA PORTFOLIO - CORE LOGIC & CONTROLLERS
 * Director / Architect: Deepen Nehra
 */

document.addEventListener('DOMContentLoaded', () => {
    // ===== 1. REEL TIMECODE (24 FPS LIVE FILM RUNTIME) =====
    const reelTimecodeEl = document.getElementById('reel-timecode');
    if (reelTimecodeEl) {
        let frame = 0;
        setInterval(() => {
            const now = new Date();
            const hrs = String(now.getHours()).padStart(2, '0');
            const mins = String(now.getMinutes()).padStart(2, '0');
            const secs = String(now.getSeconds()).padStart(2, '0');
            frame = (frame + 1) % 24;
            const frames = String(frame).padStart(2, '0');
            reelTimecodeEl.textContent = `${hrs}:${mins}:${secs}:${frames}`;
        }, 1000 / 24);
    }

    // ===== 2. THEME SWITCHER CONTROLLER (CINEMA vs MINIMAL) =====
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeLabel = document.getElementById('theme-label');
    const savedTheme = localStorage.getItem('portfolioTheme') || 'cinema';

    function applyTheme(theme) {
        if (theme === 'minimal') {
            document.body.classList.remove('theme-cinema');
            document.body.classList.add('theme-minimal');
            if (themeLabel) themeLabel.textContent = 'MINIMAL';
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = '<span class="theme-icon"><i class="fas fa-bolt"></i></span> <span class="theme-label">MINIMAL</span>';
                themeToggleBtn.title = 'Switch to Cinema Theme';
            }
        } else {
            document.body.classList.remove('theme-minimal');
            document.body.classList.add('theme-cinema');
            if (themeLabel) themeLabel.textContent = 'CINEMA';
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = '<span class="theme-icon"><i class="fas fa-film"></i></span> <span class="theme-label">CINEMA</span>';
                themeToggleBtn.title = 'Switch to Minimal Theme';
            }
        }
        localStorage.setItem('portfolioTheme', theme);
    }

    applyTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('theme-minimal') ? 'minimal' : 'cinema';
            const nextTheme = currentTheme === 'cinema' ? 'minimal' : 'cinema';
            applyTheme(nextTheme);
        });
    }

    // ===== 3. CINEMA INTRO SEQUENCE (3-2-1 COUNTDOWN & VELVET CURTAINS) =====
    const cinemaIntro = document.getElementById('cinema-intro');
    const countdownNum = document.getElementById('countdown-num');
    const skipIntroBtn = document.getElementById('skip-intro-btn');
    const introSeen = sessionStorage.getItem('cinemaIntroSeen');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function finishIntro() {
        if (!cinemaIntro) return;
        cinemaIntro.classList.add('part-curtains');
        sessionStorage.setItem('cinemaIntroSeen', 'true');
        setTimeout(() => {
            cinemaIntro.classList.add('hidden');
            setTimeout(() => {
                cinemaIntro.style.display = 'none';
            }, 500);
        }, 1100);
    }

    if (introSeen === 'true' || prefersReducedMotion || savedTheme === 'minimal') {
        if (cinemaIntro) {
            cinemaIntro.style.display = 'none';
        }
    } else if (cinemaIntro && countdownNum) {
        let count = 3;
        const countdownTimer = setInterval(() => {
            count--;
            if (count > 0) {
                countdownNum.textContent = count;
            } else {
                clearInterval(countdownTimer);
                finishIntro();
            }
        }, 850);

        if (skipIntroBtn) {
            skipIntroBtn.addEventListener('click', () => {
                clearInterval(countdownTimer);
                finishIntro();
            });
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                clearInterval(countdownTimer);
                finishIntro();
            }
        });
    }

    // ===== 4. CUSTOM VIEWFINDER / RETICLE CURSOR =====
    const cursor = document.getElementById('cinema-cursor');
    const cursorFollower = document.getElementById('cinema-cursor-follower');
    const cursorTag = cursor ? cursor.querySelector('.cursor-tag') : null;
    const isTouchDevice = window.matchMedia('(hover: none) or (pointer: coarse)').matches;

    if (cursor && cursorFollower && !isTouchDevice) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let curX = mouseX, curY = mouseY;
        let folX = mouseX, folY = mouseY;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function renderCursor() {
            if (document.body.classList.contains('theme-cinema')) {
                curX += (mouseX - curX) * 0.35;
                curY += (mouseY - curY) * 0.35;
                folX += (mouseX - folX) * 0.12;
                folY += (mouseY - folY) * 0.12;

                cursor.style.transform = `translate(${curX}px, ${curY}px)`;
                cursorFollower.style.transform = `translate(${folX}px, ${folY}px)`;
            }
            requestAnimationFrame(renderCursor);
        }
        requestAnimationFrame(renderCursor);

        // Hover expansions on interactive elements
        const interactiveQuery = 'a, button, .movie-poster-card, .gear-tag, .storyboard-item, .stat-slate-card, input, textarea, .director-still-card';
        document.querySelectorAll(interactiveQuery).forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (!document.body.classList.contains('theme-cinema')) return;
                cursor.classList.add('is-hovering');
                cursorFollower.classList.add('is-hovering');

                let tagText = 'INSPECT';
                if (el.classList.contains('poster-action-btn') && el.classList.contains('live')) tagText = 'PREMIERE';
                else if (el.classList.contains('poster-action-btn') && el.classList.contains('repo')) tagText = 'SOURCE';
                else if (el.classList.contains('primary-ticket')) tagText = 'TICKET';
                else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') tagText = 'TYPE';
                else if (el.tagName === 'BUTTON') tagText = 'TRIGGER';
                else if (el.classList.contains('movie-poster-card')) tagText = 'POSTER';
                else if (el.classList.contains('storyboard-item')) tagText = 'FIGMA';

                if (cursorTag) cursorTag.textContent = `[ ${tagText} ]`;
            });

            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('is-hovering');
                cursorFollower.classList.remove('is-hovering');
                if (cursorTag) cursorTag.textContent = '';
            });
        });
    }

    // ===== 5. HERO PROJECTOR BEAM TRACKER =====
    const heroSection = document.getElementById('home');
    if (heroSection && !isTouchDevice) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            heroSection.style.setProperty('--beam-x', `${x}px`);
            heroSection.style.setProperty('--beam-y', `${y}px`);
        });
    }

    // ===== 6. 3D MOVIE POSTER & DIRECTOR STILL TILT EFFECT =====
    if (!isTouchDevice && !prefersReducedMotion) {
        const tiltElements = document.querySelectorAll('[data-tilt]');
        tiltElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                if (document.body.classList.contains('theme-minimal')) return;
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;

                el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            });
        });
    }

    // ===== 7. SCROLL OBSERVER: REVEAL & GOLD SHIMMER SWEEP =====
    const scrollObserverOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
    };

    const shimmerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, scrollObserverOptions);

    document.querySelectorAll('.shimmer-heading').forEach(heading => {
        shimmerObserver.observe(heading);
    });

    // ===== 8. ACTIVE NAVIGATION LINK ON SCROLL =====
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => navObserver.observe(section));

    // Navbar background transition on scroll
    const headerEl = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            headerEl.classList.add('scrolled');
        } else {
            headerEl.classList.remove('scrolled');
        }
    });

    // ===== 9. MOBILE MENU TOGGLE =====
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isActive = navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isActive);
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', false);
            });
        });
    }

    // ===== 10. SMOOTH ANCHOR SCROLLING =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ===== 11. CONTACT FORM TRANSMISSION WITH EMAILJS =====
    const contactForm = document.getElementById('contactForm');
    const toast = document.getElementById('toast');

    function showToast(message, type = 'success') {
        if (!toast) return;
        toast.textContent = message;
        toast.className = `cinema-toast ${type} show`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4500);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = contactForm.querySelector('input[name="name"]');
            const emailInput = contactForm.querySelector('input[name="email"]');
            const subjectInput = contactForm.querySelector('input[name="subject"]');
            const messageInput = contactForm.querySelector('textarea[name="message"]');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const subject = subjectInput && subjectInput.value.trim() ? subjectInput.value.trim() : 'Cinema Portfolio Transmission';
            const message = messageInput ? messageInput.value.trim() : '';

            if (!name || !email || !message) {
                showToast('⚠️ Please enter your Name, Email, and Message payload before dispatching.', 'error');
                return;
            }

            const submitBtn = contactForm.querySelector('#submit-btn');
            const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.innerHTML = '<span class="btn-text"><i class="fas fa-spinner fa-spin"></i> TRANSMITTING REEL TO STUDIO...</span>';
                submitBtn.disabled = true;
            }

            const templateParams = {
                name: name,
                email: email,
                title: subject,
                message: message
            };

            if (typeof emailjs !== 'undefined') {
                emailjs.send('service_yftjexm', 'template_ifphcsa', templateParams)
                    .then(() => {
                        showToast('🎬 Transmission successful! Deepen has received your script dispatch.', 'success');
                        contactForm.reset();
                    })
                    .catch((error) => {
                        console.error('EmailJS Transmission Error:', error);
                        showToast('❌ Transmission failed. Please reach out directly at nehra7deepen5@gmail.com', 'error');
                    })
                    .finally(() => {
                        if (submitBtn) {
                            submitBtn.innerHTML = originalBtnHTML;
                            submitBtn.disabled = false;
                        }
                    });
            } else {
                showToast('🎬 Transmission recorded! (Email service offline in preview)', 'success');
                contactForm.reset();
                if (submitBtn) {
                    submitBtn.innerHTML = originalBtnHTML;
                    submitBtn.disabled = false;
                }
            }
        });
    }

    // ===== 12. DYNAMIC FOOTER YEAR =====
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Console Easter Egg
    console.log(
        '%c🎬 THE DEEPEN NEHRA PRODUCTION\n%cNow Showing: Full-Stack Engineering & AI Architectures\nRole: Director & Creative Technologist',
        'color: #e5be65; font-size: 20px; font-weight: bold; font-family: sans-serif;',
        'color: #a8283a; font-size: 13px; font-family: monospace;'
    );
});
