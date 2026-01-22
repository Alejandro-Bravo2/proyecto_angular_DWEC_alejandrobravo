import {
  Component,
  ElementRef,
  OnDestroy,
  NgZone,
  ViewChild,
  AfterViewInit,
  effect,
  input
} from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

/**
 * Tipo para el módulo Three.js cargado dinámicamente
 */
type ThreeModule = typeof import('three');

/**
 * Componente de escena 3D para la sección de nutrición.
 *
 * @description
 * Este componente demuestra el uso correcto de ViewChild con ElementRef:
 * - ViewChild con static: true para acceso antes de ngAfterViewInit
 * - Null checks antes de acceder a nativeElement
 * - Proper cleanup en ngOnDestroy
 * - NgZone.runOutsideAngular para rendimiento de animaciones
 *
 * @example
 * ```html
 * <app-nutrition-scene></app-nutrition-scene>
 * <app-nutrition-scene [compact]="true"></app-nutrition-scene>
 * ```
 */
@Component({
  selector: 'app-nutrition-scene',
  standalone: true,
  imports: [],
  template: `<canvas #canvas class="nutrition-scene__canvas"></canvas>`,
  styleUrls: ['./nutrition-scene.component.scss']
})
export class NutritionSceneComponent implements AfterViewInit, OnDestroy {
  /**
   * Referencia al elemento canvas para renderizado Three.js WebGL.
   * @description Usa static: true para acceso inmediato antes de ngAfterViewInit.
   * El canvas se usa para inicializar WebGLRenderer y manejar eventos de resize.
   */
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly compact = input(false);

  /** Módulo Three.js cargado dinámicamente */
  private THREE!: ThreeModule;
  /** Módulo gsap cargado dinámicamente */
  private gsap: any;

  private renderer: any;
  private scene: any;
  private camera: any;
  private mainGroup: any;
  private appleGroup: any;
  private bowlGroup: any;
  private floatingFruits: any[] = [];
  private particles: any;
  private frameId = 0;
  private mouseX = 0;
  private mouseY = 0;
  private clock: any;
  private isInitialized = false;

  private boundOnWindowResize = this.onWindowResize.bind(this);
  private boundOnMouseMove = this.onMouseMove.bind(this);

