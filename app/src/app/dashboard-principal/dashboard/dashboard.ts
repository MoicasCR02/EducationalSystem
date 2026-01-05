import { Component } from '@angular/core';
import { TicketsService } from '../../share/services/api/tickets.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  chartLabels: string[] = [];
  chartData: number[] = [];
  chartOptions: any = null;
  chartOptionsSLA: any = null;
  constructor(private TicketsService: TicketsService) {}

  ngOnInit(): void {
    this.TicketsService.getTicketsPorMes().subscribe({
      next: (res) => {
        console.log('Respuesta del backend:', res);

        this.chartOptions = {
          title: { text: 'Tickets creados por mes' },
          data: res, // 👈 directamente el array recibido
          series: [
            {
              type: 'bar',
              xKey: 'mes',
              yKey: 'total',
              yName: 'Tickets',
              fill: '#90CAF9',
              stroke: '#1E88E5',
            },
          ],
          axes: [
            { type: 'category', position: 'bottom' },
            { type: 'number', position: 'left' },
          ],
        };
      },
      error: (err) => console.error('Error al cargar reporte:', err),
    });
    // Gráfico de SLA (barras agrupadas)
    this.TicketsService.getTicketsResolucionRespuesta().subscribe({
      next: (res) => {
        const data = [
          {
            indicador: 'Respuesta',
            cumplimiento: parseFloat(res.slaRespuesta.cumplimiento),
            incumplimiento: parseFloat(res.slaRespuesta.incumplimiento),
          },
          {
            indicador: 'Resolución',
            cumplimiento: parseFloat(res.slaResolucion.cumplimiento),
            incumplimiento: parseFloat(res.slaResolucion.incumplimiento),
          },
        ];

        this.chartOptionsSLA = {
          title: { text: 'Cumplimiento SLA' },
          data,
          series: [
            {
              type: 'bar',
              xKey: 'indicador',
              yKey: 'cumplimiento',
              yName: 'Cumplimiento',
              fill: '#4CAF50',
            },
            {
              type: 'bar',
              xKey: 'indicador',
              yKey: 'incumplimiento',
              yName: 'Incumplimiento',
              fill: '#F44336',
            },
          ],
          axes: [
            { type: 'category', position: 'bottom' },
            { type: 'number', position: 'left', title: { text: '%' } },
          ],
        };
      },
      error: (err) => console.error('Error al cargar indicadores SLA:', err),
    });
  }
}
