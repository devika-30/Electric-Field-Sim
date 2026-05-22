const canvas = document.getElementById("simCanvas");
const ctx = canvas.getContext("2d");

const fieldOnBtn = document.getElementById("fieldOn");
const fieldOffBtn = document.getElementById("fieldOff");
const resetBtn = document.getElementById("resetSim");
const speedRange = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");
const fieldStrength = document.getElementById("fieldStrength");
const fieldStrengthValue = document.getElementById("fieldStrengthValue");
const statusFieldStrength = document.getElementById("statusFieldStrength");
const statusCharge = document.getElementById("statusCharge");
const statusPolarization = document.getElementById("statusPolarization");

let fieldOn = true;
let speed = Number(speedRange.value) / 100;
let fieldStrengthLevel = Number(fieldStrength.value) / 100;
let phase = 0;

const W = canvas.width;
const H = canvas.height;

const conductor = { x: 430, y: 210, r: 250 };
const insulator = { x: 1170, y: 210, r: 250 };

let conductorCharges = [];
let dipoles = [];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function initScene() {
  conductorCharges = [];
  dipoles = [];

  for (let i = 0; i < 14; i++) {
    conductorCharges.push({
      x: rand(conductor.x - conductor.r + 35, conductor.x + conductor.r - 35),
      y: rand(conductor.y + 45, conductor.y + conductor.r * 2 - 40),
      vx: rand(-0.4, 0.4),
      vy: rand(-0.4, 0.4),
      side: i < 7 ? "neg" : "pos"
    });
  }

  for (let i = 0; i < 12; i++) {
    dipoles.push({
      x: rand(insulator.x - insulator.r + 55, insulator.x + insulator.r - 55),
      y: rand(insulator.y + 45, insulator.y + insulator.r * 2 - 55),
      shift: 0,
      angle: rand(0, Math.PI * 2)
    });
  }
}

function setFieldState(state) {
  fieldOn = state;
  fieldOnBtn.classList.toggle("active", state);
  fieldOffBtn.classList.toggle("active", !state);
  statusCharge.textContent = state ? "Active" : "Low";
  statusPolarization.textContent = state ? "Active" : "Low";
}

function drawArrow(x1, y1, x2, y2, color, width = 6) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 16;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

