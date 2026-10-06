// ===== SCRAMBLE TEXT ANIMATION =====
class ScrambleText {
    constructor(element, options = {}) {
        this.element = element;
        this.originalText = element.textContent;
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        this.duration = options.duration || 800;  // Faster: 800ms instead of 2000ms
        this.speed = options.speed || 20;  // Faster: 20ms instead of 50ms
        this.hasAnimated = false;
    }

    animate() {
        if (this.hasAnimated) return;
        this.hasAnimated = true;

        const text = this.originalText;
        const length = text.length;
        let iteration = 0;
        const maxIterations = this.duration / this.speed;

        const interval = setInterval(() => {
            this.element.textContent = text
                .split('')
                .map((char, index) => {
                    if (char === ' ' || char === '\n') return char;

                    const progress = iteration / maxIterations;
                    const charProgress = index / length;

                    if (progress > charProgress) {
                        return text[index];
                    }

                    return this.chars[Math.floor(Math.random() * this.chars.length)];
                })
                .join('');

            iteration++;

            if (iteration >= maxIterations) {
                clearInterval(interval);
                this.element.textContent = text;
            }
        }, this.speed);
    }

    reset() {
        this.hasAnimated = false;
        this.element.textContent = this.originalText;
    }
}

// ===== INTERSECTION OBSERVER FOR SECTIONS =====
// Using very low threshold (0.01 = 1%) to ensure sections become visible
// even when they're taller than the viewport (e.g., long project sections)
const observerOptions = {
    threshold: 0.01,
    rootMargin: '0px'
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Trigger scramble animations for this section (one-shot, guarded by hasAnimated)
            const scrambleElements = entry.target.querySelectorAll('.scramble-text');
            scrambleElements.forEach(el => {
                if (!el.scrambleInstance) {
                    el.scrambleInstance = new ScrambleText(el, { duration: 800, speed: 15 });
                }
                el.scrambleInstance.animate();
            });
        }
    });
}, observerOptions);

// Observe all animated sections
document.addEventListener('DOMContentLoaded', () => {
    const animatedSections = document.querySelectorAll('[data-animate]');
    animatedSections.forEach(section => {
        sectionObserver.observe(section);
    });
});

// ===== SMOOTH SCROLL FOR NAV LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== EMAIL: COPY TO CLIPBOARD (better UX than a bare mailto:) =====
// mailto: links only work when the visitor has a desktop mail client
// configured, which many people don't. Copying the address lets anyone
// paste it into whatever they actually use (Gmail web, phone, etc.).
let copiedResetTimer = null;

const copyEmailToClipboard = async (email, triggerEl) => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(email);
        } else {
            // Fallback for older/non-secure contexts
            const textarea = document.createElement('textarea');
            textarea.value = email;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }

        if (triggerEl) {
            // Clear any pending revert so rapid clicks don't race each other
            // and leave the button stuck showing the checkmark.
            clearTimeout(copiedResetTimer);
            triggerEl.classList.add('copied');
            copiedResetTimer = setTimeout(() => {
                triggerEl.classList.remove('copied');
            }, 1600);
        }
    } catch (err) {
        // Clipboard API unavailable/denied — fall back to mailto
        window.location.href = `mailto:${email}`;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const emailBtn = document.getElementById('email-contact');
    if (emailBtn) {
        emailBtn.addEventListener('click', () => {
            copyEmailToClipboard(emailBtn.dataset.email, emailBtn);
        });
    }
});

// ===== EXPERIENCE: SHOW MORE / LESS =====
// Older roles start collapsed (inert, so they're skipped by keyboard and
// screen readers); the chevron toggle expands them with a grid-rows animation.
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('experience-toggle');
    const more = document.getElementById('experience-more');
    if (!toggle || !more) return;

    toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        toggle.setAttribute('aria-label', expanded ? 'Show more experience' : 'Show less experience');
        more.classList.toggle('open', !expanded);
        more.inert = expanded;
    });
});

console.log('Portfolio initialized ✨');
