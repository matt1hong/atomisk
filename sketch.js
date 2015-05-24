/*
  Analyze the frequency spectrum with FFT (Fast Fourier Transform)
  Draw a 1024 particles system that represents bins of the FFT frequency spectrum. 
 */

var mic, soundFile; // input sources, press T to toggleInput()

var fft;
var smoothing = 0.8; // play with this, between 0 and .99
var binCount = 1024; // size of resulting FFT array. Must be a power of 2 between 16 and 1024
var particles =  new Array(binCount);
var volume = 0.01; // initial starting volume of amplitude (necessary for p5.sound)
var amplitude;

// preload ensures that the sound is loaded and ready to play in time for setup
function preload() {
  soundFile = loadSound('music/Broke_For_Free_-_01_-_As_Colorful_As_Ever.mp3')
}

function setup() {
  c = createCanvas(windowWidth, windowHeight);
  noStroke();
  // colorMode(HSB, 360, 100, 100, 100);

  soundFile.play();
  mic = new p5.AudioIn();

  // initialize the FFT, plug in our variables for smoothing and binCount
  fft = new p5.FFT(smoothing, binCount);
  fft.setInput(soundFile);

  amplitude = new p5.Amplitude();

  // instantiate the particles.
  for (var i = 0; i < particles.length; i++) {
    var position = createVector(
      // x position corresponds with position in the frequency spectrum
      map(i, 0, binCount, 0, width * 2),
      random(0, height)
    );
    particles[i] = new Particle(position);
  }
}

function draw() {

    // returns an array with [binCount] amplitude readings from lowest to highest frequencies
  var spectrum = fft.analyze(binCount);

  // analyze the volume
  volume = amplitude.getLevel();

  // var hue = map(volume, 0, 0.5, 176, 288);
  // var sat = map(volume, 0, 0.5, 80, 100);
  // var bri = map(volume, 0, 0.5, 80, 100);
  // var alp = map(windowHeight, 0, 0.5, 60, 100);

  // background('#2E7A18');
  clear();

  // update and draw all [binCount] particles!
  // Each particle gets a level that corresponds to
  // the level at one bin of the FFT spectrum. 
  // This level is like amplitude, often called "energy."
  // It will be a number between 0-255.
  for (var i = 0; i < binCount; i++) {
    var thisLevel = map(spectrum[i], 0, 64, 0, 1);
    particles[i].update( thisLevel );
    // update x position (in case we change the bin count)
    particles[i].position.x = map(i, 0, binCount, 0, width * 2);
  }
}

// ===============
// Particle class
// ===============

var Particle = function(position) {
  this.position = position;
  this.scale = random(1, 1.5);
  this.speed = createVector(0, random(5, 8) );
}

var theyExpand = 1+(2*volume);

// use FFT bin level to change speed and diameter
Particle.prototype.update = function(someLevel) {
  this.position.y -= this.speed.y / (someLevel*1.2)

  if (this.position.y < 0) {
    this.position.y = height;
  }
  
  this.diameter = map(someLevel, 0, 1, 0, 10) * this.scale * theyExpand;

  var hue = map(someLevel, 0, 255, 0, 360);
  var sat = 90;
  //var sat = map(volume, 0, 0.5, 80, 100);
 // var sat = map(someLevel, 0, 255, 40, 80);
  var bri = map(volume, 0, 0.5, 60, 100);
  //var bri = map(this.radius, 0, width/1.2, 80, 100);
  var alp = map(volume, 0, 0.5, 60, 100);

  fill(hue,sat,bri,alp);

  ellipse(this.position.x, this.position.y, this.diameter, this.diameter);

}

// ================
// Helper Functions
// ================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

function keyPressed() {
  if (key == 'T') {
    toggleInput();
  }
}

// To prevent feedback, mic doesnt send its output.
// So we need to tell fft to listen to the mic, and then switch back.
function toggleInput() {
  if (soundFile.isPlaying() ) {
    soundFile.pause();
    mic.start();
    amplitude.setInput(mic);
    fft.setInput(mic);
  } else {
    soundFile.play();
    mic.stop();
    amplitude.setInput(soundFile);
    fft.setInput(soundFile);
  }
}