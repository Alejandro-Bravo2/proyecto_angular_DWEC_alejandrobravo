import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Configuración de meta tags para una página.
 */
export interface MetaTagsConfig {
  titulo: string;
  descripcion: string;
  urlCanonica?: string;
  imagen?: string;
  tipo?: string;
}

/**
 * Meta tags por defecto para la aplicación.
 */
const META_TAGS_DEFECTO: MetaTagsConfig = {
  titulo: 'COFIRA - Tu entrenamiento, nutrición y progreso',
  descripcion: 'Sistema integral de entrenamiento, nutrición y seguimiento de progreso personalizado.',
  urlCanonica: 'https://cofira.com/',
  imagen: 'https://cofira.com/assets/images/og-image.jpg',
  tipo: 'website'
};

/**
 * Configuración de meta tags por ruta.
 */
const META_TAGS_POR_RUTA: Record<string, Partial<MetaTagsConfig>> = {
  '/': {
    titulo: 'COFIRA - Tu entrenamiento, nutrición y progreso',
    descripcion: 'Sistema integral de entrenamiento, nutrición y seguimiento de progreso personalizado. Alcanza tus objetivos fitness.'
  },
  '/login': {
    titulo: 'Iniciar Sesión - COFIRA',
    descripcion: 'Accede a tu cuenta COFIRA para gestionar tu entrenamiento, nutrición y progreso personalizado.'
  },
  '/register': {
    titulo: 'Crear Cuenta - COFIRA',
    descripcion: 'Únete a COFIRA y comienza tu transformación fitness. Regístrate gratis y empieza hoy.'
  },
  '/entrenamiento': {
    titulo: 'Entrenamiento - COFIRA',
    descripcion: 'Planifica y registra tus entrenamientos. Rutinas personalizadas para alcanzar tus objetivos.'
  },
  '/alimentacion': {
    titulo: 'Alimentación - COFIRA',
    descripcion: 'Controla tu nutrición con planes de alimentación personalizados y seguimiento de macros.'
  },
  '/seguimiento': {
    titulo: 'Seguimiento - COFIRA',
    descripcion: 'Visualiza tu progreso fitness con gráficos detallados y métricas de evolución.'
  },
  '/legal/privacidad': {
    titulo: 'Política de Privacidad - COFIRA',
    descripcion: 'Conoce cómo COFIRA protege y gestiona tus datos personales.'
  },
  '/legal/terminos': {
    titulo: 'Términos y Condiciones - COFIRA',
    descripcion: 'Términos y condiciones de uso de la plataforma COFIRA.'
  },
  '/legal/cookies': {
    titulo: 'Política de Cookies - COFIRA',
    descripcion: 'Información sobre el uso de cookies en COFIRA.'
  }
};

/**
 * Servicio para gestión dinámica de meta tags SEO.
 *
 * @description
 * Actualiza automáticamente los meta tags según la ruta actual:
 * - Title
 * - Description
 * - Open Graph tags
 * - Twitter Card tags
 * - Canonical URL
 *
 * @example
 * ```typescript
 * // En app.component.ts
 * metaTagsService = inject(MetaTagsService);
 *
 * ngOnInit() {
 *   this.metaTagsService.inicializar();
 * }
 *
 * // Actualizar manualmente
 * this.metaTagsService.actualizarMetaTags({
 *   titulo: 'Mi Página',
 *   descripcion: 'Descripción de mi página'
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class MetaTagsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly router = inject(Router);

  /**
   * Inicializa el servicio y escucha cambios de ruta.
   * Debe llamarse una vez en el componente raíz.
   */
  inicializar(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Actualizar meta tags en cada navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const rutaActual = event.urlAfterRedirects;
      this.actualizarPorRuta(rutaActual);
    });

    // Actualizar para la ruta inicial
    const rutaInicial = this.router.url;
    this.actualizarPorRuta(rutaInicial);
  }

  /**
   * Actualiza los meta tags basándose en la ruta actual.
   *
   * @param ruta - La ruta actual de la aplicación
   */
  private actualizarPorRuta(ruta: string): void {
    // Obtener configuración para la ruta o usar valores por defecto
    const rutaBase = this.obtenerRutaBase(ruta);
    const configRuta = META_TAGS_POR_RUTA[rutaBase] || {};

    const configCompleta: MetaTagsConfig = {
      ...META_TAGS_DEFECTO,
      ...configRuta,
      urlCanonica: `https://cofira.com${rutaBase}`
    };

    this.actualizarMetaTags(configCompleta);
  }

  /**
   * Obtiene la ruta base sin parámetros ni fragmentos.
   *
   * @param ruta - Ruta completa
   * @returns Ruta base limpia
   */
  private obtenerRutaBase(ruta: string): string {
    // Quitar parámetros query y fragmentos
    const rutaSinQuery = ruta.split('?')[0];
    const rutaBase = rutaSinQuery.split('#')[0];
    return rutaBase;
  }

  /**
   * Actualiza todos los meta tags con la configuración proporcionada.
   *
   * @param config - Configuración de meta tags
   */
  actualizarMetaTags(config: MetaTagsConfig): void {
    // Title
    this.title.setTitle(config.titulo);

    // Description
    this.meta.updateTag({ name: 'description', content: config.descripcion });

    // Canonical
    if (config.urlCanonica) {
      this.actualizarLinkCanonica(config.urlCanonica);
    }

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: config.titulo });
    this.meta.updateTag({ property: 'og:description', content: config.descripcion });
    this.meta.updateTag({ property: 'og:url', content: config.urlCanonica || META_TAGS_DEFECTO.urlCanonica! });
    this.meta.updateTag({ property: 'og:type', content: config.tipo || 'website' });

    if (config.imagen) {
      this.meta.updateTag({ property: 'og:image', content: config.imagen });
    }

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:title', content: config.titulo });
    this.meta.updateTag({ name: 'twitter:description', content: config.descripcion });
    this.meta.updateTag({ name: 'twitter:url', content: config.urlCanonica || META_TAGS_DEFECTO.urlCanonica! });

    if (config.imagen) {
      this.meta.updateTag({ name: 'twitter:image', content: config.imagen });
    }
  }

  /**
   * Actualiza el link canónico en el head del documento.
   *
   * @param url - URL canónica
   */
  private actualizarLinkCanonica(url: string): void {
    let elementoCanonica = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

    if (elementoCanonica) {
      elementoCanonica.href = url;
    } else {
      elementoCanonica = this.document.createElement('link');
      elementoCanonica.rel = 'canonical';
      elementoCanonica.href = url;
      this.document.head.appendChild(elementoCanonica);
    }
  }
}
