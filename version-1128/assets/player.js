(function () {
  function attach(video, url) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = url;
  }

  window.initMoviePlayer = function (url) {
    var root = document.querySelector("[data-player-root]");
    var video = document.getElementById("movie-player");
    var button = document.querySelector("[data-play-button]");
    if (!video || !url) {
      return;
    }
    var ready = false;

    function start() {
      if (!ready) {
        attach(video, url);
        ready = true;
      }
      if (button) {
        button.classList.add("is-hidden");
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!ready || video.paused) {
        start();
      }
    });
    if (root) {
      root.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          start();
        }
      });
      root.setAttribute("tabindex", "0");
    }
  };
})();
