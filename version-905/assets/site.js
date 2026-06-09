(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slider = document.querySelector("[data-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-dot]"));
    var current = 0;
    var timer = null;

    var activate = function (index) {
      current = index % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    var start = function () {
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-slide-dot"));
        window.clearInterval(timer);
        activate(index);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  var searchInput = document.querySelector("[data-search]");
  var yearFilter = document.querySelector("[data-year-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var emptyState = document.querySelector("[data-empty-state]");

  var normalize = function (value) {
    return String(value || "").trim().toLowerCase();
  };

  var applyFilter = function () {
    var keyword = normalize(searchInput ? searchInput.value : "");
    var year = yearFilter ? yearFilter.value : "";
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" "));
      var cardYear = card.getAttribute("data-year") || "";
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !year || cardYear === year;
      var shouldShow = matchKeyword && matchYear;

      card.classList.toggle("is-hidden", !shouldShow);

      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  };

  if (searchInput || yearFilter) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && searchInput) {
      searchInput.value = query;
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilter);
    }

    if (yearFilter) {
      yearFilter.addEventListener("change", applyFilter);
    }

    applyFilter();
  }
})();
