const video = document.getElementById("remote_video");
const fullscreenButton = document.getElementById("fullscreenButton");

fullscreenButton.addEventListener("click", toggleFullscreen);

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    video.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement === video) {
    video.controls = true;
  } else {
    video.controls = false;
  }
});
