(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function norm(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var links = document.querySelector("[data-nav-links]");
        if (toggle && links) {
            toggle.addEventListener("click", function () {
                links.classList.toggle("is-open");
            });
        }

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

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

            function start() {
                timer = setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    if (timer) {
                        clearInterval(timer);
                    }
                    show(dotIndex);
                    start();
                });
            });

            show(0);
            start();
        }

        var homeSearch = document.querySelector("[data-home-search]");
        if (homeSearch) {
            homeSearch.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = homeSearch.querySelector("input");
                var keyword = input ? input.value.trim() : "";
                var url = "movies.html";
                if (keyword) {
                    url += "?q=" + encodeURIComponent(keyword);
                }
                window.location.href = url;
            });
        }

        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-btn]"));
            var targetSelector = panel.getAttribute("data-filter-target") || "[data-movie-card]";
            var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
            var empty = document.querySelector(panel.getAttribute("data-empty-target") || "[data-empty-state]");
            var active = "all";

            function apply() {
                var keyword = norm(input ? input.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var text = norm(card.textContent + " " + (card.getAttribute("data-keywords") || ""));
                    var group = card.getAttribute("data-group") || "all";
                    var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchedGroup = active === "all" || group === active;
                    var keep = matchedKeyword && matchedGroup;
                    card.style.display = keep ? "" : "none";
                    if (keep) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                var params = new URLSearchParams(window.location.search);
                if (params.get("q")) {
                    input.value = params.get("q");
                }
                input.addEventListener("input", apply);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    active = button.getAttribute("data-filter-btn") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });

            apply();
        });
    });
}());

function initMoviePlayer(streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-player-trigger]"));
    var hls = null;
    var prepared = false;

    function prepare() {
        if (prepared || !video) {
            return;
        }
        prepared = true;
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function start(event) {
        if (event) {
            event.preventDefault();
        }
        if (!video) {
            return;
        }
        prepare();
        video.setAttribute("controls", "controls");
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    triggers.forEach(function (trigger) {
        trigger.addEventListener("click", start);
    });

    if (cover) {
        cover.addEventListener("click", start);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    }

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
