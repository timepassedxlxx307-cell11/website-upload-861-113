import { H as Hls } from './hls.js';

(function () {
  var player = document.querySelector('[data-video-player]');

  if (!player) {
    return;
  }

  var video = player.querySelector('video');
  var button = player.querySelector('[data-play-button]');
  var source = video ? video.dataset.src : '';
  var loaded = false;
  var hlsInstance = null;

  function loadSource() {
    if (!video || !source || loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function playVideo() {
    loadSource();
    player.classList.add('is-playing');

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        player.classList.remove('is-playing');
      });
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  video.addEventListener('play', function () {
    player.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      player.classList.remove('is-playing');
    }
  });

  video.addEventListener('click', function () {
    if (!loaded) {
      playVideo();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
