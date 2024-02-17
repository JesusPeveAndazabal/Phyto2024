import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PressureComponent } from './pressure.component';
import { IonicModule } from '@ionic/angular';

describe('PressureComponent', () => {
  let component: PressureComponent;
  let fixture: ComponentFixture<PressureComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PressureComponent],
      imports: [IonicModule.forRoot()]
    });
    fixture = TestBed.createComponent(PressureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
