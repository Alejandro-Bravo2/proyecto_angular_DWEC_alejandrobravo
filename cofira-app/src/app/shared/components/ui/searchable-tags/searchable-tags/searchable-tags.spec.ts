import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { SearchableTags } from './searchable-tags';

interface Tag {
  label: string;
  value: string;
}

describe('SearchableTags', () => {
  let component: SearchableTags;
  let fixture: ComponentFixture<SearchableTags>;

  const mockTags: Tag[] = [
    { label: 'Angular', value: 'angular' },
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' },
    { label: 'TypeScript', value: 'typescript' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchableTags, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchableTags);
    component = fixture.componentInstance;
  });

  describe('Creacion del componente', () => {
    it('deberia crear el componente correctamente', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('Propiedades de entrada (@Input)', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deberia tener allTags como array vacio por defecto', () => {
      expect(component.allTags).toEqual([]);
    });

    it('deberia tener selectedTags como array vacio por defecto', () => {
      expect(component.selectedTags).toEqual([]);
    });

    it('deberia tener tagType red por defecto', () => {
      expect(component.tagType).toBe('red');
    });

    it('deberia tener placeholder Buscar... por defecto', () => {
      expect(component.placeholder).toBe('Buscar...');
    });

    it('deberia aceptar tagType yellow', () => {
      component.tagType = 'yellow';
      expect(component.tagType).toBe('yellow');
    });
  });

  describe('ngOnInit', () => {
    it('deberia inicializar filteredTags con todos los tags', () => {
      component.allTags = mockTags;
      fixture.detectChanges();

      expect(component.filteredTags.length).toBe(4);
    });

    it('deberia configurar la suscripcion al searchControl', fakeAsync(() => {
      component.allTags = mockTags;
      fixture.detectChanges();

      component.searchControl.setValue('ang');
      tick(300); // Esperar el debounceTime

      expect(component.filteredTags.length).toBe(1);
      expect(component.filteredTags[0].value).toBe('angular');
    }));

    it('deberia filtrar correctamente con debounceTime', fakeAsync(() => {
      component.allTags = mockTags;
      fixture.detectChanges();

      component.searchControl.setValue('t');
      tick(100); // No ha pasado suficiente tiempo
      expect(component.filteredTags.length).toBe(4); // Todavia no filtrado

      tick(200); // Ahora si
      expect(component.filteredTags.length).toBe(2); // TypeScript y React
    }));

    it('deberia ignorar valores null del searchControl', fakeAsync(() => {
      component.allTags = mockTags;
      fixture.detectChanges();

      component.searchControl.setValue(null);
      tick(300);

      // Deberia mantener los tags filtrados anteriores
      expect(component.filteredTags.length).toBe(4);
    }));
  });

  describe('filterTags', () => {
    beforeEach(() => {
      component.allTags = mockTags;
      component.selectedTags = [];
      fixture.detectChanges();
    });

    it('deberia filtrar por termino de busqueda', () => {
      component.filterTags('ang');

      expect(component.filteredTags.length).toBe(1);
      expect(component.filteredTags[0].label).toBe('Angular');
    });

    it('deberia ser case-insensitive', () => {
      component.filterTags('ANGULAR');

      expect(component.filteredTags.length).toBe(1);
      expect(component.filteredTags[0].label).toBe('Angular');
    });

    it('deberia excluir tags ya seleccionados', () => {
      component.selectedTags = [{ label: 'Angular', value: 'angular' }];

      component.filterTags('');

      expect(component.filteredTags.length).toBe(3);
      expect(component.filteredTags.find(t => t.value === 'angular')).toBeUndefined();
    });

    it('deberia mostrar todos los tags cuando el termino esta vacio', () => {
      component.filterTags('');

      expect(component.filteredTags.length).toBe(4);
    });

    it('deberia no mostrar resultados si no hay coincidencias', () => {
      component.filterTags('xyz');

      expect(component.filteredTags.length).toBe(0);
    });
  });

  describe('addTag', () => {
    beforeEach(() => {
      component.allTags = mockTags;
      component.selectedTags = [];
      fixture.detectChanges();
    });

    it('deberia agregar un tag a selectedTags', () => {
      const tagParaAgregar = mockTags[0];

      component.addTag(tagParaAgregar);

      expect(component.selectedTags.length).toBe(1);
      expect(component.selectedTags[0]).toEqual(tagParaAgregar);
    });

    it('deberia emitir evento tagAdded', () => {
      const tagParaAgregar = mockTags[0];
      spyOn(component.tagAdded, 'emit');

      component.addTag(tagParaAgregar);

      expect(component.tagAdded.emit).toHaveBeenCalledWith(tagParaAgregar);
    });

    it('deberia limpiar el searchControl despues de agregar', () => {
      const tagParaAgregar = mockTags[0];
      component.searchControl.setValue('angular');

      component.addTag(tagParaAgregar);

      expect(component.searchControl.value).toBe('');
    });

    it('deberia re-filtrar las sugerencias despues de agregar', () => {
      const tagParaAgregar = mockTags[0];

      component.addTag(tagParaAgregar);

      expect(component.filteredTags.find(t => t.value === tagParaAgregar.value)).toBeUndefined();
    });

    it('no deberia agregar un tag duplicado', () => {
      const tagParaAgregar = mockTags[0];
      component.selectedTags = [tagParaAgregar];
      spyOn(component.tagAdded, 'emit');

      component.addTag(tagParaAgregar);

      expect(component.selectedTags.length).toBe(1);
      expect(component.tagAdded.emit).not.toHaveBeenCalled();
    });
  });

  describe('removeTag', () => {
    beforeEach(() => {
      component.allTags = mockTags;
      component.selectedTags = [mockTags[0], mockTags[1]];
      fixture.detectChanges();
    });

    it('deberia eliminar un tag de selectedTags', () => {
      const tagParaEliminar = mockTags[0];

      component.removeTag(tagParaEliminar);

      expect(component.selectedTags.length).toBe(1);
      expect(component.selectedTags.find(t => t.value === tagParaEliminar.value)).toBeUndefined();
    });

    it('deberia emitir evento tagRemoved', () => {
      const tagParaEliminar = mockTags[0];
      spyOn(component.tagRemoved, 'emit');

      component.removeTag(tagParaEliminar);

      expect(component.tagRemoved.emit).toHaveBeenCalledWith(tagParaEliminar);
    });

    it('deberia re-filtrar las sugerencias despues de eliminar', () => {
      const tagParaEliminar = mockTags[0];

      component.removeTag(tagParaEliminar);

      expect(component.filteredTags.find(t => t.value === tagParaEliminar.value)).toBeDefined();
    });

    it('deberia usar el valor actual del searchControl al re-filtrar', () => {
      component.searchControl.setValue('ang');
      const tagParaEliminar = mockTags[0];

      component.removeTag(tagParaEliminar);

      // Solo deberia mostrar Angular porque coincide con 'ang'
      expect(component.filteredTags.some(t => t.value === 'angular')).toBe(true);
    });

    it('deberia manejar searchControl con valor null', () => {
      component.searchControl.setValue(null);
      const tagParaEliminar = mockTags[0];

      expect(() => component.removeTag(tagParaEliminar)).not.toThrow();
    });
  });

  describe('searchPlaceholder getter', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deberia devolver placeholder por defecto cuando no hay tags seleccionados', () => {
      component.selectedTags = [];

      expect(component.searchPlaceholder).toBe('Buscar...');
    });

    it('deberia devolver Añadir mas... cuando hay tags seleccionados', () => {
      component.selectedTags = [mockTags[0]];

      expect(component.searchPlaceholder).toBe('Añadir más...');
    });

    it('deberia usar placeholder personalizado cuando no hay seleccionados', () => {
      component.placeholder = 'Buscar tags...';
      component.selectedTags = [];

      expect(component.searchPlaceholder).toBe('Buscar tags...');
    });
  });

  describe('Renderizado en el DOM', () => {
    it('deberia renderizar un input de busqueda', () => {
      fixture.detectChanges();
      const inputElement = fixture.nativeElement.querySelector('input');
      expect(inputElement).toBeTruthy();
    });
  });
});
