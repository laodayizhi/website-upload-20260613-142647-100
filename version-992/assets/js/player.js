(function () {
    window.initMoviePlayer = function (options) {
        var root = document.getElementById(options.rootId);
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var button = document.getElementById(options.buttonId);
        var source = options.source;
        var prepared = false;
        var hlsInstance = null;

        if (!root || !video || !source) {
            return;
        }

        function tryPlay() {
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {});
            }
        }

        function prepare(callback) {
            if (prepared) {
                callback();
                return;
            }
            prepared = true;
            video.controls = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    callback();
                });
                hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        if (hlsInstance) {
                            hlsInstance.destroy();
                            hlsInstance = null;
                        }
                        video.src = source;
                        video.load();
                        callback();
                    }
                });
                window.setTimeout(callback, 1200);
                return;
            }

            video.src = source;
            video.addEventListener("loadedmetadata", callback, { once: true });
            video.load();
            window.setTimeout(callback, 700);
        }

        function start() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            prepare(tryPlay);
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                start();
            });
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    };
})();
