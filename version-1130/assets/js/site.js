(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var forms = document.querySelectorAll('[data-search-form]');
    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input');
            var query = input ? input.value.trim() : '';
            var prefix = form.getAttribute('data-prefix') || '';
            var target = prefix + 'search.html';

            if (query) {
                target += '?q=' + encodeURIComponent(query);
            }

            window.location.href = target;
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function setHero(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            setHero(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            setHero(current + 1);
        }, 5600);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function runFilter() {
        if (!cards.length) {
            return;
        }

        var keyword = normalize(filterInput && filterInput.value);
        var typeValue = normalize(typeFilter && typeFilter.value);
        var yearValue = normalize(yearFilter && yearFilter.value);

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' '));
            var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
            var matchYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;

            card.classList.toggle('hidden-card', !(matchKeyword && matchType && matchYear));
        });
    }

    [filterInput, typeFilter, yearFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', runFilter);
            control.addEventListener('change', runFilter);
        }
    });

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');

        if (q) {
            filterInput.value = q;
        }

        runFilter();
    }
})();
