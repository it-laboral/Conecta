import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AlertaConfig {
  alert: string;
  visible: boolean;
  esConfirmacion?: boolean;
  callback?: (aceptado: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  private estadoAlerta = new BehaviorSubject<AlertaConfig>({ alert: '', visible: false });
  alerta$ = this.estadoAlerta.asObservable();

  constructor() {
    // 🪄 TRUCO: Sobrescribimos el alert() nativo del navegador (¡Intacto!)
    window.alert = (mensaje: any) => {
      this.mostrar(String(mensaje));
    };
  }

  mostrar(mensaje: string): void {
    this.estadoAlerta.next({ alert: mensaje, visible: true, esConfirmacion: false });
  }

  mostrarMensaje(mensaje: string): void {
    this.mostrar(mensaje);
  }

  ocultar(): void {
    this.estadoAlerta.next({ alert: '', visible: false, esConfirmacion: false });
  }

  // ==========================================
  // 👇 MÉTODOS NUEVOS AGREGADOS ABAJO (PARA CONFIRMACIONES)
  // ==========================================

  confirmar(mensaje: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.estadoAlerta.next({
        alert: mensaje,
        visible: true,
        esConfirmacion: true,
        callback: (aceptado) => resolve(aceptado)
      });
    });
  }

  responder(aceptado: boolean): void {
    const estadoActual = this.estadoAlerta.value;
    if (estadoActual.callback) {
      estadoActual.callback(aceptado);
    }
    this.ocultar();
  }
}