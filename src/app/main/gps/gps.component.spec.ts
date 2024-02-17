import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GpsComponent } from './gps.component';
import { IonicModule } from '@ionic/angular';

describe('GpsComponent', () => {
  let component: GpsComponent;
  let fixture: ComponentFixture<GpsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GpsComponent],
      imports: [IonicModule.forRoot()]
    });
    fixture = TestBed.createComponent(GpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
