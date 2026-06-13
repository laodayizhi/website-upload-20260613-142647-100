(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (toggle && mobileMenu) {
            toggle.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            if (!slides.length) {
                return;
            }
            var index = 0;
            function show(next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, position) {
                    slide.classList.toggle("is-active", position === index);
                });
                dots.forEach(function (dot, position) {
                    dot.classList.toggle("is-active", position === index);
                });
            }
            dots.forEach(function (dot, position) {
                dot.addEventListener("click", function () {
                    show(position);
                });
            });
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        });

        document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var category = scope.querySelector("[data-category-filter]");
            var year = scope.querySelector("[data-year-filter]");
            var sort = scope.querySelector("[data-sort-select]");
            var container = scope.querySelector("[data-sort-container]");
            var items = Array.prototype.slice.call(scope.querySelectorAll("[data-search-item]"));

            function applyFilter() {
                var keyword = normalize(input ? input.value : "");
                var categoryValue = category ? category.value : "";
                var yearValue = year ? year.value : "";
                items.forEach(function (item) {
                    var text = normalize(item.getAttribute("data-filter-text"));
                    var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchesCategory = !categoryValue || item.getAttribute("data-category") === categoryValue;
                    var matchesYear = !yearValue || item.getAttribute("data-year") === yearValue;
                    item.classList.toggle("is-hidden", !(matchesKeyword && matchesCategory && matchesYear));
                });
            }

            function applySort() {
                if (!container || !sort) {
                    return;
                }
                var mode = sort.value;
                var sorted = items.slice().sort(function (a, b) {
                    if (mode === "title-asc") {
                        return normalize(a.getAttribute("data-filter-text")).localeCompare(normalize(b.getAttribute("data-filter-text")), "zh-Hans-CN");
                    }
                    if (mode === "heat-desc") {
                        return Number(b.getAttribute("data-heat") || 0) - Number(a.getAttribute("data-heat") || 0);
                    }
                    return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                });
                sorted.forEach(function (item) {
                    container.appendChild(item);
                });
                items = sorted;
                applyFilter();
            }

            [input, category, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });
            if (sort) {
                sort.addEventListener("change", applySort);
            }
            applySort();
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
            var searchInput = document.querySelector("[data-filter-input]");
            if (searchInput) {
                searchInput.value = q;
                searchInput.dispatchEvent(new Event("input", { bubbles: true }));
            }
        }
    });
})();
