(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
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

    restart();
  }

  function setupFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
    roots.forEach(function (root) {
      var section = root.closest('section') || document;
      var search = root.querySelector('[data-search-input]');
      var category = root.querySelector('[data-filter="category"]');
      var year = root.querySelector('[data-filter="year"]');
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
      var empty = section.querySelector('[data-empty-state]');

      function matchYear(cardYear, selectedYear) {
        if (!selectedYear || selectedYear === 'all') {
          return true;
        }
        if (selectedYear === 'classic') {
          var number = parseInt(cardYear, 10);
          return !number || number < 2022;
        }
        return cardYear === selectedYear;
      }

      function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : '';
        var selectedCategory = category ? category.value : 'all';
        var selectedYear = year ? year.value : 'all';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-title') || '').toLowerCase();
          var cardCategory = card.getAttribute('data-category') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (selectedCategory !== 'all' && cardCategory !== selectedCategory) {
            ok = false;
          }
          if (!matchYear(cardYear, selectedYear)) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (search) {
        search.addEventListener('input', apply);
      }
      if (category) {
        category.addEventListener('change', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
