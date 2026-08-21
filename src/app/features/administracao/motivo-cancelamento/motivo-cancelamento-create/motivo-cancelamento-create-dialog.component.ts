import { computed, untracked, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { input, signal, Output, inject, Component, EventEmitter, effect } from '@angular/core';

import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { CancellationReasonsFacade } from '@features/facade/motivo-cancelamento.facade';
import { CancellationReasonModel, CancellationReasonCreateInput } from '@models/motivo-cancelamento.models';
import { RecordStatus, allRecordStatuses, recordStatusLabel } from '@models/enums/record-status.enum';
import { MotivoCancelamentoPermissionPolicy } from '@features/administracao/policy/motivo-cancelamento-permission.policy';

@Component({
  standalone: true,
  selector: 'app-motivo-cancelamento-create-dialog',
  templateUrl: './motivo-cancelamento-create-dialog.component.html',
  imports: [
    ToastModule,
    SelectModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TranslateModule,
    FloatLabelModule,
    ErrorMsgComponent,
    ReactiveFormsModule,
  ],
})
export class MotivoCancelamentoCreateDialogComponent {
  visible = input.required<boolean>();
  reason = input<CancellationReasonModel | null>(null);

  @Output() saved = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly i18n = inject(I18nService);
  readonly facade = inject(CancellationReasonsFacade);
  readonly secPolicy = inject(MotivoCancelamentoPermissionPolicy);

  readonly isEditMode = computed(() => !!this.reason());
  readonly canSubmit = computed(() =>
    this.isEditMode() ? this.secPolicy.canEdit({ id: this.reason()!.id, generation: this.reason()!.generation }) : this.secPolicy.canCreate(),
  );

  readonly saving = signal(false);

  readonly statusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allRecordStatuses().map((value) => ({ label: recordStatusLabel(value, this.i18n), value }));
  });

  private lastLoadedId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
    description: ['', [Validators.maxLength(150)]],
    status: [RecordStatus.ACTIVE as RecordStatus],
  });

  /** Ver o mesmo comentário em AgentesCreateDialogComponent/ProdutosCreateDialogComponent -
   *  `untracked()` + guard por `lastLoadedId` evita que uma reexecução espúria deste `effect`
   *  apague os dados já digitados no modo de criação. */
  constructor() {
    effect(() => {
      const visible = this.visible();
      const reason = this.reason();

      untracked(() => {
        if (!visible) return;

        if (!reason) {
          if (this.lastLoadedId !== null) {
            this.lastLoadedId = null;
            this.resetFormForCreate();
          }
          return;
        }

        if (this.lastLoadedId === reason.id) return;

        this.lastLoadedId = reason.id;
        this.form.reset({
          name: reason.name,
          description: reason.description ?? '',
          status: reason.status ?? RecordStatus.ACTIVE,
        });
      });
    });
  }

  onHide(): void {
    this.close();
  }

  close(): void {
    this.saving.set(false);
    this.lastLoadedId = null;
    this.resetFormForCreate();
    this.visibleChange.emit(false);
  }

  private resetFormForCreate(): void {
    this.form.reset({ name: '', description: '', status: RecordStatus.ACTIVE });
  }

  save(): void {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      return;
    }

    const v = this.form.getRawValue();
    const payload: CancellationReasonCreateInput = {
      name: v.name.trim(),
      description: v.description?.trim() || null,
      status: v.status,
    };

    this.saving.set(true);

    const id = this.reason()?.id;
    const req$ = id ? this.facade.update(id, payload) : this.facade.create(payload);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: id
            ? this.i18n.tUi('motivoCancelamento.form.updated')
            : this.i18n.tUi('motivoCancelamento.form.created'),
        });
        this.saved.emit();
        this.close();
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }
}