  private colors = {
    light: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#666666',
      particles: '#000000',
      fruit: '#1a1a1a'
    },
    dark: {
      primary: '#ffffff',
      secondary: '#cccccc',
      accent: '#999999',
      particles: '#ffffff',
      fruit: '#e5e5e5'
    }
  };

  constructor(
    private ngZone: NgZone,
    private themeService: ThemeService
  ) {
    effect(() => {
      const isDark = this.themeService.currentTheme() === 'dark';
      if (this.isInitialized) {
        this.updateColors(isDark);
      }
    });
  }

  /**
   * Hook AfterViewInit - Inicializa la escena Three.js cuando el canvas está disponible.
   * @description Usa dynamic imports para cargar Three.js y gsap de forma diferida.
   */
  async ngAfterViewInit(): Promise<void> {
    // Null check: Verificar que el canvas esté disponible antes de inicializar
    if (!this.canvasRef?.nativeElement) {
      console.error('NutritionSceneComponent: Canvas element not found');
      return;
    }

    // Cargar módulos de forma diferida (lazy loading)
    const [threeModule, gsapModule] = await Promise.all([
      import('three'),
      import('gsap')
    ]);

    this.THREE = threeModule;
    this.gsap = gsapModule.default;
    this.clock = new this.THREE.Clock();

    this.initThree();
    this.createApple();
    this.createBowl();
    this.createFloatingFruits();
    this.createParticleField();
    this.addEventListeners();
    this.playIntroAnimation();
    this.isInitialized = true;

    // Ejecutar animación fuera de Angular para mejor rendimiento
    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  ngOnDestroy(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    window.removeEventListener('resize', this.boundOnWindowResize);
    window.removeEventListener('mousemove', this.boundOnMouseMove);
    if (this.gsap) {
      this.gsap.killTweensOf(this.mainGroup?.position);
      this.gsap.killTweensOf(this.mainGroup?.rotation);
      this.gsap.killTweensOf(this.mainGroup?.scale);
    }
    this.disposeScene();
  }

  private disposeScene(): void {
    if (!this.THREE) return;

    this.scene?.traverse((child: any) => {
      if (child instanceof this.THREE.Mesh || child instanceof this.THREE.Line || child instanceof this.THREE.Points || child instanceof this.THREE.LineSegments) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => m.dispose());
        } else if (child.material) {
          child.material.dispose();
        }
      }
    });
    this.renderer?.dispose();
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;

    this.renderer = new this.THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new this.THREE.Scene();

    const fov = this.compact() ? 60 : 50;
    this.camera = new this.THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
    this.camera.position.z = this.compact() ? 6 : 8;
    this.camera.position.y = 0.5;

    this.mainGroup = new this.THREE.Group();
    this.scene.add(this.mainGroup);
  }

  private getColors() {
    const isDark = this.themeService.currentTheme() === 'dark';
    return isDark ? this.colors.dark : this.colors.light;
  }

  private createApple(): void {
    const colors = this.getColors();
    this.appleGroup = new this.THREE.Group();

    // Apple body using lathe geometry for organic shape
    const applePoints: any[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const angle = t * Math.PI;
      // Apple profile with indent at top
      let radius = Math.sin(angle) * 0.8;
      if (t < 0.15) {
        radius *= 0.7 + t * 2; // Indent at top
      }
      if (t > 0.85) {
        radius *= 1 - (t - 0.85) * 3; // Taper at bottom
      }
      applePoints.push(new this.THREE.Vector2(radius, (t - 0.5) * 1.2));
    }

    const appleGeometry = new this.THREE.LatheGeometry(applePoints, 16);
    const appleEdges = new this.THREE.EdgesGeometry(appleGeometry, 15);
    const appleMaterial = new this.THREE.LineBasicMaterial({
      color: new this.THREE.Color(colors.primary),
      transparent: true,
      opacity: 1
    });
    const apple = new this.THREE.LineSegments(appleEdges, appleMaterial);
    this.appleGroup.add(apple);

    // Apple stem
    const stemGeometry = new this.THREE.CylinderGeometry(0.03, 0.05, 0.25, 6);
    const stemEdges = new this.THREE.EdgesGeometry(stemGeometry);
    const stemMaterial = new this.THREE.LineBasicMaterial({
      color: new this.THREE.Color(colors.secondary),
      transparent: true,
      opacity: 0.8
    });
    const stem = new this.THREE.LineSegments(stemEdges, stemMaterial);
    stem.position.y = 0.65;
    stem.rotation.z = 0.1;
    this.appleGroup.add(stem);

    // Apple leaf
    const leafShape = new this.THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.15, 0.1, 0.3, 0);
    leafShape.quadraticCurveTo(0.15, -0.05, 0, 0);

    const leafGeometry = new this.THREE.ShapeGeometry(leafShape);
    const leafEdges = new this.THREE.EdgesGeometry(leafGeometry);
    const leafMaterial = new this.THREE.LineBasicMaterial({
      color: new this.THREE.Color(colors.accent),
      transparent: true,
      opacity: 0.7
    });
    const leaf = new this.THREE.LineSegments(leafEdges, leafMaterial);
    leaf.position.set(0.05, 0.7, 0);
    leaf.rotation.z = -0.3;
    leaf.rotation.y = 0.5;
    this.appleGroup.add(leaf);

    this.appleGroup.position.set(-1.5, 0, 0);
    this.appleGroup.scale.set(1.2, 1.2, 1.2);
    this.mainGroup.add(this.appleGroup);
  }

  private createBowl(): void {
    const colors = this.getColors();
    this.bowlGroup = new this.THREE.Group();

    // Bowl using lathe geometry
    const bowlPoints: any[] = [];
    for (let i = 0; i <= 15; i++) {
      const t = i / 15;
      const radius = 0.3 + t * 0.8;
      const y = t * t * 0.6;
      bowlPoints.push(new this.THREE.Vector2(radius, y));
    }

    const bowlGeometry = new this.THREE.LatheGeometry(bowlPoints, 24);
    const bowlEdges = new this.THREE.EdgesGeometry(bowlGeometry, 15);
    const bowlMaterial = new this.THREE.LineBasicMaterial({
      color: new this.THREE.Color(colors.primary),
      transparent: true,
      opacity: 0.9
    });
    const bowl = new this.THREE.LineSegments(bowlEdges, bowlMaterial);
    bowl.position.y = -0.3;
    this.bowlGroup.add(bowl);

    // Bowl rim ring
    const rimGeometry = new this.THREE.TorusGeometry(1.1, 0.03, 8, 32);
    const rimEdges = new this.THREE.EdgesGeometry(rimGeometry);
    const rimMaterial = new this.THREE.LineBasicMaterial({
      color: new this.THREE.Color(colors.secondary),
      transparent: true,
      opacity: 0.7
    });
    const rim = new this.THREE.LineSegments(rimEdges, rimMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.3;
    this.bowlGroup.add(rim);

    // Small fruits inside bowl
    this.createSmallFruit(this.bowlGroup, 0.2, { x: 0.3, y: 0.1, z: 0.2 }, colors);
    this.createSmallFruit(this.bowlGroup, 0.18, { x: -0.2, y: 0.05, z: 0.3 }, colors);
    this.createSmallFruit(this.bowlGroup, 0.22, { x: 0, y: 0.15, z: -0.2 }, colors);

    this.bowlGroup.position.set(1.5, -0.5, 0);
    this.mainGroup.add(this.bowlGroup);
  }

  private createSmallFruit(parent: any, size: number, pos: { x: number; y: number; z: number }, colors: any): void {
    const fruitGeometry = new this.THREE.SphereGeometry(size, 8, 6);
    const fruitEdges = new this.THREE.EdgesGeometry(fruitGeometry);
    const fruitMaterial = new this.THREE.LineBasicMaterial({
      color: new this.THREE.Color(colors.fruit),
      transparent: true,
      opacity: 0.6
    });
    const fruit = new this.THREE.LineSegments(fruitEdges, fruitMaterial);
    fruit.position.set(pos.x, pos.y, pos.z);
    parent.add(fruit);
  }

  private createFloatingFruits(): void {
    const colors = this.getColors();

    // Create various floating fruits
    const fruitConfigs = [
      { type: 'orange', pos: { x: 2.5, y: 1, z: -1 }, size: 0.4 },
      { type: 'lemon', pos: { x: -2.5, y: 0.8, z: -0.5 }, size: 0.35 },
      { type: 'grape', pos: { x: 0, y: 1.5, z: -1.5 }, size: 0.15 },
      { type: 'banana', pos: { x: -0.5, y: -1.2, z: 1 }, size: 0.5 },
      { type: 'orange', pos: { x: 2, y: -0.8, z: 0.5 }, size: 0.3 },
    ];

    fruitConfigs.forEach((config, _index) => {
      const fruitGroup = new this.THREE.Group();

      if (config.type === 'orange' || config.type === 'lemon') {
        // Citrus fruit - sphere with segments
        const segments = config.type === 'lemon' ? 6 : 8;
        const geometry = new this.THREE.SphereGeometry(config.size, segments, segments);
        const edges = new this.THREE.EdgesGeometry(geometry);
        const material = new this.THREE.LineBasicMaterial({
          color: new this.THREE.Color(colors.primary),
          transparent: true,
          opacity: 0.7
        });
        const fruit = new this.THREE.LineSegments(edges, material);

        // If lemon, scale to make it elliptical
        if (config.type === 'lemon') {
          fruit.scale.set(1, 0.7, 0.7);
        }
        fruitGroup.add(fruit);
      } else if (config.type === 'grape') {
        // Grape cluster - multiple small spheres
        for (let i = 0; i < 5; i++) {
          const grapeGeometry = new this.THREE.SphereGeometry(config.size, 6, 4);
          const grapeEdges = new this.THREE.EdgesGeometry(grapeGeometry);
          const grapeMaterial = new this.THREE.LineBasicMaterial({
            color: new this.THREE.Color(colors.secondary),
            transparent: true,
            opacity: 0.6
          });
          const grape = new this.THREE.LineSegments(grapeEdges, grapeMaterial);
          grape.position.set(
            (Math.random() - 0.5) * 0.2,
            i * 0.12 - 0.2,
            (Math.random() - 0.5) * 0.2
          );
          fruitGroup.add(grape);
        }
      } else if (config.type === 'banana') {
        // Banana - curved cylinder
        const curve = new this.THREE.QuadraticBezierCurve3(
          new this.THREE.Vector3(-0.3, 0, 0),
          new this.THREE.Vector3(0, 0.15, 0),
          new this.THREE.Vector3(0.3, 0, 0)
        );
        const bananaGeometry = new this.THREE.TubeGeometry(curve, 12, 0.08, 6, false);
        const bananaEdges = new this.THREE.EdgesGeometry(bananaGeometry);
        const bananaMaterial = new this.THREE.LineBasicMaterial({
          color: new this.THREE.Color(colors.primary),
          transparent: true,
          opacity: 0.7
        });
        const banana = new this.THREE.LineSegments(bananaEdges, bananaMaterial);
        fruitGroup.add(banana);
      }

      fruitGroup.position.set(config.pos.x, config.pos.y, config.pos.z);
      fruitGroup.userData = {
        originalY: config.pos.y,
        floatSpeed: 0.5 + Math.random() * 0.5,
        floatOffset: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      };

      this.floatingFruits.push(fruitGroup);
      this.scene.add(fruitGroup);
    });
  }

  private createParticleField(): void {
    const colors = this.getColors();
    const particleCount = 150;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    const geometry = new this.THREE.BufferGeometry();
    geometry.setAttribute('position', new this.THREE.BufferAttribute(positions, 3));

    const material = new this.THREE.PointsMaterial({
      color: new this.THREE.Color(colors.particles),
      size: 0.03,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true
    });

    this.particles = new this.THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private playIntroAnimation(): void {
    // Apple entrance
    this.gsap.fromTo(this.appleGroup.scale,
      { x: 0, y: 0, z: 0 },
      {
        x: 1.2, y: 1.2, z: 1.2,
        duration: 1.5,
        ease: 'elastic.out(1, 0.5)',
        delay: 0.2
      }
    );

    this.gsap.fromTo(this.appleGroup.rotation,
      { y: -Math.PI },
      {
        y: 0,
        duration: 2,
        ease: 'power3.out',
        delay: 0.2
      }
    );

    // Bowl entrance
    this.gsap.fromTo(this.bowlGroup.scale,
      { x: 0, y: 0, z: 0 },
      {
        x: 1, y: 1, z: 1,
        duration: 1.5,
        ease: 'elastic.out(1, 0.6)',
        delay: 0.4
      }
    );

    this.gsap.fromTo(this.bowlGroup.position,
      { y: -2 },
      {
        y: -0.5,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.4
      }
    );

    // Floating fruits entrance
    this.floatingFruits.forEach((fruit, index) => {
      this.gsap.fromTo(fruit.scale,
        { x: 0, y: 0, z: 0 },
        {
          x: 1, y: 1, z: 1,
          duration: 1,
          ease: 'back.out(2)',
          delay: 0.6 + index * 0.1
        }
      );
    });

    // Particles fade in
    if (this.particles.material instanceof this.THREE.PointsMaterial) {
      this.gsap.fromTo(this.particles.material,
        { opacity: 0 },
        {
          opacity: 0.4,
          duration: 2,
          ease: 'power2.out',
          delay: 1
        }
      );
    }
  }

  private updateColors(isDark: boolean): void {
    const colors = isDark ? this.colors.dark : this.colors.light;
    const duration = 0.5;

    // Update apple
    this.appleGroup?.traverse((child: any) => {
      if (child instanceof this.THREE.LineSegments) {
        const material = child.material as any;
        this.gsap.to(material.color, {
          r: new this.THREE.Color(colors.primary).r,
          g: new this.THREE.Color(colors.primary).g,
          b: new this.THREE.Color(colors.primary).b,
          duration
        });
      }
    });

    // Update bowl
    this.bowlGroup?.traverse((child: any) => {
      if (child instanceof this.THREE.LineSegments) {
        const material = child.material as any;
        this.gsap.to(material.color, {
          r: new this.THREE.Color(colors.primary).r,
          g: new this.THREE.Color(colors.primary).g,
          b: new this.THREE.Color(colors.primary).b,
          duration
        });
      }
    });

    // Update floating fruits
    this.floatingFruits.forEach(fruit => {
      fruit.traverse((child: any) => {
        if (child instanceof this.THREE.LineSegments) {
          const material = child.material as any;
          this.gsap.to(material.color, {
            r: new this.THREE.Color(colors.primary).r,
            g: new this.THREE.Color(colors.primary).g,
            b: new this.THREE.Color(colors.primary).b,
            duration
          });
        }
      });
    });

    // Update particles
    if (this.particles?.material instanceof this.THREE.PointsMaterial) {
      this.gsap.to(this.particles.material.color, {
        r: new this.THREE.Color(colors.particles).r,
        g: new this.THREE.Color(colors.particles).g,
        b: new this.THREE.Color(colors.particles).b,
        duration
      });
    }
  }

  private addEventListeners(): void {
    window.addEventListener('resize', this.boundOnWindowResize);
    window.addEventListener('mousemove', this.boundOnMouseMove);
  }

  private onWindowResize(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private onMouseMove(event: MouseEvent): void {
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = (event.clientY / window.innerHeight) * 2 - 1;
  }

  private animate(): void {
    this.frameId = requestAnimationFrame(() => this.animate());
    const elapsedTime = this.clock.getElapsedTime();

    // Mouse-based rotation
    if (this.mainGroup) {
      const targetRotationY = this.mouseX * 0.2;
      const targetRotationX = this.mouseY * 0.1;

      this.mainGroup.rotation.y += (targetRotationY - this.mainGroup.rotation.y) * 0.03;
      this.mainGroup.rotation.x += (targetRotationX - this.mainGroup.rotation.x) * 0.03;
    }

    // Apple gentle rotation
    if (this.appleGroup) {
      this.appleGroup.rotation.y += 0.003;
      this.appleGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.1;
    }

    // Bowl subtle movement
    if (this.bowlGroup) {
      this.bowlGroup.rotation.y -= 0.002;
    }

    // Floating fruits animation
    this.floatingFruits.forEach((fruit) => {
      const data = fruit.userData;
      fruit.position.y = data['originalY'] + Math.sin(elapsedTime * data['floatSpeed'] + data['floatOffset']) * 0.15;
      fruit.rotation.x += data['rotationSpeed'];
      fruit.rotation.y += data['rotationSpeed'] * 0.5;
    });

    // Particles rotation
    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.02;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
