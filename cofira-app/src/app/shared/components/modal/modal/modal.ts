import { Component, HostListener, ViewChild, ViewContainerRef, ComponentRef, Type, OnDestroy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../../core/services/modal.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal implements OnInit, OnDestroy {
  @ViewChild('modalContentHost', { read: ViewContainerRef }) modalContentHost!: ViewContainerRef;
  componentRef: ComponentRef<any> | null = null;

  constructor(public modalService: ModalService) {}

  ngOnInit(): void {
    this.modalService.activeModal$.subscribe(modalState => {
      if (modalState && modalState.component) {
        this.loadComponent(modalState.component, modalState.inputs);
      } else {
        this.clearComponent();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearComponent();
  }

  private loadComponent(component: Type<any>, inputs: Record<string, any>): void {
    this.clearComponent();
    this.componentRef = this.modalContentHost.createComponent(component);
    // Set inputs
    Object.keys(inputs).forEach(key => {
      if (this.componentRef) {
        this.componentRef.instance[key] = inputs[key];
      }
    });
  }

  private clearComponent(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent): void {
    if (this.modalService.activeModal$()) {
      this.modalService.close();
    }
  }

  closeModal(): void {
    this.modalService.close();
  }
}
