import { ProjectFile, SupportedLanguage } from '../types';

export function getLanguageFromFilename(filename: string): SupportedLanguage {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'js':
    case 'mjs':
    case 'cjs':
      return 'javascript';
    case 'ts':
    case 'tsx':
    case 'jsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'json':
      return 'json';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'sql':
      return 'sql';
    default:
      return 'text';
  }
}

export const STARTER_PROJECTS: Record<string, { name: string; description: string; files: ProjectFile[] }> = {
  nebula: {
    name: 'Cosmic Nebula (Interactive 3D Canvas)',
    description: 'High-performance interactive particle canvas with gravitational physics and neon vortex controls.',
    files: [
      {
        id: 'file-1',
        name: 'index.html',
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cosmic Nebula - Interactive Physics</title>
  <link rel="stylesheet" href="styles.css">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="hud-overlay">
    <header class="hud-header">
      <div class="logo">
        <span class="neon-dot"></span>
        <h1>Cosmic Nebula Engine</h1>
      </div>
      <div class="metrics">
        <span id="fps-counter">60 FPS</span>
        <span id="particle-counter">250 Particles</span>
      </div>
    </header>

    <div class="controls-card">
      <div class="control-group">
        <label for="speed-slider">Gravitational Drift</label>
        <input type="range" id="speed-slider" min="1" max="10" value="4">
      </div>
      <div class="control-group">
        <label for="color-picker">Vortex Palette</label>
        <select id="color-picker">
          <option value="cyber">Cyber Cyan & Violet</option>
          <option value="solar">Solar Flare Orange</option>
          <option value="emerald">Quantum Emerald</option>
        </select>
      </div>
      <button id="burst-btn" class="btn-primary">⚡ Quantum Burst (Click or Press Space)</button>
    </div>

    <footer class="hud-footer">
      <p>💡 Move your cursor across the canvas to bend spacetime gravity.</p>
    </footer>
  </div>

  <canvas id="nebula-canvas"></canvas>
  <script src="script.js"></script>
</body>
</html>`,
      },
      {
        id: 'file-2',
        name: 'styles.css',
        path: 'styles.css',
        language: 'css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #05070f;
  color: #e2e8f0;
  font-family: 'Space Grotesk', -apple-system, sans-serif;
  overflow: hidden;
  height: 100vh;
  width: 100vw;
}

#nebula-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 1;
}

.hud-overlay {
  position: relative;
  z-index: 10;
  pointer-events: none;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem;
}

.hud-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h1 {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.neon-dot {
  width: 8px;
  height: 8px;
  background: #38bdf8;
  border-radius: 50%;
  box-shadow: 0 0 10px #38bdf8;
  animation: pulse 2s infinite ease-in-out;
}

.metrics {
  display: flex;
  gap: 0.75rem;
  font-size: 0.8rem;
  font-family: monospace;
}

.metrics span {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.controls-card {
  pointer-events: auto;
  align-self: flex-start;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 280px;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.control-group label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

input[type="range"] {
  accent-color: #6366f1;
  cursor: pointer;
}

select {
  background: #1e293b;
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #3b82f6);
  color: white;
  border: none;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.hud-footer {
  font-size: 0.8rem;
  color: #64748b;
  text-align: center;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}`,
      },
      {
        id: 'file-3',
        name: 'script.js',
        path: 'script.js',
        language: 'javascript',
        content: `// Cosmic Nebula Physics Engine
console.log('🌌 Initializing Cosmic Nebula Engine...');

const canvas = document.getElementById('nebula-canvas');
const ctx = canvas.getContext('2d');
const fpsCounter = document.getElementById('fps-counter');
const particleCounter = document.getElementById('particle-counter');
const speedSlider = document.getElementById('speed-slider');
const colorPicker = document.getElementById('color-picker');
const burstBtn = document.getElementById('burst-btn');

let width, height;
let particles = [];
const PARTICLE_COUNT = 220;
let mouse = { x: null, y: null, radius: 140, isDown: false };
let frameCount = 0;
let lastTime = performance.now();

const PALETTES = {
  cyber: ['#38bdf8', '#818cf8', '#c084fc', '#e879f9'],
  solar: ['#f97316', '#fbbf24', '#f43f5e', '#ffedd5'],
  emerald: ['#10b981', '#34d399', '#6ee7b7', '#065f46']
};

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  console.log(\`[Display] Viewport resized: \${width}x\${height}\`);
}

window.addEventListener('resize', resize);
resize();

class Particle {
  constructor(x, y, isBurst = false) {
    this.x = x ?? Math.random() * width;
    this.y = y ?? Math.random() * height;
    this.size = Math.random() * 2.5 + 1.2;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = (Math.random() * 20) + 5;
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = isBurst ? Math.random() * 7 + 3 : Math.random() * 1.5 + 0.5;
    this.vx = Math.cos(angle) * velocity;
    this.vy = Math.sin(angle) * velocity;
    this.colorIdx = Math.floor(Math.random() * 4);
    this.life = isBurst ? 100 : Infinity;
  }

  draw() {
    const palette = PALETTES[colorPicker.value] || PALETTES.cyber;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = palette[this.colorIdx];
    ctx.shadowBlur = 12;
    ctx.shadowColor = palette[this.colorIdx];
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  update() {
    const speedMult = parseFloat(speedSlider.value) * 0.35;
    this.x += this.vx * speedMult;
    this.y += this.vy * speedMult;

    // Boundary wrap
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;

    // Mouse gravity interaction
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius) {
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const maxDistance = mouse.radius;
        const force = (maxDistance - distance) / maxDistance;
        const direction = mouse.isDown ? 1.5 : -1;

        this.x += forceDirectionX * force * this.density * 0.4 * direction;
        this.y += forceDirectionY * force * this.density * 0.4 * direction;
      }
    }
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }
  particleCounter.innerText = \`\${particles.length} Particles\`;
  console.log(\`[Engine] Spawned \${particles.length} gravity-bound particles.\`);
}

function connectParticles() {
  const palette = PALETTES[colorPicker.value] || PALETTES.cyber;
  const maxDist = 95;
  
  for (let a = 0; a < particles.length; a++) {
    for (let b = a + 1; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < maxDist) {
        const opacity = 1 - (distance / maxDist);
        ctx.strokeStyle = palette[0];
        ctx.globalAlpha = opacity * 0.22;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }
}

function triggerQuantumBurst() {
  const centerX = mouse.x || width / 2;
  const centerY = mouse.y || height / 2;
  console.info(\`⚡ Quantum burst fired at (\${Math.round(centerX)}, \${Math.round(centerY)})\`);

  for (let i = 0; i < 40; i++) {
    particles.push(new Particle(centerX, centerY, true));
  }

  // Keep particle count reasonable
  if (particles.length > 320) {
    particles.splice(0, particles.length - 320);
  }
  particleCounter.innerText = \`\${particles.length} Particles\`;
}

// Event Listeners
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

window.addEventListener('mousedown', () => { mouse.isDown = true; });
window.addEventListener('mouseup', () => { mouse.isDown = false; });
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    triggerQuantumBurst();
  }
});
burstBtn.addEventListener('click', triggerQuantumBurst);

// Render Loop
function animate(currentTime) {
  requestAnimationFrame(animate);

  // FPS calculation
  frameCount++;
  if (currentTime - lastTime >= 1000) {
    fpsCounter.innerText = \`\${frameCount} FPS\`;
    frameCount = 0;
    lastTime = currentTime;
  }

  // Semi-transparent clear for smooth light trail
  ctx.fillStyle = 'rgba(5, 7, 15, 0.25)';
  ctx.fillRect(0, 0, width, height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  connectParticles();
}

initParticles();
animate(performance.now());
console.log('✅ Nebula Engine Running. Move mouse to bend spacetime!');
`,
      },
      {
        id: 'file-4',
        name: 'README.md',
        path: 'README.md',
        language: 'markdown',
        content: `# Cosmic Nebula Engine 🌌

An interactive WebGL-like 2D physics and particle vortex simulation built in pure vanilla HTML5, CSS3, and JavaScript.

## Features
- **Spacetime Curvature**: Move your mouse to warp particles. Hold mouse down to collapse them inward.
- **Quantum Burst**: Click the burst button or press [Spacebar] to spawn high-velocity particles.
- **Dynamic Palettes**: Switch on-the-fly between Cyber Cyan, Solar Flare, and Quantum Emerald.
- **60 FPS Physics**: Lightweight $\\mathcal{O}(n)$ nearest-neighbor link renderer.

## OmniCode Studio AI Integrations
- Try highlighting the \`Particle\` class in \`script.js\` and ask **Gemini** to add gravitational black holes!
- Ask **ChatGPT / Codex** to convert the particle math to Python Pygame or Rust WebAssembly.
- Ask **Cloud AI** to perform a memory leak and performance benchmark.
`,
      },
    ],
  },
  saas: {
    name: 'Tailwind SaaS Landing & Pricing App',
    description: 'Modern developer tools landing page with live interactive pricing calculator and responsive FAQ accordion.',
    files: [
      {
        id: 'file-saas-1',
        name: 'index.html',
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HyperScale - Next-Gen Cloud Platform</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="style.css">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: { 500: '#6366f1', 600: '#4f46e5' }
          }
        }
      }
    }
  </script>
