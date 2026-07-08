import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
} from '@angular/core';

/*
  Directiva propia Sprint 4.

  Para acciones sensibles:
  el usuario debe mantener presionado el botón
  durante un tiempo determinado para confirmar.

  Evita bajas accidentales sin usar confirm() del navegador.
*/
@Directive({
  selector: '[appHoldToConfirm]',
  standalone: true,
})
export class HoldToConfirmDirective {
  @Input('appHoldToConfirm') durationMs: number | string = 1000;

  @Output() appHoldToConfirmComplete = new EventEmitter<void>();

  @HostBinding('style.transition')
  transition = 'transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease';

  @HostBinding('style.userSelect')
  userSelect = 'none';

  @HostBinding('style.touchAction')
  touchAction = 'manipulation';

  @HostBinding('style.transform')
  transform = '';

  @HostBinding('style.boxShadow')
  boxShadow = '';

  @HostBinding('attr.title')
  title = 'Mantené presionado para confirmar';

  private timeoutId: number | null = null;
  private isHolding = false;

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: Event): void {
    this.startHolding(event);
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: Event): void {
    this.startHolding(event);
  }

  @HostListener('mouseup')
  onMouseUp(): void {
    this.cancelHolding();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.cancelHolding();
  }

  @HostListener('touchend')
  onTouchEnd(): void {
    this.cancelHolding();
  }

  @HostListener('touchcancel')
  onTouchCancel(): void {
    this.cancelHolding();
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private startHolding(event: Event): void {
    event.preventDefault();

    if (this.isHolding) {
      return;
    }

    this.isHolding = true;
    this.transform = 'scale(0.97)';
    this.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.22)';

    this.timeoutId = window.setTimeout(() => {
      this.appHoldToConfirmComplete.emit();
      this.cancelHolding();
    }, this.getDuration());
  }

  private cancelHolding(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.isHolding = false;
    this.transform = '';
    this.boxShadow = '';
  }

  private getDuration(): number {
    const parsedDuration = Number(this.durationMs);

    if (Number.isNaN(parsedDuration) || parsedDuration < 300) {
      return 1000;
    }

    return parsedDuration;
  }
}