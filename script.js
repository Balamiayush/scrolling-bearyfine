// ----------------------------------------------
// 1. Initialize Lenis Smooth Scrolling
// ----------------------------------------------
const lenis = new Lenis({
  lerp: 0.07,
  smoothWheel: true,
  autoRaf: false
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
let imgs = [
    "https://bearyfine.com/cdn/shop/files/Purple3.webp?v=1726136872",
    "https://bearyfine.com/cdn/shop/files/Pink3.webp?v=1726137687",
    "https://bearyfine.com/cdn/shop/files/green3.webp?v=1726137865",
    "https://bearyfine.com/cdn/shop/files/blue3.webp?v=1726137870",
    "https://bearyfine.com/cdn/shop/files/Red_3.webp?v=1726137476",
    "https://bearyfine.com/cdn/shop/files/Orange3.webp?v=1726137798",

]
let page2elem = document.querySelector('.elemnts')
imgs.forEach((img, index) => {
  let imgElem = document.createElement('img');
  imgElem.src = img;
  imgElem.classList.add('imgbottle');;
  page2elem.appendChild(imgElem);
});
// ----------------------------------------------
// 2. DOM Ready: Canvas + Scroll + Animation Setup
// ----------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const config = {
    totalFrames: 60,
    currentFrame: 1,
    imagePath: 'bearyfine/E_',
    imageExt: '.webp.png',
    loadedImages: [],
    isAnimating: false,
    scrollProgress: 0
  };

  const canvas = document.getElementById('animationCanvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: false });

  // Setup
  resizeCanvas();
  window.addEventListener('resize', debounce(resizeCanvas, 100));

  preloadImages().then(() => {
    drawFrame(1);
    setupCanvasScrollTrigger();
    setupBottleAnimation();
  });

  // ----------------------------------------------
  // 3. Canvas Setup
  // ----------------------------------------------
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (config.loadedImages[config.currentFrame]) {
      drawFrame(config.currentFrame);
    }
  }

  function drawFrame(frame) {
    const img = config.loadedImages[frame];
    if (!img) return;

    config.currentFrame = frame;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Maintain aspect ratio
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;

    let width, height, x, y;
    if (imgRatio > canvasRatio) {
      width = canvas.width;
      height = width / imgRatio;
      x = 0;
      y = (canvas.height - height) / 2;
    } else {
      height = canvas.height;
      width = height * imgRatio;
      x = (canvas.width - width) / 2;
      y = 0;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, x, y, width, height);
  }

  // ----------------------------------------------
  // 4. Image Preloading
  // ----------------------------------------------
  function preloadImages() {
    const promises = [];

    for (let i = 1; i <= config.totalFrames; i++) {
      const img = new Image();
      const paddedNum = i.toString().padStart(4, '0');
      img.src = `${config.imagePath}${paddedNum}${config.imageExt}`;

      promises.push(
        new Promise(resolve => {
          img.onload = () => {
            config.loadedImages[i] = img;
            resolve();
          };
          img.onerror = () => {
            console.warn(`Frame ${i} failed to load`);
            resolve();
          };
        })
      );
    }

    return Promise.all(promises);
  }

  // ----------------------------------------------
  // 5. Scroll-Driven Canvas Animation
  // ----------------------------------------------
  function setupCanvasScrollTrigger() {
    const animState = { progress: 0 };

    gsap.to(animState, {
      progress: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        
        // markers: true,
        onUpdate: self => {
          config.scrollProgress = self.progress;
          updateCanvasFrame();
        }
      }
    });
  }

  function updateCanvasFrame() {
    if (config.isAnimating) return;
    config.isAnimating = true;

    const targetFrame = Math.ceil(config.scrollProgress * (config.totalFrames - 1)) + 1;

    if (targetFrame !== config.currentFrame) {
      requestAnimationFrame(() => {
        drawFrame(targetFrame);
        config.isAnimating = false;
      });
    } else {
      config.isAnimating = false;
    }
  }

  // ----------------------------------------------
  // 6. Bottle Element Animation
  // ----------------------------------------------
  function setupBottleAnimation() {
    gsap.timeline({
      scrollTrigger: {
        trigger: ".page1",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
        ease: "sine.inOut",
        // markers: true
      }
    })
    .to(".imgbottle", { top: "5%", })
    .to(".imgbottle", { top: "10%",x:"-45%" })
  }

  // ----------------------------------------------
  // 7. Utility: Debounce for Resize
  // ----------------------------------------------
  function debounce(func, wait) {
    let timeout;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, arguments), wait);
    };
  }
});
