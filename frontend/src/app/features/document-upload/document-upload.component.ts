import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ApiService} from '../../core/api.service';
import {Document} from '../../shared/models/document.model';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './document-upload.component.html',
  styleUrl: './document-upload.component.scss'
})
export class DocumentUploadComponent implements OnInit {
  documents: Document[] = [];
  selectedFile: File | null = null;
  documentTitle: string = '';
  isUploading: boolean = false;
  uploadProgress: number = 0;
  message: { type: 'success' | 'error', text: string } | null = null;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments() {
    this.apiService.getAllDocuments().subscribe({
      next: (docs: Document[]) => {
        this.documents = docs;
      },
      error: (error) => {
        console.error('Document upload error:', error);
        this.showMessage('error', 'Failed to load document list');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Автоматично встановлюємо назву документа з імені файлу
      this.documentTitle = file.name.split('.')[0];
    }
  }

  uploadDocument() {
    if (!this.selectedFile) {
      this.showMessage('error', 'Select file to upload');
      return;
    }

    if (!this.documentTitle.trim()) {
      this.showMessage('error', 'Enter the document name');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', this.documentTitle);

    this.isUploading = true;
    this.uploadProgress = 0;

    // Симулюємо прогрес завантаження
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 500);

    this.apiService.uploadDocument(formData).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;

        setTimeout(() => {
          this.isUploading = false;
          this.showMessage('success', 'Document successfully uploaded');
          this.resetForm();
          this.loadDocuments();
        }, 500);
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.isUploading = false;
        console.error('Upload error:', error);
        this.showMessage('error', 'Error loading document');
      }
    });
  }

  deleteDocument(id: number, event: Event) {
    event.stopPropagation();

    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    this.apiService.deleteDocument(id).subscribe({
      next: () => {
        this.documents = this.documents.filter(doc => doc.id !== id);
        this.showMessage('success', 'Document successfully deleted');
      },
      error: (error) => {
        console.error('Deletion error:', error);
        this.showMessage('error', 'Can\'t delete document');
      }
    });
  }

  resetForm() {
    this.selectedFile = null;
    this.documentTitle = '';
    // Очищаємо input type="file"
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  showMessage(type: 'success' | 'error', text: string) {
    this.message = { type, text };
    setTimeout(() => {
      this.message = null;
    }, 5000);
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
