(function () {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    const slides = Array.from(carousel.querySelectorAll("[data-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    const prev = document.querySelector("[data-hero-prev]");
    const next = document.querySelector("[data-hero-next]");
    let index = slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    });

    if (index < 0) {
      index = 0;
    }

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });

      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        show(itemIndex);
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 6500);
    }
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    const input = panel.querySelector("[data-filter-input]");
    const yearSelect = panel.querySelector("[data-year-filter]");
    const genreSelect = panel.querySelector("[data-genre-filter]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const empty = document.querySelector("[data-empty-state]");

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      const query = normalize(input ? input.value : "");
      const year = normalize(yearSelect ? yearSelect.value : "");
      const genre = normalize(genreSelect ? genreSelect.value : "");
      let visible = 0;

      cards.forEach(function (card) {
        const search = normalize(card.getAttribute("data-search"));
        const cardYear = normalize(card.getAttribute("data-year"));
        const cardGenre = normalize(card.getAttribute("data-genre"));
        const matchQuery = !query || search.indexOf(query) !== -1;
        const matchYear = !year || cardYear === year;
        const matchGenre = !genre || cardGenre.indexOf(genre) !== -1;
        const show = matchQuery && matchYear && matchGenre;

        card.classList.toggle("is-filtered", !show);

        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }

    if (genreSelect) {
      genreSelect.addEventListener("change", applyFilter);
    }
  });

  const video = document.getElementById("moviePlayer");
  const shell = document.querySelector(".player-shell");
  const overlay = document.querySelector(".play-overlay");

  if (video && shell) {
    let ready = false;
    let hlsInstance = null;
    const source = video.getAttribute("src");

    function prepare() {
      if (ready || !source) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        video.removeAttribute("src");
        hlsInstance = new window.Hls({
          maxBufferLength: 45
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      }

      ready = true;
    }

    function start() {
      prepare();
      shell.classList.add("is-playing");
      video.controls = true;
      const attempt = video.play();

      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
