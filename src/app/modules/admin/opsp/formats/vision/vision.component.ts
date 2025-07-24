import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vision',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './vision.component.html',
  styleUrl: './vision.component.scss'
})
export class VisionComponent {
  @ViewChildren('autosizeArea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

  visionForm!: FormGroup;

  estados = [
    { color: '#006600', placeholder: 'Excelente (verde oscuro)' },
    { color: '#66CC66', placeholder: 'Bien (verde claro)' },
    { color: '#FFCC00', placeholder: 'Entre verde y rojo' },
    { color: '#CC0000', placeholder: 'En problemas (rojo)' }
  ];

  usuarios = [
    { id: '1', nombre: 'Juan Pérez' },
    { id: '2', nombre: 'María García' },
    { id: '3', nombre: 'Carlos Rodríguez' }
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.visionForm = this.fb.group({
      valores: [''],
      proposito: [''],
      promesas: [''],
      bhag: [''],
      prioridadesLargo: this.fb.array([]),
      prioridadesMedio: this.fb.array([]),
      prioridadesCorto: this.fb.array([]),
      kpis: this.fb.array([]),
      ganarJuego1: this.fb.array(this.createGanarJuegoRows()),
      ganarJuego2: this.fb.array(this.createGanarJuegoRows()),
      prioridadesTrimestrales: this.fb.array([])
    });

    this.loadFromStorage();
  }

  // prioridades estrategicas
  get prioridadesLargo(): FormArray {
    return this.visionForm.get('prioridadesLargo') as FormArray;
  }

  get prioridadesMedio(): FormArray {
    return this.visionForm.get('prioridadesMedio') as FormArray;
  }

  get prioridadesCorto(): FormArray {
    return this.visionForm.get('prioridadesCorto') as FormArray;
  }

  autoResize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  ngAfterViewInit(): void {
    this.textareas.forEach(textarea => {
      this.autoResize(textarea.nativeElement);
    });
  }

  // Métodos
  addItem(array: FormArray): void {
    array.push(this.fb.control(''));
  }

  addItemWithOwner(array: FormArray) {
    array.push(
      this.fb.group({
        descripcion: [''],
        quien: ['']
      })
    );
  }

  trackByIndex(_index: number): number {
    return _index;
  }

  removeItem(array: FormArray, index: number): void {
    array.removeAt(index);
  }

  createKpiRows(count: number): FormGroup[] {
    return Array.from({ length: count }, () =>
      this.fb.group({
        kpi: [''],
        meta: ['']
      })
    );
  }

  createPrioridadRows(count: number): FormGroup[] {
    return Array.from({ length: count }, () =>
      this.fb.group({
        prioridad: [''],
        plazo: ['']
      })
    );
  }

  createGanarJuegoRows(): FormGroup[] {
    return this.estados.map(() =>
      this.fb.group({
        descripcion: ['']
      })
    );
  }

  // KPIS
  get kpis(): FormArray {
    return this.visionForm.get('kpis') as FormArray;
  }

  createKpiGroup(): FormGroup {
    return this.fb.group({
      kpi: [''],
      meta: ['']
    });
  }

  addKpi(): void {
    this.kpis.push(this.createKpiGroup());
  }

  removeKpi(index: number): void {
    this.kpis.removeAt(index);
  }

  get ganarJuego1(): FormArray {
    return this.visionForm.get('ganarJuego1') as FormArray;
  }

  get ganarJuego2(): FormArray {
    return this.visionForm.get('ganarJuego2') as FormArray;
  }

  // prioridades trimestrales
  get prioridadesTrimestrales(): FormArray {
    return this.visionForm.get('prioridadesTrimestrales') as FormArray;
  }

  createPrioridadForm(): FormGroup {
    return this.fb.group({
      prioridad: [''],
      plazo: [''],
      esOKR: [false],
      subprioridades: this.fb.array([]),
      esIndividual: [false],
      quien: [''],
    });
  }

  addPrioridad(): void {
    this.prioridadesTrimestrales.push(this.createPrioridadForm());
  }

  removePrioridad(index: number): void {
    this.prioridadesTrimestrales.removeAt(index);
  }

  getSubprioridades(index: number): FormArray {
    return (this.prioridadesTrimestrales.at(index) as FormGroup).get('subprioridades') as FormArray;
  }

  addSubprioridad(index: number): void {
    this.getSubprioridades(index).push(this.fb.control(''));
  }

  removeSubprioridad(prioridadIndex: number, subIndex: number): void {
    this.getSubprioridades(prioridadIndex).removeAt(subIndex);
  }

  save(): void {
    localStorage.setItem('visionData', JSON.stringify(this.visionForm.value));
    console.log(JSON.stringify(this.visionForm.value))
    console.log(this.visionForm.value);

    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Los datos se han guardado correctamente.',
      confirmButtonColor: '#003660'
    });
  }

  loadFromStorage(): void {
    const data = localStorage.getItem('visionData');
    if (data) {
      this.visionForm.patchValue(JSON.parse(data));
    }
  }
}
