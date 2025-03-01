// components/attachments-panel.tsx
import Link from "next/link";
import { Paperclip, Download, FileText, CalendarIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Attachment } from "../../../../lib/types";

interface AttachmentsPanelProps {
  attachments: Attachment[];
  publicationUrl: string | null;
  publicationDate: string | null;
}

export function AttachmentsPanel({ attachments, publicationUrl, publicationDate }: AttachmentsPanelProps) {
  return (
    <Card className="dark:bg-[#09090B]">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Paperclip className="mr-2 h-5 w-5" />
          Anexos e Publicações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attachments.length > 0 ? (
          <div className="space-y-3">
            {attachments.map((attachment, index) => (
              <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Button variant="link" asChild className="h-auto whitespace-normal text-left justify-start p-0">
                  <Link href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4 flex-shrink-0 text-blue-500" />
                    <span className="break-words">{attachment.name}</span>
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhum anexo disponível.</p>
        )}
        
        {publicationUrl && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold mb-2">Publicação Oficial:</h3>
            <Button variant="outline" asChild className="w-full">
              <a href={publicationUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 h-4 w-4" />
                Ver Publicação
              </a>
            </Button>
            {publicationDate && (
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <CalendarIcon className="mr-1 h-3 w-3" />
                <time>Publicado em {new Date(publicationDate).toLocaleDateString('pt-PT', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</time>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}