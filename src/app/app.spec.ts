import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { User } from './models/user';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [ provideHttpClientTesting() ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Searchable Table');
  });

  it('should render searchable table displays', async () => {
    const httpTestingController = TestBed.inject(HttpTestingController);
    
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const mockUsers: User[] = [
      {
        id: 1,
        name: 'Test User',
        username: 'testuser123',
        email: 'test@user.com',
        address: {
          street: '123 Test St',
          suite: 'Apt. 556',
          city: 'Testville',
          zipcode: '12345',
          geo: {
            lat: '0.0000',
            lng: '0.0000',
          }
        },
        phone: '123-456-7890',
        website: 'testuser.com',
        company: {
          name: 'Test Company',
          catchPhrase: 'Testing made easy',
          bs: 'test the world',
        }
      },
    ];
    httpTestingController.expectOne('https://jsonplaceholder.typicode.com/users').flush(mockUsers);
    await fixture.whenStable();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('sd-searchable-display').length).toBe(2);
    expect(compiled.querySelector('sd-searchable-display')?.textContent).toContain('Test User');
    expect(compiled.querySelector('sd-searchable-display')?.textContent).toContain('123 Test St');
    expect(compiled.querySelectorAll('sd-searchable-display')[1].textContent).toContain('1Test User');
  });
});
