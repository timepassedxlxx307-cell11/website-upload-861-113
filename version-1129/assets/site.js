(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function initNavigation() {
        var toggle = one('[data-mobile-toggle]');
        var nav = one('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = one('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = all('[data-hero-slide]', hero);
        var dots = all('[data-hero-dot]', hero);
        var prev = one('[data-hero-prev]', hero);
        var next = one('[data-hero-next]', hero);
        var current = 0;
        var timer = null;
        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    function initFilters() {
        var input = one('[data-search-input]');
        var cards = all('[data-search-card]');
        var chips = all('[data-filter-chip]');
        var empty = one('[data-empty-state]');
        if (!cards.length) {
            return;
        }
        var activeFilter = 'all';
        function update() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var group = card.getAttribute('data-filter') || 'all';
                var matchText = !query || text.indexOf(query) !== -1;
                var matchFilter = activeFilter === 'all' || group === activeFilter;
                var matched = matchText && matchFilter;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }
        if (input) {
            input.addEventListener('input', update);
        }
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeFilter = chip.getAttribute('data-filter-chip') || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                update();
            });
        });
        update();
    }

    function initPlayers() {
        all('[data-player]').forEach(function (shell) {
            var video = one('video', shell);
            var overlay = one('[data-play-button]', shell);
            var url = shell.getAttribute('data-video-url');
            var ready = false;
            function attach() {
                if (!video || !url || ready) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    ready = true;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    ready = true;
                    return;
                }
                video.src = url;
                ready = true;
            }
            function play() {
                attach();
                if (!video) {
                    return;
                }
                if (overlay) {
                    overlay.hidden = true;
                }
                var started = video.play();
                if (started && typeof started.catch === 'function') {
                    started.catch(function () {
                        if (overlay) {
                            overlay.hidden = false;
                        }
                    });
                }
            }
            if (overlay) {
                overlay.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener('play', function () {
                    if (overlay) {
                        overlay.hidden = true;
                    }
                });
                video.addEventListener('pause', function () {
                    if (overlay && !video.ended) {
                        overlay.hidden = false;
                    }
                });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initNavigation();
        initHero();
        initFilters();
        initPlayers();
    });
})();
