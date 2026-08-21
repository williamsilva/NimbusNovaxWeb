import { Component } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [TranslateModule, PageHeaderComponent],
})
export class DashboardComponent {}
