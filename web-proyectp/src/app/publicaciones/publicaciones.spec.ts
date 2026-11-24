import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Publicaciones } from './publicaciones';

describe('Publicaciones', () => {
  let component: Publicaciones;
  let fixture: ComponentFixture<Publicaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Publicaciones],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(Publicaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default filter to todas', () => {
    expect(component.filtroPlataforma()).toBe('todas');
  });
});
