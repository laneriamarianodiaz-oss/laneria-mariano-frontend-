import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCarritoComponent } from './detalle-carrito.component';

describe('DetalleCarritoComponent', () => {
  let component: DetalleCarritoComponent;
  let fixture: ComponentFixture<DetalleCarritoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCarritoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleCarritoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
