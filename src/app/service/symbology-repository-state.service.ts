import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {SymbologyRepositoryState} from "../model/symbology-repository-state.model";

@Injectable({
  providedIn: 'root'
})
export class SymbologyRepositoryStateService {
  private readonly stateSubject = new BehaviorSubject<SymbologyRepositoryState>({
    loading: false,
    error: null
  });
  public state$ = this.stateSubject.asObservable();

  constructor() {
  }

  private get currentState(): SymbologyRepositoryState {
    return this.stateSubject.getValue();
  }

  public setLoading(loading: boolean): void {
    this.stateSubject.next({
      ...this.currentState,
      loading,
      error: loading ? null : this.currentState.error
    });
  }

  public setError(error: string | null): void {
    this.stateSubject.next({
      ...this.currentState,
      error
    });
  }
}
