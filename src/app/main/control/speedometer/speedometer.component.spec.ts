import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeedometerComponent } from './speedometer.component';
import { IonicModule } from '@ionic/angular';

describe('SpeedometerComponent', () => {
  let component: SpeedometerComponent;
  let fixture: ComponentFixture<SpeedometerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpeedometerComponent],
      imports: [IonicModule.forRoot()]
    });
    fixture = TestBed.createComponent(SpeedometerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
