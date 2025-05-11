import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/search',
    pathMatch: 'full'
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'upload',
    loadComponent: () => import('./features/document-upload/document-upload.component').then(m => m.DocumentUploadComponent)
  },
  {
    path: 'analyze/:id',
    loadComponent: () => import('./features/document-analysis/document-analysis.component').then(m => m.DocumentAnalysisComponent)
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./features/document-viewer/document-viewer.component').then(m => m.DocumentViewerComponent)
  },
  {
    path: '**',
    redirectTo: '/search'
  }
];
