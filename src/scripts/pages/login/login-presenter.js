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
      const response = await this.#model.login(email, password);

      if (response.ok) {
        console.log(response.loginResult.token);
        if (response.loginResult.token) {
          localStorage.setItem("token", response.loginResult.token);
          navigateTo("/");
        } else {
          this.#view.showError("Invalid token received.");
        }
      } else {
        this.#view.showError(response.message || "Login failed.");
      }
    } catch (error) {
      console.error(error);
      this.#view.showError("Something went wrong.");
    }
  }
}
