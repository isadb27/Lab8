import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { supabase } from '../config/supabase';

@customElement('meme-uploader')
export class MemeUploader extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .upload-container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin: 0 auto;
      text-align: center;
    }

    .title {
      color: var(--primary-color);
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .drop-zone {
      border: 2px dashed var(--primary-color);
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 1.5rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
      position: relative;
      background-color: rgba(98, 0, 238, 0.05);
    }

    .drop-zone.dragover {
      background-color: rgba(98, 0, 238, 0.1);
    }

    .drop-zone-text {
      color: var(--text-color);
      margin-bottom: 1rem;
    }

    .preview-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .preview-item {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .preview-image, .preview-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-video {
      background: #000;
    }

    .file-type-indicator {
      position: absolute;
      top: 4px;
      left: 4px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 2;
    }

    .remove-preview {
      position: absolute;
      top: 4px;
      right: 4px;
      background: var(--error-color);
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      z-index: 2;
    }

    .upload-button {
      background-color: var(--primary-color);
      color: white;
      padding: 0.8rem 1.5rem;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: background-color 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 1rem;
    }

    .upload-button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .upload-button:not(:disabled):hover {
      background-color: #4a00b3;
    }

    .progress {
      margin-top: 1rem;
      color: var(--text-color);
    }

    .error {
      color: var(--error-color);
      margin-top: 1rem;
      font-size: 0.9rem;
    }

    .success {
      color: #4caf50;
      margin-top: 1rem;
      font-size: 0.9rem;
    }

    input[type="file"] {
      display: none;
    }

    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid #ffffff;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  @state()
  private error: string = '';

  @state()
  private success: string = '';

  @state()
  private isLoading: boolean = false;

  @state()
  private progress: string = '';

  @state()
  private isDragover: boolean = false;

  @state()
  private previews: Array<{ 
    file: File; 
    url: string;
    type: 'image' | 'video';
  }> = [];

  render() {
    return html`
      <div class="upload-container">
        <h2 class="title">Sube tus Memes</h2>
        
        <div class="drop-zone ${this.isDragover ? 'dragover' : ''}"
          @dragover=${this._handleDragOver}
          @dragleave=${this._handleDragLeave}
          @drop=${this._handleDrop}
          @click=${this._handleZoneClick}
        >
          ${this.previews.length > 0 
            ? html`
              <div class="preview-container">
                ${this.previews.map((preview, index) => html`
                  <div class="preview-item">
                    ${preview.type === 'image' 
                      ? html`<img 
                          src="${preview.url}" 
                          alt="Preview" 
                          class="preview-image"
                        >`
                      : html`<video 
                          src="${preview.url}" 
                          class="preview-video"
                          autoplay
                          loop
                          muted
                          playsinline
                        ></video>`
                    }
                    <span class="file-type-indicator">
                      ${preview.type === 'image' ? 'IMG' : 'VID'}
                    </span>
                    <button 
                      class="remove-preview" 
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        this._handleRemovePreview(e, index);
                      }}
                    >×</button>
                  </div>
                `)}
              </div>
            `
            : html`
              <p class="drop-zone-text">
                Arrastra y suelta tus imágenes o videos aquí<br>
                o haz clic para seleccionar
              </p>
              <svg class="upload-icon" viewBox="0 0 24 24" width="48" height="48">
                <path fill="currentColor" d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
              </svg>
            `
          }
        </div>

        <input 
          type="file" 
          accept="image/*,video/*"
          @change=${this._handleFileSelect}
          id="file-input"
          multiple
          @click=${(e: Event) => e.stopPropagation()}
        >

        <button 
          class="upload-button"
          ?disabled=${this.previews.length === 0 || this.isLoading}
          @click=${(e: Event) => {
            e.stopPropagation();
            this._handleUpload();
          }}
        >
          ${this.isLoading 
            ? html`<span class="loading"></span>` 
            : html`
              <svg class="upload-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
              </svg>
            `
          }
          ${this.isLoading ? 'Subiendo...' : 'Subir Memes'}
        </button>

        ${this.progress ? html`<p class="progress">${this.progress}</p>` : ''}
        ${this.error ? html`<p class="error">${this.error}</p>` : ''}
        ${this.success ? html`<p class="success">${this.success}</p>` : ''}
      </div>
    `;
  }

  private _handleDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragover = true;
  }

  private _handleDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isDragover = false;
  }

  private _handleDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragover = false;
    
    const files = e.dataTransfer?.files;
    if (files?.length) {
      this._processFiles(Array.from(files));
    }
  }

  private _handleZoneClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    const input = this.shadowRoot?.querySelector('#file-input') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  private _handleFileSelect(e: Event) {
    e.stopPropagation();
    const input = e.target as HTMLInputElement;
    const files = input.files;
    
    if (files?.length) {
      this._processFiles(Array.from(files));
    }
  }

  private _processFiles(files: File[]) {
    files.forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        this.error = 'Por favor, selecciona solo imágenes o videos';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previews = [
          ...this.previews,
          { 
            file, 
            url: e.target?.result as string,
            type: isImage ? 'image' : 'video'
          }
        ];
      };
      reader.readAsDataURL(file);
    });

    this.error = '';
    this.success = '';
  }

  private _handleRemovePreview(e: Event, index: number) {
    e.stopPropagation();
    this.previews = this.previews.filter((_, i) => i !== index);
    this.error = '';
    this.success = '';
  }

  private async _handleUpload() {
    if (this.previews.length === 0) return;

    try {
      this.isLoading = true;
      this.error = '';
      this.success = '';

      let uploadedCount = 0;
      const totalFiles = this.previews.length;

      for (const preview of this.previews) {
        const fileExt = preview.file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error } = await supabase.storage
          .from('memes')
          .upload(fileName, preview.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        uploadedCount++;
        this.progress = `Subiendo... ${uploadedCount}/${totalFiles}`;
      }

      this.success = '¡Archivos subidos exitosamente!';
      this.previews = [];
      this.progress = '';
      
      this.dispatchEvent(new CustomEvent('meme-uploaded', {
        bubbles: true,
        composed: true
      }));

    } catch (err: any) {
      console.error('Error de subida:', err);
      this.error = 'Error al subir los archivos. Por favor, intenta de nuevo.';
    } finally {
      this.isLoading = false;
      this.progress = '';
    }
  }
} 