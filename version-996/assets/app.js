(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var activeFilter = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        var keyword = searchInput ? normalize(searchInput.value) : '';

        cards.forEach(function (card) {
            var title = normalize(card.getAttribute('data-title'));
            var tags = normalize(card.getAttribute('data-tags'));
            var region = normalize(card.getAttribute('data-region'));
            var category = normalize(card.getAttribute('data-category'));
            var matchKeyword = !keyword || title.indexOf(keyword) > -1 || tags.indexOf(keyword) > -1 || region.indexOf(keyword) > -1 || category.indexOf(keyword) > -1;
            var matchFilter = activeFilter === 'all' || category === activeFilter;

            card.classList.toggle('is-hidden', !(matchKeyword && matchFilter));
        });
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            searchInput.value = query;
        }

        searchInput.addEventListener('input', applyFilters);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter') || 'all';

            filterButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });

            applyFilters();
        });
    });

    applyFilters();
}());
