import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SymbologyEntry} from "../../model/symbology-entry.model";

@Component({
  selector: 'symbology-form',
  templateUrl: './symbology-form.component.html',
  styleUrls: ['./symbology-form.component.scss']
})
export class SymbologyFormComponent {
  @Input() loading = false;
  @Output() submitEntry = new EventEmitter<SymbologyEntry>();

  entryForm: FormGroup;

  constructor(private readonly formBuilder: FormBuilder) {
    this.entryForm = this.formBuilder.group({
      app6: ['', [
        Validators.required,
        Validators.pattern('[0-9]+'),
        Validators.minLength(20),
        Validators.maxLength(30)
      ]],
      milStd2525C: ['', [
        Validators.required,
        Validators.minLength(15),
        Validators.maxLength(15)
      ]]
    });
  }
  addEntry(): void {
    if (this.entryForm.invalid) return;

    const formValues = this.entryForm.value;
    this.submitEntry.emit({
      app6: formValues.app6,
      milStd2525C: formValues.milStd2525C
    });
  }
  resetForm(): void {
    this.entryForm.reset();
  }
}
