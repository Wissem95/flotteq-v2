import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { documentsApi } from '@/api/services/documents.service';
import { DocumentEntityType, DocumentType } from '@/types/document.types';

vi.mock('@/api/services/documents.service', () => ({
  documentsApi: {
    download: vi.fn(),
  },
}));

describe('DocumentPreviewModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:document-preview'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
  });

  it('charge un PDF avec le service API authentifié', async () => {
    vi.mocked(documentsApi.download).mockResolvedValue(
      new Blob(['pdf'], { type: 'application/pdf' }),
    );

    render(
      <DocumentPreviewModal
        document={{
          id: 'document-1',
          fileName: 'permis.pdf',
          fileUrl: '/uploads/permis.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          entityType: DocumentEntityType.DRIVER,
          entityId: 'driver-1',
          uploadedById: 'user-1',
          documentType: DocumentType.PERMIS,
          tenantId: 234,
          createdAt: '2026-10-07T10:00:00.000Z',
          updatedAt: '2026-10-07T10:00:00.000Z',
        }}
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTitle('permis.pdf')).toHaveAttribute(
        'src',
        'blob:document-preview',
      );
    });
    expect(documentsApi.download).toHaveBeenCalledWith('document-1');
  });
});
