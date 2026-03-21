import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { UserPermissionsService } from 'app/modules/admin/services/user-permissions.service';

@Directive({
  selector: '[appPermissionHideIfNoEdit]',
  standalone: true,
})
export class PermissionHideIfNoEditDirective implements OnInit, OnChanges {
  @Input('appPermissionHideIfNoEdit') permissionId: number | null = null;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private permissionsService: UserPermissionsService
  ) {}

  ngOnInit(): void {
    void this.applyVisibility();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    void this.applyVisibility();
  }

  private async applyVisibility(): Promise<void> {
    await this.permissionsService.ensureLoaded();
    const canEdit = this.permissionsService.canEdit(this.permissionId);
    this.renderer.setStyle(this.elementRef.nativeElement, 'display', canEdit ? '' : 'none');
  }
}
