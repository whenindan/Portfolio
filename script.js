// ===== PROJECT TECH STACKS =====
// IMPORTANT: This array must match the number of .project-card elements in index.html
// Each project card has data-project="N" where N is the array index (0-based)
// When adding/removing projects, update both index.html AND this array
const projectTechStacks = [
    {
        techs: [
            { svgFile: 'Java', displayName: 'Java' },
            { svgFile: 'Spring', displayName: 'Spring Boot' },
            { svgFile: 'Redis', displayName: 'Redis Streams' },
            { svgFile: 'Docker', displayName: 'Docker' },
            { svgFile: 'PostgresSQL', displayName: 'PostgreSQL' }
        ]
    },
    {
        techs: [
            { svgFile: 'Next.js', displayName: 'Next.js' },
            { svgFile: 'Node.js', displayName: 'Node.js' },
            { svgFile: 'TypeScript', displayName: 'TypeScript' },
            { svgFile: 'Tailwind-CSS', displayName: 'Tailwind' },
            { svgFile: 'Vercel', displayName: 'Vercel' },
            { svgFile: 'Docker', displayName: 'Docker' }
        ]
    },
    {
        techs: [
            { svgFile: 'FastAPI', displayName: 'FastAPI' },
            { svgFile: 'React', displayName: 'React' },
            { svgFile: 'Docker', displayName: 'Docker' }
        ]
    },
    {
        techs: [
            { svgFile: 'PyTorch', displayName: 'PyTorch' },
            { svgFile: 'Python', displayName: 'Python' }
        ]
    }
];

// ===== TYPEWRITER TEXT ANIMATION =====
class TypewriterText {
    constructor(element, options = {}) {
        this.element = element;
        this.originalText = element.textContent;
        this.speed = options.speed || 50;
        this.hasAnimated = false;
    }

    animate() {
        if (this.hasAnimated) return;
        this.hasAnimated = true;

        const text = this.originalText;
        let index = 0;

        // Clear element and add cursor
        this.element.innerHTML = '<span class="cursor"></span>';
        const cursor = this.element.querySelector('.cursor');

        const interval = setInterval(() => {
            if (index < text.length) {
                const char = text[index];
                if (char === '<' && text.substring(index, index + 4) === '<br>') {
                    // Handle <br> tag
                    cursor.insertAdjacentHTML('beforebegin', '<br>');
                    index += 4;
                } else {
                    cursor.insertAdjacentText('beforebegin', char);
                    index++;
                }
            } else {
                clearInterval(interval);
                cursor.classList.add('blink');
            }
        }, this.speed);
    }
}

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
            // Section is entering viewport
            entry.target.classList.add('visible');
            entry.target.classList.remove('exiting');

            // Trigger scramble animations for this section
            const scrambleElements = entry.target.querySelectorAll('.scramble-text');
            scrambleElements.forEach(el => {
                if (!el.scrambleInstance) {
                    el.scrambleInstance = new ScrambleText(el, { duration: 800, speed: 15 });
                }
                el.scrambleInstance.animate();
            });

            // Trigger scramble for skill items with delay
            const skillItems = entry.target.querySelectorAll('.skill-item');
            skillItems.forEach((item, index) => {
                setTimeout(() => {
                    if (!item.scrambleInstance) {
                        item.scrambleInstance = new ScrambleText(item, { duration: 600, speed: 15 });
                    }
                    item.scrambleInstance.animate();
                }, index * 30);
            });
        } else {
            // Section is leaving viewport - add exiting class
            entry.target.classList.add('exiting');
            entry.target.classList.remove('visible');
        }
    });
}, observerOptions);

// Observe all animated sections
document.addEventListener('DOMContentLoaded', () => {
    const animatedSections = document.querySelectorAll('[data-animate]');
    animatedSections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Animate hero section with typewriter effect
    const heroTitle = document.querySelector('.hero-section .hero-title');
    if (heroTitle) {
        // Get text from data-text attribute
        const originalText = heroTitle.getAttribute('data-text') || '';
        heroTitle.textContent = ''; // Clear any existing content

        const typewriter = new TypewriterText(heroTitle, { speed: 50 });
        typewriter.originalText = originalText; // Set the text to type
        setTimeout(() => typewriter.animate(), 500);
    }

    // Start live clock
    updateClock();
    setInterval(updateClock, 1000);
});

// ===== DYNAMIC TECH STACK DISPLAY =====
let currentActiveProject = -1;

