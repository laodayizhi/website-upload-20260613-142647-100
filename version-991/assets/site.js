(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            if (value) {
                window.location.href = './search.html?q=' + encodeURIComponent(value);
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
            slide.classList.toggle('is-active', position === activeSlide);
        });
        dots.forEach(function (dot, position) {
            dot.classList.toggle('is-active', position === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var filterChips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    var activeFilter = 'all';

    function normalizeText(value) {
        return String(value || '').toLowerCase();
    }

    function applyCardFilter() {
        if (!filterCards.length) {
            return;
        }
        var keyword = filterInput ? normalizeText(filterInput.value.trim()) : '';
        filterCards.forEach(function (card) {
            var text = normalizeText(card.getAttribute('data-search'));
            var genre = normalizeText(card.getAttribute('data-genre'));
            var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
            var genreMatch = activeFilter === 'all' || genre.indexOf(normalizeText(activeFilter)) !== -1;
            card.style.display = keywordMatch && genreMatch ? '' : 'none';
        });
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyCardFilter);
    }

    filterChips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            activeFilter = chip.getAttribute('data-filter-chip') || 'all';
            filterChips.forEach(function (item) {
                item.classList.toggle('is-active', item === chip);
            });
            applyCardFilter();
        });
    });

    var searchPage = document.querySelector('[data-search-page]');

    if (searchPage) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var input = searchPage.querySelector('[data-search-page-input]');
        var resultBox = searchPage.querySelector('[data-search-results]');

        if (input) {
            input.value = query;
            input.focus();
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function renderSearchResults(value) {
            if (!resultBox) {
                return;
            }
            var term = normalizeText(value.trim());
            if (!term) {
                resultBox.innerHTML = '<div class="empty-state">输入片名、类型、地区或年份，查找想看的影视内容。</div>';
                return;
            }
            var list = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
            var results = list.filter(function (item) {
                var haystack = normalizeText([item.title, item.region, item.type, item.year, item.genre, item.tags, item.one_line, item.category_name].join(' '));
                return haystack.indexOf(term) !== -1;
            });
            if (!results.length) {
                resultBox.innerHTML = '<div class="empty-state">没有找到匹配内容，请换一个关键词再试。</div>';
                return;
            }
            resultBox.innerHTML = results.map(function (item) {
                return '<a class="movie-card" href="./' + escapeHtml(item.file) + '">' +
                    '<div class="card-poster">' +
                    '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '">' +
                    '<span class="card-badge">' + escapeHtml(item.type) + '</span>' +
                    '<span class="card-year">' + escapeHtml(item.year) + '</span>' +
                    '</div>' +
                    '<div class="card-body">' +
                    '<h2 class="card-title">' + escapeHtml(item.title) + '</h2>' +
                    '<div class="card-meta">' +
                    '<span class="pill">' + escapeHtml(item.region) + '</span>' +
                    '<span class="pill">' + escapeHtml(item.category_name) + '</span>' +
                    '</div>' +
                    '<p class="card-text">' + escapeHtml(item.one_line) + '</p>' +
                    '</div>' +
                    '</a>';
            }).join('');
        }

        renderSearchResults(query);

        var pageForm = searchPage.querySelector('[data-search-page-form]');
        if (pageForm) {
            pageForm.addEventListener('submit', function (event) {
                event.preventDefault();
                var value = input ? input.value.trim() : '';
                if (value) {
                    window.history.replaceState(null, '', './search.html?q=' + encodeURIComponent(value));
                    renderSearchResults(value);
                }
            });
        }
    }
})();
