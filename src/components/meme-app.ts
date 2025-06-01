import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './nav-bar';

@customElement('meme-app')
export class MemeApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background-color: var(--background-color);
    }

    .content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .upload-dialog {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .upload-dialog.visible {
      opacity: 1;
      visibility: visible;
    }

    .upload-dialog[hidden] {
      display: none;
    }
  `;

  @state()
  private showUploadDialog = false;

  render() {
    return html`
      <nav-bar @show-upload-dialog=${this._handleShowUpload}></nav-bar>
      
      <div class="content">
        <meme-gallery></meme-gallery>
      </div>

      <div 
        class="upload-dialog ${this.showUploadDialog ? 'visible' : ''}"
        ?hidden=${!this.showUploadDialog}
        @click=${this._handleCloseDialog}
      >
        <meme-uploader 
          @meme-uploaded=${this._handleMemeUploaded}
        ></meme-uploader>
      </div>
    `;
  }

  private _handleShowUpload() {
    this.showUploadDialog = true;
  }

  private _handleCloseDialog() {
    this.showUploadDialog = false;
  }

  private _handleMemeUploaded() {
    // Cerrar el diálogo después de una subida exitosa
    this.showUploadDialog = false;
  }
} 