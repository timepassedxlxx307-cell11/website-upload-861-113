(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot));
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  var categoryFilter = document.querySelector('[data-category-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var resultCount = document.querySelector('[data-result-count]');

  function applyFilters() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var category = categoryFilter ? categoryFilter.value.trim() : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.dataset.title || '',
        card.dataset.tags || '',
        card.dataset.year || '',
        card.dataset.category || ''
      ].join(' ').toLowerCase();
      var matchedQuery = !query || haystack.indexOf(query) !== -1;
      var matchedCategory = !category || card.dataset.category === category;
      var matched = matchedQuery && matchedCategory;
      card.classList.toggle('is-hidden', !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = String(visible);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', applyFilters);
  }

  document.querySelectorAll('.poster-frame img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.remove();
    });
  });
})();
