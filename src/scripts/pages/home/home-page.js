import HomePresenter from "./home-presenter";
import * as StoriesAPI from "../../data/api";

export default class HomePage {
  constructor() {
    this.presenter = new HomePresenter({ view: this, model: StoriesAPI });
    this.showError = this.showError.bind(this);
  }

  async render() {
    return `
      <section class="container">
        <h1>Home Page</h1>
      </section>

      <section id="stories" class="container">
        <h2>Stories</h2>
        <div id="stories-list" class="stories-list"></div>
      </section>
    `;
  }

  showError(message) {
    alert("Error: " + message);
    console.log(message);
  }

  initMap(stories) {
    const rasterTile = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const defaultLocation = [-7.2575, 112.7521];
    const map = L.map("stories-map").setView(defaultLocation, 13);

    L.tileLayer(rasterTile, {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const markerGroup = L.featureGroup();

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).bindPopup(
          `<strong>${story.name}</strong><br>${story.description}`
        );
        markerGroup.addLayer(marker);
      }
    });

    markerGroup.addTo(map);

    if (markerGroup.getLayers().length > 0) {
      map.fitBounds(markerGroup.getBounds());
    }
  }

  renderStories(stories) {
    const storiesList = document.getElementById("stories-list");
    storiesList.innerHTML = `
    <div id="stories-map" class="map" style="height: 400px; margin-bottom: 2rem;"></div>
  `;

    stories.forEach((story) => {
      const storyItem = document.createElement("div");
      storyItem.classList.add("story-item");
      storyItem.innerHTML = `
      <h3>${story.name}</h3>
      <p>${story.description}</p>
      <p>${story.createdAt}</p>
      <img src="${story.photoUrl}" alt="${story.name}" />
    `;
      storiesList.appendChild(storyItem);
    });

    this.initMap(stories);
  }

  async afterRender() {
    try {
      const response = await this.presenter.getAllStories();
      const stories = response.listStory;

      this.renderStories(stories);
    } catch (error) {
      this.showError(error.message);
    }
  }
}
