import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';

import { I18nService } from '@core/i18n/i18n.service';
import { PermissionService } from '@core/auth/permission.service';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { CompanySettingsFacade } from '@features/facade/company-settings.facade';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';

/** Tela "Configurações > Empresa" - nome/CNPJ/endereço/telefone da empresa emissora do voucher,
 *  exibidos no cabeçalho do e-mail e do PDF enviados ao cliente (ver
 *  VoucherFlowService.buildDocumentContext no backend). Linha única, mesmo papel de Configurações
 *  de E-mail. */
@Component({
  standalone: true,
  selector: 'app-company-settings-page',
  templateUrl: './company-settings-page.component.html',
  imports: [
    CardModule,
    ButtonModule,
    TranslateModule,
    InputTextModule,
    FloatLabelModule,
    ReactiveFormsModule,
    PageHeaderComponent,
  ],
})
export class CompanySettingsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly perms = inject(PermissionService);

  readonly i18n = inject(I18nService);
  readonly facade = inject(CompanySettingsFacade);

  readonly canEdit = computed(() => this.perms.hasSupportOr(PERMISSIONS.SETTINGS.COMPANY_CHANGE));

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    document: [''],
    addressLine: [''],
    city: [''],
    state: [''],
    postalCode: [''],
    phone: [''],
    email: [''],
  });

  private loaded = false;

  constructor() {
    this.facade.load();

    effect(() => {
      const settings = this.facade.settings();
      if (!settings || this.loaded) return;

      this.loaded = true;
      this.form.reset({
        name: settings.name ?? '',
        document: settings.document ?? '',
        addressLine: settings.addressLine ?? '',
        city: settings.city ?? '',
        state: settings.state ?? '',
        postalCode: settings.postalCode ?? '',
        phone: settings.phone ?? '',
        email: settings.email ?? '',
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
        name: v.name,
        document: v.document || null,
        addressLine: v.addressLine || null,
        city: v.city || null,
        state: v.state || null,
        postalCode: v.postalCode || null,
        phone: v.phone || null,
        email: v.email || null,
      })
      .subscribe({
        next: () => {
          this.toast.add({
            severity: 'success',
            summary: this.i18n.tUi('common.success'),
            detail: this.i18n.tUi('companySettings.saved'),
          });
        },
      });
  }
}
