document.addEventListener('DOMContentLoaded', function() {

    // --- Page Transition Logic ---
    const transitionLinks = document.querySelectorAll('a:not([target="_blank"]):not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])');
    transitionLinks.forEach(link => {
        link.addEventListener('click', e => {
            const url = new URL(link.href, window.location.origin);
            const currentUrl = new URL(window.location.href);
            if (url.href === currentUrl.href) { e.preventDefault(); return; }
            e.preventDefault();
            document.body.classList.add('page-is-leaving');
            setTimeout(() => { window.location.href = link.href; }, 500);
        });
    });

    // --- Mobile Navigation (Hamburger Menu) ---
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
    }

    // --- Infinite Carousel Logic ---
    const initCarousel = (carousel) => {
        const track = carousel.querySelector('.carousel-track');
        if (!track || track.children.length === 0) return;

        const slides = Array.from(track.children);
        const nextButton = carousel.querySelector('.carousel-button.next');
        const prevButton = carousel.querySelector('.carousel-button.prev');
        
        // Clone slides for the infinite effect
        slides.forEach(slide => track.appendChild(slide.cloneNode(true)));
        
        let currentIndex = 0;
        let isMoving = false;
        let autoPlayInterval = null;
        let touchStartX = 0;
        let touchMoveX = 0;

        const updatePosition = (transition = true) => {
            const slideWidth = slides[0].offsetWidth;
            const gap = parseInt(window.getComputedStyle(track).gap) || 30;
            const totalMove = currentIndex * (slideWidth + gap);
            
            track.style.transition = transition ? 'transform 0.5s ease-in-out' : 'none';
            track.style.transform = `translateX(-${totalMove}px)`;
        };
        
        const move = (direction) => {
            if (isMoving) return;
            isMoving = true;
            currentIndex += direction;
            updatePosition();
        };

        track.addEventListener('transitionend', () => {
            isMoving = false;
            // If we're at the cloned set, jump back to the start
            if (currentIndex >= slides.length) {
                currentIndex = 0;
                updatePosition(false);
            }
            // If we scrolled backwards past the beginning (not naturally possible with this setup, but for safety)
            if (currentIndex < 0) {
                currentIndex = slides.length - 1;
                updatePosition(false);
            }
        });

        nextButton.addEventListener('click', () => move(1));
        prevButton.addEventListener('click', () => {
            if (isMoving) return;
            // Handle prev button click specially
            if (currentIndex === 0) {
                isMoving = true;
                currentIndex = slides.length;
                updatePosition(false);
                // Force a browser reflow before the next animation
                setTimeout(() => {
                    move(-1);
                }, 20);
            } else {
                move(-1);
            }
        });

        // --- Touch Swipe Logic ---
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            stopAutoPlay();
        });

        track.addEventListener('touchmove', (e) => {
            touchMoveX = e.touches[0].clientX;
        });

        track.addEventListener('touchend', () => {
            if (touchStartX - touchMoveX > 50) {
                move(1);
            } else if (touchStartX - touchMoveX < -50) {
                move(-1);
            }
            startAutoPlay();
        });


        // Autoplay logic
        const startAutoPlay = () => {
            if (carousel.dataset.autoplay !== 'true') return;
            stopAutoPlay(); // Clear any existing interval
            autoPlayInterval = setInterval(() => move(1), 3000);
        };

        const stopAutoPlay = () => {
            clearInterval(autoPlayInterval);
        };

        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);

        startAutoPlay();
        updatePosition(false); // Initial position setup
    };

    // Initialize all carousels on the page
    document.querySelectorAll('.carousel-container').forEach(initCarousel);

    // --- Scroll Animation Logic ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.anim-on-scroll').forEach(el => observer.observe(el));
});