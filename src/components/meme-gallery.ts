import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { supabase } from '../config/supabase';

@customElement('meme-gallery')
export class MemeGallery extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .gallery-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .filter-container {
      margin-bottom: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
    }

    .filter-label {
      font-size: 1.1rem;
      color: var(--primary-color);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filter-label svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    .filter-select-wrapper {
      position: relative;
      min-width: 200px;
    }

    .filter-select {
      width: 100%;
      padding: 12px 40px 12px 20px;
      border: 2px solid var(--primary-color);
      border-radius: 25px;
      background: white;
      color: var(--primary-color);
      font-size: 1rem;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      transition: all 0.3s ease;
    }

    .filter-select:hover {
      background: var(--primary-color);
      color: white;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .filter-select:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
    }

    .select-arrow {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      pointer-events: none;
      transition: transform 0.3s ease;
    }

    .filter-select:hover + .select-arrow {
      fill: white;
    }

    @media (max-width: 600px) {
      .filter-container {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-select-wrapper {
        width: 100%;
      }
    }

    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }

    .meme-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
      aspect-ratio: 1;
      position: relative;
    }

    .meme-card:hover {
      transform: translateY(-5px);
    }

    .meme-image, .meme-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .meme-video {
      background: #000;
    }

    .file-type-indicator {
      position: absolute;
      top: 8px;
      left: 8px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 2;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: var(--text-color);
    }

    .error {
      color: var(--error-color);
      text-align: center;
      padding: 2rem;
    }
  `;

  @state()
  private memes: Array<{ 
    id: string; 
    url: string; 
    type: 'image' | 'video';
    created_at: string;
  }> = [];

  @state()
  private loading: boolean = true;

  @state()
  private error: string = '';

  @state()
  private sortOrder: 'chronological' | 'random' = 'chronological';

  connectedCallback() {
    super.connectedCallback();
    this.loadMemes();
    this.addEventListener('meme-uploaded', () => this.loadMemes());
  }

  private isVideoFile(filename: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return videoExtensions.includes(ext);
  }

  private async loadMemes() {
    try {
      this.loading = true;
      const { data: files, error } = await supabase.storage
        .from('memes')
        .list('', {
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        throw error;
      }

      if (!files) {
        this.memes = [];
        return;
      }

      this.memes = files.map(file => ({
        id: file.name,
        url: `${supabase.storage.from('memes').getPublicUrl(file.name).data.publicUrl}`,
        type: this.isVideoFile(file.name) ? 'video' : 'image',
        created_at: file.created_at || new Date().toISOString()
      }));

      this.sortMemes();
      this.loading = false;
    } catch (err: any) {
      this.error = 'Error al cargar los memes. Por favor, actualiza la página.';
      this.loading = false;
      console.error('Error de carga:', err);
    }
  }

  private sortMemes() {
    if (this.sortOrder === 'random') {
      for (let i = this.memes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.memes[i], this.memes[j]] = [this.memes[j], this.memes[i]];
      }
    } else {
      this.memes.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    this.requestUpdate();
  }

  private handleSortChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.sortOrder = select.value as 'chronological' | 'random';
    this.sortMemes();
  }

  render() {
    if (this.loading) {
      return html`<div class="loading">Cargando memes...</div>`;
    }

    if (this.error) {
      return html`<div class="error">${this.error}</div>`;
    }

    return html`
      <div class="gallery-container">
        <div class="filter-container">
          <label class="filter-label">
            <svg viewBox="0 0 24 24">
              <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
            </svg>
            Ordenar por:
          </label>
          <div class="filter-select-wrapper">
            <select 
              class="filter-select"
              @change=${this.handleSortChange}
              .value=${this.sortOrder}
            >
              <option value="chronological">Más recientes primero</option>
              <option value="random">Orden aleatorio</option>
            </select>
            <svg class="select-arrow" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </div>
        </div>

        <div class="gallery">
          ${this.memes.map(meme => html`
            <div class="meme-card">
              ${meme.type === 'image' 
                ? html`<img src="${meme.url}" alt="Meme" class="meme-image">`
                : html`
                  <video 
                    src="${meme.url}" 
                    class="meme-video"
                    autoplay
                    loop
                    muted
                    playsinline
                  ></video>`
              }
              <span class="file-type-indicator">
                ${meme.type === 'image' ? 'IMG' : 'VID'}
              </span>
            </div>
          `)}
        </div>
      </div>
    `;
  }
} 