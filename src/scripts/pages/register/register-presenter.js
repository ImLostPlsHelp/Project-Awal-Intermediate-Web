import { navigateTo } from "../../routes/url-parser";

export default class RegisterPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async register(name, email, password) {
    try {
      const response = await this.#model.register(name, email, password);
      if (response.ok) {
        console.log(response);
        navigateTo("/login");
      } else {
        this.#view.showError(response.message || "Register failed.");
      }
    } catch (error) {
      console.error(error.message);
      this.#view.showError("Something went wrong.");
    }
  }
}