</head>
<body class="bg-[#0b0f17] text-slate-100 min-h-screen">
  <nav class="border-b border-slate-800 bg-[#0b0f17]/80 backdrop-blur sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">H</div>
        <span class="font-bold tracking-tight text-lg text-white">HyperScale</span>
      </div>
      <div class="flex items-center gap-4">
        <a href="#pricing" class="text-sm text-slate-400 hover:text-white transition">Pricing</a>
        <button class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-indigo-600/30">Deploy App</button>
      </div>
    </div>
  </nav>

  <main class="max-w-5xl mx-auto px-6 py-20 text-center">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-8">
      <span>🚀 Version 3.4 Live</span>
      <span class="text-slate-500">•</span>
      <span>12x Faster Cold Starts</span>
    </div>
    <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
      Ship Global Microservices <br/>
      <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">At Microsecond Latency</span>
    </h1>
    <p class="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg mb-10">
      Zero config edge compute with automated geographic routing, instant rollbacks, and real-time observability.
    </p>

    <!-- Pricing Calculator Section -->
    <div id="pricing" class="mt-16 text-left max-w-3xl mx-auto p-8 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 class="text-xl font-bold">Predictable Edge Pricing</h2>
          <p class="text-sm text-slate-400">Scale on-demand with zero cold-start fees.</p>
        </div>
        <div class="text-right">
          <span class="text-3xl font-extrabold text-indigo-400" id="price-display">$29</span>
          <span class="text-slate-400 text-sm">/ month</span>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <div class="flex justify-between text-xs text-slate-300 font-mono mb-2">
            <span>Monthly Requests</span>
            <span id="requests-display">2,500,000 requests</span>
          </div>
          <input type="range" id="traffic-slider" min="1" max="10" value="3" class="w-full accent-indigo-500 cursor-pointer">
        </div>
        <div class="grid grid-cols-2 gap-3 pt-4 text-xs text-slate-400 border-t border-slate-800">
          <div>✅ 99.99% Global SLA</div>
          <div>✅ Distributed DDoS Shield</div>
          <div>✅ Unlimited Edge Functions</div>
          <div>✅ Dedicated Support</div>
        </div>
      </div>
    </div>
  </main>

  <script src="main.js"></script>
