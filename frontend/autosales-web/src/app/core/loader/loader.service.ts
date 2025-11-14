import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private counter = 0;
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading$.asObservable();

  show() { if (++this.counter === 1) this._loading$.next(true); }
  hide() { if (this.counter > 0 && --this.counter === 0) this._loading$.next(false); }
  reset() { this.counter = 0; this._loading$.next(false); }
}
