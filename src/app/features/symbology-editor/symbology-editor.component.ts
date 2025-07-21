import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {SymbologyEntry} from "../../model/symbology-entry.model";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";
import {SymbologyRepositoryService} from "../../service/symbology-repository.service";
import {SymbologyRepositoryStateService} from "../../service/symbology-repository-state.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {EditDialogComponent} from "../edit-dialog/edit-dialog.component";
import {ConfirmDialogComponent} from "../confirm-dialog/confirm-dialog.component";
import {ConfirmDialogData} from "../../model/confirm-dialog-data.model";
import {SymbologyFormComponent} from "../symbology-form/symbology-form.component";

@Component({
  selector: 'symbology-editor',
  templateUrl: './symbology-editor.component.html',
  styleUrls: ['./symbology-editor.component.scss']
})
export class SymbologyEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns: string[] = ['app6', 'milStdD', 'actions'];
  tableDataSource = new MatTableDataSource<SymbologyEntry>([]);

  loading = false;
  error: string | null = null;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('symbologyForm') symbologyForm!: SymbologyFormComponent;

  private readonly subscription: Subscription = new Subscription();
  private currentFilter = '';
  constructor(private readonly symbologyRepository: SymbologyRepositoryService,
              private readonly stateService: SymbologyRepositoryStateService,
              private readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
// Subscribe to data changes
    this.subscription.add(
      this.symbologyRepository.data$.subscribe(data => {
        this.tableDataSource.data = data;
        // Apply filter if there's any
        this.applyFilter();
      })
    );

    // Subscribe to state changes (loading, error)
    this.subscription.add(
      this.stateService.state$.subscribe(state => {
        this.loading = state.loading;
        this.error = state.error;

        // Show error message if there is an error
        if (state.error) {
          this.showError(state.error);
        }
      })
    );
  }

  ngAfterViewInit(): void {
    this.tableDataSource.sort = this.sort;
    this.tableDataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onFilterChanged(filterValue: string): void {
    this.currentFilter = filterValue;
    this.applyFilter();
  }

  // Apply filter to the data source
  private applyFilter() {
    const filterValue = this.filterValue;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();

    // Custom filter predicate to search in both app6 and milStdD
    this.tableDataSource.filterPredicate = (data: SymbologyEntry, filter: string) => {
      return data.app6.toLowerCase().includes(filter) ||
        data.milStd2525C.toLowerCase().includes(filter);
    };
  }

  // Getter for filter value
  get filterValue(): string {
    return this.currentFilter
  }

  // Fügen Sie eine neue Methode hinzu, um Einträge vom Formular zu empfangen
  async handleFormSubmit(entry: SymbologyEntry): Promise<void> {
    const duplicate = this.tableDataSource.data.find(existingEntry =>
      existingEntry.app6 === entry.app6
    );

    if (duplicate) {
      this.showError('Eintrag mit APP6 "' + entry.app6 + '" existiert bereits.');
      return;
    }

    try {
      await this.symbologyRepository.create(entry);
      this.symbologyForm.resetForm();
    } catch (error) {
      // Error is already handled by the state$ subscription
    }
  }

  deleteEntry(index: number) {
    const entry = this.tableDataSource.data[index];

    const dialogData: ConfirmDialogData = {
      title: 'Eintrag löschen',
      message: `Möchten Sie den Eintrag mit APP6 "${entry.app6}" wirklich löschen?`,
      confirmButtonText: 'Löschen',
      cancelButtonText: 'Abbrechen'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(async (result: boolean) => {
      if (result) {
        try {
          await this.symbologyRepository.delete(entry.app6);
        } catch (error) {
          // Error is already handled by the state$ subscription
        }
      }
    });
  }

  editEntry(index: number) {
    const original = this.tableDataSource.data[index];
    const dialogRef = this.dialog.open(EditDialogComponent, {
      width: '400px',
      data: {...this.tableDataSource.data[index]}
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        const duplicate = this.tableDataSource.data.find(
          (entry, i) => i !== index && entry.app6 === result.app6
        );

        if (duplicate) {
          this.showError('Eintrag mit APP6 "' + result.app6 + '" existiert bereits.');
          return;
        }

        try {
          await this.symbologyRepository.update(original.app6, result);
        } catch (error) {
          // Error is already handled by the state$ subscription
        }
      }
    });
  }

  get filteredData() {
    return this.tableDataSource;
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Schließen', {
      duration: 3000,
      panelClass: ['snack-error']
    });
  }
}

