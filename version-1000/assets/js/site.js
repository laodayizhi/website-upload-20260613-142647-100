(function () {
    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setPlayer(video, stream) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            return;
        }

        video.src = stream;
    }

    window.initMoviePlayer = function (videoId, stream, coverId) {
        onReady(function () {
            var video = document.getElementById(videoId);
            var cover = document.getElementById(coverId);
            var started = false;

            if (!video || !cover) {
                return;
            }

            function playMovie() {
                if (!started) {
                    started = true;
                    setPlayer(video, stream);
                    video.setAttribute('controls', 'controls');
                }

                cover.classList.add('is-hidden');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        cover.classList.remove('is-hidden');
                    });
                }
            }

            cover.addEventListener('click', playMovie);
            video.addEventListener('click', function () {
                if (video.paused) {
                    playMovie();
                }
            });
        });
    };

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var menu = document.querySelector('[data-mobile-nav]');

        if (!button || !menu) {
            return;
        }

        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFiltering() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));

        inputs.forEach(function (input) {
            var targetSelector = input.getAttribute('data-filter-target');
            var target = targetSelector ? document.querySelector(targetSelector) : document;
            if (!target) {
                return;
            }

            var cards = Array.prototype.slice.call(target.querySelectorAll('[data-movie-card]'));
            var count = document.querySelector('[data-filter-count]');
            var empty = document.createElement('div');
            empty.className = 'no-results';
            empty.textContent = '没有找到匹配影片';

            function filter() {
                var value = input.value.trim().toLowerCase();
                var visible = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                    var matched = !value || text.indexOf(value) !== -1;
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }

                if (visible === 0) {
                    if (!empty.parentNode) {
                        target.appendChild(empty);
                    }
                } else if (empty.parentNode) {
                    empty.parentNode.removeChild(empty);
                }
            }

            input.addEventListener('input', filter);

            var params = new URLSearchParams(window.location.search);
            if (params.has('q')) {
                input.value = params.get('q') || '';
            }
            filter();
        });
    }

    function setupBackTop() {
        var button = document.querySelector('[data-back-top]');
        if (!button) {
            return;
        }

        function toggle() {
            button.classList.toggle('show', window.scrollY > 420);
        }

        button.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        window.addEventListener('scroll', toggle, { passive: true });
        toggle();
    }

    onReady(function () {
        setupMenu();
        setupHero();
        setupFiltering();
        setupBackTop();
    });
}());
