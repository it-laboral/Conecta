import { Component, inject, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-reportes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss'
})
export class ReportesAdminComponent implements OnInit, AfterViewInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  // Referencias Canvas para 4 Gráficos
  @ViewChild('chartCarreras') chartCarrerasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartModalidad') chartModalidadRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartSkills') chartSkillsRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartEstadoEmpresas') chartEstadoEmpresasRef!: ElementRef<HTMLCanvasElement>;

  // Instancias de Chart.js
  private chartCarrerasInst: any;
  private chartModalidadInst: any;
  private chartSkillsInst: any;
  private chartEstadoEmpresasInst: any;

  tipoReporte: 'postulantes' | 'empresas' | 'ofertas' | 'graficos' = 'graficos';

  // Filtros
  filtroSkill: string = '';
  filtroCarrera: string = '';
  filtroStack: string = '';
  filtroSector: string = '';
  filtroTituloOferta: string = '';

  cargando: boolean = false;
  resultadosPostulantes: any[] = [];
  resultadosEmpresas: any[] = [];
  resultadosOfertas: any[] = [];

  ngOnInit(): void {
    this.cargarDatosGenerales();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.inicializarGraficos(), 250);
  }

  cambiarTipoReporte(tipo: 'postulantes' | 'empresas' | 'ofertas' | 'graficos'): void {
    this.tipoReporte = tipo;
    if (tipo === 'postulantes') this.buscarReportePostulantes();
    if (tipo === 'empresas') this.buscarReporteEmpresas();
    if (tipo === 'ofertas') this.buscarReporteOfertas();
    if (tipo === 'graficos') setTimeout(() => this.inicializarGraficos(), 150);
  }

  cargarDatosGenerales(): void {
    this.buscarReportePostulantes();
    this.buscarReporteEmpresas();
    this.buscarReporteOfertas();
  }

  // 📈 RENDERIZADO DE LOS 4 GRÁFICOS
  inicializarGraficos(): void {
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' as const, labels: { boxWidth: 10, font: { size: 11 } } }
      }
    };

    // 1. Gráfico de Carreras (Doughnut)
    if (this.chartCarrerasRef && this.chartCarrerasRef.nativeElement) {
      if (this.chartCarrerasInst) this.chartCarrerasInst.destroy();

      const carrerasCount: { [key: string]: number } = {};
      this.resultadosPostulantes.forEach(p => {
        const carrera = p.carrera || 'Analista de Sistemas';
        carrerasCount[carrera] = (carrerasCount[carrera] || 0) + 1;
      });

      this.chartCarrerasInst = new Chart(this.chartCarrerasRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: Object.keys(carrerasCount).length > 0 ? Object.keys(carrerasCount) : ['Analista de Sistemas', 'Ciencia de Datos e IA'],
          datasets: [{
            data: Object.values(carrerasCount).length > 0 ? Object.values(carrerasCount) : [5, 3],
            backgroundColor: ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']
          }]
        },
        options: {
          ...defaultOptions,
          plugins: { ...defaultOptions.plugins, title: { display: true, text: 'Distribución por Carrera' } }
        }
      });
    }

    // 2. Gráfico de Modalidades (Barras Verticales)
    if (this.chartModalidadRef && this.chartModalidadRef.nativeElement) {
      if (this.chartModalidadInst) this.chartModalidadInst.destroy();

      const modalidadCount: { [key: string]: number } = { 'Presencial': 0, 'Híbrido': 0, 'Remoto': 0 };
      this.resultadosOfertas.forEach(o => {
        const mod = o.modalidad || 'Presencial';
        modalidadCount[mod] = (modalidadCount[mod] || 0) + 1;
      });

      this.chartModalidadInst = new Chart(this.chartModalidadRef.nativeElement, {
        type: 'bar',
        data: {
          labels: Object.keys(modalidadCount),
          datasets: [{
            label: 'Ofertas',
            data: Object.values(modalidadCount),
            backgroundColor: ['#10b981', '#6366f1', '#f43f5e']
          }]
        },
        options: {
          ...defaultOptions,
          plugins: { ...defaultOptions.plugins, legend: { display: false }, title: { display: true, text: 'Ofertas por Modalidad' } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
      });
    }

    // 3. Gráfico de Top Skills Demandadas (Lee REALMENTE todas las categorías cargadas en MySQL)
if (this.chartSkillsRef && this.chartSkillsRef.nativeElement) {
  if (this.chartSkillsInst) this.chartSkillsInst.destroy();

  const skillsCount: { [key: string]: number } = {};

  // Recorremos la lista real devuelta por el Backend
  this.resultadosPostulantes.forEach(p => {
    if (p.skills && typeof p.skills === 'string') {
      // Separamos por cualquier coma y quitamos espacios
      const listaSkills = p.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      
      listaSkills.forEach((skillNombre: string) => {
        skillsCount[skillNombre] = (skillsCount[skillNombre] || 0) + 1;
      });
    }
  });

  // Ordenamos de mayor a menor y tomamos las 6 más elegidas
  const skillsOrdenadas = Object.entries(skillsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const labelsReales = skillsOrdenadas.map(item => item[0]);
  const dataValoresReales = skillsOrdenadas.map(item => item[1]);

  this.chartSkillsInst = new Chart(this.chartSkillsRef.nativeElement, {
    type: 'bar',
    data: {
      labels: labelsReales, // 👈 Únicamente las etiquetas verdaderas de la BD
      datasets: [{
        label: 'Postulantes',
        data: dataValoresReales, // 👈 Únicamente el conteo real
        backgroundColor: '#0ea5e9',
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y', // Barras horizontales
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { 
          display: true, 
          text: labelsReales.length > 0 ? 'Top Skills (Desarrollo & Data)' : 'Sin Skills Registradas Aún' 
        }
      },
      scales: { 
        x: { 
          beginAtZero: true, 
          ticks: { stepSize: 1 } 
        } 
      }
    }
  });
}
    // 4. Gráfico de Empresas por Sector / Rubro
if (this.chartEstadoEmpresasRef && this.chartEstadoEmpresasRef.nativeElement) {
  if (this.chartEstadoEmpresasInst) this.chartEstadoEmpresasInst.destroy();

  const sectorCount: { [key: string]: number } = {};

  this.resultadosEmpresas.forEach(e => {
    const rubro = e.sector && e.sector.trim() !== '' ? e.sector.trim() : 'Sin Especificar';
    sectorCount[rubro] = (sectorCount[rubro] || 0) + 1;
  });

  const labelsSector = Object.keys(sectorCount);
  const dataSector = Object.values(sectorCount);

  this.chartEstadoEmpresasInst = new Chart(this.chartEstadoEmpresasRef.nativeElement, {
    type: 'pie',
    data: {
      labels: labelsSector.length > 0 ? labelsSector : ['Tecnología', 'Servicios / Consultoría', 'Finanzas', 'Sin Especificar'],
      datasets: [{
        data: dataSector.length > 0 ? dataSector : [4, 2, 1, 1],
        backgroundColor: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#64748b']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' as const, labels: { boxWidth: 10, font: { size: 11 } } },
        title: { display: true, text: 'Distribución de Empresas por Sector' }
      }
    }
  });
}
}

  buscarReportePostulantes(): void {
    this.cargando = true;
    this.adminService.getReportePostulantesSkills({ skill: this.filtroSkill, carrera: this.filtroCarrera }).subscribe({
      next: (data: any) => {
        this.resultadosPostulantes = Array.isArray(data) ? data : (data.postulantes || []);
        this.cargando = false;
        this.cdr.detectChanges();
        if (this.tipoReporte === 'graficos') this.inicializarGraficos();
      },
      error: () => this.cargando = false
    });
  }

  buscarReporteEmpresas(): void {
    this.cargando = true;
    this.adminService.getReporteEmpresasStack({ tecnologia: this.filtroStack, sector: this.filtroSector }).subscribe({
      next: (data: any) => {
        this.resultadosEmpresas = Array.isArray(data) ? data : (data.empresas || []);
        this.cargando = false;
        this.cdr.detectChanges();
        if (this.tipoReporte === 'graficos') this.inicializarGraficos();
      },
      error: () => this.cargando = false
    });
  }

  buscarReporteOfertas(): void {
    this.cargando = true;
    this.adminService.getReporteOfertas({ titulo: this.filtroTituloOferta }).subscribe({
      next: (data: any) => {
        this.resultadosOfertas = Array.isArray(data) ? data : (data.ofertas || []);
        this.cargando = false;
        this.cdr.detectChanges();
        if (this.tipoReporte === 'graficos') this.inicializarGraficos();
      },
      error: () => this.cargando = false
    });
  }

  exportarCSV(): void {
    let contenido = '';
    let nombreArchivo = 'reporte.csv';

    if (this.tipoReporte === 'postulantes') {
      contenido = 'ID,Nombre,Email,Carrera,Skills,Estado\n';
      this.resultadosPostulantes.forEach(p => {
        contenido += `"${p.id_postulante || p.id}","${p.nombres || p.nombre} ${p.apellidos || p.apellido}","${p.email}","${p.carrera || ''}","${p.skills || ''}","${p.estado || 'Activo'}"\n`;
      });
      nombreArchivo = 'reporte_postulantes_skills.csv';
    } else if (this.tipoReporte === 'empresas') {
      contenido = 'ID,Razón Social,CUIT,Email,Stack Tecnológico,Sector,Estado\n';
      this.resultadosEmpresas.forEach(e => {
        contenido += `"${e.id_empresa}","${e.razonSocial}","${e.cuit}","${e.email}","${e.stack_tecnologico || ''}","${e.sector || ''}","${e.estado}"\n`;
      });
      nombreArchivo = 'reporte_empresas_stack.csv';
    } else {
      contenido = 'ID,Título,Empresa,Modalidad,Fecha Publicación\n';
      this.resultadosOfertas.forEach(o => {
        contenido += `"${o.id_oferta}","${o.titulo}","${o.razonSocial || ''}","${o.modalidad}","${o.fecha_publicacion}"\n`;
      });
      nombreArchivo = 'reporte_ofertas_laborales.csv';
    }

    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', nombreArchivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}