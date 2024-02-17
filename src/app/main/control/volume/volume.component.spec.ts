import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumeComponent } from './volume.component';
import { IonicModule } from '@ionic/angular';

describe('VolumeComponent', () => {
  let component: VolumeComponent;
  let fixture: ComponentFixture<VolumeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VolumeComponent],
      imports: [IonicModule.forRoot()]
    });
    fixture = TestBed.createComponent(VolumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
