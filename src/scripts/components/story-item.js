class StoryItem extends HTMLElement {
  _shadowRoot = null;
  _style = null;
  _storyData = {
    name: null,
    description: null,
    createdAt: null,
    lat: null,
    lon: null,
    photoUrl: null,
  };

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._style = document.createElement("style");
  }

  _emptyContent() {
    this._shadowRoot.innerHTML = "";
  }

  set storyData(storyData) {
    this._storyData = storyData;
    this._render();
  }

  get storyData() {
    return this._storyData;
  }

  _updateStyle() {
    this._style.textContent = `
            :host {
                display: block;
                border-radius: 8px;
                box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.5);
                overflow: hidden;
            }
        `;
  }

  _render() {
    this._emptyContent();
    this._updateStyle();

    this._shadowRoot.appendChild(this._style);
    this._shadowRoot.innerHTML += `
            <div class="story-item">
                <img src="${this._storyData.photoUrl}" alt="${this._storyData.name}">
                <h2>${this._storyData.name}</h2>
                <p>${this._storyData.description}</p>
                <p>${this._storyData.createdAt}</p>
                <p>${this._storyData.lat}, ${this._storyData.lon}</p>
            </div>
        `;
  }
}
