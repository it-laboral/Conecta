import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './componentes/header/header';
import { Footer } from './componentes/footer/footer';
import { provideHttpClient } from '@angular/common/http';
import { AlertaService } from './services/alerta.service';
import { Alerta} from './alerta/alerta';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Alerta],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Conecta');
 // 💡 Inyectamos el servicio correctamente por constructor para activar la interceptación global
  constructor(private alertaService: AlertaService) {}
}