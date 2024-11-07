export interface Attachment {
  filename: string;
  mimeType: string;
  content: string;
}

export interface AttachmentMetadata {
  filename: string;
  mimeType: string;
  size: number;
  lastModified?: Date;
} 