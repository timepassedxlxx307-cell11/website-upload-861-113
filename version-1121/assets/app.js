(function () {
    const menuButton = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            const expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            mobileNav.classList.toggle('open');
        });
    }

    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    let heroIndex = 0;
    let heroTimer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === heroIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === heroIndex);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        clearInterval(heroTimer);
        heroTimer = setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    const prev = document.querySelector('.hero-prev');
    const next = document.querySelector('.hero-next');

    if (prev) {
        prev.addEventListener('click', function () {
            showHero(heroIndex - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showHero(heroIndex + 1);
            startHero();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showHero(index);
            startHero();
        });
    });

    showHero(0);
    startHero();

    const searchInput = document.querySelector('.js-search');
    const categorySelect = document.querySelector('.js-filter-category');
    const typeSelect = document.querySelector('.js-filter-type');
    const yearInput = document.querySelector('.js-filter-year');
    const cards = Array.from(document.querySelectorAll('.js-card'));
    const emptyState = document.querySelector('.empty-state');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        const keyword = normalize(searchInput && searchInput.value);
        const category = normalize(categorySelect && categorySelect.value);
        const type = normalize(typeSelect && typeSelect.value);
        const year = normalize(yearInput && yearInput.value);
        let visible = 0;

        cards.forEach(function (card) {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.category,
                card.dataset.genre,
                card.dataset.year,
                card.dataset.type,
                card.dataset.tags
            ].join(' '));
            const matchKeyword = !keyword || haystack.includes(keyword);
            const matchCategory = !category || normalize(card.dataset.category) === category;
            const matchType = !type || normalize(card.dataset.type).includes(type);
            const matchYear = !year || normalize(card.dataset.year).includes(year);
            const isVisible = matchKeyword && matchCategory && matchType && matchYear;
            card.hidden = !isVisible;
            if (isVisible) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    [searchInput, categorySelect, typeSelect, yearInput].forEach(function (control) {
        if (control) {
            control.addEventListener('input', filterCards);
            control.addEventListener('change', filterCards);
        }
    });

    function attachPlayer(shell) {
        const video = shell.querySelector('video');
        const button = shell.querySelector('.watch-button');
        const message = shell.querySelector('.player-message');

        if (!video || !button) {
            return;
        }

        function playNow() {
            const streamUrl = video.getAttribute('data-stream');

            if (!streamUrl) {
                if (message) {
                    message.textContent = '播放暂时不可用，请稍后重试';
                }
                return;
            }

            if (!video.dataset.ready) {
                if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                    const hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    video._hls = hls;
                } else {
                    video.src = streamUrl;
                }
                video.dataset.ready = '1';
            }

            const playTask = video.play();
            shell.classList.add('playing');

            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {
                    shell.classList.remove('playing');
                    if (message) {
                        message.textContent = '点击视频控件继续播放';
                    }
                });
            }
        }

        button.addEventListener('click', playNow);
        video.addEventListener('click', function () {
            if (!video.dataset.ready) {
                playNow();
            }
        });
        video.addEventListener('play', function () {
            shell.classList.add('playing');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                shell.classList.remove('playing');
            }
        });
    }

    Array.from(document.querySelectorAll('.player-shell')).forEach(attachPlayer);
})();
