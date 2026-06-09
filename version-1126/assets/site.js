(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
      });
    }

    function schedule() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        schedule();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        schedule();
      });
    });

    show(0);
    schedule();
  }

  function initFilters() {
    var containers = Array.prototype.slice.call(document.querySelectorAll("[data-card-container]"));
    if (!containers.length) {
      return;
    }

    var search = document.querySelector("[data-movie-search]");
    var year = document.querySelector("[data-filter-year]");
    var type = document.querySelector("[data-filter-type]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var activeChip = "";

    function cardText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-year")
      ].join(" "));
    }

    function applyFilters() {
      var keyword = normalize(search && search.value);
      var yearValue = normalize(year && year.value);
      var typeValue = normalize(type && type.value);
      var chipValue = normalize(activeChip);

      containers.forEach(function (container) {
        var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
        cards.forEach(function (card) {
          var text = cardText(card);
          var okKeyword = !keyword || text.indexOf(keyword) !== -1;
          var okYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
          var okType = !typeValue || normalize(card.getAttribute("data-type")).indexOf(typeValue) !== -1;
          var okChip = !chipValue || text.indexOf(chipValue) !== -1;
          card.classList.toggle("is-hidden-card", !(okKeyword && okYear && okType && okChip));
        });
      });
    }

    if (search) {
      search.addEventListener("input", applyFilters);
    }
    if (year) {
      year.addEventListener("change", applyFilters);
    }
    if (type) {
      type.addEventListener("change", applyFilters);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var value = chip.getAttribute("data-filter-chip") || "";
        activeChip = activeChip === value ? "" : value;
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item.getAttribute("data-filter-chip") === activeChip);
        });
        applyFilters();
      });
    });
  }

  window.setupMoviePlayer = function (streamUrl) {
    ready(function () {
      var video = document.querySelector("[data-player]");
      var trigger = document.querySelector("[data-player-trigger]");
      var hls = null;
      var attached = false;

      if (!video || !trigger || !streamUrl) {
        return;
      }

      function attachSource() {
        if (attached) {
          return;
        }
        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            autoStartLoad: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          return;
        }

        video.src = streamUrl;
      }

      function playVideo() {
        attachSource();
        trigger.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      trigger.addEventListener("click", playVideo);
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
}());
