import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home').then(m => m.Home),
  },
  {
    path: 'entrenamiento',
    loadComponent: () => import('./features/training/training').then(m => m.Training),
  },
  {
    path: 'alimentacion',
    loadComponent: () => import('./features/nutrition/nutrition').then(m => m.Nutrition),
  },
  {
    path: 'seguimiento',
    loadComponent: () => import('./features/progress/progress').then(m => m.Progress),
  },
  {
    path: 'preferencias',
    loadComponent: () => import('./features/preferences/preferences').then(m => m.Preferences),
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/onboarding/onboarding-container/onboarding-container').then(m => m.OnboardingContainer),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'about'
      },
      {
        path: 'about',
        loadComponent: () => import('./features/onboarding/steps/about/onboarding-about/onboarding-about').then(m => m.OnboardingAbout)
      },
      {
        path: 'nutrition',
        loadComponent: () => import('./features/onboarding/steps/nutrition/onboarding-nutrition/onboarding-nutrition').then(m => m.OnboardingNutrition)
      },
      {
        path: 'goal',
        loadComponent: () => import('./features/onboarding/steps/goal/onboarding-goal/onboarding-goal').then(m => m.OnboardingGoal)
      },
      {
        path: 'pricing',
        loadComponent: () => import('./features/onboarding/steps/pricing/onboarding-pricing/onboarding-pricing').then(m => m.OnboardingPricing)
      },
      {
        path: 'muscles',
        loadComponent: () => import('./features/onboarding/steps/muscles/onboarding-muscles/onboarding-muscles').then(m => m.OnboardingMuscles)
      },
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found').then(m => m.NotFound),
  }
];