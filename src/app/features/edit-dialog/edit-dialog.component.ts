import {Component, Inject} from '@angular/core';
import {SymbologyEntry} from "../../model/symbology-entry.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss']
})
export class EditDialogComponent {

  editForm: FormGroup

  constructor(@Inject(MAT_DIALOG_DATA) private readonly data: SymbologyEntry,
              public dialogRef: MatDialogRef<EditDialogComponent>,
              private readonly formBuilder: FormBuilder
  ) {
    this.editForm = this.formBuilder.group({
      app6: [data.app6, Validators.required,],
      milStd2525C: [data.milStd2525C, Validators.required]
    })
  }

  save(): void {
    if (this.editForm.valid) {
      this.dialogRef.close(this.editForm.value);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
