/**
 * Hero Particles Animation
 * Lightweight particle system for hero section background
 */

class ParticleSystem {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.warn(`Canvas with id "${canvasId}" not found`);
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.connections = [];
    this.mouse = { x: null, y: null, radius: 150 };

    // Configuration
    this.config = {
      particleCount: options.particleCount || 80,
      particleColor: options.particleColor || 'rgba(0, 212, 255, 0.8)',
      connectionColor: options.connectionColor || 'rgba(0, 212, 255, 0.2)',
      particleSize: options.particleSize || 2,
      maxDistance: options.maxDistance || 120,
      speed: options.speed || 0.5,
      interactive: options.interactive !== false
    };

    this.init();
  }

  init() {
    this.setCanvasSize();
    this.createParticles();
    this.setupEventListeners();
    this.animate();
  }

  setCanvasSize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.config.speed,
        vy: (Math.random() - 0.5) * this.config.speed,
        size: Math.random() * this.config.particleSize + 1
      });
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.setCanvasSize();
      this.createParticles();
    });

    if (this.config.interactive) {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      });

      this.canvas.addEventListener('mouseleave', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });
    }
  }

  drawParticle(particle) {
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fillStyle = this.config.particleColor;
    this.ctx.fill();
  }

  updateParticle(particle) {
    // Move particle
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Bounce off edges
    if (particle.x < 0 || particle.x > this.canvas.width) {
      particle.vx *= -1;
    }
    if (particle.y < 0 || particle.y > this.canvas.height) {
      particle.vy *= -1;
    }

    // Mouse interaction
    if (this.mouse.x !== null && this.mouse.y !== null) {
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.mouse.radius) {
        const force = (this.mouse.radius - distance) / this.mouse.radius;
        const angle = Math.atan2(dy, dx);
        particle.vx -= Math.cos(angle) * force * 0.2;
        particle.vy -= Math.sin(angle) * force * 0.2;
      }
    }

    // Limit velocity
    const maxVelocity = this.config.speed * 2;
    particle.vx = Math.max(Math.min(particle.vx, maxVelocity), -maxVelocity);
    particle.vy = Math.max(Math.min(particle.vy, maxVelocity), -maxVelocity);

    // Apply friction
    particle.vx *= 0.99;
    particle.vy *= 0.99;
  }

  connectParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.config.maxDistance) {
          const opacity = 1 - (distance / this.config.maxDistance);
          this.ctx.beginPath();
          this.ctx.strokeStyle = this.config.connectionColor.replace('0.2', opacity * 0.2);
          this.ctx.lineWidth = 1;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(particle => {
      this.updateParticle(particle);
      this.drawParticle(particle);
    });

    this.connectParticles();

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize particles when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const heroParticles = new ParticleSystem('heroParticlesCanvas', {
    particleCount: window.innerWidth < 768 ? 40 : 80,
    particleColor: 'rgba(0, 212, 255, 0.8)',
    connectionColor: 'rgba(0, 212, 255, 0.2)',
    particleSize: 2,
    maxDistance: 120,
    speed: 0.3,
    interactive: true
  });
});

// Smooth scroll for scroll indicator
document.addEventListener('DOMContentLoaded', () => {
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const nextSection = document.querySelector('.hero-modern').nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
});

// Simple 3D rotating shape using CSS transforms
class Simple3DShape {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.rotation = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.init();
  }

  init() {
    this.createShape();
    this.setupMouseInteraction();
    this.animate();
  }

  createShape() {
    const shape = document.createElement('div');
    shape.className = 'shape-3d';
    shape.style.cssText = `
      position: absolute;
      width: 200px;
      height: 200px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      transform-style: preserve-3d;
    `;

    // Create cube faces
    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    const colors = [
      'rgba(0, 212, 255, 0.1)',
      'rgba(176, 38, 255, 0.1)',
      'rgba(0, 212, 255, 0.15)',
      'rgba(176, 38, 255, 0.15)',
      'rgba(0, 212, 255, 0.08)',
      'rgba(176, 38, 255, 0.08)'
    ];

    faces.forEach((face, index) => {
      const faceElement = document.createElement('div');
      faceElement.className = `face face-${face}`;
      faceElement.style.cssText = `
        position: absolute;
        width: 200px;
        height: 200px;
        background: ${colors[index]};
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        box-shadow: inset 0 0 60px rgba(0, 212, 255, 0.1);
      `;

      // Position faces
      switch (face) {
        case 'front':
          faceElement.style.transform = 'translateZ(100px)';
          break;
        case 'back':
          faceElement.style.transform = 'translateZ(-100px) rotateY(180deg)';
          break;
        case 'right':
          faceElement.style.transform = 'rotateY(90deg) translateZ(100px)';
          break;
        case 'left':
          faceElement.style.transform = 'rotateY(-90deg) translateZ(100px)';
          break;
        case 'top':
          faceElement.style.transform = 'rotateX(90deg) translateZ(100px)';
          break;
        case 'bottom':
          faceElement.style.transform = 'rotateX(-90deg) translateZ(100px)';
          break;
      }

      shape.appendChild(faceElement);
    });

    this.container.appendChild(shape);
    this.shape = shape;
  }

  setupMouseInteraction() {
    document.addEventListener('mousemove', (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      this.targetRotation.y = ((e.clientX - centerX) / centerX) * 20;
      this.targetRotation.x = ((e.clientY - centerY) / centerY) * -20;
    });
  }

  animate() {
    // Smooth interpolation
    this.rotation.x += (this.targetRotation.x - this.rotation.x) * 0.05;
    this.rotation.y += (this.targetRotation.y - this.rotation.y) * 0.05;

    // Auto rotation
    this.rotation.y += 0.2;

    if (this.shape) {
      this.shape.style.transform = `
        translate(-50%, -50%)
        rotateX(${this.rotation.x}deg)
        rotateY(${this.rotation.y}deg)
      `;
    }

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize 3D shape
document.addEventListener('DOMContentLoaded', () => {
  const shape3D = new Simple3DShape('hero3DContainer');
});
