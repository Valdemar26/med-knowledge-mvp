import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {ApiService} from '../../core/api.service';
import {Document} from '../../shared/models/document.model';
import {MarkdownPipe} from '../../shared/pipes/markdown.pipe';

@Component({
  selector: 'app-document-analysis',
  standalone: true,
  imports: [CommonModule, RouterLink, MarkdownPipe],
  templateUrl: './document-analysis.component.html',
  styleUrl: './document-analysis.component.scss'
})
export class DocumentAnalysisComponent implements OnInit {
  documentId: number = 0;
  document: Document | null = null;
  summary: string = '';
  keyPoints: any[] = [];
  categories: string[] = [];

  activeTab: 'content' | 'summary' | 'keyPoints' = 'content';

  isLoadingDocument: boolean = false;
  isLoadingSummary: boolean = false;
  isLoadingKeyPoints: boolean = false;

  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.documentId = +params['id'];
      this.loadDocument();
    });
  }

  loadDocument(): void {
    this.isLoadingDocument = true;
    this.error = null;

    this.apiService.getDocumentById(this.documentId).subscribe({
      next: (document: Document) => {
        this.document = document;
        this.isLoadingDocument = false;

        // Перевіряємо чи є вже збережене резюме
        if (document.summary && document.summary.length > 10) {
          this.summary = document.summary;
        }
      },
      error: (error) => {
        this.error = 'Failed to load document.';
        this.isLoadingDocument = false;
        console.error('Document upload error:', error);
      }
    });
  }

  generateSummary(): void {
    if (!this.document) return;

    this.isLoadingSummary = true;
    this.error = null;

    this.apiService.getDocumentSummary(this.documentId).subscribe({
      next: (response) => {
        this.summary = response.summary;
        this.isLoadingSummary = false;
        this.activeTab = 'summary';
      },
      error: (error) => {
        this.error = 'Failed to generate summary';
        this.isLoadingSummary = false;
        console.error('Summary generation error:', error);
      }
    });
  }

  analyzeKeyPoints(): void {
    if (!this.document) return;

    this.isLoadingKeyPoints = true;
    this.error = null;

    this.apiService.getDocumentKeyPoints(this.documentId).subscribe({
      next: (response) => {
        this.keyPoints = response.keyPoints || [];
        this.categories = response.categories || [];
        this.isLoadingKeyPoints = false;
        this.activeTab = 'keyPoints';
      },
      error: (error) => {
        this.error = 'Failed to parse document';
        this.isLoadingKeyPoints = false;
        console.error('Document parsing error:', error);
      }
    });
  }

  setActiveTab(tab: 'content' | 'summary' | 'keyPoints'): void {
    this.activeTab = tab;
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
