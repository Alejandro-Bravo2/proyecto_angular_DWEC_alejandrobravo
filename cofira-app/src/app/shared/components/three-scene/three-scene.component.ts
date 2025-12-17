import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  NgZone,
  ViewChild,
  AfterViewInit,
  Input,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-three-scene',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #canvas class="three-scene__canvas"></canvas>`,
  styleUrls: ['./three-scene.component.scss']
})
export class ThreeSceneComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() wireframeColorLight: string = '#0a0a0a';
  @Input() wireframeColorDark: string = '#ffffff';
  @Input() backgroundColor: string = 'transparent';
  @Input() rotationSpeed: number = 0.001;
  @Input() mouseInfluence: number = 0.0005;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private icosahedron!: THREE.Mesh;
  private innerIcosahedron!: THREE.Mesh;
  private frameId: number = 0;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetRotationX: number = 0;
  private targetRotationY: number = 0;

  constructor(
    private ngZone: NgZone,
    private themeService: ThemeService
  ) {
    // Efecto reactivo para cambios de tema
    effect(() => {
      const isDark = this.themeService.currentTheme() === 'dark';
      this.updateWireframeColor(isDark);
    });
  }

  ngOnInit(): void {
    // Inicialización básica
  }

  ngAfterViewInit(): void {
    this.initThree();
    this.createGeometry();
    this.addEventListeners();

    // Ejecutar animación fuera de Angular zone para mejor performance
    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  ngOnDestroy(): void {
    // Limpiar recursos
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }

    // Remover event listeners
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    window.removeEventListener('mousemove', this.onMouseMove.bind(this));

    // Dispose de Three.js
    if (this.innerIcosahedron) {
      this.innerIcosahedron.geometry.dispose();
      (this.innerIcosahedron.material as THREE.Material).dispose();
    }

    if (this.icosahedron) {
      this.icosahedron.geometry.dispose();
      (this.icosahedron.material as THREE.Material).dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;

    // Renderer con transparencia
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.z = 5;
  }

  private createGeometry(): void {
    const isDark = this.themeService.currentTheme() === 'dark';
    const wireframeColor = isDark ? this.wireframeColorDark : this.wireframeColorLight;

    // Icosaedro wireframe - forma geométrica elegante
    const geometry = new THREE.IcosahedronGeometry(1.5, 1);

    // Material wireframe minimalista
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(wireframeColor),
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });

    this.icosahedron = new THREE.Mesh(geometry, material);
    this.scene.add(this.icosahedron);

    // Añadir un segundo icosaedro más pequeño para profundidad
    const geometry2 = new THREE.IcosahedronGeometry(0.8, 1);
    const material2 = new THREE.MeshBasicMaterial({
      color: new THREE.Color(wireframeColor),
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    this.innerIcosahedron = new THREE.Mesh(geometry2, material2);
    this.icosahedron.add(this.innerIcosahedron);
  }

  private updateWireframeColor(isDark: boolean): void {
    if (!this.icosahedron || !this.innerIcosahedron) return;

    const newColor = isDark ? this.wireframeColorDark : this.wireframeColorLight;

    // Actualizar color del icosaedro principal
    const mainMaterial = this.icosahedron.material as THREE.MeshBasicMaterial;
    mainMaterial.color.set(newColor);

    // Actualizar color del icosaedro interior
    const innerMaterial = this.innerIcosahedron.material as THREE.MeshBasicMaterial;
    innerMaterial.color.set(newColor);
  }

  private addEventListeners(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
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
    // Normalizar posición del mouse (-1 a 1)
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = (event.clientY / window.innerHeight) * 2 - 1;
  }

  private animate(): void {
    this.frameId = requestAnimationFrame(() => this.animate());

    // Rotación base continua (muy sutil)
    this.icosahedron.rotation.x += this.rotationSpeed;
    this.icosahedron.rotation.y += this.rotationSpeed * 0.8;

    // Rotación basada en mouse (suave interpolación)
    this.targetRotationX += (this.mouseY * this.mouseInfluence - this.targetRotationX) * 0.05;
    this.targetRotationY += (this.mouseX * this.mouseInfluence - this.targetRotationY) * 0.05;

    this.icosahedron.rotation.x += this.targetRotationX;
    this.icosahedron.rotation.y += this.targetRotationY;

    this.renderer.render(this.scene, this.camera);
  }
}
