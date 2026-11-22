import { Component, Input } from '@angular/core';
import { LucideFileSpreadsheet } from '@lucide/angular';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [LucideFileSpreadsheet],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.css',
})
export class LogoComponent {
  @Input() label = 'Protótipo Visual';
  @Input() inverted = false;
}
