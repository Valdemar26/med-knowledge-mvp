import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {SearchResult} from '../../../shared/models/document.model';

@Component({
  selector: 'app-search-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.scss'
})
export class SearchResultComponent {
  @Input() result!: SearchResult;

  getFileBadgeClass(): string {
    switch (this.result.document.fileType) {
      case 'pdf': return 'bg-danger';
      case 'docx': case 'doc': return 'bg-primary';
      case 'txt': return 'bg-secondary';
      default: return 'bg-info';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('uk-UA');
  }
}
