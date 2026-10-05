import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  constructor(private location: Location) {}

  volver() {
    this.location.back();
  }

  subir() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}