function drawBackground() {
  const g = ctx.createRadialGradient(W * 0.5, H * 0.25, 120, W * 0.5, H * 0.45, 1100);
  g.addColorStop(0, "#14233b");
  g.addColorStop(1, "#08111f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

function drawRod(cx) {
  ctx.fillStyle = "#4b79c7";
  ctx.strokeStyle = "#2f5aa5";
  ctx.lineWidth = 3;

  roundRectPath(ctx, cx - 8, 0, 16, 330, 4);
  ctx.fill();
  ctx.stroke();

  roundRectPath(ctx, cx - 18, 0, 36, 92, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(cx, 298, 22, 0, Math.PI * 2);
  ctx.fill();
}

function pointInsideCircle(px, py, cx, cy, r) {
  return Math.hypot(px - cx, py - cy) <= r - 18;
}

function drawCirclePack(obj, isInsulator) {
  ctx.beginPath();
  ctx.arc(obj.x, obj.y + 170, obj.r, 0, Math.PI * 2);
  ctx.fillStyle = "#d4d1d1";
  ctx.strokeStyle = "#355a99";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  if (!isInsulator && fieldOn) {
    ctx.fillStyle = "#ef1111";
    const pts = [
      [obj.x - 220, obj.y + 75], [obj.x - 270, obj.y + 205], [obj.x - 190, obj.y + 365],
      [obj.x + 190, obj.y + 75], [obj.x + 260, obj.y + 205], [obj.x + 175, obj.y + 365],
      [obj.x - 90, obj.y + 430], [obj.x + 90, obj.y + 430]
    ];
    ctx.font = "74px Arial";
    for (const [px, py] of pts) ctx.fillText("+", px, py);
  }

  if (isInsulator && fieldOn) {
    ctx.fillStyle = "#ef1111";
    ctx.font = "56px Arial";
    ctx.fillText("+", obj.x - 18, obj.y + 207);
    ctx.fillText("+", obj.x + 8, obj.y + 218);
    ctx.fillText("+", obj.x - 34, obj.y + 230);
    ctx.fillText("+", obj.x + 32, obj.y + 234);
  }
}

function updateConductorCharges() {
  const strength = fieldOn ? fieldStrengthLevel : 0;

  for (const p of conductorCharges) {
    const tx = fieldOn
      ? (p.side === "neg" ? conductor.x - conductor.r + 48 : conductor.x + conductor.r - 48)
      : p.x;

    p.x += (tx - p.x) * 0.03 * (0.5 + speed + strength);
    p.vx += (Math.random() - 0.5) * 0.08 * speed;
    p.vy += (Math.random() - 0.5) * 0.08 * speed;

    p.x += p.vx * (0.4 + strength);
    p.y += p.vy * (0.4 + strength);

    p.vx *= 0.92;
    p.vy *= 0.92;

    if (!fieldOn) {
      p.x += Math.sin(phase + p.y * 0.02) * 0.35 * speed;
      p.y += Math.cos(phase + p.x * 0.02) * 0.25 * speed;
    }

    if (p.x < conductor.x - conductor.r + 25) p.x = conductor.x - conductor.r + 25;
    if (p.x > conductor.x + conductor.r - 25) p.x = conductor.x + conductor.r - 25;
    if (p.y < conductor.y + 40) p.y = conductor.y + 40;
    if (p.y > conductor.y + conductor.r * 2 - 25) p.y = conductor.y + conductor.r * 2 - 25;
  }
}

function updateDipoles() {
  for (const d of dipoles) {
    const target = fieldOn ? (16 + 20 * fieldStrengthLevel) : 0;
    d.shift += (target - d.shift) * 0.08;
    d.angle += fieldOn ? 0.01 * speed : -0.004 * speed;
  }
}

function drawConductorElectrons() {
  for (const p of conductorCharges) {
    const y = p.y + 170;
    if (!pointInsideCircle(p.x, y, conductor.x, conductor.y + 170, conductor.r)) continue;

    ctx.beginPath();
    ctx.arc(p.x, y, 11, 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("−", p.x, y + 1);
  }
}

function drawInsulatorDipoles() {
  for (const d of dipoles) {
    const a = d.shift;
    const y = d.y + 170;
    const x1 = d.x - a;
    const x2 = d.x + a;

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#9ca3af";
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();

    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.arc(x1, y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ec4899";
    ctx.beginPath();
    ctx.arc(x2, y, 6, 0, Math.PI * 2);
    ctx.fill();

    drawArrow(x1 - 6, y - 12, x1 - 18, y - 22, "rgba(255,155,68,0.85)", 2);
  }
}

function drawFieldArrows() {
  if (!fieldOn) return;
  ctx.fillStyle = "#5aa7ff";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Applied electric field", 800, 38);
  drawArrow(500, 24, 1100, 24, "#5aa7ff", 5);

  for (let x = 110; x <= 1490; x += 120) {
    drawArrow(x, 900, x + 70, 900, "rgba(90,167,255,0.55)", 4);
  }
}

function drawTopLabel(centerX, title, line1, line2) {
  ctx.fillStyle = "rgba(9, 18, 34, 0.8)";
  ctx.strokeStyle = "rgba(170, 205, 255, 0.25)";
  ctx.lineWidth = 2;
  roundRectPath(ctx, centerX - 250, 68, 500, 92, 14);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#f3f7ff";
  ctx.font = "24px Arial";
  ctx.fillText(title, centerX, 98);

  ctx.fillStyle = "#dbe7ff";
  ctx.font = "18px Arial";
  ctx.fillText(line1, centerX, 126);
  if (line2) ctx.fillText(line2, centerX, 150);
}

function drawBottomLabel(centerX, text) {
  ctx.fillStyle = "#dbe7ff";
  ctx.font = "18px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, centerX, 900);
}

function drawMetrics() {
  const separation = fieldOn ? Math.round(20 + 60 * fieldStrengthLevel) : 0;
  const polarization = fieldOn ? Math.round(20 + 80 * fieldStrengthLevel) : 0;

  ctx.fillStyle = "rgba(9, 18, 34, 0.8)";
  ctx.strokeStyle = "rgba(170, 205, 255, 0.25)";
  ctx.lineWidth = 2;
  roundRectPath(ctx, 620, 760, 360, 90, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f3f7ff";
  ctx.font = "18px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Field Strength: ${Math.round(fieldStrengthLevel * 100)}`, 650, 790);
  ctx.fillText(`Electron Displacement: ${separation}`, 650, 816);
  ctx.fillText(`Polarization Magnitude: ${polarization}`, 650, 842);
}

function drawScene() {
  drawBackground();
  drawFieldArrows();

  drawTopLabel(430, "Conductor", "Electrons move freely.", "Charge redistributes to the surface.");
  drawTopLabel(1170, "Insulator", "Insulators only polarize.", "No free charge flow.");

  drawRod(conductor.x);
  drawRod(insulator.x);

  drawCirclePack(conductor, false);
  drawCirclePack(insulator, true);

  drawConductorElectrons();
  drawInsulatorDipoles();

  drawBottomLabel(430, "Green electrons shift and collect on the conductor surface");
  drawBottomLabel(1170, "Insulator only polarizes internally; no free charge flow");

  drawMetrics();

  ctx.fillStyle = "#b7c5df";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(fieldOn ? "Electric field ON" : "Electric field OFF", 800, 940);
}

function animate() {
  phase += 0.05;
  updateConductorCharges();
  updateDipoles();
  drawScene();
  requestAnimationFrame(animate);
}

fieldOnBtn.addEventListener("click", () => setFieldState(true));
fieldOffBtn.addEventListener("click", () => setFieldState(false));

resetBtn.addEventListener("click", () => {
  setFieldState(true);
  speedRange.value = 60;
  fieldStrength.value = 60;
  speed = 0.6;
  fieldStrengthLevel = 0.6;
  speedValue.textContent = "60";
  fieldStrengthValue.textContent = "60";
  statusFieldStrength.textContent = "60";
  initScene();
});

speedRange.addEventListener("input", (e) => {
  speed = Number(e.target.value) / 100;
  speedValue.textContent = e.target.value;
});

fieldStrength.addEventListener("input", (e) => {
  fieldStrengthLevel = Number(e.target.value) / 100;
  fieldStrengthValue.textContent = e.target.value;
  statusFieldStrength.textContent = e.target.value;
});

initScene();
setFieldState(true);
animate();