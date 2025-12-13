import { Component, input, signal, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

/**
 * Interfaz para definir una pestaña
 */
export interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

/**
 * Componente de Tabs para organizar contenido en pestañas
 *
 * @example
 * ```typescript
 * tabs = [
 *   { id: 'profile', label: 'Perfil' },
 *   { id: 'settings', label: 'Configuración' }
 * ];
 * activeTab = signal('profile');
 * ```
 *
 * ```html
 * <app-tabs [tabs]="tabs" (tabChanged)="onTabChange($event)">
 *   <app-tab-panel [tabId]="'profile'" [isActive]="activeTab() === 'profile'">
 *     <p>Contenido del perfil</p>
 *   </app-tab-panel>
 *   <app-tab-panel [tabId]="'settings'" [isActive]="activeTab() === 'settings'">
 *     <p>Contenido de configuración</p>
 *   </app-tab-panel>
 * </app-tabs>
 * ```
 */
@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="c-tabs">
      <!-- Tabs Header -->
      <div class="c-tabs__header" role="tablist">
        @for (tab of tabs(); track tab.id) {
          <button
            class="c-tabs__tab"
            [class.c-tabs__tab--active]="activeTabId() === tab.id"
            [class.c-tabs__tab--disabled]="tab.disabled"
            [disabled]="tab.disabled"
            role="tab"
            [attr.aria-selected]="activeTabId() === tab.id"
            [attr.aria-controls]="'panel-' + tab.id"
            [id]="'tab-' + tab.id"
            (click)="selectTab(tab.id)"
            type="button"
          >
            {{ tab.label }}
          </button>
        }

        <!-- Active Tab Indicator -->
        <div
          class="c-tabs__indicator"
          [style.transform]="'translateX(' + indicatorPosition() + 'px)'"
          [style.width]="indicatorWidth() + 'px'"
        ></div>
      </div>

      <!-- Tabs Content -->
      <div class="c-tabs__content" role="tabpanel">
        <ng-content />
      </div>
    </div>
  `,
  styleUrl: './tabs.scss'
})
export class Tabs implements OnInit {
  /**
   * Array de pestañas a mostrar
   */
  tabs = input.required<Tab[]>();

  /**
   * ID de la pestaña activa por defecto
   */
  defaultTab = input<string>('');

  /**
   * ID de la pestaña actualmente activa
   */
  activeTabId = signal<string>('');

  /**
   * Evento emitido cuando cambia la pestaña activa
   */
  tabChanged = output<string>();

  /**
   * Posición del indicador de pestaña activa (en píxeles)
   */
  indicatorPosition = signal(0);

  /**
   * Ancho del indicador de pestaña activa (en píxeles)
   */
  indicatorWidth = signal(0);

  ngOnInit(): void {
    // Establecer la primera pestaña como activa si no se especifica una por defecto
    const tabs = this.tabs();
    const defaultTab = this.defaultTab();

    if (defaultTab && tabs.find(t => t.id === defaultTab)) {
      this.activeTabId.set(defaultTab);
    } else if (tabs.length > 0) {
      this.activeTabId.set(tabs[0].id);
    }

    // Calcular posición del indicador después de un tick
    setTimeout(() => this.updateIndicatorPosition(), 0);
  }

  /**
   * Selecciona una pestaña y emite el evento de cambio
   * @param id - ID de la pestaña a seleccionar
   */
  selectTab(id: string): void {
    const tab = this.tabs().find(t => t.id === id);
    if (tab?.disabled) return;

    this.activeTabId.set(id);
    this.tabChanged.emit(id);
    this.updateIndicatorPosition();
  }

  /**
   * Actualiza la posición y ancho del indicador de pestaña activa
   */
  private updateIndicatorPosition(): void {
    const activeTab = document.querySelector(`#tab-${this.activeTabId()}`) as HTMLElement;
    if (!activeTab) return;

    const tabsHeader = activeTab.parentElement as HTMLElement;
    const headerRect = tabsHeader.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();

    this.indicatorPosition.set(tabRect.left - headerRect.left);
    this.indicatorWidth.set(tabRect.width);
  }
}

/**
 * Componente panel de contenido para una pestaña
 *
 * @example
 * ```html
 * <app-tab-panel [tabId]="'profile'" [isActive]="activeTab === 'profile'">
 *   <p>Contenido del perfil</p>
 * </app-tab-panel>
 * ```
 */
@Component({
  selector: 'app-tab-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isActive()) {
      <div
        class="c-tab-panel"
        [@fadeIn]
        role="tabpanel"
        [attr.aria-labelledby]="'tab-' + tabId()"
        [id]="'panel-' + tabId()"
      >
        <ng-content />
      </div>
    }
  `,
  styleUrl: './tabs.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class TabPanel {
  /**
   * ID de la pestaña asociada a este panel
   */
  tabId = input.required<string>();

  /**
   * Indica si este panel está activo
   */
  isActive = input<boolean>(false);
}
