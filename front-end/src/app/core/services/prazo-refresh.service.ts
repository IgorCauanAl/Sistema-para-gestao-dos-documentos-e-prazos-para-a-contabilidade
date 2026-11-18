import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PrazoRefreshService {
  private readonly subject = new Subject<void>();
  readonly changes$ = this.subject.asObservable();

  notify(): void {
    this.subject.next();
  }
}
