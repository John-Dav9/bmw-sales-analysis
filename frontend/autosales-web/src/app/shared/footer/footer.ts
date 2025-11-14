import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class Footer {
  readonly year = new Date().getFullYear();

  toTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
