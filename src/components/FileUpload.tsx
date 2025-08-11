import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileText,
  Archive,
  X,
  Download,
  Eye,
  Paperclip,
  Camera,
  Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onFilesUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

const FILE_TYPE_ICONS = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
  archive: Archive,
  default: File
};

const FILE_TYPE_COLORS = {
  image: 'text-green-500',
  video: 'text-purple-500',
  audio: 'text-blue-500',
  document: 'text-orange-500',
  archive: 'text-yellow-500',
  default: 'text-gray-500'
};

export const FileUpload = ({
  onFilesUpload,
  maxFiles = 10,
  maxSizePerFile = 10, // 10MB default
  acceptedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.txt', '.zip', '.rar'],
  className
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): keyof typeof FILE_TYPE_ICONS => {
    const type = file.type.split('/')[0];
    if (type === 'image') return 'image';
    if (type === 'video') return 'video';
    if (type === 'audio') return 'audio';
    if (file.type === 'application/pdf' || 
        file.type.includes('document') || 
        file.type.includes('text')) return 'document';
    if (file.type.includes('zip') || 
        file.type.includes('rar') || 
        file.type.includes('archive')) return 'archive';
    return 'default';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizePerFile * 1024 * 1024) {
      return `File quá lớn. Kích thước tối đa: ${maxSizePerFile}MB`;
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isValidType) {
      return 'Loại file không được hỗ trợ';
    }

    return null;
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validate number of files
    if (uploads.length + fileArray.length > maxFiles) {
      alert(`Chỉ có thể upload tối đa ${maxFiles} files`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length === 0) return;

    // Start upload process
    const newUploads: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploads(prev => [...prev, ...newUploads]);

    try {
      await onFilesUpload(validFiles);
      
      // Update upload status to completed
      setUploads(prev => prev.map(upload => {
        if (validFiles.includes(upload.file)) {
          return { ...upload, progress: 100, status: 'completed' as const };
        }
        return upload;
      }));

    } catch (error) {
      // Update upload status to error
      setUploads(prev => prev.map(upload => {
        if (validFiles.includes(upload.file)) {
          return { 
            ...upload, 
            status: 'error' as const, 
            error: 'Upload failed'
          };
        }
        return upload;
      }));
    }
  }, [uploads.length, maxFiles, maxSizePerFile, acceptedTypes, onFilesUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  };

  const FileIcon = ({ type }: { type: keyof typeof FILE_TYPE_ICONS }) => {
    const Icon = FILE_TYPE_ICONS[type];
    return <Icon className={cn("h-4 w-4", FILE_TYPE_COLORS[type])} />;
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        {/* Upload Area */}
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <Upload className={cn(
                "h-10 w-10 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            
            <div>
              <h3 className="text-lg font-medium">
                {isDragging ? "Thả files vào đây" : "Upload files"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Kéo thả hoặc click để chọn files
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Tối đa {maxFiles} files, mỗi file không quá {maxSizePerFile}MB
              </p>
            </div>

            {/* Quick Upload Buttons */}
            <div className="flex justify-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Ảnh
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upload ảnh</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Tài liệu
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upload tài liệu</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Camera
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Chụp ảnh</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </Card>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        {/* Upload Progress */}
        <AnimatePresence>
          {uploads.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {uploads.map((upload, index) => (
                <motion.div
                  key={`${upload.file.name}-${index}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <FileIcon type={getFileType(upload.file)} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">
                        {upload.file.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(upload.file.size)}
                      </span>
                    </div>
                    
                    {upload.status === 'uploading' && (
                      <Progress value={upload.progress} className="mt-2 h-1" />
                    )}
                    
                    {upload.status === 'error' && (
                      <p className="text-xs text-destructive mt-1">
                        {upload.error}
                      </p>
                    )}
                    
                    {upload.status === 'completed' && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          Hoàn thành
                        </Badge>
                        {upload.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-2 text-xs"
                            onClick={() => window.open(upload.url, '_blank')}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Xem
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeUpload(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>File Preview</DialogTitle>
            </DialogHeader>
            {/* Preview content would go here */}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

// Quick attach button component
export const QuickAttachButton = ({
  onFilesUpload,
  className
}: {
  onFilesUpload: (files: File[]) => Promise<void>;
  className?: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesUpload(Array.from(files));
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("hover:scale-110 transition-transform", className)}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Đính kèm file</TooltipContent>
      </Tooltip>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
};

// File attachment display component
export const FileAttachment = ({
  fileName,
  fileSize,
  fileType,
  fileUrl,
  onDownload,
  onPreview,
  className
}: {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl?: string;
  onDownload?: () => void;
  onPreview?: () => void;
  className?: string;
}) => {
  const getFileTypeFromMime = (mimeType: string): keyof typeof FILE_TYPE_ICONS => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'archive';
    return 'default';
  };

  const fileTypeKey = getFileTypeFromMime(fileType);
  const Icon = FILE_TYPE_ICONS[fileTypeKey];

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors",
      className
    )}>
      <div className={cn("p-2 rounded", FILE_TYPE_COLORS[fileTypeKey])}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate text-sm">{fileName}</div>
        <div className="text-xs text-muted-foreground">
          {formatFileSize(fileSize)}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onPreview && fileTypeKey === 'image' && (
          <Button variant="ghost" size="sm" onClick={onPreview}>
            <Eye className="h-4 w-4" />
          </Button>
        )}
        
        {(onDownload || fileUrl) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDownload || (() => fileUrl && window.open(fileUrl, '_blank'))}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
