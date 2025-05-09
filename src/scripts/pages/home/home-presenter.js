export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async getAllStories() {
    const response = await this.#model.getAllStories();
    if (response.ok) {
      return response;
    } else {
      throw new Error("Failed to fetch stories");
    }
  }

async handleFormSubmit(formData) {
  try {
    const response = await this.#model.addStory(formData);
    if (response.ok) {
      this.#view.onStoryAdded();
    } else {
      this.#view.showError(response.message);
    }
  } catch (error) {
    this.#view.showError("Network error");
  }
}

}
