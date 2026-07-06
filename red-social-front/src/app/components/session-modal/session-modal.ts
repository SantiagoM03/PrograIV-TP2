import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-session-modal',
  imports: [],
  templateUrl: './session-modal.html',
  styleUrl: './session-modal.scss',
})
export class SessionModal 
{
  @Output() extendSession = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  onExtendSession(): void {
    this.extendSession.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }
}