(function () {
    function initMoviePlayer(sourceUrl) {
        var video = document.getElementById('movie-player');
        var overlay = document.querySelector('.player-overlay');

        if (!video || !sourceUrl) {
            return;
        }

        var hls = null;

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else {
            video.src = sourceUrl;
        }

        var startPlayback = function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        };

        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        video.addEventListener('ended', function () {
            if (overlay) {
                overlay.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
}());
