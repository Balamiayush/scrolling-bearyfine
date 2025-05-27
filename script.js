     let imgs = [
            "/bearyfine/E_0001.webp.png",
            "/bearyfine/B_0001.webp.png",
            "/bearyfine/F_0001.webp.png",
            "/bearyfine/Q_0001.webp.png",
            "/bearyfine/G_0001.webp.png",
            "/bearyfine/P_0001.webp.png",
        ];
        let currentImageIndex = 0;

        const config = {
            totalFrames: 60,
            currentFrame: 1,
            imagePath: 'bearyfine/E_',
            imageExt: '.webp.png',
            loadedImages: [],
            isAnimating: false,
            scrollProgress: 0
        };

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

        // ----------------------------------------------
        // 2. DOM Ready: Canvas + Scroll + Animation Setup
        // ----------------------------------------------
        document.addEventListener('DOMContentLoaded', () => {
            const canvas = document.getElementById('animationCanvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: false });

            const left = document.getElementById('left');
            const right = document.getElementById('right');

            const colors = ['--bg-main', '--bg-blue', '--bg-red', '--bg-orange', '--bg-darkBlue'];

            function getRandomColor() {
                const randomVar = colors[Math.floor(Math.random() * colors.length)];
                return getComputedStyle(document.documentElement).getPropertyValue(randomVar).trim();
            }

            left.addEventListener('click', () => {
                document.body.style.background = getRandomColor();
                currentImageIndex = (currentImageIndex - 1 + imgs.length) % imgs.length;
                updateImageSet(currentImageIndex);
            });

            right.addEventListener('click', () => {
                document.body.style.background = getRandomColor();
                currentImageIndex = (currentImageIndex + 1) % imgs.length;
                updateImageSet(currentImageIndex);
            });

            function updateImageSet(index) {
                const pathParts = imgs[index].split('/');
                const filename = pathParts[pathParts.length - 1]; // "E_0001.webp.png"
                const [name, ...extParts] = filename.split('.');
                const [prefix] = name.split('_');
                const ext = '.' + extParts.join('.');

                config.imagePath = `bearyfine/${prefix}_`;
                config.imageExt = ext;
                config.loadedImages = [];

                preloadImages().then(() => drawFrame(1));
            }

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

            function setupBottleAnimation() {
                gsap.timeline({
                    scrollTrigger: {
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 1.5,
                        ease: "sine.inOut",
                    }
                })
                    .to(".imgbottle", { top: "5%" })
                    .to(".imgbottle", { top: "10%", x: "-45%" });
            }

            function debounce(func, wait) {
                let timeout;
                return function () {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => func.apply(this, arguments), wait);
                };
            }

            // Add bottle images visually
            let page2elem = document.querySelector('.elemnts');
            imgs.forEach((img, index) => {
                let imgElem = document.createElement('img');
                imgElem.src = img;
                imgElem.classList.add('imgbottle');
                page2elem.appendChild(imgElem);
            });

            // Initialize everything
            resizeCanvas();
            window.addEventListener('resize', debounce(resizeCanvas, 100));
            preloadImages().then(() => {
                drawFrame(1);
                setupCanvasScrollTrigger();
                setupBottleAnimation();
            });
        });
