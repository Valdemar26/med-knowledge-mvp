import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document, SearchResult } from '../shared/models/document.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Документи
  getAllDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/documents`);
  }

  getDocumentById(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/documents/${id}`);
  }

  uploadDocument(formData: FormData): Observable<Document> {
    return this.http.post<Document>(`${this.apiUrl}/documents`, formData);
  }

  deleteDocument(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/documents/${id}`);
  }

  // Пошук
  searchDocuments(query: string): Observable<SearchResult[]> {
    return this.http.post<SearchResult[]>(`${this.apiUrl}/search`, { query });
  }

  // Отримання резюме документа
  getDocumentSummary(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analysis/summary/${id}`);
  }

  // Отримання ключових тез документа
  getDocumentKeyPoints(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analysis/key-points/${id}`);
  }
}
