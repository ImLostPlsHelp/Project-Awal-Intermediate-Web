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

  async afterRender() {
    const storiesList = document.getElementById('stories-list');
    const homePresenter = new HomePresenter({
      view: this,
      model: StoriesAPI,
    });

    try {
      const response = await homePresenter.getAllStories();
      const stories = response.listStory;

      stories.forEach((story) => {
        const storyItem = document.createElement('div');
        storyItem.classList.add('story-item');
        storyItem.classList.add('${story.id}');
        storyItem.innerHTML = `
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <p>${story.createdAt}</p>
          <img src="${story.photoUrl}" alt="${story.name}" />
        `
        storiesList.appendChild(storyItem);
      });
    } catch (error) {
      console.error(error);
    }
  }
}
