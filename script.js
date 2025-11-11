const flames = document.querySelectorAll('.flame');
const relightBtn = document.getElementById('relightBtn');
const confettiCanvas = document.getElementById('confetti');
const ctx = confettiCanvas.getContext('2d');
let width = window.innerWidth, height = window.innerHeight;
confettiCanvas.width = width;
confettiCanvas.height = height;

let confetti = [];
let confettiActive = false;
let blownOut = false; // prevent multiple blow-outs

const birthdaySong = document.getElementById('birthdaySong');

// 🎊 Confetti effect
function createConfetti() {
  confetti = [];
  for (let i = 0; i < 150; i++) {
    confetti.push({
      x: Math.random() * width,
      y: Math.random() * height - height,
      r: Math.random() * 6 + 2,
      d: Math.random() * 20 + 10,
      color: `hsl(${Math.random() * 360}, 100%, 70%)`,
      tilt: Math.random() * 10 - 10
    });
  }
  confettiActive = true;
  setTimeout(() => { confettiActive = false; ctx.clearRect(0, 0, width, height); }, 10000);
}

function drawConfetti() {
  if (!confettiActive) return;
  ctx.clearRect(0, 0, width, height);
  confetti.forEach(c => {
    ctx.beginPath();
    ctx.fillStyle = c.color;
    ctx.fillRect(c.x, c.y, c.r, c.r);
  });
  confetti.forEach(c => {
    c.y += c.d / 20;
    c.x += Math.sin(c.tilt);
    if (c.y > height) c.y = -10;
  });
  requestAnimationFrame(drawConfetti);
}

// 🔥 Blow out flames
function blowOutFlames() {
  if (blownOut) return; // prevent multiple triggers
  blownOut = true;

  flames.forEach((f, i) => {
    setTimeout(() => {
      f.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
      f.style.opacity = "0";
      f.style.transform = "translateY(-10px) scale(0.3)";
      f.style.animation = "none";
    }, i * 100);
  });

  setTimeout(() => {
    createConfetti();
    drawConfetti();
    relightBtn.style.display = "inline-block";

    // 🔹 Play birthday song after flames are blown
    birthdaySong.play().catch(() => {
      console.log("Autoplay blocked. Waiting for user interaction...");
      document.body.addEventListener('click', () => birthdaySong.play(), { once: true });
    });
  }, 1500);
}

// 🎤 Microphone detection
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const mic = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    mic.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    function detectBlow() {
      analyser.getByteFrequencyData(data);
      const volume = data.reduce((a, b) => a + b, 0) / data.length;
      if (volume > 90 && !blownOut) {
        blowOutFlames();
      }
      requestAnimationFrame(detectBlow);
    }

    detectBlow();
  })
  .catch(err => console.log("Microphone access denied:", err));

// 🎂 Relight candles
relightBtn.addEventListener("click", () => {
  flames.forEach(f => {
    f.style.transition = "opacity 0.5s ease-in, transform 0.5s ease-in";
    f.style.opacity = "1";
    f.style.transform = "translateY(0) scale(1)";
    f.style.animation = "flicker 0.2s infinite alternate, glow 1s infinite alternate";
  });
  confetti = [];
  ctx.clearRect(0, 0, width, height);
  confettiActive = false;
  blownOut = false;
  relightBtn.style.display = "none";

  // 🔹 Stop the song when relighting (optional)
  birthdaySong.pause();
  birthdaySong.currentTime = 0;
});

const showGiftsBtn = document.getElementById('showGiftsBtn');
const surpriseSection = document.getElementById('surprise-section');

showGiftsBtn.addEventListener('click', () => {
  surpriseSection.classList.add('visible');
  showGiftsBtn.style.display = 'none'; // hide button after click
});

