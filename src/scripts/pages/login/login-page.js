import LoginPresenter from "./login-presenter";
import * as StoriesAPI from "../../data/api";

export default class LoginPage {
  constructor() {
    this.presenter = new LoginPresenter({ view: this, model: StoriesAPI });
  }
  async render() {
    document.body.innerHTML = `
      <h2>Login</h2>
      <form id="login-form">
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    `;

    document
      .getElementById("login-form")
      .addEventListener("submit", this.onLogin.bind(this));
  }

  async onLogin(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await this.presenter.handleLogin(email, password);
  }

  showError(message) {
    alert("Error: " + message);
    console.log(message);
  }
}
