const NIKAH_DATE = new Date("2026-11-20T17:00:00+05:30");
const WEDDING_TIME_ZONE = "Asia/Kolkata";

const entryScreen = document.querySelector("#entry-screen");
const site = document.querySelector("#site");
const openButton = document.querySelector("#open-invitation");

openButton.addEventListener("click", () => {
  document.body.classList.remove("is-locked");
  site.inert = false;
  site.setAttribute("aria-hidden", "false");
  entryScreen.classList.add("is-opening");
  openButton.disabled = true;
  window.setTimeout(() => {
    entryScreen.classList.add("is-gone");
    document.querySelector("#hero-title").setAttribute("tabindex", "-1");
    document.querySelector("#hero-title").focus({ preventScroll: true });
  }, 1200);
});

function formatWeddingDate(date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: WEDDING_TIME_ZONE,
  }).format(date);
}

function updateWeddingDetails() {
  document.querySelector("#date-label").textContent = `Nikah · ${formatWeddingDate(NIKAH_DATE)}`;
  const countdownNote = document.querySelector("#countdown-note");
  const units = {
    days: document.querySelector('[data-unit="days"]'),
    hours: document.querySelector('[data-unit="hours"]'),
    minutes: document.querySelector('[data-unit="minutes"]'),
    seconds: document.querySelector('[data-unit="seconds"]'),
  };

  function tick() {
    const remaining = NIKAH_DATE.getTime() - Date.now();
    if (remaining <= 0) {
      countdownNote.textContent = `The Nikah was scheduled for ${formatWeddingDate(NIKAH_DATE)}.`;
      Object.values(units).forEach((unit) => { unit.textContent = "00"; });
      return;
    }

    const seconds = Math.floor(remaining / 1000);
    units.days.textContent = String(Math.floor(seconds / 86400)).padStart(2, "0");
    units.hours.textContent = String(Math.floor((seconds % 86400) / 3600)).padStart(2, "0");
    units.minutes.textContent = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    units.seconds.textContent = String(seconds % 60).padStart(2, "0");
    countdownNote.textContent = "Every day brings us a little closer.";
  }

  tick();
  window.setInterval(tick, 1000);
}

function setupFlowerShower() {
  const shower = document.querySelector("#flower-shower");
  const bloomCount = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 12 : 30;

  for (let index = 0; index < bloomCount; index += 1) {
    const bloom = document.createElement("span");
    bloom.className = "flower-shower__bloom";
    bloom.style.setProperty("--x", `${(index * 37 + 11) % 100}%`);
    bloom.style.setProperty("--size", `${21 + (index * 17) % 20}px`);
    bloom.style.setProperty("--duration", `${11 + (index * 7) % 9}s`);
    bloom.style.setProperty("--delay", `-${(index * 5) % 19}s`);
    bloom.style.setProperty("--drift", `${((index * 23) % 150) - 75}px`);
    bloom.style.setProperty("--spin", `${180 + (index * 47) % 360}deg`);
    bloom.style.setProperty("--rest", `${(index * 29) % 82}%`);

    for (let petalIndex = 0; petalIndex < 6; petalIndex += 1) {
      const petal = document.createElement("span");
      petal.className = "flower-shower__petal";
      petal.style.setProperty("--angle", `${petalIndex * 60}deg`);
      bloom.append(petal);
    }

    const center = document.createElement("span");
    center.className = "flower-shower__center";
    bloom.append(center);
    shower.append(bloom);
  }
}

function setupScratchCard() {
  const button = document.querySelector("#scratch-cover");
  const canvas = document.querySelector("#scratch-canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  let isScratching = false;
  let isRevealed = false;

  function drawCover() {
    const bounds = button.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(bounds.width * scale);
    canvas.height = Math.round(bounds.height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);

    const fill = context.createLinearGradient(0, 0, bounds.width, bounds.height);
    fill.addColorStop(0, "#ddc896");
    fill.addColorStop(0.5, "#efe2c3");
    fill.addColorStop(1, "#d4b77c");
    context.fillStyle = fill;
    context.fillRect(0, 0, bounds.width, bounds.height);

    context.fillStyle = "rgba(108, 80, 42, 0.13)";
    for (let x = 16; x < bounds.width; x += 24) {
      for (let y = 16; y < bounds.height; y += 24) {
        context.beginPath();
        context.arc(x, y, 1, 0, Math.PI * 2);
        context.fill();
      }
    }
  }

  function scratchAt(event) {
    if (!isScratching || isRevealed) return;
    const bounds = canvas.getBoundingClientRect();
    context.globalCompositeOperation = "destination-out";
    context.fillStyle = "#000";
    context.beginPath();
    context.arc(event.clientX - bounds.left, event.clientY - bounds.top, 22, 0, Math.PI * 2);
    context.fill();
    context.globalCompositeOperation = "source-over";

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let clearPixels = 0;
    let totalPixels = 0;
    for (let pixel = 3; pixel < pixels.length; pixel += 48) {
      totalPixels += 1;
      if (pixels[pixel] < 32) clearPixels += 1;
    }
    if (clearPixels / totalPixels > 0.4) revealMessage();
  }

  function revealMessage() {
    if (isRevealed) return;
    isRevealed = true;
    button.classList.add("is-revealed");
    document.querySelector("#scratch-message").setAttribute("aria-label", "Invitation revealed: May Allah fill this new chapter with love, laughter and countless blessings. We can’t wait to celebrate together.");
  }

  button.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    isScratching = true;
    button.setPointerCapture(event.pointerId);
    scratchAt(event);
  });
  button.addEventListener("pointermove", scratchAt);
  button.addEventListener("pointerup", () => { isScratching = false; });
  button.addEventListener("pointercancel", () => { isScratching = false; });
  button.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      revealMessage();
    }
  });
  drawCover();
  new ResizeObserver(drawCover).observe(button);
}

updateWeddingDetails();
setupFlowerShower();
setupScratchCard();