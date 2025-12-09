import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';
import { LoadingSpinner } from './shared/components/spinner/loading-spinner/loading-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, LoadingSpinner],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  title = 'COFIRA';
}
