(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var opened = mobileNav.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
        var current = 0;
        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showSlide(i);
            });
        });
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var searchInput = document.querySelector(".site-search");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-item"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var empty = document.querySelector(".empty-state");
    var activeChip = "";

    var applyFilter = function () {
        if (!cards.length) {
            return;
        }
        var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
            var bag = [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-type") || "",
                card.getAttribute("data-year") || "",
                card.getAttribute("data-genre") || "",
                card.getAttribute("data-tags") || "",
                card.textContent || ""
            ].join(" ").toLowerCase();
            var matchedQuery = !query || bag.indexOf(query) !== -1;
            var matchedChip = !activeChip || bag.indexOf(activeChip.toLowerCase()) !== -1;
            var matched = matchedQuery && matchedChip;
            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.style.display = visible ? "none" : "block";
        }
    };

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
            searchInput.value = q;
        }
        searchInput.addEventListener("input", applyFilter);
    }

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            activeChip = chip.getAttribute("data-filter-chip") || "";
            chips.forEach(function (item) {
                item.classList.toggle("active", item === chip);
            });
            applyFilter();
        });
    });

    applyFilter();
})();

function initMoviePlayer(source) {
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playOverlay");
    if (!video || !source) {
        return;
    }
    var loaded = false;
    var hlsInstance = null;
    var load = function () {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    };
    var start = function () {
        load();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    };
    if (overlay) {
        overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });
    video.addEventListener("ended", function () {
        if (overlay) {
            overlay.classList.remove("is-hidden");
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
