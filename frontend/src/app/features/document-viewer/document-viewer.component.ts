import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {ApiService} from '../../core/api.service';
import {Document} from '../../shared/models/document.model';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './document-viewer.component.html',
  styleUrl: './document-viewer.component.scss'
})
export class DocumentViewerComponent implements OnInit {
  documentId: number = 0;
  document: Document | null = null;
  fileUrl: SafeResourceUrl | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.documentId = +params['id'];
      this.loadDocument();
    });
  }

  loadDocument(): void {
    this.isLoading = true;
    this.error = null;

    this.apiService.getDocumentById(this.documentId).subscribe({
      next: (document: Document) => {
        this.document = document;
        this.setDocumentFileUrl();
      },
      error: (error) => {
        this.error = 'Failed to load document.';
        this.isLoading = false;
        console.error('Document upload error:', error);
      }
    });
  }

  setDocumentFileUrl(): void {
    // API URL для отримання файлу
    const fileUrl = `${this.apiService.apiUrl}/documents/file/${this.documentId}`;
    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    this.isLoading = false;
  }

  downloadDocument(): void {
    if (!this.document) return;

    const link = document.createElement('a');
    link.href = `${this.apiService.apiUrl}/documents/file/${this.documentId}`;
    link.download = this.document.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getFileIcon(fileType: string): string {
    switch(fileType) {
      case 'pdf': return 'bi-file-earmark-pdf';
      case 'doc': case 'docx': return 'bi-file-earmark-word';
      case 'txt': return 'bi-file-earmark-text';
      default: return 'bi-file-earmark';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('uk-UA');
  }
}
