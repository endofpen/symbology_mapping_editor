import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-symbology-filter',
  templateUrl: './symbology-filter.component.html',
  styleUrls: ['./symbology-filter.component.scss']
})
export class SymbologyFilterComponent implements OnInit {
  @Input() loading = false;
  @Output() filterChanged = new EventEmitter<string>();

  filterForm: FormGroup;

  constructor(private readonly formBuilder: FormBuilder) {
    this.filterForm = this.formBuilder.group({
      filterValue: ['']
    });
  }

  ngOnInit(): void {
    // Subscribe to filter changes
    this.filterForm.get('filterValue')!.valueChanges.subscribe((value) => {
      this.filterChanged.emit(value);
    });
  }

  // Getter für den Filterwert
  get filterValue(): string {
    return this.filterForm.get('filterValue')?.value ?? '';
  }

  // Methode zum Zurücksetzen des Filters
  resetFilter(): void {
    this.filterForm.get('filterValue')?.setValue('');
  }

}
