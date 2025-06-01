import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('nav-bar')
export class NavBar extends LitElement {
  static styles = css`
    :host {
      display: block;
      background-color: var(--primary-color);
      color: white;
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 1.8rem;
      font-weight: bold;
      text-decoration: none;
      color: white;
      font-family: 'Roboto', sans-serif;
    }

    .upload-button {
      background-color: var(--secondary-color);
      color: black;
      padding: 0.8rem 1.5rem;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.2s ease, background-color 0.2s ease;
    }

    .upload-button:hover {
      transform: translateY(-2px);
      background-color: #04ecd4;
    }

    .upload-icon {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
  `;

  render() {
    return html`
      <nav>
        <div class="nav-container">
          <a href="/" class="logo">Memelyco</a>
          <button class="upload-button" @click=${this._handleUploadClick}>
            <svg class="upload-icon" viewBox="0 0 24 24">
              <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
            </svg>
            Subir Meme
          </button>
        </div>
      </nav>
    `;
  }

  private _handleUploadClick() {
    // Dispatch un evento personalizado que será escuchado por meme-uploader
    this.dispatchEvent(new CustomEvent('show-upload-dialog', {
      bubbles: true,
      composed: true
    }));
  }
} 