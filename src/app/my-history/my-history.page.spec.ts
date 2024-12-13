import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyHistoryPage } from './my-history.page';

describe('MyHistoryPage', () => {
  let component: MyHistoryPage;
  let fixture: ComponentFixture<MyHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
