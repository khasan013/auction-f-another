import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { uploadAPI } from '../../services/api';

export default function ImageUploader({ images = [], onChange, maxFiles = 8 }) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (images.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => formData.append('images', file));
      const res = await uploadAPI.uploadImages(formData);
      onChange([...images, ...res.images]);
      toast.success(`${res.images.length} image(s) uploaded`);
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [images, maxFiles, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    disabled: uploading || images.length >= maxFiles,
  });

  const removeImage = async (index) => {
    const image = images[index];
    if (image.publicId) await uploadAPI.deleteImage(image.publicId).catch(() => {});
    onChange(images.filter((_, i) => i !== index));
  };

  const setPrimary = (index) => {
    onChange(images.map((image, i) => ({ ...image, isPrimary: i === index })));
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className="app-card"
        style={{
          borderStyle: 'dashed',
          borderColor: isDragActive ? 'var(--yellow)' : 'rgba(255,255,255,0.2)',
          padding: '34px 22px',
          textAlign: 'center',
          cursor: images.length >= maxFiles ? 'not-allowed' : 'pointer',
          opacity: images.length >= maxFiles ? 0.55 : 1,
        }}
      >
        <input {...getInputProps()} />
        <strong style={{ display: 'block', marginBottom: 6 }}>{uploading ? 'Uploading images...' : images.length >= maxFiles ? `Maximum ${maxFiles} images reached` : 'Drop images or click to browse'}</strong>
        <p className="app-muted">JPG, PNG, WebP. Max 5MB each. Up to {maxFiles} images.</p>
      </div>

      {images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12, marginTop: 16 }}>
          {images.map((image, index) => (
            <div key={image.url || index} className="app-card" style={{ overflow: 'hidden', borderColor: image.isPrimary ? 'var(--yellow)' : undefined }}>
              <img src={image.url} alt="" style={{ width: '100%', height: 110, objectFit: 'cover' }} />
              <div style={{ display: 'grid', gap: 6, padding: 8 }}>
                {!image.isPrimary && <button type="button" className="btn-secondary btn-sm" onClick={() => setPrimary(index)}>Set Primary</button>}
                <button type="button" className="btn-danger btn-sm" onClick={() => removeImage(index)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
