import { navigateTo } from "../../routes/url-parser";

export default class LoginPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async handleLogin(email, password) {
    try {
        const response = await this.#model.login(email,password);
        if (response.ok) {
            const data = response.json();
            localStorage.setItem("token", data.token);
            navigateTo("/");
        } else {
            this.#view.showError(response.message);
        }
    } catch (error) {
        this.#view.showError("Something went wrong");
    }
  }
}
