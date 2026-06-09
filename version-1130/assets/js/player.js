function initPlayer(config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var started = false;
    var hls = null;

    if (!video || !button || !config.src) {
        return;
    }

    function attach() {
        if (started) {
            return;
        }

        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = config.src;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 60
            });
            hls.loadSource(config.src);
            hls.attachMedia(video);
        } else {
            video.src = config.src;
        }
    }

    function play() {
        attach();
        button.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');

        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                button.classList.remove('is-hidden');
            });
        }
    }

    button.addEventListener('click', play);

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function () {
        button.classList.add('is-hidden');
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
