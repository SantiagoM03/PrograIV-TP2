import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
  inject,
} from '@angular/core';

/*
  Directiva propia Sprint 4.

  Mejora textareas:
  - autoajusta la altura mientras se escribe;
  - marca si el texto está muy corto, ideal o largo;
  - da feedback visual sin meter lógica en el componente.
*/
@Directive({
  selector: 'textarea[appSmartComposer]',
  standalone: true,
})
export class SmartComposerDirective implements AfterViewInit {
  private readonly elementRef = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  @Input() smartComposerIdealMin = 20;
  @Input() smartComposerIdealMax = 260;

  ngAfterViewInit(): void {
    this.applyBaseStyles();
    this.updateComposerState();
  }

  @HostListener('input')
  onInput(): void {
    this.updateComposerState();
  }

  @HostListener('focus')
  onFocus(): void {
    this.updateComposerState();
  }

  @HostListener('blur')
  onBlur(): void {
    this.updateComposerState();
  }

  private updateComposerState(): void {
    const textarea = this.elementRef.nativeElement;
    const textLength = textarea.value.trim().length;

    this.autoResize(textarea);

    if (textLength === 0) {
      this.applyNeutralState();
      return;
    }

    if (textLength < this.smartComposerIdealMin) {
      this.applyShortState();
      return;
    }

    if (textLength <= this.smartComposerIdealMax) {
      this.applyIdealState();
      return;
    }

    this.applyLongState();
  }

  private autoResize(textarea: HTMLTextAreaElement): void {
    this.renderer.setStyle(textarea, 'height', 'auto');

    const nextHeight = Math.min(textarea.scrollHeight, 260);

    this.renderer.setStyle(textarea, 'height', `${nextHeight}px`);
    this.renderer.setStyle(textarea, 'overflowY', textarea.scrollHeight > 260 ? 'auto' : 'hidden');
  }

  private applyBaseStyles(): void {
    const textarea = this.elementRef.nativeElement;

    this.renderer.setStyle(textarea, 'transition', 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease');
  }

  private applyNeutralState(): void {
    this.setVisualState(
      'rgba(148, 163, 184, 0.24)',
      'none',
      'rgba(15, 23, 42, 0.78)',
    );
  }

  private applyShortState(): void {
    this.setVisualState(
      'rgba(251, 191, 36, 0.55)',
      '0 0 0 4px rgba(251, 191, 36, 0.10)',
      'linear-gradient(135deg, rgba(251, 191, 36, 0.10), rgba(15, 23, 42, 0.78))',
    );
  }

  private applyIdealState(): void {
    this.setVisualState(
      'rgba(74, 222, 128, 0.55)',
      '0 0 0 4px rgba(34, 197, 94, 0.12)',
      'linear-gradient(135deg, rgba(34, 197, 94, 0.10), rgba(15, 23, 42, 0.78))',
    );
  }

  private applyLongState(): void {
    this.setVisualState(
      'rgba(248, 113, 113, 0.6)',
      '0 0 0 4px rgba(239, 68, 68, 0.12)',
      'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(15, 23, 42, 0.78))',
    );
  }

  private setVisualState(
    borderColor: string,
    boxShadow: string,
    background: string,
  ): void {
    const textarea = this.elementRef.nativeElement;

    this.renderer.setStyle(textarea, 'borderColor', borderColor);
    this.renderer.setStyle(textarea, 'boxShadow', boxShadow);
    this.renderer.setStyle(textarea, 'background', background);
  }
}