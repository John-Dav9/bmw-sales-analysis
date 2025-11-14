import { Component, TemplateRef } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { NgIf, NgIfContext } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class Landing {


}
