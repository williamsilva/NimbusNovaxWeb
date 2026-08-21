import { computed, untracked, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { input, signal, Output, inject, Component, EventEmitter, effect } from '@angular/core';

import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { VoucherFacade } from '@features/facade/voucher.facade';
import { CancellationReasonsFacade } from '@features/facade/motivo-cancelamento.facade';
import { RecordStatus } from '@models/enums/record-status.enum';
import { VoucherModel } from '@models/voucher.models';

/** Modal de cancelamento de voucher (motivo obrigatório) - mesmo papel do
 *  CancellationReasonComponent no sistema legado (Novax antigo). */
@Component({
  standalone: true,
  selector: 'app-voucher-cancel-dialog',
  templateUrl: './voucher-cancel-dialog.component.html',
  imports: [
    ToastModule,
    SelectModule,
    DialogModule,
    ButtonModule,
    TranslateModule,
    FloatLabelModule,
    ErrorMsgComponent,
    ReactiveFormsModule,
  ],
})
export class VoucherCancelDialogComponent {
  visible = input.required<boolean>();
  voucher = input<VoucherModel | null>(null);

  @Output() canceled = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly i18n = inject(I18nService);
  readonly facade = inject(VoucherFacade);
  readonly reasonsFacade = inject(CancellationReasonsFacade);

  readonly saving = signal(false);

  readonly reasonOptions = computed(() =>
    this.reasonsFacade
      .reasons()
      .filter((r) => r.status === RecordStatus.ACTIVE)
      .map((r) => ({ label: r.name, value: r.id })),
  );

  readonly form = this.fb.nonNullable.group({
    cancellationReasonId: [null as string | null, [Validators.required]],
  });

  private lastLoadedVisible = false;

  constructor() {
    this.reasonsFacade.loadPage({ page: 0, size: 100 });

    effect(() => {
      const visible = this.visible();

      untracked(() => {
        if (visible && !this.lastLoadedVisible) {
          this.form.reset({ cancellationReasonId: null });
        }
        this.lastLoadedVisible = visible;
      });
    });
  }

  onHide(): void {
    this.close();
  }

  close(): void {
    this.saving.set(false);
    this.visibleChange.emit(false);
  }

  confirm(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const voucher = this.voucher();
    if (!voucher) return;

    const { cancellationReasonId } = this.form.getRawValue();
    this.saving.set(true);

    this.facade
      .cancel(voucher.id, cancellationReasonId!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.add({
            severity: 'success',
            summary: this.i18n.tUi('common.success'),
            detail: this.i18n.tUi('voucher.action.cancel.success'),
          });
          this.canceled.emit();
          this.close();
        },
        error: () => {
          this.saving.set(false);
        },
      });
  }
}