const updateTechStack = () => {
    const projectCards = document.querySelectorAll('.project-card');
    const techPillsContainer = document.getElementById('tech-pills');

    if (!techPillsContainer) return;

    // Validation: Warn if HTML and JS are out of sync
    if (projectCards.length !== projectTechStacks.length) {
        console.warn(
            `[Portfolio] Mismatch detected: ${projectCards.length} project cards found in HTML ` +
            `but ${projectTechStacks.length} entries in projectTechStacks array. ` +
            `Update script.js to match your HTML project cards.`
        );
    }

    let activeProjectIndex = -1;
    let maxVisibility = 0;

    projectCards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportCenter = viewportHeight / 2;

        // Calculate how much of the card is visible
        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        const visibilityRatio = Math.max(0, visibleHeight / rect.height);

        // Only consider projects that are at least partially visible
        if (visibilityRatio > 0) {
            // Calculate distance from center of viewport
            const cardCenter = (rect.top + rect.bottom) / 2;
            const distanceFromCenter = Math.abs(cardCenter - viewportCenter);

            // Score based on both visibility and distance from center
            // Prefer projects closer to center
            const score = visibilityRatio * (1 - (distanceFromCenter / viewportHeight));

            if (score > maxVisibility) {
                maxVisibility = score;
                activeProjectIndex = index;
            }
        }
    });

    // Update active state
    projectCards.forEach((card, index) => {
        if (index === activeProjectIndex) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    // Only update tech stack if project changed
    if (activeProjectIndex !== -1 && activeProjectIndex !== currentActiveProject) {
        currentActiveProject = activeProjectIndex;

        // Defensive: Check if tech stack exists for this project
        const techStackData = projectTechStacks[activeProjectIndex];
        const techStack = techStackData?.techs || [];

        if (!techStackData) {
            console.warn(
                `[Portfolio] No tech stack data found for project index ${activeProjectIndex}. ` +
                `Add an entry to projectTechStacks array in script.js.`
            );
        }

        techPillsContainer.innerHTML = '';

        techStack.forEach((tech, index) => {
            setTimeout(() => {
                const pill = document.createElement('div');
                pill.className = 'tech-pill';

                // Use svgFile for the icon path and displayName for text
                const svgFileName = tech.svgFile || tech;
                const displayText = tech.displayName || tech;

                const iconPath = `imgs/tech-svg/${svgFileName}.svg`;
                const icon = document.createElement('img');
                icon.src = iconPath;
                icon.alt = displayText;
                icon.className = 'tech-icon';
                icon.onerror = () => {
                    // If icon doesn't load, just show text
                    pill.innerHTML = '';
                    pill.textContent = displayText;
                };

                pill.appendChild(icon);

                const text = document.createElement('span');
                text.textContent = displayText;
                pill.appendChild(text);

                techPillsContainer.appendChild(pill);
            }, index * 50);
        });
    }
};

// Throttle function for performance
const throttle = (func, delay) => {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func(...args);
        }
    };
};

// Listen to scroll for tech stack updates
window.addEventListener('scroll', throttle(updateTechStack, 150));
window.addEventListener('resize', throttle(updateTechStack, 200));
window.addEventListener('load', updateTechStack);

// Initial tech stack update
document.addEventListener('DOMContentLoaded', () => {
    // Show first project's tech stack immediately
    const techPillsContainer = document.getElementById('tech-pills');
    if (techPillsContainer) {
        currentActiveProject = 0;
        const techStack = projectTechStacks[0]?.techs || [];

        techStack.forEach((tech, index) => {
            setTimeout(() => {
                const pill = document.createElement('div');
                pill.className = 'tech-pill';

                // Use svgFile for the icon path and displayName for text
                const svgFileName = tech.svgFile || tech;
                const displayText = tech.displayName || tech;

                const iconPath = `imgs/tech-svg/${svgFileName}.svg`;
                const icon = document.createElement('img');
                icon.src = iconPath;
                icon.alt = displayText;
                icon.className = 'tech-icon';
                icon.onerror = () => {
                    pill.innerHTML = '';
                    pill.textContent = displayText;
                };

                pill.appendChild(icon);

                const text = document.createElement('span');
                text.textContent = displayText;
                pill.appendChild(text);

                techPillsContainer.appendChild(pill);
            }, index * 50);
        });
    }

    setTimeout(updateTechStack, 1000);
});

// ===== LIVE CLOCK (EST) =====
const updateClock = () => {
    const clockElement = document.getElementById('live-clock');
    if (!clockElement) return;

    const now = new Date();
    const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

    const hours = estTime.getHours().toString().padStart(2, '0');
    const minutes = estTime.getMinutes().toString().padStart(2, '0');
    const seconds = estTime.getSeconds().toString().padStart(2, '0');

    clockElement.textContent = `${hours}:${minutes}:${seconds} EST`;
};

// ===== COMMAND PALETTE =====
const commandPalette = document.getElementById('command-palette');
const commandInput = document.getElementById('command-input');
const closePaletteBtn = document.getElementById('close-palette');
const commandItems = document.querySelectorAll('.command-item');

let selectedCommandIndex = 0;

// Open command palette
const openCommandPalette = () => {
    commandPalette.classList.add('active');
    commandInput.focus();
    selectedCommandIndex = 0;
    updateSelectedCommand();
};

