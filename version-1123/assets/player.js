(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function setMessage(player, text) {
    var message = player.querySelector('[data-player-message]');
    if (!message) {
      return;
    }
    message.textContent = text || '';
    message.classList.toggle('show', Boolean(text));
  }

  function playVideo(video) {
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        return null;
      });
    }
  }

  function loadNative(video, source, player) {
    video.src = source;
    video.addEventListener('loadedmetadata', function () {
      playVideo(video);
    }, { once: true });
    video.load();
    setMessage(player, '正在加载播放源');
  }

  function loadWithHls(video, source, player) {
    var hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
      setMessage(player, '播放源已就绪');
      playVideo(video);
    });
    hls.on(window.Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setMessage(player, '播放源加载异常，请稍后重试');
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      }
    });
    player._hlsInstance = hls;
  }

  function initializePlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-player-button]');
    var source = player.getAttribute('data-video-url');
    if (!video || !button || !source) {
      return;
    }

    function start() {
      if (player.classList.contains('is-loaded')) {
        playVideo(video);
        return;
      }
      player.classList.add('is-loaded');
      button.classList.add('is-hidden');
      setMessage(player, '正在连接高清播放源');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        loadNative(video, source, player);
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        loadWithHls(video, source, player);
        return;
      }
      loadNative(video, source, player);
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });

    player.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      start();
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initializePlayer);
  });
})();
