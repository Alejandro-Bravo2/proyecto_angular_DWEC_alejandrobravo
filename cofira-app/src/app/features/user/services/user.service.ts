import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../../../core/services/base-http.service';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../../../../core/services/loading.service';
import { Observable } from 'rxjs';

interface User {
  id: string;
  name: string;
  email: string;
  // Add other user profile properties
}

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseHttpService {
  constructor(http: HttpClient, loadingService: LoadingService) {
    super(http, loadingService);
  }

  // Example CRUD operations for user profile
  getUser(id: string): Observable<User> {
    return this.get<User>(`users/${id}`);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.put<User>(`users/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.delete<void>(`users/${id}`);
  }
}
