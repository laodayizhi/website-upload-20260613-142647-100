(function (global) {
    global.createMoviePlayer = function (videoSelector, buttonSelector, streamUrl) {
        var video = document.querySelector(videoSelector);
        var button = document.querySelector(buttonSelector);
        var attached = false;
        var Hls = global.Hls;

        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (Hls && Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function startPlayback() {
            attachStream();
            video.controls = true;
            if (button) {
                button.classList.add('is-hidden');
            }
            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
    };
})(window);
