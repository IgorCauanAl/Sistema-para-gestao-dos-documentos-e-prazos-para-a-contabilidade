import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LucideDownload, LucideFileText, LucideEye } from '@lucide/angular';

import { documentStatusMeta } from '../../../core/domain/documento';
import {
  type DocumentoPublico,
  DocumentService,
} from '../../../core/services/document.service';

@Component({
  selector: 'app-document-share-page',
  standalone: true,
  imports: [LucideDownload, LucideFileText, LucideEye],
  templateUrl: './document-share-page.component.html',
  styleUrl: './document-share-page.component.css',
})
export class DocumentSharePageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly documentService = inject(DocumentService);

  documento: DocumentoPublico | null = null;
  arquivoUrl: string | null = null;
  carregando = true;
  erro = '';
  visualizado = false;

  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.paramMap.get('token') ?? '';
    try {
      this.documento = await this.documentService.documentoPublico(token);
      // Buscar o arquivo registra a visualização no back-end.
      const blob = await this.documentService.arquivoPublico(token);
      this.arquivoUrl = URL.createObjectURL(blob);
      this.visualizado = true;
    } catch {
      this.erro = 'Este link não está disponível ou expirou. Solicite um novo link ao escritório.';
    } finally {
      this.carregando = false;
    }
  }

  ngOnDestroy(): void {
    if (this.arquivoUrl) URL.revokeObjectURL(this.arquivoUrl);
  }

  statusLabel(status: string): string {
    return documentStatusMeta[status]?.label ?? status;
  }
}
