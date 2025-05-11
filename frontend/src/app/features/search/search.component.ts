import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SearchResult} from '../../shared/models/document.model';
import {ApiService} from '../../core/api.service';
import {SearchResultComponent} from './search-result/search-result.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchResultComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  searchQuery: string = '';
  searchResults: SearchResult[] = [];
  isLoading: boolean = false;
  hasSearched: boolean = false;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
  }

  search() {
    if (!this.searchQuery.trim()) return;

    this.isLoading = true;
    this.hasSearched = true;

    this.apiService.searchDocuments(this.searchQuery).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.isLoading = false;
      }
    });
  }
}
