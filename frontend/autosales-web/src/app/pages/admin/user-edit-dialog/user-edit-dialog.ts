import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

export interface UserEditData {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: 'admin' | 'visitor';
  is_active: boolean;
}

@Component({
  standalone: true,
  selector: 'app-user-edit-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  templateUrl: './user-edit-dialog.html',
  styleUrls: ['./user-edit-dialog.scss'],
})
export class UserEditDialog {
  model: UserEditData;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: UserEditData,
    private ref: MatDialogRef<UserEditDialog, UserEditData | null>
  ) {
    // On travaille sur une copie locale
    this.model = { ...data };
  }

  save() {
    if (!this.model.name || !this.model.email) return;
    this.ref.close(this.model);
  }

  cancel() {
    this.ref.close(null);
  }
}
