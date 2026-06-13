(function () {
  var hlsPromise = null;
  var hlsCdn = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';

  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsPromise) {
      return hlsPromise;
    }

    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = hlsCdn;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsPromise;
  }

  function initPlayer(container) {
    var video = container.querySelector('video');
    var playButton = container.querySelector('[data-play-button]');
    var sourceButtons = Array.prototype.slice.call(container.querySelectorAll('[data-source]'));
    var status = container.querySelector('[data-player-status]');
    var activeSource = container.getAttribute('data-m3u8') || '';
    var hlsInstance = null;
    var preparedSource = '';

    if (!video || !activeSource) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function destroyHls() {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    }

    function prepare(source) {
      if (preparedSource === source) {
        return Promise.resolve();
      }

      preparedSource = source;
      destroyHls();
      setStatus('正在连接高清线路');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.load();
        return Promise.resolve();
      }

      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          return new Promise(function (resolve) {
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            hlsInstance.on(Hls.Events.ERROR, function (_, data) {
              if (data && data.fatal) {
                setStatus('线路连接异常，可切换播放源重试');
              }
            });
          });
        }

        video.src = source;
        video.load();
        return Promise.resolve();
      });
    }

    function play() {
      prepare(activeSource).then(function () {
        var playTask = video.play();
        if (playTask && typeof playTask.then === 'function') {
          playTask.then(function () {
            if (playButton) {
              playButton.classList.add('is-hidden');
            }
            setStatus('正在播放');
          }).catch(function () {
            setStatus('请再次点击播放');
          });
        }
      }).catch(function () {
        setStatus('播放器初始化失败，可刷新后重试');
      });
    }

    sourceButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeSource = button.getAttribute('data-source') || activeSource;
        sourceButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        preparedSource = '';
        play();
      });
    });

    if (playButton) {
      playButton.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
      setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
      if (playButton && !video.ended) {
        playButton.classList.remove('is-hidden');
      }
      setStatus('已暂停');
    });

    video.addEventListener('ended', function () {
      if (playButton) {
        playButton.classList.remove('is-hidden');
      }
      setStatus('播放结束');
    });
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(initPlayer);
  });
})();
