import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-territory',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './territory.component.html',
  styleUrl: './territory.component.scss'
})
export class TerritoryComponent {
  newTerritory = '';
  territories: { name: string }[] = [];

  addTerritory(): void {
    const name = this.newTerritory.trim();
    if (name) {
      this.territories.push({ name });
      this.newTerritory = '';
    }
  }

  removeTerritory(index: number): void {
    this.territories.splice(index, 1);
  }
}
