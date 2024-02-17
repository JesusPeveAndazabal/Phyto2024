import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationValuesComponent } from './application-values.component';
import { IonicModule } from '@ionic/angular';

describe('ApplicationValuesComponent', () => {
  let component: ApplicationValuesComponent;
  let fixture: ComponentFixture<ApplicationValuesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationValuesComponent],
      imports: [IonicModule.forRoot()]
    });
    fixture = TestBed.createComponent(ApplicationValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
