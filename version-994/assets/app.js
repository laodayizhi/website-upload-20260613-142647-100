(function () {
  'use strict';

  var rootPrefix = document.body ? (document.body.getAttribute('data-root-prefix') || '') : '';

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function buildUrl(path) {
    return rootPrefix + String(path || '').replace(/^\.\//, '');
  }

  function initMobileNav() {
    var toggle = $('[data-menu-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('open');
      nav.classList.toggle('open');
    });
  }

  function initHeroSlider() {
    var slider = $('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = $all('[data-hero-slide]', slider);
    var dots = $all('[data-hero-dot]', slider);
    var previous = $('[data-hero-prev]', slider);
    var next = $('[data-hero-next]', slider);
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

    if (previous) {
      previous.addEventListener('click', function () {
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

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initGlobalSearch() {
    $all('[data-global-search]').forEach(function (panel) {
      var input = $('[data-search-input]', panel);
      var category = $('[data-search-category]', panel);
      var type = $('[data-search-type]', panel);
      var results = $('[data-search-results]', panel);
      var movies = window.MOVIE_INDEX || [];

      if (!input || !results || !movies.length) {
        return;
      }

      if (type && type.options.length <= 1) {
        var types = movies.map(function (movie) { return movie.type; })
          .filter(Boolean)
          .filter(function (value, index, array) { return array.indexOf(value) === index; })
          .slice(0, 32)
          .sort();
        types.forEach(function (value) {
          var option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          type.appendChild(option);
        });
      }

      function render() {
        var query = normalize(input.value);
        var selectedCategory = category ? category.value : '';
        var selectedType = type ? type.value : '';
        var filtered = movies.filter(function (movie) {
          var text = normalize([
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.categoryName,
            (movie.tags || []).join(' '),
            movie.oneLine
          ].join(' '));
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesCategory = !selectedCategory || movie.category === selectedCategory;
          var matchesType = !selectedType || movie.type === selectedType;
          return matchesQuery && matchesCategory && matchesType;
        }).slice(0, 60);

        if (!query && !selectedCategory && !selectedType) {
          results.innerHTML = '<p class="search-empty">输入关键词或选择分类后显示结果。</p>';
          return;
        }

        if (!filtered.length) {
          results.innerHTML = '<p class="search-empty">没有找到匹配影片，请换个关键词。</p>';
          return;
        }

        results.innerHTML = filtered.map(function (movie) {
          return [
            '<a class="search-result-card" href="' + buildUrl(movie.url) + '">',
            '  <img src="' + buildUrl(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '  <span>',
            '    <strong>' + escapeHtml(movie.title) + '</strong>',
            '    <em>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</em>',
            '  </span>',
            '</a>'
          ].join('');
        }).join('');
      }

      ['input', 'change'].forEach(function (eventName) {
        input.addEventListener(eventName, render);
        if (category) {
          category.addEventListener(eventName, render);
        }
        if (type) {
          type.addEventListener(eventName, render);
        }
      });

      render();
    });
  }

  function initLocalFilter() {
    $all('[data-local-filter]').forEach(function (bar) {
      var input = $('[data-local-search]', bar);
      var type = $('[data-local-type]', bar);
      var year = $('[data-local-year]', bar);
      var count = $('[data-local-count]', bar);
      var cards = $all('[data-movie-card]');

      function render() {
        var query = normalize(input ? input.value : '');
        var selectedType = type ? type.value : '';
        var selectedYear = year ? year.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search-text'));
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesType = !selectedType || card.getAttribute('data-type') === selectedType;
          var matchesYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
          var show = matchesQuery && matchesType && matchesYear;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible + ' 部影片';
        }
      }

      [input, type, year].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      });

      render();
    });
  }

  function initPlayers() {
    $all('[data-player]').forEach(function (player) {
      var video = $('.site-video', player);
      var button = $('[data-player-start]', player);
      var status = $('[data-player-status]', player);
      var source = player.getAttribute('data-video-src');
      var hlsInstance = null;
      var initialized = false;

      if (!video || !source) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function initialize() {
        if (initialized) {
          return Promise.resolve();
        }
        initialized = true;

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          setStatus('正在加载高清线路');
          return new Promise(function (resolve) {
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              setStatus('高清线路已加载');
              resolve();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function () {
              setStatus('播放线路连接中，请稍后重试');
              resolve();
            });
          });
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setStatus('高清线路已加载');
          return Promise.resolve();
        }

        video.src = source;
        setStatus('浏览器正在尝试打开播放线路');
        return Promise.resolve();
      }

      function play() {
        initialize().then(function () {
          if (button) {
            button.classList.add('hidden');
          }
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              setStatus('请再次点击视频画面开始播放');
            });
          }
        });
      }

      if (button) {
        button.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHeroSlider();
    initGlobalSearch();
    initLocalFilter();
    initPlayers();
  });
})();
