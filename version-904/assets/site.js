(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function bindMobileNav() {
        var button = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!button || !panel) {
            return;
        }

        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function bindHeaderSearch() {
        var input = document.querySelector("[data-header-search]");

        if (!input) {
            return;
        }

        input.addEventListener("keydown", function (event) {
            if (event.key !== "Enter") {
                return;
            }

            var value = input.value.trim();
            var url = "./search.html";

            if (value) {
                url += "?q=" + encodeURIComponent(value);
            }

            window.location.href = url;
        });
    }

    function bindHeroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var timer = null;

        if (slides.length <= 1) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        show(0);
        start();
    }

    function bindListFilter() {
        var filterInput = document.querySelector("[data-filter-input]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var emptyState = document.querySelector("[data-empty-state]");

        if (!cards.length) {
            return;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function apply() {
            var query = normalize(filterInput ? filterInput.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            var year = normalize(yearSelect ? yearSelect.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                if (type && cardType.indexOf(type) === -1) {
                    matched = false;
                }

                if (year && cardYear !== year) {
                    matched = false;
                }

                card.classList.toggle("hidden-by-filter", !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        [filterInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var preset = params.get("q");

        if (preset && filterInput) {
            filterInput.value = preset;
        }

        apply();
    }

    function bindSmoothAnchors() {
        Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]')).forEach(function (link) {
            link.addEventListener("click", function (event) {
                var target = document.querySelector(link.getAttribute("href"));

                if (!target) {
                    return;
                }

                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });
    }

    window.attachMoviePlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var button = document.getElementById(config.buttonId);
        var overlay = document.getElementById(config.overlayId);
        var source = config.source;
        var loading = false;

        if (!video || !button || !overlay || !source) {
            return;
        }

        function playVideo() {
            if (loading) {
                return;
            }

            loading = true;
            overlay.classList.add("is-hidden");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.play().catch(function () {
                    loading = false;
                    overlay.classList.remove("is-hidden");
                });
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (video._movieHls) {
                    video._movieHls.destroy();
                }

                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                video._movieHls = hls;
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {
                        loading = false;
                        overlay.classList.remove("is-hidden");
                    });
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        loading = false;
                        overlay.classList.remove("is-hidden");
                    }
                });
                return;
            }

            video.src = source;
            video.play().catch(function () {
                loading = false;
                overlay.classList.remove("is-hidden");
            });
        }

        button.addEventListener("click", playVideo);
        overlay.addEventListener("click", playVideo);
    };

    ready(function () {
        bindMobileNav();
        bindHeaderSearch();
        bindHeroSlider();
        bindListFilter();
        bindSmoothAnchors();
    });
})();
