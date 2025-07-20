import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {SymbologyEntry} from "../model/symbology-entry.model";
import {SymbologyRepositoryStateService} from "./symbology-repository-state.service";

@Injectable({
  providedIn: 'root'
})
export class SymbologyRepositoryService {
  private readonly dataSubject = new BehaviorSubject<SymbologyEntry[]>([
    {app6: 'A1', milStd2525C: 'X1'},
    {app6: 'A2', milStd2525C: 'X2'}
  ]);

  public data$ = this.dataSubject.asObservable();

  constructor(private readonly stateService: SymbologyRepositoryStateService) {
  }

  async create(entry: SymbologyEntry): Promise<void> {
    try {
      this.stateService.setLoading(true);
      await this.delay(700);

      // Simulate potential server error
      if (this.simulateError()) {
        throw new Error('Fehler beim Erstellen des Eintrags');
      }

      const updatedData = [entry, ...this.currentData];
      this.updateData(updatedData);
      this.stateService.setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler beim Erstellen';
      this.stateService.setError(errorMessage);
      throw error;
    } finally {
      this.stateService.setLoading(false);
    }
  }

  async update(oldApp6: string, updated: SymbologyEntry): Promise<void> {
    try {
      this.stateService.setLoading(true);
      await this.delay(700);

      // Simulate potential server error
      if (this.simulateError()) {
        throw new Error('Fehler beim Aktualisieren des Eintrags');
      }

      const currentData = this.currentData;
      const index = currentData.findIndex(e => e.app6 === oldApp6);

      if (index !== -1) {
        const updatedData = [...currentData];
        updatedData.splice(index, 1); // alt entfernen
        updatedData.unshift(updated); // neu oben einfügen
        this.updateData(updatedData);
        this.stateService.setError(null);
      } else {
        throw new Error(`Eintrag mit APP6 "${oldApp6}" nicht gefunden`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler beim Aktualisieren';
      this.stateService.setError(errorMessage);
      throw error;
    } finally {
      this.stateService.setLoading(false);
    }
  }

  async delete(app6: string): Promise<void> {
    try {
      this.stateService.setLoading(true);
      await this.delay(500);

      // Simulate potential server error
      if (this.simulateError()) {
        throw new Error('Fehler beim Löschen des Eintrags');
      }

      const updatedData = this.currentData.filter(e => e.app6 !== app6);

      // Check if anything was deleted
      if (updatedData.length === this.currentData.length) {
        throw new Error(`Eintrag mit APP6 "${app6}" nicht gefunden`);
      }

      this.updateData(updatedData);
      this.stateService.setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler beim Löschen';
      this.stateService.setError(errorMessage);
      throw error;
    } finally {
      this.stateService.setLoading(false);
    }
  }

  private get currentData(): SymbologyEntry[] {
    return this.dataSubject.getValue();
  }

  private updateData(data: SymbologyEntry[]): void {
    this.dataSubject.next([...data]);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private simulateError(probability: number = 0.1): boolean {
    return Math.random() < probability;
  }
}
