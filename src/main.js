import './css/style.css'
import * as THREE from 'three'

// ===================================
// Aurora Background with Three.js
// ===================================
class AuroraBackground {
  constructor(container) {
    this.container = container
    this.init()
    this.animate()

    window.addEventListener('resize', () => this.onResize())
  }

  init() {
    // Scene
    this.scene = new THREE.Scene()

    // Camera
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: false })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.container.appendChild(this.renderer.domElement)

    // Shader material for aurora effect
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;

        #define NUM_OCTAVES 5

        float rand(vec2 n) {
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 u = fract(p);
          u = u * u * (3.0 - 2.0 * u);
          float res = mix(
            mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
            mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
            u.y
          );
          return res * res;
        }

        float fbm(vec2 x) {
          float v = 0.0;
          float a = 0.5;
          vec2 shift = vec2(100);
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
          for (int i = 0; i < NUM_OCTAVES; ++i) {
            v += a * noise(x);
            x = rot * x * 2.0 + shift;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
          vec2 p = uv * 2.0;

          float t = iTime * 0.15;
          vec3 color = vec3(0.0);

          // Multiple layers of flowing aurora
          for(float i = 0.0; i < 8.0; i++) {
            float layer = i / 8.0;

            // Wave motion
            vec2 wave = vec2(
              sin(p.y * 3.0 + t + i * 0.5) * 0.3,
              cos(p.x * 2.0 + t * 0.8 + i * 0.3) * 0.2
            );

            vec2 pos = p + wave;

            // Flowing noise
            float n = fbm(pos * 1.5 + vec2(t * 0.3, -t * 0.2));
            n += fbm(pos * 3.0 - vec2(t * 0.2, t * 0.4)) * 0.5;

            // Elegant color palette - purple, blue, pink gradient
            vec3 auroraColor = mix(
              vec3(0.4, 0.2, 0.8),  // Deep purple
              vec3(0.8, 0.3, 0.6),  // Rose pink
              layer
            );

            auroraColor = mix(
              auroraColor,
              vec3(0.2, 0.5, 0.9),  // Soft blue
              sin(layer * 3.14159 + t) * 0.5 + 0.5
            );

            // Create flowing bands
            float band = smoothstep(0.3, 0.7, n);
            band *= smoothstep(0.0, 0.2, n);
            band *= (1.0 - length(uv * vec2(1.5, 1.0))) * 0.8;

            color += auroraColor * band * 0.15;
          }

          // Add subtle glow
          float glow = 1.0 - length(uv * vec2(0.8, 1.2));
          glow = pow(glow, 3.0) * 0.1;
          color += vec3(0.3, 0.4, 0.8) * glow;

          // Soft gamma correction
          color = pow(color, vec3(1.2));

          gl_FragColor = vec4(color, 1.0);
        }
      `
    })

    // Geometry
    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, this.material)
    this.scene.add(mesh)
  }

  animate() {
    requestAnimationFrame(() => this.animate())

    // Update time uniform
    this.material.uniforms.iTime.value += 0.016

    // Render
    this.renderer.render(this.scene, this.camera)
  }

  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight)
  }
}

// ===================================
// Smooth Scroll
// ===================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute('href'))
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    })
  })
}

// ===================================
// Initialize
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Aurora Background
  const auroraContainer = document.getElementById('aurora-background')
  if (auroraContainer) {
    new AuroraBackground(auroraContainer)
  }

  // Initialize smooth scrolling
  initSmoothScroll()

  console.log('✨ Aurora Minimal Portfolio initialized')
})
