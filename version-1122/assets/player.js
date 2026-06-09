
(function () {
  window.initMoviePlayer = function (playlistUrl) {
    var root = document.querySelector('.movie-player');
    if (!root) {
      return;
    }
    var video = root.querySelector('video');
    var overlay = root.querySelector('.play-overlay');
    var loaded = false;
    var hls = null;

    function attachStream() {
      if (loaded || !video || !playlistUrl) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playlistUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(playlistUrl);
        hls.attachMedia(video);
      } else {
        video.src = playlistUrl;
      }
      loaded = true;
    }

    function startPlayback() {
      attachStream();
      if (!video) {
        return;
      }
      video.controls = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          startPlayback();
        }
      });
      video.addEventListener('ended', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
