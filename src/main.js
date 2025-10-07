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

          float t = iTime * 0.2;
          vec3 color = vec3(0.0);

          // Sci-fi energy flows - more layers for richness
          for(float i = 0.0; i < 12.0; i++) {
            float layer = i / 12.0;

            // Complex wave motion with turbulence
            vec2 wave = vec2(
              sin(p.y * 4.0 + t + i * 0.8) * 0.4,
              cos(p.x * 3.0 + t * 1.2 + i * 0.6) * 0.3
            );

            // Add rotation
            float angle = t * 0.1 + layer * 6.28;
            mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
            vec2 pos = rotation * (p + wave);

            // Turbulent energy flow
            float n = fbm(pos * 2.0 + vec2(t * 0.5, -t * 0.3));
            n += fbm(pos * 4.0 - vec2(t * 0.3, t * 0.6)) * 0.5;
            n += sin(pos.x * 10.0 + t * 2.0) * 0.1;

            // Vibrant sci-fi color palette
            vec3 energyColor;

            if(layer < 0.33) {
              // Cyan to electric blue
              energyColor = mix(
                vec3(0.0, 0.8, 1.0),   // Bright cyan
                vec3(0.2, 0.4, 1.0),   // Electric blue
                layer * 3.0
              );
            } else if(layer < 0.66) {
              // Purple to magenta
              energyColor = mix(
                vec3(0.6, 0.2, 1.0),   // Vivid purple
                vec3(1.0, 0.2, 0.8),   // Hot magenta
                (layer - 0.33) * 3.0
              );
            } else {
              // Orange to pink
              energyColor = mix(
                vec3(1.0, 0.4, 0.2),   // Bright orange
                vec3(1.0, 0.3, 0.6),   // Hot pink
                (layer - 0.66) * 3.0
              );
            }

            // Add pulsing energy
            energyColor *= 1.0 + sin(t * 1.5 + layer * 6.28) * 0.3;

            // Create flowing energy streams
            float stream = smoothstep(0.35, 0.75, n);
            stream *= smoothstep(0.0, 0.25, n);

            // Add sharp highlights for sci-fi feel
            float highlight = smoothstep(0.7, 0.9, n) * 0.5;
            stream += highlight;

            // Vignette effect
            stream *= (1.0 - length(uv * vec2(1.3, 1.0))) * 0.9;

            color += energyColor * stream * 0.12;
          }

          // Add subtle particle field
          vec2 particleUV = p * 6.0;
          float particles = 0.0;
          for(float j = 0.0; j < 5.0; j++) {
            vec2 offset = vec2(sin(j * 2.4 + t * 0.5), cos(j * 1.7 + t * 0.3)) * 3.0;
            vec2 particlePos = particleUV + offset;
            float dist = length(fract(particlePos) - 0.5);
            particles += smoothstep(0.08, 0.0, dist) * 0.2;
          }
          color += vec3(0.5, 0.7, 1.0) * particles * 0.08;

          // Intense central glow
          float glow = 1.0 - length(uv * vec2(0.7, 1.0));
          glow = pow(glow, 2.0) * 0.2;
          color += vec3(0.4, 0.6, 1.0) * glow;

          // Add energy pulses
          float pulse = sin(t * 2.0) * 0.5 + 0.5;
          color += vec3(0.3, 0.5, 0.9) * pulse * 0.05;

          // Enhance contrast and saturation for sci-fi look
          color = pow(color, vec3(0.9));
          color *= 1.3;

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
