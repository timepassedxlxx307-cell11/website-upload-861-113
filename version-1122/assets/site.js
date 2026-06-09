
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector('.menu-button');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = nav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', opened);
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = document.querySelector('.hero');
    var title = document.querySelector('.js-hero-title');
    var desc = document.querySelector('.js-hero-desc');
    var link = document.querySelector('.js-hero-link');
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('.hero-thumb'));
    if (!hero || !title || !desc || !link || thumbs.length === 0) {
      return;
    }
    function activate(item) {
      thumbs.forEach(function (node) {
        node.classList.toggle('is-active', node === item);
      });
      var bg = item.getAttribute('data-hero-bg');
      hero.style.backgroundImage = "linear-gradient(115deg, rgba(15,23,42,.94), rgba(30,64,175,.82), rgba(37,99,235,.46)), url('" + bg + "')";
      title.textContent = item.getAttribute('data-hero-title') || title.textContent;
      desc.textContent = item.getAttribute('data-hero-desc') || desc.textContent;
      link.setAttribute('href', item.getAttribute('data-hero-link') || link.getAttribute('href'));
    }
    thumbs.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        activate(item);
      });
      item.addEventListener('focus', function () {
        activate(item);
      });
    });
    activate(thumbs[0]);
  }

  function yearMatches(itemYear, selected) {
    if (selected === 'all') {
      return true;
    }
    if (selected === 'older') {
      var numeric = parseInt(itemYear, 10);
      return !numeric || numeric < 2022;
    }
    return String(itemYear) === selected;
  }

  function setupSearchableList() {
    var list = document.querySelector('.searchable-list');
    if (!list) {
      return;
    }
    var searchInput = document.querySelector('.js-search-input');
    var yearFilter = document.querySelector('.js-year-filter');
    var channelFilter = document.querySelector('.js-channel-filter');
    var sortSelect = document.querySelector('.js-sort-select');
    var emptyState = document.querySelector('.empty-state');
    var selector = '.movie-card, .rank-row, .compact-card';
    var originalItems = Array.prototype.slice.call(list.querySelectorAll(selector));

    function getItems() {
      return Array.prototype.slice.call(list.querySelectorAll(selector));
    }

    function applySort() {
      if (!sortSelect) {
        return;
      }
      var value = sortSelect.value;
      var items = getItems();
      if (value === 'default') {
        items = originalItems.slice();
      } else if (value === 'year-desc') {
        items.sort(function (a, b) {
          return (parseInt(b.dataset.year, 10) || 0) - (parseInt(a.dataset.year, 10) || 0);
        });
      } else if (value === 'year-asc') {
        items.sort(function (a, b) {
          return (parseInt(a.dataset.year, 10) || 0) - (parseInt(b.dataset.year, 10) || 0);
        });
      } else if (value === 'title') {
        items.sort(function (a, b) {
          return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), 'zh-Hans-CN');
        });
      }
      items.forEach(function (item) {
        list.appendChild(item);
      });
    }

    function applyFilter() {
      var query = normalize(searchInput && searchInput.value);
      var selectedYear = yearFilter ? yearFilter.value : 'all';
      var selectedChannel = channelFilter ? channelFilter.value : 'all';
      var visible = 0;
      getItems().forEach(function (item) {
        var haystack = normalize(item.getAttribute('data-search') || item.textContent);
        var year = item.getAttribute('data-year') || '';
        var channel = item.getAttribute('data-channel') || '';
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = yearMatches(year, selectedYear);
        var matchesChannel = selectedChannel === 'all' || channel === selectedChannel;
        var show = matchesQuery && matchesYear && matchesChannel;
        item.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [searchInput, yearFilter, channelFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        applySort();
        applyFilter();
      });
    }
    applyFilter();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchableList();
  });
})();
