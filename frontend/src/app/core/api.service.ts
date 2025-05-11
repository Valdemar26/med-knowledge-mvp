import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document, SearchResult } from '../shared/models/document.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5000/api';

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

  // У майбутньому можна додати методи для аналізу документів та інші
}
