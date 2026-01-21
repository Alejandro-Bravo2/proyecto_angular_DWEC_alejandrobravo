import { Component, inject, OnInit, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';
import { LoadingSpinner } from './shared/components/spinner/loading-spinner/loading-spinner';
import { ToastContainer } from './shared/components/toast/toast-container/toast-container/toast-container';
import { Modal } from './shared/components/modal/modal/modal';
import { Breadcrumbs } from './shared/components/breadcrumbs/breadcrumbs/breadcrumbs';
import { MetaTagsService } from './core/services/meta-tags.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, LoadingSpinner, ToastContainer, Modal, Breadcrumbs],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App implements OnInit, AfterViewInit {
  title = 'COFIRA';

  @ViewChild('footerContainer', { read: ViewContainerRef }) footerContainer!: ViewContainerRef;

  private readonly metaTagsService = inject(MetaTagsService);

  ngOnInit(): void {
    // Inicializar servicio de meta tags dinámicos para SEO
    this.metaTagsService.inicializar();
  }

  ngAfterViewInit(): void {
    // Cargar footer después de la vista inicial (prevenir CLS)
    setTimeout(() => {
      this.footerContainer.createComponent(Footer);
    }, 100);
  }
}
