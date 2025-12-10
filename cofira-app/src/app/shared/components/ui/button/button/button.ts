import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'small' | 'large';
type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize | '' = '';
  @Input() disabled: boolean = false;
  @Input() type: ButtonType = 'button';

  @Output() clickEvent = new EventEmitter<Event>();

  onClick(event: Event): void {
    if (!this.disabled) {
      this.clickEvent.emit(event);
    }
  }

  get buttonClasses(): Record<string, boolean> {
    return {
      'c-button--primary': this.variant === 'primary',
      'c-button--secondary': this.variant === 'secondary',
      'c-button--ghost': this.variant === 'ghost',
      'c-button--small': this.size === 'small',
      'c-button--large': this.size === 'large',
    };
  }
}
