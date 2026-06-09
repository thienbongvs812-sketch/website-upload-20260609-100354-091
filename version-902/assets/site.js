(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10));
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function setupFilters() {
        var bars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-bar]'));
        bars.forEach(function (bar) {
            var container = bar.parentElement;
            if (!container) {
                return;
            }
            var grid = container.querySelector('[data-card-grid]');
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            var search = bar.querySelector('[data-search-input]');
            var year = bar.querySelector('[data-year-filter]');
            var type = bar.querySelector('[data-type-filter]');
            var region = bar.querySelector('[data-region-filter]');

            function valueOf(element) {
                return element ? element.value.trim().toLowerCase() : '';
            }

            function apply() {
                var keyword = valueOf(search);
                var selectedYear = valueOf(year);
                var selectedType = valueOf(type);
                var selectedRegion = valueOf(region);
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
                    var cardType = (card.getAttribute('data-type') || '').toLowerCase();
                    var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
                    var matched = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        matched = false;
                    }
                    if (selectedType && cardType !== selectedType) {
                        matched = false;
                    }
                    if (selectedRegion && cardRegion !== selectedRegion) {
                        matched = false;
                    }
                    card.classList.toggle('is-hidden', !matched);
                });
            }

            [search, year, type, region].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', apply);
                    element.addEventListener('change', apply);
                }
            });
        });
    }

    function attachVideo(video) {
        if (!video || video.getAttribute('data-ready') === '1') {
            return;
        }
        var src = video.getAttribute('data-src');
        if (!src) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hls = hls;
        } else {
            video.src = src;
        }
        video.setAttribute('data-ready', '1');
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            attachVideo(video);
            function play() {
                attachVideo(video);
                if (button) {
                    button.classList.add('is-hidden');
                }
                var attempt = video.play();
                if (attempt && attempt.catch) {
                    attempt.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            }
            if (button) {
                button.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('play', function () {
                    if (button) {
                        button.classList.add('is-hidden');
                    }
                });
                video.addEventListener('pause', function () {
                    if (button && video.currentTime === 0) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
