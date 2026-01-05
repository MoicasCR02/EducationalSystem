import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardPrincipalRoutingModule } from './dashboard-principal-routing-module';
import { Dashboard } from './dashboard/dashboard';
import { AgCharts } from 'ag-charts-angular';
import { AgChartsModule } from 'ag-charts-angular';

@NgModule({
  declarations: [
    Dashboard
  ],
  imports: [
    CommonModule,
    DashboardPrincipalRoutingModule,
    AgCharts,
    AgChartsModule
  ]
})
export class DashboardPrincipalModule { }
