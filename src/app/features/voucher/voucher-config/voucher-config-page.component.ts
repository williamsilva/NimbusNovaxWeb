import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';
import { TranslateModule } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import { I18nService } from '@core/i18n/i18n.service';
import { CsTagComponent } from '@shared/ui/tag/cs-tag.component';
import { VoucherConfigFacade } from '@features/facade/voucher-config.facade';
import { VoucherPermissionPolicy } from '@features/voucher/policy/voucher-permission.policy';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';

/** Tela de configuração de voucher (dias para expirar/cancelar, nº de vouchers pendentes
 *  permitido, notificação por e-mail) - mesmo papel do VoucherComponent (aba "config/voucher") no
 *  sistema legado (Novax antigo). */
@Component({
  standalone: true,
  selector: 'app-voucher-config-page',
  templateUrl: './voucher-config-page.component.html',
  imports: [
    CardModule,
    ButtonModule,
    TooltipModule,
    CsTagComponent,
    TextareaModule,
    TranslateModule,
    FloatLabelModule,
    InputNumberModule,
    ToggleSwitchModule,
    ReactiveFormsModule,
    PageHeaderComponent,
  ],
})
export class VoucherConfigPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);

  readonly i18n = inject(I18nService);
  readonly facade = inject(VoucherConfigFacade);
  readonly secPolicy = inject(VoucherPermissionPolicy);

  readonly canEdit = computed(() => this.secPolicy.canChangeConfig());

  readonly notificationRecipients = this.facade.notificationRecipients;

  readonly form = this.fb.nonNullable.group({
    senderMail: [true],
    daysToExpire: [20, [Validators.required, Validators.min(1)]],
    daysToCancel: [90, [Validators.required, Validators.min(1)]],
    numberPendingVouchers: [20, [Validators.required, Validators.min(1)]],
    emailBody: [''],
    importantInfo: [''],
  });

  private loaded = false;

  constructor() {
    this.facade.load();

    // effect() simples (sem untracked/guard) - só reage à primeira carga de fato bem-sucedida
    // (guard por `loaded`), esta tela não tem o problema de reexecução espúria dos dialogs de
    // criação (nenhum signal de "visible"/"editing item" é lido durante o processamento).
    effect(() => {
      const config = this.facade.config();
      if (!config || this.loaded) return;

      this.loaded = true;
      this.form.reset({
        senderMail: config.senderMail,
        daysToExpire: config.daysToExpire,
        daysToCancel: config.daysToCancel,
        numberPendingVouchers: config.numberPendingVouchers,
        emailBody: config.emailBody ?? '',
        importantInfo: config.importantInfo ?? '',
      });
      if (!this.canEdit()) {
        this.form.disable();
      }
    });
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    this.facade
      .update({
        senderMail: v.senderMail,
        daysToExpire: v.daysToExpire,
        daysToCancel: v.daysToCancel,
        numberPendingVouchers: v.numberPendingVouchers,
        emailBody: v.emailBody || null,
        importantInfo: v.importantInfo || null,
      })
      .subscribe({
        next: () => {
          this.toast.add({
            severity: 'success',
            summary: this.i18n.tUi('common.success'),
            detail: this.i18n.tUi('voucher.config.saved'),
          });
        },
      });
  }
}
