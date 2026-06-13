(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var navLinks = document.querySelector('.nav-links');

    if (menuButton && navLinks) {
        menuButton.addEventListener('click', function () {
            var isOpen = navLinks.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero-carousel]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer = null;

        var activate = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        var next = function () {
            if (slides.length > 0) {
                activate((current + 1) % slides.length);
            }
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(next, 5200);
            });
        });

        if (slides.length > 1) {
            timer = window.setInterval(next, 5200);
        }
    }

    var grid = document.getElementById('movie-grid');
    var searchInput = document.getElementById('movie-search');
    var typeFilter = document.getElementById('type-filter');
    var regionFilter = document.getElementById('region-filter');
    var yearFilter = document.getElementById('year-filter');
    var categoryFilter = document.getElementById('category-filter');
    var visibleCount = document.getElementById('visible-count');
    var emptyState = document.getElementById('empty-state');

    if (grid && searchInput) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.searchable-card'));

        var uniqueValues = function (name) {
            var values = [];
            cards.forEach(function (card) {
                var value = card.getAttribute('data-' + name) || '';
                if (value && values.indexOf(value) === -1) {
                    values.push(value);
                }
            });
            return values.sort(function (a, b) {
                return a.localeCompare(b, 'zh-CN');
            });
        };

        var fillOptions = function (select, values) {
            if (!select) {
                return;
            }
            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        };

        fillOptions(typeFilter, uniqueValues('type'));
        fillOptions(regionFilter, uniqueValues('region'));
        fillOptions(yearFilter, uniqueValues('year').reverse());

        var applyFilters = function () {
            var query = searchInput.value.trim().toLowerCase();
            var typeValue = typeFilter ? typeFilter.value : '';
            var regionValue = regionFilter ? regionFilter.value : '';
            var yearValue = yearFilter ? yearFilter.value : '';
            var categoryValue = categoryFilter ? categoryFilter.value : '';
            var shown = 0;

            cards.forEach(function (card) {
                var searchText = (card.getAttribute('data-search') || '').toLowerCase();
                var isMatch = true;

                if (query && searchText.indexOf(query) === -1) {
                    isMatch = false;
                }
                if (typeValue && card.getAttribute('data-type') !== typeValue) {
                    isMatch = false;
                }
                if (regionValue && card.getAttribute('data-region') !== regionValue) {
                    isMatch = false;
                }
                if (yearValue && card.getAttribute('data-year') !== yearValue) {
                    isMatch = false;
                }
                if (categoryValue && card.getAttribute('data-category') !== categoryValue) {
                    isMatch = false;
                }

                card.style.display = isMatch ? '' : 'none';
                if (isMatch) {
                    shown += 1;
                }
            });

            if (visibleCount) {
                visibleCount.textContent = String(shown);
            }
            if (emptyState) {
                emptyState.style.display = shown === 0 ? 'block' : 'none';
            }
        };

        [searchInput, typeFilter, regionFilter, yearFilter, categoryFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }
}());
