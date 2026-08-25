import { Component, computed, effect, inject, signal } from '@angular/core';
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

/** Mesmo limite/formatos validados em CompanySettingsService (backend) - checado aqui só pra dar
 *  feedback imediato sem round-trip, a validação de verdade continua no servidor. */
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;

/** Tela "Configurações > Empresa" - nome/CNPJ/endereço/telefone/logo da empresa emissora do
 *  voucher, exibidos no cabeçalho do e-mail e do PDF enviados ao cliente (ver
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

  readonly logoUploading = signal(false);
  readonly logoUrl = computed(() => this.facade.settings()?.logoUrl ?? null);

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

  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    // Limpa o input pra permitir selecionar o mesmo arquivo de novo depois (ex.: tentar de novo
    // após corrigir o arquivo) - o evento "change" não dispara se o value não mudar.
    input.value = '';
    if (!file) return;

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      this.toast.add({
        severity: 'error',
        summary: this.i18n.tUi('common.error'),
        detail: this.i18n.tUi('companySettings.logo.invalidType'),
      });
      return;
    }
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      this.toast.add({
        severity: 'error',
        summary: this.i18n.tUi('common.error'),
        detail: this.i18n.tUi('companySettings.logo.tooLarge'),
      });
      return;
    }

    this.logoUploading.set(true);
    this.facade.uploadLogo(file).subscribe({
      next: () => {
        this.logoUploading.set(false);
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.i18n.tUi('companySettings.logo.uploaded'),
        });
      },
      error: () => this.logoUploading.set(false),
    });
  }

  removeLogo(): void {
    this.logoUploading.set(true);
    this.facade.deleteLogo().subscribe({
      next: () => {
        this.logoUploading.set(false);
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.i18n.tUi('companySettings.logo.removed'),
        });
      },
      error: () => this.logoUploading.set(false),
    });
  }
}
