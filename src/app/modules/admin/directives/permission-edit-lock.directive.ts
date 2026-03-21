import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { UserPermissionsService } from 'app/modules/admin/services/user-permissions.service';

@Directive({
  selector: '[appPermissionEditLock]',
  standalone: true,
})
export class PermissionEditLockDirective implements AfterViewInit, OnChanges {
  @Input('appPermissionEditLock') permissionId: number | null = null;
  private initialized = false;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private permissionsService: UserPermissionsService
  ) {}

  ngAfterViewInit(): void {
    this.initialized = true;
    void this.applyLock();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['permissionId'] && this.initialized) {
      void this.applyLock();
    }
  }

  private async applyLock(): Promise<void> {
    await this.permissionsService.ensureLoaded();
    const canEdit = this.permissionsService.canEdit(this.permissionId);
    if (canEdit) {
      return;
    }

    const host = this.elementRef.nativeElement;
    const editableNodes = Array.from(
      host.querySelectorAll('input, textarea, select, button, .cdk-drag')
    ) as HTMLElement[];

    editableNodes.forEach((node) => {
      if (node.closest('.print-hide, .permission-ignore-edit') || node.classList.contains('permission-ignore-edit')) {
        return;
      }

      if (node instanceof HTMLButtonElement) {
        this.renderer.setProperty(node, 'disabled', true);
        return;
      }

      if (node instanceof HTMLSelectElement) {
        this.renderer.setProperty(node, 'disabled', true);
        return;
      }

      if (node instanceof HTMLTextAreaElement) {
        this.renderer.setProperty(node, 'readOnly', true);
        return;
      }

      if (node instanceof HTMLInputElement) {
        const type = (node.type || '').toLowerCase();
        if (['checkbox', 'radio', 'date', 'file'].includes(type)) {
          this.renderer.setProperty(node, 'disabled', true);
        } else {
          this.renderer.setProperty(node, 'readOnly', true);
        }
        return;
      }

      this.renderer.setStyle(node, 'pointer-events', 'none');
    });
  }
}
