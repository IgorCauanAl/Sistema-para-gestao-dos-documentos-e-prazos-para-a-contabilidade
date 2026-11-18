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
  template: `
    <ol class="relative">
      @for (item of items; track item.title; let index = $index, isLast = $last) {
        <li class="relative pl-8 pb-6 last:pb-0">
          @if (!isLast) {
            <span
              class="absolute left-[7px] top-4 bottom-0 w-px"
              [class]="item.done ? 'bg-indigo-300' : 'bg-slate-200'"
              aria-hidden="true"
            ></span>
          }

          <span
            class="absolute left-0 top-1 w-4 h-4 rounded-full border-2"
            [class]="item.done ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-300'"
            aria-hidden="true"
          ></span>

          <div class="flex flex-col gap-0.5">
            <span class="text-sm font-semibold" [class]="item.done ? 'text-slate-700' : 'text-slate-400'">
              {{ item.title }}
            </span>

            @if (item.done) {
              <span class="text-xs text-slate-500">
                {{ item.date }} às {{ item.time }}
                @if (item.extra) {
                  <span class="text-slate-400"> · {{ item.extra }}</span>
                }
              </span>
            } @else {
              <span class="text-xs text-slate-400 italic">aguardando</span>
            }
          </div>
        </li>
      }
    </ol>
  `,
})
export class TimelineComponent {
  @Input() items: TimelineItem[] = [];
}
