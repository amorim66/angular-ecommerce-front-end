import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  private fontSize = 16;
  private maxFontSize = 24;
  private minFontSize = 12;

  public increaseFontSize() {
    if (this.fontSize < this.maxFontSize) {
      this.fontSize += 2;
      document.documentElement.style.fontSize = `${this.fontSize}px`;
    }
  }

  public decreaseFontSize() {
    if (this.fontSize > this.minFontSize) {
      this.fontSize -= 2;
      document.documentElement.style.fontSize = `${this.fontSize}px`;
    }
  }
}
