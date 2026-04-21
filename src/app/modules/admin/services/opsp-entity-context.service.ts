import { Injectable } from '@angular/core';
import { getSessionEntityId, getSessionUserId } from 'app/core/auth/auth-session';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpspEntityContextService {
  private selectedEntityId: number | string | null = null;
  private ownerUserId: number | string | null = null;
  readonly entityChanges$ = new Subject<number | string>();

  getCurrentEntityId(): number | string {
    this.ensureCurrentSessionOwner();
    return this.selectedEntityId ?? getSessionEntityId();
  }

  setSelectedEntityId(id: number | string | null): void {
    this.ownerUserId = getSessionUserId();
    this.selectedEntityId = id;
    if (id != null) {
      this.entityChanges$.next(id);
    }
  }

  resetToSessionEntity(): void {
    this.ownerUserId = getSessionUserId();
    this.selectedEntityId = getSessionEntityId();
  }

  private ensureCurrentSessionOwner(): void {
    const currentUserId = getSessionUserId();
    if (this.ownerUserId !== currentUserId) {
      this.ownerUserId = currentUserId;
      this.selectedEntityId = getSessionEntityId();
    }
  }
}
