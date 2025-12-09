import { Component } from '@angular/core';
import { HeroSection } from './components/hero-section/hero-section';
import { PricingPlans } from './components/pricing-plans/pricing-plans';
import { NewsletterForm } from './components/newsletter-form/newsletter-form';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroSection, PricingPlans, NewsletterForm],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

}
