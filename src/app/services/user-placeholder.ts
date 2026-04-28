import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { User, UserData } from '../models/user';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserPlaceholderService {
  private readonly http = inject(HttpClient);
  private readonly refreshTrigger = signal(false);
  private users$ = signal<UserData[]>([]);

  users = computed(() => {
    var currentUsers = this.users$();
    if (currentUsers.length === 0 || this.refreshTrigger()) {
      var obs = this.http.get<User[]>(`https://jsonplaceholder.typicode.com/users`)
      .pipe(
        map(users =>
          users.map(
            (user) => this.formatUserData(user)
          ),
        ),
      ).subscribe(
        {
          next: formattedUsers => {
            this.users$.set(formattedUsers);
          },
          complete: () => {
            this.refreshTrigger.set(false);
            obs.unsubscribe();
          }
        }
      );
    }
    return this.users$();
  });

  refreshUsers() {
    if (!this.refreshTrigger()) {
      this.refreshTrigger.set(true);
    }
  }

  generateRandomUser(): UserData {
    const newUser: User = {
      id: Math.floor(Math.random() * 1000) + 100,
      name: 'New User ' + Math.floor(Math.random() * 100),
      username: 'newuser' + Math.floor(Math.random() * 100),
      email: `newuser${Math.floor(Math.random() * 100)}@example.com`,
      address: {
        street: '123 New St',
        suite: 'Apt ' + Math.floor(Math.random() * 100),
        city: 'New City',
        zipcode: '12345',
        geo: {
          lat: (Math.random() * 180 - 90).toFixed(6),
          lng: (Math.random() * 360 - 180).toFixed(6),
        },
      },
      phone: '555-1234',
      website: 'www.newuser.com',
      company: {
        name: 'New User Inc',
        catchPhrase: 'Innovating the Future',
        bs: 'new user solutions',
      },
    };
    return this.formatUserData(newUser);
  }

  private formatUserData(user: User): UserData {
    return {
      ...user,
      formattedAddress: `${user.address.street} ${user.address.suite}\n${user.address.city}  ${user.address.zipcode}`,
      formattedGeo: `${user.address.geo.lat} : ${user.address.geo.lng}`,
      formattedCompany: `${user.company.name} - ${user.company.catchPhrase} (${user.company.bs})`,
    };
  }
}
