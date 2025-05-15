export default class AddStoryPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
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
