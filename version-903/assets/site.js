(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        if (!toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            document.body.classList.toggle("is-menu-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var next = hero.querySelector("[data-hero-next]");
        var prev = hero.querySelector("[data-hero-prev]");
        var current = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5600);
        show(0);
    }

    function setupFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
        roots.forEach(function (root) {
            var scope = root.parentElement || document;
            var input = root.querySelector("[data-filter-keyword]");
            var year = root.querySelector("[data-filter-year]");
            var type = root.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector("[data-empty-state]");

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var typeValue = type ? type.value : "";
                var shown = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.tags,
                        card.dataset.year
                    ].join(" ").toLowerCase();
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchYear = !yearValue || card.dataset.year === yearValue;
                    var matchType = !typeValue || card.dataset.type === typeValue;
                    var visible = matchKeyword && matchYear && matchType;
                    card.classList.toggle("hidden-by-filter", !visible);
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", shown === 0);
                }
            }

            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    window.initMoviePlayer = function (url) {
        ready(function () {
            var player = document.getElementById("moviePlayer");
            var button = document.getElementById("playButton");
            var cover = document.querySelector(".player-cover");
            var loaded = false;

            function attach() {
                if (!player || loaded) {
                    return;
                }
                loaded = true;
                if (player.canPlayType("application/vnd.apple.mpegurl")) {
                    player.src = url;
                } else if (window.Hls) {
                    var hls = new window.Hls();
                    hls.loadSource(url);
                    hls.attachMedia(player);
                } else {
                    player.src = url;
                }
            }

            function start() {
                attach();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                if (player) {
                    var playTask = player.play();
                    if (playTask && typeof playTask.catch === "function") {
                        playTask.catch(function () {});
                    }
                }
            }

            if (button) {
                button.addEventListener("click", start);
            }
            if (cover) {
                cover.addEventListener("click", start);
            }
            if (player) {
                player.addEventListener("play", attach, { once: true });
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
