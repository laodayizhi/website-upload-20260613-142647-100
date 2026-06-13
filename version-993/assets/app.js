(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var track = hero.querySelector('[data-hero-track]');
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            track.style.transform = 'translateX(-' + index * 100 + '%)';
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                play();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', play);
        show(0);
        play();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-zone]')).forEach(function (zone) {
        var shell = zone.parentElement;
        var input = zone.querySelector('[data-search-input]');
        var clearButton = zone.querySelector('[data-search-clear]');
        var yearSelect = zone.querySelector('[data-filter-year]');
        var regionSelect = zone.querySelector('[data-filter-region]');
        var typeSelect = zone.querySelector('[data-filter-type]');
        var empty = zone.querySelector('[data-empty-state]');
        var cards = Array.prototype.slice.call(shell.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && input) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().replace(/\s+/g, '');
        }

        function apply() {
            var query = normalize(input ? input.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var ok = true;

                if (query && haystack.indexOf(query) === -1) {
                    ok = false;
                }

                if (year && card.getAttribute('data-year') !== year) {
                    ok = false;
                }

                if (region && card.getAttribute('data-region') !== region) {
                    ok = false;
                }

                if (type && card.getAttribute('data-type') !== type) {
                    ok = false;
                }

                card.style.display = ok ? '' : 'none';

                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, yearSelect, regionSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (clearButton) {
            clearButton.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                if (regionSelect) {
                    regionSelect.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                apply();
            });
        }

        apply();
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var hlsInstance = null;

        function start() {
            if (!video) {
                return;
            }

            var src = video.getAttribute('data-hls');

            if (!src) {
                return;
            }

            if (button) {
                button.classList.add('is-hidden');
            }

            if (!video.getAttribute('src')) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.setAttribute('src', src);
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                } else {
                    video.setAttribute('src', src);
                }
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.setAttribute('controls', 'controls');
                });
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });

            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
