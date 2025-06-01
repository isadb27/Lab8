import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { createClient } from '@supabase/supabase-js';

@customElement('meme-gallery')
export class MemeGallery extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      padding: 20px;
    }

    .meme-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .meme-card:hover {
      transform: translateY(-5px);
    }

    .meme-image {
      width: 100%;
      height: 250px;
      object-fit: cover;
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
  private memes: Array<{ id: string; url: string }> = [];

  @state()
  private loading: boolean = true;

  @state()
  private error: string = '';

  private supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_KEY || ''
  );

  connectedCallback() {
    super.connectedCallback();
    this.loadMemes();
    this.addEventListener('meme-uploaded', () => this.loadMemes());
  }

  private async loadMemes() {
    try {
      this.loading = true;
      const { data: files, error } = await this.supabase.storage
        .from('memes')
        .list();

      if (error) throw error;

      this.memes = await Promise.all(
        files.map(async (file) => {
          const { data: { publicUrl } } = this.supabase.storage
            .from('memes')
            .getPublicUrl(file.name);

          return {
            id: file.name,
            url: publicUrl
          };
        })
      );

      this.loading = false;
    } catch (err) {
      this.error = 'Error loading memes. Please refresh the page.';
      this.loading = false;
      console.error('Loading error:', err);
    }
  }

  render() {
    if (this.loading) {
      return html`<div class="loading">Loading memes...</div>`;
    }

    if (this.error) {
      return html`<div class="error">${this.error}</div>`;
    }

    return html`
      <div class="gallery">
        ${this.memes.map(meme => html`
          <div class="meme-card">
            <img src="${meme.url}" alt="Meme" class="meme-image">
          </div>
        `)}
      </div>
    `;
  }
} 