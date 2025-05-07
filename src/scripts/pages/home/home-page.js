import HomePresenter from "./home-presenter";
import * as StoriesAPI from "../../data/api";

export default class HomePage {
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

  initMap(story) {
    const rasterTile = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  
    const map = L.map(`map-${story.id}`).setView([story.lat, story.lon], 13);
    L.tileLayer(rasterTile, {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  
    L.marker([story.lat, story.lon])
      .addTo(map)
      .bindPopup(`<strong>${story.name}</strong>`);
  }

  renderStories(stories) {
    const storiesList = document.getElementById('stories-list');

    stories.forEach((story) => {
      const storyItem = document.createElement('div');
      storyItem.classList.add('story-item');
      storyItem.classList.add(story.id);
      storyItem.innerHTML = `
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <p>${story.createdAt}</p>
        <img src="${story.photoUrl}" alt="${story.name}" />
        <div id="map-${story.id}" class="map" style="height: 300px; margin-top: 1rem;"></div>
      `
      storiesList.appendChild(storyItem);

      if(story.lat && story.lon) {
        this.initMap(story);
      }
    });
  } catch (error) {
    console.error(error);
  }
  

  async afterRender() {
    const homePresenter = new HomePresenter({
      view: this,
      model: StoriesAPI,
    });

    try {
      const response = await homePresenter.getAllStories();
      const stories = response.listStory;

      this.renderStories(stories);
  } catch(error) {
    console.error('Failed to fetch stories:', error);
  }
}
}
