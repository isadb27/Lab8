import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { createClient } from '@supabase/supabase-js';

@customElement('meme-uploader')
export class MemeUploader extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: white;
      padding: 2rem;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .upload-container {
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
      margin-top: 1rem;
      position: relative;
      display: inline-block;
    }

    .preview-image {
      max-width: 100%;
      max-height: 300px;
      border-radius: 8px;
      display: block;
      margin: 0 auto;
    }

    .remove-preview {
      position: absolute;
      top: -10px;
      right: -10px;
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
      z-index: 1;
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

    .upload-icon {
      width: 20px;
      height: 20px;
      fill: currentColor;
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
  private previewUrl: string | null = null;

  @state()
  private isDragover: boolean = false;

  private file: File | null = null;

  private supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_KEY || ''
  );

  render() {
    return html`
      <div class="upload-container" @click=${(e: Event) => e.stopPropagation()}>
        <h2 class="title">Sube tu Meme</h2>
        
        <div 
          class="drop-zone ${this.isDragover ? 'dragover' : ''}"
          @dragover=${this._handleDragOver}
          @dragleave=${this._handleDragLeave}
          @drop=${this._handleDrop}
          @click=${this._handleZoneClick}
        >
          ${this.previewUrl 
            ? html`
              <div class="preview-container">
                <img src="${this.previewUrl}" alt="Preview" class="preview-image">
                <button class="remove-preview" @click=${this._handleRemovePreview}>×</button>
              </div>
            `
            : html`
              <p class="drop-zone-text">
                Arrastra y suelta tu imagen aquí<br>
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
          accept="image/*"
          @change=${this._handleFileSelect}
          id="file-input"
        >

        <button 
          class="upload-button"
          ?disabled=${!this.file || this.isLoading}
          @click=${this._handleUpload}
        >
          ${this.isLoading 
            ? html`<span class="loading"></span>` 
            : html`
              <svg class="upload-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
              </svg>
            `
          }
          ${this.isLoading ? 'Subiendo...' : 'Subir Meme'}
        </button>

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
      this._processFile(files[0]);
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
    const input = e.target as HTMLInputElement;
    const files = input.files;
    
    if (files?.length) {
      this._processFile(files[0]);
    }
  }

  private _processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      this.error = 'Por favor, selecciona una imagen válida';
      return;
    }

    this.file = file;
    this.error = '';
    this.success = '';
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  private _handleRemovePreview(e: Event) {
    e.stopPropagation();
    this.previewUrl = null;
    this.file = null;
    this.error = '';
    this.success = '';
    const input = this.shadowRoot?.querySelector('#file-input') as HTMLInputElement;
    if (input) input.value = '';
  }

  private async _handleUpload() {
    if (!this.file) return;

    try {
      this.isLoading = true;
      this.error = '';
      
      const { data, error } = await this.supabase.storage
        .from('memes')
        .upload(`meme-${Date.now()}-${this.file.name}`, this.file);

      if (error) throw error;

      this.success = '¡Meme subido exitosamente!';
      this._handleRemovePreview(new Event('click'));
      
      // Notificar que se ha subido un nuevo meme
      this.dispatchEvent(new CustomEvent('meme-uploaded', {
        detail: { path: data.path },
        bubbles: true,
        composed: true
      }));

    } catch (err) {
      this.error = 'Error al subir el meme. Por favor, intenta de nuevo.';
      console.error('Error de subida:', err);
    } finally {
      this.isLoading = false;
    }
  }
} 