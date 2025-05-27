// Initialize Lenis
const lenis = new Lenis({
  autoRaf: true,
});

// Listen for the scroll event and log the event data
lenis.on('scroll', (e) => {
//   console.log(e);
});
// var tl = gsap.timeline({scrollTrigger:{
//     trigger: ".hero",
//     start: "10% top",
//     end: "50% 0%",
//     // end: "bottom bottom",
//     scrub: 1,
//     markers: true,
// }})
// tl.to(".imgbottle",{
//     top: "50%",

// }, 'a')
// tl.to(".imgbottle",{
//     top: "60%",
// }, 'a')
// tl.to(".imgbottle",{
//     top: "70%",
//     left: "50%",
// }, 'a')

 document.addEventListener('DOMContentLoaded', function () {
    // Configuration
    const config = {
        maxIndex: 60,
        currentIndex: 1,
        imageBasePath: 'bearyfine/E_',
        imageExtension: '.webp.png' // Make sure to include the dot
    };

    // DOM Elements
    const canvas = document.getElementById('animationCanvas');
    const ctx = canvas.getContext('2d');

    // State
    let imagesLoaded = 0;
    const imageCache = [];
    let isAnimating = false;

    // Initialize
    function init() {
        handleResize();
        window.addEventListener('resize', handleResize);
        preloadImages();
    }

    // Handle window resize — keeps internal resolution fullscreen
    function handleResize() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    // Preload all images
    function preloadImages() {
        for (let i = 1; i <= config.maxIndex; i++) {
            const img = new Image();
            const paddedIndex = i.toString().padStart(4, '0');
            img.src = `${config.imageBasePath}${paddedIndex}${config.imageExtension}`;
            console.log('Loading image:', img.src);

            img.onload = function () {
                imagesLoaded++;
                imageCache[i] = img;

                if (imagesLoaded === config.maxIndex) {
                    console.log('All images loaded');
                    requestAnimationFrame(() => loadImage(1));
                    setupAnimation();
                }
            };

            img.onerror = function () {
                console.error('Error loading image:', img.src);
            };
        }
    }

    // Load specific image onto canvas
    function loadImage(index) {
    if (index < 1 || index > config.maxIndex) return;

    const img = imageCache[index];
    if (!img || !canvas) return;

    // Optionally keep this if you want full-resolution canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clear and draw at top-left corner
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0);
    
    config.currentIndex = index;
}


    // Setup GSAP scroll animation
    function setupAnimation() {
        gsap.registerPlugin(ScrollTrigger);

        const animation = {
            currentIndex: 1
        };

        gsap.to(animation, {
            currentIndex: config.maxIndex,
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5,
                pin: true,
                markers: true
            },
            onUpdate: function () {
                if (!isAnimating) {
                    isAnimating = true;
                    requestAnimationFrame(() => {
                        loadImage(Math.round(animation.currentIndex));
                        isAnimating = false;
                    });
                }
            }
        });
    }

    // Start
    init();
});
