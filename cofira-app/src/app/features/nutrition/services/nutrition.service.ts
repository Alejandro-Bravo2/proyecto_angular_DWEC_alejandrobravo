import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../../../core/services/base-http.service';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../../../../core/services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class NutritionService extends BaseHttpService {

  constructor(http: HttpClient, loadingService: LoadingService) {
    super(http, loadingService);
  }
}
