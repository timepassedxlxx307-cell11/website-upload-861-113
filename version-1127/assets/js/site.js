(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function initMenu() {
    var button = select('.nav-toggle');
    var menu = select('.mobile-menu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function initHero() {
    var slides = selectAll('.hero-slide');
    var dots = selectAll('.hero-dot');
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      slides[index].classList.remove('active');
      if (dots[index]) {
        dots[index].classList.remove('active');
      }
      index = (next + slides.length) % slides.length;
      slides[index].classList.add('active');
      if (dots[index]) {
        dots[index].classList.add('active');
      }
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(dotIndex);
        start();
      });
    });

    start();
  }

  function initQuickSearch() {
    var form = select('.quick-search-form');
    if (!form) {
      return;
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = select('input', form);
      var query = input ? input.value.trim() : '';
      var url = './search.html';
      if (query) {
        url += '?q=' + encodeURIComponent(query);
      }
      window.location.href = url;
    });
  }

  function initCatalogFilter() {
    var panel = select('.catalog-filter');
    var cards = selectAll('.movie-card, .rank-card');
    if (!panel || !cards.length) {
      return;
    }
    var search = select('.catalog-search', panel);
    var year = select('.catalog-year', panel);
    var type = select('.catalog-type', panel);
    var category = select('.catalog-category', panel);
    var empty = select('.filter-empty');
    var params = new URLSearchParams(window.location.search);
    var preset = params.get('q');

    if (preset && search) {
      search.value = preset;
    }

    function matches(card) {
      var query = normalize(search && search.value);
      var selectedYear = normalize(year && year.value);
      var selectedType = normalize(type && type.value);
      var selectedCategory = normalize(category && category.value);
      var text = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.year
      ].join(' '));
      var okQuery = !query || text.indexOf(query) !== -1;
      var okYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
      var okType = !selectedType || normalize(card.dataset.type) === selectedType;
      var okCategory = !selectedCategory || normalize(card.dataset.category) === selectedCategory;
      return okQuery && okYear && okType && okCategory;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [search, year, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  window.setupVideo = function (src) {
    var video = select('[data-video-player]');
    var cover = select('.player-cover');
    var play = select('.player-play');
    var hls = null;
    var ready = false;

    function attach() {
      if (!video || ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      ready = true;
    }

    function start() {
      if (!video) {
        return;
      }
      attach();
      video.controls = true;
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }
    if (play) {
      play.addEventListener('click', function (event) {
        event.stopPropagation();
        start();
      });
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initQuickSearch();
    initCatalogFilter();
  });
})();