</body>
</html>`,
      },
      {
        id: 'file-saas-2',
        name: 'style.css',
        path: 'style.css',
        language: 'css',
        content: `/* Custom landing page enhancements */
body {
  background-image: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15), transparent 45%);
}
`,
      },
      {
        id: 'file-saas-3',
        name: 'main.js',
        path: 'main.js',
        language: 'javascript',
        content: `// Interactive Pricing Calculator
console.log('⚡ Initializing HyperScale Landing Engine...');

const trafficSlider = document.getElementById('traffic-slider');
const priceDisplay = document.getElementById('price-display');
const requestsDisplay = document.getElementById('requests-display');

const TIERS = [
  { requests: '500,000', price: 9 },
  { requests: '1,000,000', price: 19 },
  { requests: '2,500,000', price: 29 },
  { requests: '5,000,000', price: 49 },
  { requests: '10,000,000', price: 89 },
  { requests: '25,000,000', price: 149 },
  { requests: '50,000,000', price: 249 },
  { requests: '100,000,000', price: 449 },
  { requests: '250,000,000', price: 899 },
  { requests: 'Enterprise Unlimited', price: 1499 },
];

function updatePricing() {
  const index = parseInt(trafficSlider.value, 10) - 1;
  const tier = TIERS[index];
  if (tier) {
    priceDisplay.textContent = \`$\${tier.price}\`;
    requestsDisplay.textContent = \`\${tier.requests} requests\`;
    console.info(\`[Pricing] Tier updated to \${tier.requests} reqs (\$\${tier.price}/mo)\`);
  }
}

trafficSlider.addEventListener('input', updatePricing);
updatePricing();
`,
      },
    ],
  },
};
