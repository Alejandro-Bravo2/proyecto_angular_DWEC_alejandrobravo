import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

/**
 * Componente contenedor de Accordion
 *
 * @example
 * ```html
 * <app-accordion>
 *   <app-accordion-item title="Título 1">Contenido 1</app-accordion-item>
 *   <app-accordion-item title="Título 2">Contenido 2</app-accordion-item>
 * </app-accordion>
 * ```
 */
@Component({
  selector: 'app-accordion',
  standalone: true,
  templateUrl: './accordion.html',
  styleUrl: './accordion.scss'
})
export class Accordion {}

/**
 * Componente item de Accordion con animaciones
 *
 * @example
 * ```html
 * <app-accordion-item title="¿Qué es COFIRA?">
 *   <p>COFIRA es una aplicación de fitness...</p>
 * </app-accordion-item>
 * ```
 */
@Component({
  selector: 'app-accordion-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion-item.html',
  styleUrl: './accordion.scss',
  animations: [
    trigger('slideDown', [
      state('closed', style({
        height: '0',
        opacity: '0',
        overflow: 'hidden'
      })),
      state('open', style({
        height: '*',
        opacity: '1',
        overflow: 'hidden'
      })),
      transition('closed <=> open', [
        animate('300ms ease-out')
      ])
    ])
  ]
})
export class AccordionItem {
  /**
   * Título del item del accordion
   */
  title = input.required<string>();

  /**
   * Estado de apertura/cierre del accordion
   */
  isOpen = signal(false);

  /**
   * ID único para accesibilidad
   */
  itemId = `accordion-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Alterna el estado de apertura/cierre
   */
  toggle(): void {
    this.isOpen.update(v => !v);
  }

  /**
   * Abre el accordion
   */
  open(): void {
    this.isOpen.set(true);
  }

  /**
   * Cierra el accordion
   */
  close(): void {
    this.isOpen.set(false);
  }
}
