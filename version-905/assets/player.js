(function () {
  window.initializePlayer = function (streamUrl, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);

    if (!video || !streamUrl) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    var play = function () {
      if (button) {
        button.classList.add("is-hidden");
      }

      var started = video.play();

      if (started && typeof started.catch === "function") {
        started.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    };

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });
  };
})();
