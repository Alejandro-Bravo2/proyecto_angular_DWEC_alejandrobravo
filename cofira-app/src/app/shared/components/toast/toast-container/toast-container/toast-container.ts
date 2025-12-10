import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../../core/services/toast.service';
import { ToastType } from '../../../../models/toast.model';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
})
export class ToastContainer {
  ToastType = ToastType; // Make enum available in template

  constructor(public toastService: ToastService) { }

  dismissToast(id: string): void {
    this.toastService.dismiss(id);
  }
}
