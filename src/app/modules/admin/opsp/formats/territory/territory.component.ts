import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Channel {
  name: string;
}

interface Product {
  name: string;
  channels: Channel[];
}

interface Segment {
  name: string;
  products: Product[];
}

interface Territory {
  name: string;
  segments: Segment[];
}

@Component({
  selector: 'app-territory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './territory.component.html',
})
export class TerritoryComponent {
  newTerritory = '';
  territories: Territory[] = [];

  addTerritory() {
    const name = this.newTerritory.trim();
    if (name) {
      this.territories.push({ name, segments: [] });
      this.newTerritory = '';
    }
  }

  removeTerritory(index: number) {
    this.territories.splice(index, 1);
  }

  addSegment(t: Territory) {
    t.segments.push({ name: '', products: [] });
  }

  removeSegment(t: Territory, sIndex: number) {
    t.segments.splice(sIndex, 1);
  }

  addProduct(s: Segment) {
    s.products.push({ name: '', channels: [] });
  }

  removeProduct(s: Segment, pIndex: number) {
    s.products.splice(pIndex, 1);
  }

  addChannel(p: Product) {
    p.channels.push({ name: '' });
  }

  removeChannel(p: Product, cIndex: number) {
    p.channels.splice(cIndex, 1);
  }

  saveAll() {
    console.log('Estructura completa:', JSON.stringify(this.territories, null, 2));
    console.log('Estructura completa:', this.territories);
    // Aquí podrías enviar los datos a un backend, por ejemplo:
    // this.territoryService.save(this.territories).subscribe(...)
  }
}
