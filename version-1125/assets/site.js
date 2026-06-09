(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function bindMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function bindSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "./search.html?q=" + encodeURIComponent(query);
        } else {
          window.location.href = "./search.html";
        }
      });
    });
  }

  function bindFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var keyword = panel.querySelector("[data-filter-keyword]");
    var year = panel.querySelector("[data-filter-year]");
    var type = panel.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function apply() {
      var q = normalize(keyword && keyword.value);
      var selectedYear = normalize(year && year.value);
      var selectedType = normalize(type && type.value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search-text"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var matched = (!q || text.indexOf(q) !== -1) &&
          (!selectedYear || cardYear === selectedYear) &&
          (!selectedType || cardType === selectedType);
        card.classList.toggle("hide", !matched);
      });
    }

    [keyword, year, type].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
    apply();
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join("");
    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + escapeAttr(movie.url) + '">' +
      '<img src="' + escapeAttr(movie.cover) + '" alt="' + escapeAttr(movie.title) + '" loading="lazy">' +
      '<span class="badge">' + escapeHtml(movie.category) + '</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<h2 class="card-title"><a href="' + escapeAttr(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
      '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '<div class="card-tags">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function bindSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !input || !window.movieSearchIndex) {
      return;
    }

    function render() {
      var query = normalize(input.value);
      var words = query.split(/\s+/).filter(Boolean);
      var list = window.movieSearchIndex.filter(function (movie) {
        if (!words.length) {
          return true;
        }
        var text = normalize([movie.title, movie.oneLine, movie.region, movie.type, movie.genre, movie.category, (movie.tags || []).join(" ")].join(" "));
        return words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
      }).slice(0, 120);

      if (!list.length) {
        results.innerHTML = '<div class="result-empty">没有找到匹配影片，可尝试更换关键词。</div>';
        return;
      }
      results.innerHTML = list.map(movieCard).join("");
    }

    input.value = getQuery();
    input.addEventListener("input", render);
    render();
  }

  ready(function () {
    bindMenu();
    bindHero();
    bindSearchForms();
    bindFilters();
    bindSearchPage();
  });
})();
