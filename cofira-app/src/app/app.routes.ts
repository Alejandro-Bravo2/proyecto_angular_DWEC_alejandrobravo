import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home').then(m => m.Home),
    data: { breadcrumb: 'Inicio' }
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login/login').then(m => m.Login),
    data: { breadcrumb: 'Iniciar Sesión' }
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register/register').then(m => m.Register),
    data: { breadcrumb: 'Registro' }
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password/reset-password').then(m => m.ResetPassword),
    data: { breadcrumb: 'Restablecer Contraseña' }
  },
  {
    path: 'entrenamiento',
    loadComponent: () => import('./features/training/training').then(m => m.Training),
    canActivate: [authGuard],
    data: { breadcrumb: 'Entrenamiento' }
  },
  {
    path: 'alimentacion',
    loadComponent: () => import('./features/nutrition/nutrition').then(m => m.Nutrition),
    canActivate: [authGuard],
    data: { breadcrumb: 'Alimentación' }
  },
  {
    path: 'seguimiento',
    loadComponent: () => import('./features/progress/progress').then(m => m.Progress),
    canActivate: [authGuard],
    data: { breadcrumb: 'Seguimiento' }
  },
  {
    path: 'preferencias',
    loadComponent: () => import('./features/preferences/preferences').then(m => m.Preferences),
    canActivate: [authGuard],
    data: { breadcrumb: 'Preferencias' }
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/onboarding/onboarding-container/onboarding-container').then(m => m.OnboardingContainer),
    canActivate: [authGuard], // Protect onboarding flow
    data: { breadcrumb: 'Onboarding' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'about'
      },
      {
        path: 'about',
        loadComponent: () => import('./features/onboarding/steps/about/onboarding-about/onboarding-about').then(m => m.OnboardingAbout),
        data: { breadcrumb: 'Sobre ti' }
      },
      {
        path: 'nutrition',
        loadComponent: () => import('./features/onboarding/steps/nutrition/onboarding-nutrition/onboarding-nutrition').then(m => m.OnboardingNutrition),
        data: { breadcrumb: 'Nutrición' }
      },
      {
        path: 'goal',
        loadComponent: () => import('./features/onboarding/steps/goal/onboarding-goal/onboarding-goal').then(m => m.OnboardingGoal),
        data: { breadcrumb: 'Objetivo' }
      },
      {
        path: 'pricing',
        loadComponent: () => import('./features/onboarding/steps/pricing/onboarding-pricing/onboarding-pricing').then(m => m.OnboardingPricing),
        data: { breadcrumb: 'Precios' }
      },
      {
        path: 'muscles',
        loadComponent: () => import('./features/onboarding/steps/muscles/onboarding-muscles/onboarding-muscles').then(m => m.OnboardingMuscles),
        data: { breadcrumb: 'Músculos' }
      },
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found').then(m => m.NotFound),
    data: { breadcrumb: 'Página no encontrada' }
  }
];