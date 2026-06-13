(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
        img.setAttribute('aria-hidden', 'true');
      });
    });

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var index = 0;
      var timer = null;

      function activate(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      function start() {
        if (slides.length < 2) {
          return;
        }
        timer = window.setInterval(function () {
          activate(index + 1);
        }, 5200);
      }

      function reset() {
        if (timer) {
          window.clearInterval(timer);
        }
        start();
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          activate(dotIndex);
          reset();
        });
      });

      activate(0);
      start();
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var typeButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-type-filter]'));
      var categoryButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-category-filter]'));
      var yearSelect = scope.querySelector('[data-year-filter]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var empty = scope.querySelector('[data-empty-message]');
      var activeType = 'all';
      var activeCategory = 'all';

      function setActive(buttons, activeValue, attribute) {
        buttons.forEach(function (button) {
          button.classList.toggle('is-active', button.getAttribute(attribute) === activeValue);
        });
      }

      function filterCards() {
        var query = normalize(input ? input.value : '');
        var year = yearSelect ? yearSelect.value : 'all';
        var visible = 0;

        cards.forEach(function (card) {
          var searchText = normalize(card.getAttribute('data-search'));
          var cardType = card.getAttribute('data-type') || '';
          var cardCategory = card.getAttribute('data-category') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var matched = true;

          if (query && searchText.indexOf(query) === -1) {
            matched = false;
          }
          if (activeType !== 'all' && cardType !== activeType) {
            matched = false;
          }
          if (activeCategory !== 'all' && cardCategory !== activeCategory) {
            matched = false;
          }
          if (year !== 'all' && cardYear !== year) {
            matched = false;
          }

          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', filterCards);
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          input.value = q;
        }
      }

      typeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeType = button.getAttribute('data-type-filter') || 'all';
          setActive(typeButtons, activeType, 'data-type-filter');
          filterCards();
        });
      });

      categoryButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeCategory = button.getAttribute('data-category-filter') || 'all';
          setActive(categoryButtons, activeCategory, 'data-category-filter');
          filterCards();
        });
      });

      if (yearSelect) {
        yearSelect.addEventListener('change', filterCards);
      }

      filterCards();
    });
  });
})();
