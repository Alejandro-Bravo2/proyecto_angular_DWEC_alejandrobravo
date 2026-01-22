import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService, User } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  // Mock de AuthResponse según la interfaz real del backend
  const mockAuthResponse = {
    token: 'mock-jwt-token',
    type: 'Bearer',
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    rol: 'USER',
    isOnboarded: false,
  };

  const mockUsuario: User = {
    id: '1',
    email: 'test@example.com',
    name: 'testuser',
    isOnboarded: false,
  };

  const mockUsuarioConOnboarding: User = {
    id: '1',
    email: 'test@example.com',
    name: 'testuser',
    isOnboarded: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor - loadUserFromStorage', () => {
    beforeEach(() => {
      // Reiniciar TestBed para cada test del constructor
      TestBed.resetTestingModule();
    });

    it('debería cargar usuario desde localStorage si existe token y usuario válido', () => {
      // Preparar localStorage antes de crear el servicio
      localStorage.clear();
      localStorage.setItem('authToken', 'token-existente');
      localStorage.setItem('currentUser', JSON.stringify(mockUsuario));

      // Crear nuevo TestBed para disparar el constructor con inyección
      TestBed.configureTestingModule({
        providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
      });
      const nuevoServicio = TestBed.inject(AuthService);

      expect(nuevoServicio.currentUser()).toEqual(mockUsuario);
      expect(nuevoServicio.isAuthenticated()).toBe(true);
    });

    it('debería limpiar storage si el JSON del usuario está corrupto', () => {
      localStorage.clear();
      localStorage.setItem('authToken', 'token-existente');
      localStorage.setItem('currentUser', 'json-invalido{malformado}');

      TestBed.configureTestingModule({
        providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
      });
      const nuevoServicio = TestBed.inject(AuthService);

      expect(nuevoServicio.currentUser()).toBeNull();
      expect(nuevoServicio.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('no debería cargar usuario si no existe token', () => {
      localStorage.clear();
      localStorage.setItem('currentUser', JSON.stringify(mockUsuario));
      // No hay token

      TestBed.configureTestingModule({
        providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
      });
      const nuevoServicio = TestBed.inject(AuthService);

      expect(nuevoServicio.currentUser()).toBeNull();
      expect(nuevoServicio.isAuthenticated()).toBe(false);
    });

    it('no debería cargar usuario si no existe usuario en storage', () => {
      localStorage.clear();
      localStorage.setItem('authToken', 'token-existente');
      // No hay usuario

      TestBed.configureTestingModule({
        providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
      });
      const nuevoServicio = TestBed.inject(AuthService);

      expect(nuevoServicio.currentUser()).toBeNull();
      expect(nuevoServicio.isAuthenticated()).toBe(false);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', (done) => {
      service.register('Test User', 'testuser', 'test@example.com', 'password123').subscribe({
        next: (response) => {
          expect(response.token).toBe('mock-jwt-token');
          expect(response.email).toBe('test@example.com');
          expect(localStorage.getItem('authToken')).toBe('mock-jwt-token');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        nombre: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
      req.flush(mockAuthResponse);
    });

    it('should handle registration error', (done) => {
      service.register('Test User', 'testuser', 'test@example.com', 'password123').subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      req.flush({ message: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('login', () => {
    it('should login user successfully', (done) => {
      service.login('testuser', 'password123').subscribe({
        next: (response) => {
          expect(response.token).toBe('mock-jwt-token');
          expect(response.email).toBe('test@example.com');
          expect(localStorage.getItem('authToken')).toBe('mock-jwt-token');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        username: 'testuser',
        password: 'password123',
      });
      req.flush(mockAuthResponse);
    });

    it('should handle login with wrong password', (done) => {
      service.login('testuser', 'wrongpassword').subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle login with non-existent user', (done) => {
      service.login('nonexistent', 'password123').subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'User not found' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should clear token and user data', (done) => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('currentUser', JSON.stringify({ id: 1, name: 'Test' }));

      service.logout().subscribe(() => {
        expect(localStorage.getItem('authToken')).toBeNull();
        expect(localStorage.getItem('currentUser')).toBeNull();
        expect(service.isLoggedIn()).toBe(false);
        expect(service.currentUser()).toBeNull();
        expect(service.isAuthenticated()).toBe(false);
        done();
      });
    });

    it('debería retornar observable con null', (done) => {
      service.logout().subscribe((resultado) => {
        expect(resultado).toBeNull();
        done();
      });
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('authToken', 'mock-token');
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      const token = 'mock-jwt-token';
      localStorage.setItem('authToken', token);
      expect(service.getToken()).toBe(token);
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('saveToken', () => {
    it('should save token to localStorage', () => {
      service.saveToken('test-token');
      expect(localStorage.getItem('authToken')).toBe('test-token');
    });
  });

  describe('needsOnboarding', () => {
    it('debería retornar true si usuario existe y no ha completado onboarding', () => {
      service.currentUser.set(mockUsuario);

      const resultado = service.needsOnboarding();

      expect(resultado).toBe(true);
    });

    it('debería retornar false si usuario ya completó onboarding', () => {
      service.currentUser.set(mockUsuarioConOnboarding);

      const resultado = service.needsOnboarding();

      expect(resultado).toBe(false);
    });

    it('debería retornar false si no hay usuario autenticado', () => {
      service.currentUser.set(null);

      const resultado = service.needsOnboarding();

      expect(resultado).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('debería obtener usuario actual desde el backend', (done) => {
      const mockRespuestaUsuario = { user: mockUsuarioConOnboarding };

      service.getCurrentUser().subscribe((respuesta) => {
        expect(respuesta).toEqual(mockRespuestaUsuario);
        expect(service.currentUser()).toEqual(mockUsuarioConOnboarding);
        expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(mockUsuarioConOnboarding));
        done();
      });

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/profile`);
      expect(peticion.request.method).toBe('GET');
      peticion.flush(mockRespuestaUsuario);
    });

    it('debería manejar error al obtener usuario', (done) => {
      service.getCurrentUser().subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        },
      });

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/profile`);
      peticion.flush({ message: 'No autorizado' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('refreshToken', () => {
    it('debería refrescar token y guardarlo en localStorage', (done) => {
      const nuevoToken = 'nuevo-token-jwt';
      const mockRespuesta = { token: nuevoToken };

      service.refreshToken().subscribe((respuesta) => {
        expect(respuesta.token).toBe(nuevoToken);
        expect(localStorage.getItem('authToken')).toBe(nuevoToken);
        done();
      });

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      expect(peticion.request.method).toBe('POST');
      expect(peticion.request.body).toEqual({});
      peticion.flush(mockRespuesta);
    });

    it('debería manejar error al refrescar token', (done) => {
      service.refreshToken().subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        },
      });

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      peticion.flush({ message: 'Token expirado' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('requestPasswordResetCode', () => {
    it('debería solicitar código de reseteo de contraseña', (done) => {
      const email = 'test@example.com';
      const mockRespuesta = { message: 'Código enviado al email' };

      service.requestPasswordResetCode(email).subscribe((respuesta) => {
        expect(respuesta.message).toBe('Código enviado al email');
        done();
      });

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/forgot-password`);
      expect(peticion.request.method).toBe('POST');
      expect(peticion.request.body).toEqual({ email });
      peticion.flush(mockRespuesta);
    });

    it('debería manejar error si el email no existe', (done) => {
      service.requestPasswordResetCode('noexiste@example.com').subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/forgot-password`);
      peticion.flush({ message: 'Email no encontrado' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('resetPasswordWithCode', () => {
    it('debería resetear contraseña con código válido', (done) => {
      const email = 'test@example.com';
      const codigo = '123456';
      const nuevaPassword = 'nuevaPassword123';
      const mockRespuesta = { message: 'Contraseña actualizada exitosamente' };

      service.resetPasswordWithCode(email, codigo, nuevaPassword).subscribe((respuesta) => {
        expect(respuesta.message).toBe('Contraseña actualizada exitosamente');
        done();
      });

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/reset-password`);
      expect(peticion.request.method).toBe('POST');
      expect(peticion.request.body).toEqual({
        email,
        code: codigo,
        newPassword: nuevaPassword,
      });
      peticion.flush(mockRespuesta);
    });

    it('debería manejar error con código inválido', (done) => {
      service.resetPasswordWithCode('test@example.com', 'codigo-invalido', 'nueva123').subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/reset-password`);
      peticion.flush({ message: 'Código inválido o expirado' }, { status: 400, statusText: 'Bad Request' });
    });

    it('debería manejar error con código expirado', (done) => {
      service.resetPasswordWithCode('test@example.com', '123456', 'nueva123').subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/reset-password`);
      peticion.flush({ message: 'El código ha expirado' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('completeOnboarding', () => {
    const mockOnboardingRequest = {
      gender: 'MALE' as const,
      birthDate: '1990-01-01',
      heightCm: 180,
      currentWeightKg: 80,
      targetWeightKg: 75,
      activityLevel: 'MODERATELY_ACTIVE' as const,
      workType: 'OFFICE_DESK' as const,
      sleepHoursAverage: 8,
      primaryGoal: 'LOSE_WEIGHT' as const,
      fitnessLevel: 'INTERMEDIATE',
      trainingDaysPerWeek: 4,
      sessionDurationMinutes: 60,
      preferredTrainingTime: 'MORNING',
      dietType: 'BALANCED',
      mealsPerDay: 4,
      allergies: ['lactosa'],
      injuries: [],
      equipment: ['mancuernas'],
      medicalConditions: [],
      medications: 'ninguna',
      previousSurgeries: [],
      isPregnant: false,
      isBreastfeeding: false,
    };

    const mockOnboardingResponse = {
      userId: 1,
      message: 'Onboarding completado exitosamente',
      isOnboarded: true,
      onboardingCompletedAt: '2024-01-01T00:00:00Z',
      nutritionTargets: {
        calculatedBMR: 1800,
        calculatedTDEE: 2500,
        dailyCalories: 2200,
        proteinGrams: 150,
        carbsGrams: 250,
        fatGrams: 70,
        fiberGrams: 30,
      },
    };

    it('debería completar onboarding y actualizar usuario local', async () => {
      service.currentUser.set(mockUsuario);

      const promesa = service.completeOnboarding(mockOnboardingRequest);

      const peticion = httpMock.expectOne(`${environment.apiUrl}/onboarding/complete`);
      expect(peticion.request.method).toBe('POST');
      expect(peticion.request.body).toEqual(mockOnboardingRequest);
      peticion.flush(mockOnboardingResponse);

      const respuesta = await promesa;

      expect(respuesta).toEqual(mockOnboardingResponse);
      expect(service.currentUser()?.isOnboarded).toBe(true);
      const usuarioGuardado = JSON.parse(localStorage.getItem('currentUser') || '');
      expect(usuarioGuardado.isOnboarded).toBe(true);
    });

    it('no debería actualizar usuario si no hay usuario actual', async () => {
      service.currentUser.set(null);

      const promesa = service.completeOnboarding(mockOnboardingRequest);

      const peticion = httpMock.expectOne(`${environment.apiUrl}/onboarding/complete`);
      peticion.flush(mockOnboardingResponse);

      const respuesta = await promesa;

      expect(respuesta).toEqual(mockOnboardingResponse);
      expect(service.currentUser()).toBeNull();
    });

    it('no debería actualizar usuario si isOnboarded es false en respuesta', async () => {
      service.currentUser.set(mockUsuario);
      const respuestaIncompleta = { ...mockOnboardingResponse, isOnboarded: false };

      const promesa = service.completeOnboarding(mockOnboardingRequest);

      const peticion = httpMock.expectOne(`${environment.apiUrl}/onboarding/complete`);
      peticion.flush(respuestaIncompleta);

      const respuesta = await promesa;

      expect(respuesta).toEqual(respuestaIncompleta);
      expect(service.currentUser()?.isOnboarded).toBe(false);
    });

    it('debería manejar error al completar onboarding', async () => {
      const promesa = service.completeOnboarding(mockOnboardingRequest);

      const peticion = httpMock.expectOne(`${environment.apiUrl}/onboarding/complete`);
      peticion.flush(
        { message: 'Datos inválidos' },
        { status: 400, statusText: 'Bad Request' }
      );

      await expectAsync(promesa).toBeRejected();
    });
  });

  describe('registerWithOnboarding', () => {
    const mockRegistroConOnboarding = {
      nombre: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      gender: 'MALE',
      birthDate: '1990-01-01',
      heightCm: 180,
      currentWeightKg: 80,
      targetWeightKg: 75,
      activityLevel: 'MODERATELY_ACTIVE',
      workType: 'OFFICE_DESK',
      sleepHoursAverage: 8,
      primaryGoal: 'LOSE_WEIGHT',
      fitnessLevel: 'INTERMEDIATE',
      trainingDaysPerWeek: 4,
      sessionDurationMinutes: 60,
      preferredTrainingTime: 'MORNING',
      dietType: 'BALANCED',
      mealsPerDay: 4,
      allergies: ['lactosa'],
      injuries: [],
      equipment: ['mancuernas'],
      medicalConditions: [],
      medications: null,
      previousSurgeries: [],
      isPregnant: false,
      isBreastfeeding: false,
    };

    const mockRespuestaConOnboarding = {
      ...mockAuthResponse,
      isOnboarded: true,
    };

    it('debería registrar usuario con onboarding completo', async () => {
      const promesa = service.registerWithOnboarding(mockRegistroConOnboarding);

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/register-with-onboarding`);
      expect(peticion.request.method).toBe('POST');
      expect(peticion.request.body).toEqual(mockRegistroConOnboarding);
      peticion.flush(mockRespuestaConOnboarding);

      const respuesta = await promesa;

      expect(respuesta).toEqual(mockRespuestaConOnboarding);
      expect(localStorage.getItem('authToken')).toBe(mockRespuestaConOnboarding.token);
      expect(service.currentUser()?.isOnboarded).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('debería guardar usuario en localStorage con isOnboarded true', async () => {
      const promesa = service.registerWithOnboarding(mockRegistroConOnboarding);

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/register-with-onboarding`);
      peticion.flush(mockRespuestaConOnboarding);

      await promesa;

      const usuarioGuardado = JSON.parse(localStorage.getItem('currentUser') || '');
      expect(usuarioGuardado.isOnboarded).toBe(true);
      expect(usuarioGuardado.id).toBe('1');
      expect(usuarioGuardado.email).toBe('test@example.com');
      expect(usuarioGuardado.name).toBe('testuser');
    });

    it('debería manejar error al registrar con onboarding', async () => {
      const promesa = service.registerWithOnboarding(mockRegistroConOnboarding);

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/register-with-onboarding`);
      peticion.flush(
        { message: 'Email ya existe' },
        { status: 400, statusText: 'Bad Request' }
      );

      await expectAsync(promesa).toBeRejected();
    });
  });

  describe('login - actualización de señales reactivas', () => {
    it('debería actualizar currentUser signal después de login exitoso', (done) => {
      // Limpiar estado previo
      service.logout().subscribe();
      expect(service.currentUser()).toBeNull();

      service.login('testuser', 'password123').subscribe(() => {
        const usuarioActual = service.currentUser();
        expect(usuarioActual).not.toBeNull();
        expect(usuarioActual?.email).toBe('test@example.com');
        expect(usuarioActual?.name).toBe('testuser');
        expect(usuarioActual?.id).toBe('1');
        done();
      });

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      peticion.flush(mockAuthResponse);
    });

    it('debería actualizar isAuthenticated signal después de login', (done) => {
      // Limpiar estado previo
      service.logout().subscribe();
      expect(service.isAuthenticated()).toBe(false);

      service.login('testuser', 'password123').subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
        done();
      });

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      peticion.flush(mockAuthResponse);
    });
  });

  describe('register - actualización de señales reactivas', () => {
    it('debería actualizar currentUser signal después de registro exitoso', (done) => {
      // Limpiar estado previo
      service.logout().subscribe();
      expect(service.currentUser()).toBeNull();

      service.register('Test User', 'testuser', 'test@example.com', 'password123').subscribe(() => {
        const usuarioActual = service.currentUser();
        expect(usuarioActual).not.toBeNull();
        expect(usuarioActual?.email).toBe('test@example.com');
        done();
      });

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      peticion.flush(mockAuthResponse);
    });

    it('debería actualizar isAuthenticated signal después de registro', (done) => {
      // Limpiar estado previo
      service.logout().subscribe();
      expect(service.isAuthenticated()).toBe(false);

      service.register('Test User', 'testuser', 'test@example.com', 'password123').subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
        done();
      });

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      peticion.flush(mockAuthResponse);
    });
  });

  describe('mapResponseToUser - prueba indirecta vía login/register', () => {
    it('debería mapear isOnboarded correctamente cuando es true', (done) => {
      const respuestaConOnboarding = { ...mockAuthResponse, isOnboarded: true };

      service.login('testuser', 'password123').subscribe(() => {
        expect(service.currentUser()?.isOnboarded).toBe(true);
        done();
      });

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      peticion.flush(respuestaConOnboarding);
    });

    it('debería mapear isOnboarded correctamente cuando es false', (done) => {
      service.login('testuser', 'password123').subscribe(() => {
        expect(service.currentUser()?.isOnboarded).toBe(false);
        done();
      });

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      peticion.flush(mockAuthResponse);
    });

    it('debería mapear isOnboarded a false cuando no viene en la respuesta', (done) => {
      const respuestaSinOnboarding = { ...mockAuthResponse };
      delete (respuestaSinOnboarding as any).isOnboarded;

      service.login('testuser', 'password123').subscribe(() => {
        expect(service.currentUser()?.isOnboarded).toBe(false);
        done();
      });

      const peticion = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      peticion.flush(respuestaSinOnboarding);
    });
  });
});
