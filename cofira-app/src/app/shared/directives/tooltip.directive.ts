import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy
} from '@angular/core';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Directiva que muestra un tooltip al hacer hover sobre el elemento
 *
 * @example
 * ```html
 * <button appTooltip="Guardar cambios" tooltipPosition="top">
 *   Guardar
 * </button>
 * ```
 */
@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  /**
   * Texto a mostrar en el tooltip
   */
  tooltipText = input<string>('', { alias: 'appTooltip' });

  /**
   * Posición del tooltip relativa al elemento
   */
  tooltipPosition = input<TooltipPosition>('top', { alias: 'tooltipPosition' });

  private elementRef = inject(ElementRef);
  private tooltipElement: HTMLElement | null = null;
  private readonly OFFSET = 8; // Píxeles de separación del elemento

  /**
   * Muestra el tooltip cuando el mouse entra en el elemento
   */
  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.showTooltip();
  }

  /**
   * Oculta el tooltip cuando el mouse sale del elemento
   */
  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hideTooltip();
  }

  /**
   * Oculta el tooltip cuando el elemento pierde el foco (accesibilidad)
   */
  @HostListener('blur')
  onBlur(): void {
    this.hideTooltip();
  }

  /**
   * Muestra el tooltip cuando el elemento recibe el foco (accesibilidad)
   */
  @HostListener('focus')
  onFocus(): void {
    this.showTooltip();
  }

  /**
   * Crea y muestra el tooltip
   */
  private showTooltip(): void {
    const text = this.tooltipText();
    if (!text || this.tooltipElement) return;

    // Crear elemento del tooltip
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = `c-tooltip c-tooltip--${this.tooltipPosition()}`;
    this.tooltipElement.textContent = text;
    this.tooltipElement.setAttribute('role', 'tooltip');

    // Agregar al DOM
    document.body.appendChild(this.tooltipElement);

    // Posicionar el tooltip
    this.positionTooltip();
  }

  /**
   * Elimina el tooltip del DOM
   */
  private hideTooltip(): void {
    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.tooltipElement = null;
    }
  }

  /**
   * Calcula y aplica la posición del tooltip según la posición configurada
   */
  private positionTooltip(): void {
    if (!this.tooltipElement) return;

    const hostElement = this.elementRef.nativeElement as HTMLElement;
    const hostRect = hostElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const position = this.tooltipPosition();

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = hostRect.top - tooltipRect.height - this.OFFSET;
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
        break;

      case 'bottom':
        top = hostRect.bottom + this.OFFSET;
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
        break;

      case 'left':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.left - tooltipRect.width - this.OFFSET;
        break;

      case 'right':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.right + this.OFFSET;
        break;
    }

    // Ajustar si el tooltip se sale de la pantalla
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) left = this.OFFSET;
    if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width - this.OFFSET;
    }
    if (top < 0) top = this.OFFSET;
    if (top + tooltipRect.height > viewportHeight) {
      top = viewportHeight - tooltipRect.height - this.OFFSET;
    }

    this.tooltipElement.style.top = `${top}px`;
    this.tooltipElement.style.left = `${left}px`;
  }

  /**
   * Limpia el tooltip al destruir la directiva
   */
  ngOnDestroy(): void {
    this.hideTooltip();
  }
}
