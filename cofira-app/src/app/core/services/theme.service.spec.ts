import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    localStorage.clear(); // Clear local storage before each test
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize theme from localStorage if available', () => {
    localStorage.setItem('cofira-theme', 'dark');
    service = TestBed.inject(ThemeService); // Re-inject to pick up localStorage
    expect(service.currentTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should initialize theme from system preference if no localStorage', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList); // Simulate dark preference
    service = TestBed.inject(ThemeService); // Re-inject
    expect(service.currentTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    localStorage.clear();

    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList); // Simulate light preference
    service = TestBed.inject(ThemeService); // Re-inject
    expect(service.currentTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should set the theme correctly', () => {
    service.setTheme('dark');
    expect(service.currentTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('cofira-theme')).toBe('dark');

    service.setTheme('light');
    expect(service.currentTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('cofira-theme')).toBe('light');
  });

  it('should toggle the theme correctly', () => {
    // Start with light theme
    service.setTheme('light');
    service.toggleTheme();
    expect(service.currentTheme()).toBe('dark');

    service.toggleTheme();
    expect(service.currentTheme()).toBe('light');
  });

  it('should correctly report if theme is dark', () => {
    service.setTheme('dark');
    expect(service.isDark()).toBeTrue();
    service.setTheme('light');
    expect(service.isDark()).toBeFalse();
  });
});
