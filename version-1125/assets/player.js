(function () {
  function setupMoviePlayer(playerId, streamUrl) {
    var shell = document.getElementById(playerId);
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var attached = false;
    var hls = null;

    function attach() {
      if (attached || !video || !streamUrl) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      attach();
      shell.classList.add("is-playing");
      video.controls = true;
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("ended", function () {
        shell.classList.remove("is-playing");
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
