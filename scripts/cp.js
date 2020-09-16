////•••• Provide the audio material (packing the audio into the buffer) ••••////

// Creating the new AudioContext
var contextClass =
  window.AudioContext ||
  window.webkitAudioContext ||
  window.mozAudioContext ||
  window.oAudioContext ||
  window.msAudioContext;
if (contextClass) {
  // Web Audio API is available.
  var context = new contextClass();
} else {
  // Web Audio API is not available. Ask the user to use a supported browser.
}

// Making the xmlHttpRequest
var request = new XMLHttpRequest();
// Two url alternatives for the request depending on browser (Safari --> '.m4a' or Chrome & FF --> '.ogg')
var x = document.createElement('AUDIO');
isSupp = x.canPlayType('audio/ogg; codecs="vorbis"');
if (isSupp == '') {
  url = '/audio/mhed-more-test-24s.m4a'; // To check if Safari is clients browser and then to choose m4a audio-file
} else {
  url = '/audio/mhed-more-test-24s.ogg'; // To check if Chrome or FF is clients browser and then to choose ogg audio-file
}
request.open('get', url, true);
request.responseType = 'arraybuffer';

// Decode asynchronously
request.onload = function () {
  context.decodeAudioData(request.response, function (theBuffer) {
    buffer = theBuffer;
    onLoaded();
  });
};
request.send();

function onLoaded() {
  button = document.querySelector('button');
  button.removeAttribute('disabled');
  button.innerHTML =
    '&nbsp;&nbsp;&nbsp;<i class="material-icons">play_arrow</i>&nbsp;&nbsp;&nbsp;';
}

////•••• Provide the graphical roundSlider ••••////

$('#slider').roundSlider({
  handleShape: 'square',
  radius: 80,
  value: 0,
  startAngle: 90,
  width: 6,
  handleSize: '15,7',
  lineCap: 'square',
  keyboardAction: false,
  editableTooltip: false,
  sliderType: 'min-range',
  showTooltip: false,
  svgMode: true,
  animation: true,
});

$('#slider').on('drag, change', function (e) {
  let $this = $(this);
  let $elem = $this.closest('.js-audio');
  source[source.stop ? 'stop' : 'noteOff'](0);
  source = context.createBufferSource();
  source.connect(context.destination);
  source.buffer = buffer;
  source.loop = true;
  source.loopEnd = trackLength;
  source[source.start ? 'start' : 'noteOn'](0, 0);
  console.log($elem + '!');
});

////•••• Provide global variables for the function togglePlay ••••////

var beginBuffer = context.createBuffer(2, 1152000, 48000); // This is just a „fake-audioContext“ to get a buffer duration value (here: 24 seconds length of audio-file; it's 24 * 48000 = 1152000)
console.log(beginBuffer.duration);

var isPlaying = false;
var startTime = 0;
var startOffset = 0;
var trackLength = beginBuffer.duration;

////•••• PLAY PAUSE FUNCTION ••••////

function togglePlay() {
  if (isPlaying) {
    // Stop Playback
    source[source.stop ? 'stop' : 'noteOff'](0);
    startOffset += context.currentTime - startTime;
    console.log('paused at', startOffset);
    // Save the position of the play head.
    button.innerHTML =
      '&nbsp;&nbsp;&nbsp;<i class="material-icons">play_arrow</i>&nbsp;&nbsp;&nbsp;';
    cancelAnimationFrame(rAF);
    context.suspend();
  } else {
    context.resume();
    startTime = context.currentTime;
    console.log('started at', startOffset);
    source = context.createBufferSource();
    source.connect(context.destination);
    source.buffer = buffer;
    source.loop = true;
    source.loopEnd = trackLength;
    // Start playback, but make sure we stay in bound of the buffer.
    source[source.start ? 'start' : 'noteOn'](0, startOffset % trackLength);
    button.innerHTML =
      '&nbsp;&nbsp;&nbsp;<i class="material-icons">pause</i>&nbsp;&nbsp;&nbsp;';
    document.getElementById('maxduration').innerText = trackLength;
    rAF = requestAnimationFrame(timeUpdate);
  }
  isPlaying = !isPlaying;
  // console.log(isPlaying);
}

////•••• Provide the function mainly to make the slider going synchronously with the audio playing ••••////

function timeUpdate() {
  // Declaring Variables with Function scope and global scope (-->circleLength)
  trackLength = Math.round(buffer.duration);
  var currentTime_animation = context.currentTime % trackLength;
  var path = document.querySelector('.rs-path');
  circleLength = path.getTotalLength();
  // Calculations
  calcRotate = 90 + (currentTime_animation / trackLength) * 360;
  calcDasharr = 0 + (currentTime_animation / trackLength) * circleLength;
  calcValue = (currentTime_animation / trackLength) * 100;
  // Changing and transforming CSS while audio track is playing
  document.querySelector('.rs-bar').style.transform =
    'rotate(' + calcRotate + 'deg)';
  document.querySelector('.rs-range').style.strokeDasharray = [
    0,
    0,
    calcDasharr,
    circleLength,
  ];
  document
    .querySelector('#slider > div > div.rs-bar.rs-transition.rs-first > div')
    .setAttribute('aria-valuenow', calcValue);
  // print currentTime_animation to HTML-Doc
  document.getElementById('time-current-global').innerText =
    context.currentTime;
  // print context.currentTime to HTML-Doc
  document.getElementById(
    'time-current-animation'
  ).innerText = currentTime_animation;
  //Math.round(context.currentTime); --> just to round cT to seconds (for testing)
  rAF = requestAnimationFrame(timeUpdate); // close the timeUpdate-function-loop
}

// Function togglePlay fired, when user clicks the Play/Pause button

document.querySelector('button').addEventListener('click', function () {
  togglePlay();
});
