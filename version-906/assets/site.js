(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('#mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
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

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    var shell = document.querySelector('.hero-shell');
    if (shell) {
      shell.addEventListener('mouseenter', stop);
      shell.addEventListener('mouseleave', start);
    }
    start();
  }

  function setupImageFallback() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img[data-fallback-title]'));
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });
  }

  function setupLocalFilter() {
    var panel = document.querySelector('[data-local-filter-panel]');
    var list = document.querySelector('[data-local-filter-list]');
    if (!panel || !list) {
      return;
    }

    var input = panel.querySelector('[data-local-filter-input]');
    var yearSelect = panel.querySelector('[data-local-filter-year]');
    var typeSelect = panel.querySelector('[data-local-filter-type]');
    var reset = panel.querySelector('[data-local-filter-reset]');
    var count = panel.querySelector('[data-local-filter-count]');
    var items = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .archive-row'));

    function matches(item) {
      var query = normalize(input ? input.value : '');
      var minYear = Number(yearSelect && yearSelect.value ? yearSelect.value : 0);
      var typeValue = normalize(typeSelect ? typeSelect.value : '');
      var searchable = normalize([
        item.getAttribute('data-title'),
        item.getAttribute('data-region'),
        item.getAttribute('data-type'),
        item.getAttribute('data-year'),
        item.getAttribute('data-genre'),
        item.getAttribute('data-tags')
      ].join(' '));
      var year = Number(item.getAttribute('data-year') || 0);
      var type = normalize(item.getAttribute('data-type'));
      var queryOk = !query || searchable.indexOf(query) !== -1;
      var yearOk = !minYear || year >= minYear;
      var typeOk = !typeValue || type.indexOf(typeValue) !== -1 || searchable.indexOf(typeValue) !== -1;
      return queryOk && yearOk && typeOk;
    }

    function apply() {
      var visible = 0;
      items.forEach(function (item) {
        var ok = matches(item);
        item.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = String(visible);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', apply);
    }
    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        apply();
      });
    }
    apply();
  }

  function movieCardHtml(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a class="movie-link" href="' + escapeHtml(movie.url) + '">',
      '    <span class="poster-frame">',
      '      <span class="poster-fallback-title">' + escapeHtml(movie.title) + '</span>',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '海报" loading="lazy" data-fallback-title="' + escapeHtml(movie.title) + '">',
      '      <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
      '    </span>',
      '    <span class="movie-card-body">',
      '      <span class="movie-title">' + escapeHtml(movie.title) + '</span>',
      '      <span class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</span>',
      '      <span class="movie-desc">' + escapeHtml(movie.oneLine) + '</span>',
      '      <span class="tag-row">' + tags + '</span>',
      '    </span>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var form = document.querySelector('[data-search-page-form]');
    var input = document.querySelector('#search-page-input');
    var count = document.querySelector('[data-search-count]');
    var yearSelect = document.querySelector('[data-search-year]');
    var typeSelect = document.querySelector('[data-search-type]');
    var params = new URLSearchParams(window.location.search);

    if (input) {
      input.value = params.get('q') || '';
    }

    function applySearch(event) {
      if (event) {
        event.preventDefault();
      }
      var query = normalize(input ? input.value : '');
      var minYear = Number(yearSelect && yearSelect.value ? yearSelect.value : 0);
      var typeValue = normalize(typeSelect ? typeSelect.value : '');
      var matches = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        var searchable = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' '));
        var queryOk = !query || searchable.indexOf(query) !== -1;
        var yearOk = !minYear || Number(movie.yearNumber || movie.year || 0) >= minYear;
        var typeOk = !typeValue || normalize(movie.type).indexOf(typeValue) !== -1 || searchable.indexOf(typeValue) !== -1;
        return queryOk && yearOk && typeOk;
      }).slice(0, 120);

      results.innerHTML = matches.map(movieCardHtml).join('');
      if (count) {
        count.textContent = String(matches.length);
      }
      setupImageFallback();
    }

    if (form) {
      form.addEventListener('submit', applySearch);
    }
    if (input) {
      input.addEventListener('input', applySearch);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applySearch);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', applySearch);
    }
    applySearch();
  }

  function setupPlayer() {
    var card = document.querySelector('[data-player-card]');
    if (!card) {
      return;
    }
    var video = card.querySelector('video[data-src]');
    var button = card.querySelector('[data-play-action]');
    if (!video || !button) {
      return;
    }
    var initialized = false;

    function playVideo() {
      var source = video.getAttribute('data-src');
      if (!source) {
        button.textContent = '当前播放源暂不可用';
        return;
      }
      button.classList.add('is-hidden');
      if (!initialized) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              button.classList.remove('is-hidden');
            });
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              button.classList.remove('is-hidden');
              button.textContent = '播放失败，请重试';
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {
              button.classList.remove('is-hidden');
            });
          }, { once: true });
        } else {
          video.src = source;
          video.play().catch(function () {
            button.classList.remove('is-hidden');
          });
        }
        initialized = true;
      } else {
        video.play().catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', playVideo);
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupImageFallback();
    setupLocalFilter();
    setupSearchPage();
    setupPlayer();
  });
})();
