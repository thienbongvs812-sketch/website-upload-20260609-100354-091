(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('.hero-thumb'));
    var prev = document.querySelector('.hero-arrow.prev');
    var next = document.querySelector('.hero-arrow.next');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function apply(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('active', i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        apply(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        apply(Number(dot.getAttribute('data-slide')) || 0);
        restart();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        apply(Number(thumb.getAttribute('data-slide')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        apply(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        apply(index + 1);
        restart();
      });
    }

    restart();
  }

  function textValue(element, selector) {
    var node = element.querySelector(selector);
    return node ? node.value.trim().toLowerCase() : '';
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
    panels.forEach(function (panel) {
      var scope = panel.parentElement;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var empty = scope.querySelector('.filter-empty');
      var reset = panel.querySelector('.filter-reset');
      var inputs = Array.prototype.slice.call(panel.querySelectorAll('input, select'));

      function apply() {
        var keyword = textValue(panel, '.filter-keyword');
        var year = textValue(panel, '.filter-year');
        var type = textValue(panel, '.filter-type');
        var category = textValue(panel, '.filter-category');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-category') || ''
          ].join(' ').toLowerCase();
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (year && String(card.getAttribute('data-year') || '').toLowerCase() !== year) {
            matched = false;
          }
          if (type && String(card.getAttribute('data-type') || '').toLowerCase() !== type) {
            matched = false;
          }
          if (category && String(card.getAttribute('data-category') || '').toLowerCase() !== category) {
            matched = false;
          }

          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      inputs.forEach(function (input) {
        input.addEventListener('input', apply);
        input.addEventListener('change', apply);
      });

      if (reset) {
        reset.addEventListener('click', function () {
          inputs.forEach(function (input) {
            input.value = '';
          });
          apply();
        });
      }
    });
  }

  window.initMoviePlayer = function (sourceUrl) {
    ready(function () {
      var video = document.querySelector('.movie-video');
      var overlay = document.querySelector('.player-overlay');
      if (!video || !sourceUrl) {
        return;
      }
      var loaded = false;
      var hlsInstance = null;

      function load() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(sourceUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
      }

      function play() {
        load();
        if (overlay) {
          overlay.classList.add('hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          play();
        }
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
