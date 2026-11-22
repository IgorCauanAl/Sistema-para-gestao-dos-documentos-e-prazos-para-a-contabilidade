import { Component, Input } from '@angular/core';

export interface TimelineItem {
  title: string;
  done: boolean;
  date?: string;
  time?: string;
  extra?: string | null;
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.css',
})
export class TimelineComponent {
  @Input() items: TimelineItem[] = [];
}
