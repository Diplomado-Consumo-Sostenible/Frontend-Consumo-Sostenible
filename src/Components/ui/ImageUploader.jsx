import { CheckCircle2, ImagePlus, Loader2, UploadCloud, X } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { validateImageFile } from '../../services/upload/upload.service';

const ImageUploader = forwardRef(function ImageUploader(
  {
    uploadFn,
    initialImage = '',
    onSuccess,
    onError,
    onFileStaged,
    validationConfig,
    disabled = false,
  },
  ref,
) {
  const [uploadStatus, setUploadStatus] = useState(initialImage ? 'success' : 'idle');
  const [stagedFile, setStagedFile]     = useState(null);
  const [preview, setPreview]           = useState(initialImage || '');
  const [progress, setProgress]         = useState(0);
  const [errorMsg, setErrorMsg]         = useState('');
  const [isDragging, setIsDragging]     = useState(false);

  const isUploading = uploadStatus === 'uploading';
  const isSuccess   = uploadStatus === 'success';
  const isError     = uploadStatus === 'error';
  const hasPreview  = !!preview;
  const canUpload   = uploadStatus === 'staged';

  const fileInputRef  = useRef(null);
  const controllerRef = useRef(null);
  const blobUrlRef    = useRef('');

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    async upload() {
      if (!stagedFile) return undefined;
      return performUpload(stagedFile);
    },
    get canUpload() {
      return canUpload;
    },
    get isSuccess() {
      return isSuccess;
    },
    reset() {
      clearFile();
    },
  }));

  function processFile(file) {
    if (!file) return;

    const validationError = validateImageFile(file, validationConfig);
    if (validationError) {
      setErrorMsg(validationError);
      setUploadStatus('error');
      return;
    }

    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);

    const objectUrl = URL.createObjectURL(file);
    blobUrlRef.current = objectUrl;

    setStagedFile(file);
    setPreview(objectUrl);
    setUploadStatus('staged');
    setErrorMsg('');
    setProgress(0);
    onFileStaged?.(file);
  }

  function clearFile() {
    if (controllerRef.current) controllerRef.current.abort();
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = '';
    }
    setStagedFile(null);
    setPreview(initialImage || '');
    setUploadStatus(initialImage ? 'success' : 'idle');
    setProgress(0);
    setErrorMsg('');
    onFileStaged?.(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function performUpload(file) {
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setUploadStatus('uploading');
    setProgress(0);

    try {
      const result = await uploadFn(file, {
        onProgress: setProgress,
        signal: controller.signal,
      });
      setUploadStatus('success');
      setProgress(100);
      onSuccess?.(result.url);
      return result.url;
    } catch (err) {
      if (err?.canceled) return;
      const msg = err?.message || 'Error al subir la imagen';
      setErrorMsg(msg);
      setUploadStatus('error');
      onError?.(msg);
      throw err;
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (!disabled && !isUploading) setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    processFile(e.dataTransfer.files?.[0]);
  }

  function handleInputChange(e) {
    processFile(e.target.files?.[0]);
    e.target.value = '';
  }

  return (
    <div className="w-full space-y-2">
      {hasPreview ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100">
          <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
              <span className="text-xs text-white font-medium tabular-nums">{progress}%</span>
            </div>
          )}

          {isSuccess && !isUploading && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500/90 text-white text-xs font-medium px-2 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Subida completada
            </div>
          )}

          {!isUploading && (
            <button
              type="button"
              onClick={clearFile}
              disabled={disabled}
              aria-label="Quitar imagen"
              className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={disabled}
          className={[
            'w-full h-36 border-2 border-dashed rounded-xl',
            'flex flex-col items-center justify-center gap-2',
            'transition-colors select-none',
            isDragging
              ? 'border-green-400 bg-green-50/50'
              : isError
                ? 'border-red-300 bg-red-50/30'
                : 'border-gray-200 hover:border-green-400 hover:bg-green-50/30',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          ].join(' ')}
        >
          {isDragging
            ? <UploadCloud className="w-6 h-6 text-green-500" />
            : <ImagePlus className="w-6 h-6 text-gray-400" />
          }
          <span className="text-sm text-gray-500">
            {isDragging ? 'Suelta la imagen aquí' : 'Arrastra o haz clic para seleccionar'}
          </span>
          <span className="text-xs text-gray-400">
            JPG, PNG, WEBP, GIF · máx.&nbsp;{validationConfig?.maxSizeMb ?? 5}&nbsp;MB
          </span>
        </button>
      )}

      {isUploading && (
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {isError && errorMsg && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span aria-hidden="true">⚠</span> {errorMsg}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />
    </div>
  );
});

export default ImageUploader;
