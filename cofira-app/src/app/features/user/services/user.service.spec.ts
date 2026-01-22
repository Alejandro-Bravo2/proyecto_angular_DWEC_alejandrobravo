import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  UserService,
  UsuarioDetalleDTO,
  UsuarioListadoDTO,
  PageResponse,
  CrearUsuarioDTO,
  ModificarUsuarioDTO,
} from './user.service';
import { LoadingService } from '../../../core/services/loading.service';
import { environment } from '../../../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const apiUrl = environment.apiUrl;

  const mockUsuarioDetalle: UsuarioDetalleDTO = {
    id: 1,
    nombre: 'Juan Perez',
    username: 'juanperez',
    email: 'juan@example.com',
    rol: 'USER',
    edad: 30,
    peso: 75,
    altura: 175,
    alimentosFavoritos: ['Pollo', 'Arroz'],
    alergias: ['Mariscos'],
  };

  const mockPageResponse: PageResponse<UsuarioListadoDTO> = {
    content: [
      { id: 1, nombre: 'Juan Perez', email: 'juan@example.com', rol: 'USER' },
      { id: 2, nombre: 'Maria Garcia', email: 'maria@example.com', rol: 'USER' },
    ],
    totalElements: 2,
    totalPages: 1,
    size: 10,
    number: 0,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        LoadingService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listarUsuarios', () => {
    it('should fetch users with pagination', (done) => {
      service.listarUsuarios().subscribe((response) => {
        expect(response).toEqual(mockPageResponse);
        expect(response.content.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne((r) => r.url.includes(`${apiUrl}/usuarios`));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      req.flush(mockPageResponse);
    });

    it('should include nombre filter when provided', (done) => {
      service.listarUsuarios('Juan', 0, 10).subscribe((response) => {
        expect(response).toEqual(mockPageResponse);
        done();
      });

      const req = httpMock.expectOne((r) => r.url.includes(`${apiUrl}/usuarios`));
      expect(req.request.params.get('nombre')).toBe('Juan');
      req.flush(mockPageResponse);
    });

    it('should use custom page and size', (done) => {
      service.listarUsuarios(undefined, 2, 25).subscribe((response) => {
        expect(response).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne((r) => r.url.includes(`${apiUrl}/usuarios`));
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('size')).toBe('25');
      req.flush(mockPageResponse);
    });
  });

  describe('obtenerUsuario', () => {
    it('should fetch user by ID', (done) => {
      service.obtenerUsuario(1).subscribe((usuario) => {
        expect(usuario).toEqual(mockUsuarioDetalle);
        expect(usuario.nombre).toBe('Juan Perez');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/usuarios/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsuarioDetalle);
    });
  });

  describe('obtenerUsuarioPorEmail', () => {
    it('should fetch user by email', (done) => {
      service.obtenerUsuarioPorEmail('juan@example.com').subscribe((usuario) => {
        expect(usuario).toEqual(mockUsuarioDetalle);
        done();
      });

      const req = httpMock.expectOne((r) => r.url.includes(`${apiUrl}/usuarios/email`));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('email')).toBe('juan@example.com');
      req.flush(mockUsuarioDetalle);
    });
  });

  describe('crearUsuario', () => {
    it('should create a new user', (done) => {
      const nuevoUsuario: CrearUsuarioDTO = {
        nombre: 'Nuevo Usuario',
        username: 'nuevousuario',
        email: 'nuevo@example.com',
        password: 'password123',
      };

      service.crearUsuario(nuevoUsuario).subscribe((usuario) => {
        expect(usuario.nombre).toBe('Nuevo Usuario');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/usuarios`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevoUsuario);
      req.flush({ ...mockUsuarioDetalle, nombre: 'Nuevo Usuario' });
    });
  });

  describe('actualizarUsuario', () => {
    it('should update an existing user', (done) => {
      const datosActualizados: ModificarUsuarioDTO = {
        nombre: 'Juan Actualizado',
        peso: 80,
      };

      service.actualizarUsuario(1, datosActualizados).subscribe((usuario) => {
        expect(usuario.nombre).toBe('Juan Actualizado');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/usuarios/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(datosActualizados);
      req.flush({ ...mockUsuarioDetalle, nombre: 'Juan Actualizado' });
    });
  });

  describe('eliminarUsuario', () => {
    it('should delete a user', (done) => {
      service.eliminarUsuario(1).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/usuarios/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Legacy methods', () => {
    it('should get user by ID (legacy)', (done) => {
      service.getUserById('123').subscribe((user) => {
        expect(user.name).toBe('Legacy User');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/users/123`);
      expect(req.request.method).toBe('GET');
      req.flush({ id: '123', name: 'Legacy User', email: 'legacy@example.com' });
    });

    it('should update user (legacy)', (done) => {
      service.updateUser('123', { name: 'Updated Name' }).subscribe((user) => {
        expect(user.name).toBe('Updated Name');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/users/123`);
      expect(req.request.method).toBe('PUT');
      req.flush({ id: '123', name: 'Updated Name', email: 'legacy@example.com' });
    });

    it('should delete user (legacy)', (done) => {
      service.deleteUser('123').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/users/123`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });


  describe('Casos especiales y edge cases', () => {
    it('deberia manejar pagina vacia correctamente', (done) => {
      const paginaVacia: PageResponse<UsuarioListadoDTO> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
      };

      service.listarUsuarios().subscribe((response) => {
        expect(response.content.length).toBe(0);
        expect(response.totalElements).toBe(0);
        done();
      });

      const req = httpMock.expectOne((r) => r.url.includes(`${apiUrl}/usuarios`));
      req.flush(paginaVacia);
    });

    it('deberia manejar usuario sin datos opcionales', (done) => {
      const usuarioMinimo: UsuarioDetalleDTO = {
        id: 1,
        nombre: 'Usuario Minimo',
        username: 'minimo',
        email: 'minimo@example.com',
        rol: 'USER',
        edad: 0,
        peso: 0,
        altura: 0,
        alimentosFavoritos: [],
        alergias: [],
      };

      service.obtenerUsuario(1).subscribe((usuario) => {
        expect(usuario.alimentosFavoritos.length).toBe(0);
        expect(usuario.alergias.length).toBe(0);
        expect(usuario.rutinaAlimentacion).toBeUndefined();
        expect(usuario.rutinaEjercicio).toBeUndefined();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/usuarios/1`);
      req.flush(usuarioMinimo);
    });

    it('deberia manejar usuario con todas las propiedades opcionales', (done) => {
      const usuarioCompleto: UsuarioDetalleDTO = {
        id: 1,
        nombre: 'Usuario Completo',
        username: 'completo',
        email: 'completo@example.com',
        rol: 'ADMIN',
        edad: 35,
        peso: 80,
        altura: 180,
        alimentosFavoritos: ['Pollo', 'Arroz', 'Brocoli'],
        alergias: ['Mariscos', 'Frutos secos'],
        rutinaAlimentacion: {
          id: 1,
          fechaInicio: '2024-01-01',
          diasAlimentacion: [
            {
              id: 1,
              diaSemana: 'LUNES',
              desayuno: { id: 1, alimentos: ['Avena', 'Platano'] },
              almuerzo: null,
              comida: { id: 2, alimentos: ['Pollo', 'Arroz'] },
              merienda: null,
              cena: { id: 3, alimentos: ['Pescado', 'Ensalada'] },
            },
          ],
        },
        rutinaEjercicio: {
          id: 1,
          fechaInicio: '2024-01-01',
          diasEjercicio: [
            {
              id: 1,
              diaSemana: 'LUNES',
              ejercicios: [
                {
                  id: 1,
                  nombreEjercicio: 'Press Banca',
                  series: 4,
                  repeticiones: 10,
                  tiempoDescansoSegundos: 90,
                  descripcion: 'Ejercicio de pecho',
                  grupoMuscular: 'Pecho',
                },
              ],
            },
          ],
        },
      };

      service.obtenerUsuario(1).subscribe((usuario) => {
        expect(usuario.rutinaAlimentacion).toBeDefined();
        expect(usuario.rutinaEjercicio).toBeDefined();
        expect(usuario.alimentosFavoritos.length).toBe(3);
        expect(usuario.alergias.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/usuarios/1`);
      req.flush(usuarioCompleto);
    });

    it('deberia permitir actualizar solo un campo', (done) => {
      const actualizacionParcial: ModificarUsuarioDTO = {
        peso: 82,
      };

      service.actualizarUsuario(1, actualizacionParcial).subscribe((usuario) => {
        expect(usuario).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/usuarios/1`);
      expect(req.request.body).toEqual({ peso: 82 });
      req.flush({ ...mockUsuarioDetalle, peso: 82 });
    });

    it('deberia manejar filtro con caracteres especiales', (done) => {
      service.listarUsuarios('José María', 0, 10).subscribe((response) => {
        expect(response).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne((r) => r.url.includes(`${apiUrl}/usuarios`));
      expect(req.request.params.get('nombre')).toBe('José María');
      req.flush(mockPageResponse);
    });

    it('deberia manejar paginacion con valores maximos', (done) => {
      service.listarUsuarios(undefined, 999, 100).subscribe((response) => {
        expect(response).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne((r) => r.url.includes(`${apiUrl}/usuarios`));
      expect(req.request.params.get('page')).toBe('999');
      expect(req.request.params.get('size')).toBe('100');
      req.flush(mockPageResponse);
    });
  });

  describe('Integracion con BaseHttpService', () => {
    it('deberia extender BaseHttpService correctamente', () => {
      expect(service).toBeInstanceOf(UserService);
    });

    it('deberia tener acceso a los metodos HTTP de BaseHttpService', () => {
      expect(typeof service['get']).toBe('function');
      expect(typeof service['post']).toBe('function');
      expect(typeof service['put']).toBe('function');
      expect(typeof service['delete']).toBe('function');
    });
  });

  describe('Validacion de DTOs', () => {
    it('deberia crear usuario con todas las propiedades opcionales', (done) => {
      const usuarioCompleto: CrearUsuarioDTO = {
        nombre: 'Usuario Completo',
        username: 'completo',
        email: 'completo@example.com',
        password: 'Password123!',
        edad: 30,
        peso: 75,
        altura: 175,
        alimentosFavoritos: ['Pollo', 'Arroz'],
        alergias: ['Mariscos'],
      };

      service.crearUsuario(usuarioCompleto).subscribe((usuario) => {
        expect(usuario.edad).toBe(30);
        expect(usuario.peso).toBe(75);
        expect(usuario.altura).toBe(175);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/usuarios`);
      req.flush({ ...mockUsuarioDetalle, ...usuarioCompleto, id: 2 });
    });

    it('deberia crear usuario solo con campos requeridos', (done) => {
      const usuarioMinimo: CrearUsuarioDTO = {
        nombre: 'Usuario Minimo',
        username: 'minimo',
        email: 'minimo@example.com',
        password: 'Password123!',
      };

      service.crearUsuario(usuarioMinimo).subscribe((usuario) => {
        expect(usuario.nombre).toBe('Usuario Minimo');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/usuarios`);
      req.flush({ ...mockUsuarioDetalle, nombre: 'Usuario Minimo' });
    });

    it('deberia actualizar usuario con DTO vacio', (done) => {
      const dtoVacio: ModificarUsuarioDTO = {};

      service.actualizarUsuario(1, dtoVacio).subscribe((usuario) => {
        expect(usuario).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/usuarios/1`);
      expect(req.request.body).toEqual({});
      req.flush(mockUsuarioDetalle);
    });
  });

  describe('Comportamiento del servicio', () => {
    it('deberia ser un servicio singleton', () => {
      const service1 = TestBed.inject(UserService);
      const service2 = TestBed.inject(UserService);

      expect(service1).toBe(service2);
    });

    it('deberia tener la URL de API configurada correctamente', () => {
      expect(service['API_URL']).toBe('usuarios');
    });
  });
});