// Close command palette
const closeCommandPalette = () => {
    commandPalette.classList.remove('active');
    commandInput.value = '';
    commandInput.blur();
};

// Update selected command
const updateSelectedCommand = () => {
    commandItems.forEach((item, index) => {
        if (index === selectedCommandIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            item.classList.remove('selected');
        }
    });
};

// Execute command
const executeCommand = (action) => {
    closeCommandPalette();

    switch (action) {
        case 'goto-home':
            document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
            break;
        case 'goto-about':
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
            break;
        case 'goto-experience':
            document.getElementById('experience').scrollIntoView({ behavior: 'smooth' });
            break;
        case 'goto-projects':
            document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
            break;
        case 'goto-skills':
            document.getElementById('skills').scrollIntoView({ behavior: 'smooth' });
            break;
        case 'email':
            window.location.href = 'mailto:nguyentrongdat294@gmail.com';
            break;
        case 'github':
            window.open('https://github.com/whenindan', '_blank');
            break;
        case 'linkedin':
            window.open('https://linkedin.com/in/dat-nguyen294', '_blank');
            break;
        case 'resume':
            window.open('/resume.pdf', '_blank');
            break;
    }
};

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // CMD+K or Ctrl+K to open command palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (commandPalette.classList.contains('active')) {
            closeCommandPalette();
        } else {
            openCommandPalette();
        }
    }

    // ESC to close
    if (e.key === 'Escape' && commandPalette.classList.contains('active')) {
        closeCommandPalette();
    }

    // Arrow navigation when palette is open
    if (commandPalette.classList.contains('active')) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedCommandIndex = (selectedCommandIndex + 1) % commandItems.length;
            updateSelectedCommand();
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedCommandIndex = selectedCommandIndex - 1;
            if (selectedCommandIndex < 0) selectedCommandIndex = commandItems.length - 1;
            updateSelectedCommand();
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            const selectedItem = commandItems[selectedCommandIndex];
            const action = selectedItem.getAttribute('data-action');
            executeCommand(action);
        }
    }
});

// Click handlers for command items
commandItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        executeCommand(action);
    });

    item.addEventListener('mouseenter', () => {
        selectedCommandIndex = index;
        updateSelectedCommand();
    });
});

// Close button
closePaletteBtn.addEventListener('click', closeCommandPalette);

// Click outside to close
commandPalette.addEventListener('click', (e) => {
    if (e.target === commandPalette) {
        closeCommandPalette();
    }
});

// Search filter (optional enhancement)
commandInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const sections = document.querySelectorAll('.command-section');

    sections.forEach(section => {
        const items = section.querySelectorAll('.command-item');
        let hasVisibleItems = false;

        items.forEach(item => {
            const text = item.querySelector('span').textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                item.style.display = 'flex';
                hasVisibleItems = true;
            } else {
                item.style.display = 'none';
            }
        });

        // Hide section title if no items are visible
        const title = section.querySelector('.command-section-title');
        if (title) {
            title.style.display = hasVisibleItems ? 'block' : 'none';
        }
    });

    // Update available command items
    const visibleItems = Array.from(commandItems).filter(item => item.style.display !== 'none');
    if (visibleItems.length > 0) {
        selectedCommandIndex = 0;
        updateSelectedCommand();
    }
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

// ===== DETECT OS FOR KEYBOARD HINT =====
document.addEventListener('DOMContentLoaded', () => {
    // More robust OS detection
    const platform = navigator.platform.toUpperCase();
    const userAgent = navigator.userAgent.toUpperCase();
    const isMac = platform.indexOf('MAC') >= 0 ||
        userAgent.indexOf('MAC') >= 0 ||
        userAgent.indexOf('MACINTOSH') >= 0;

    const isWindows = platform.indexOf('WIN') >= 0 ||
        userAgent.indexOf('WINDOWS') >= 0 ||
        userAgent.indexOf('WIN') >= 0;

    console.log('OS Detection:', { platform, userAgent, isMac, isWindows });

    if (!isMac || isWindows) {
        // Update bottom-right CMD+K indicator
        const navKbd = document.querySelector('.nav-kbd');
        if (navKbd) {
            const kbdElements = navKbd.querySelectorAll('kbd');
            if (kbdElements.length > 0) {
                kbdElements[0].textContent = 'Ctrl';
                console.log('Updated bottom-right indicator to Ctrl');
            }
        }

        // Update command palette hint (inside the modal)
        const kbdHint = document.querySelector('.kbd-hint');
        if (kbdHint) {
            const nextKbd = kbdHint.nextElementSibling;
            if (nextKbd && nextKbd.tagName === 'KBD') {
                nextKbd.textContent = 'Ctrl';
                console.log('Updated command palette hint to Ctrl');
            }
        }
    }
});

console.log('Portfolio initialized ✨');
