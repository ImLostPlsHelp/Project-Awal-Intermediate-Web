import LoginPresenter from "./login-presenter";
import * as StoriesAPI from "../../data/api";

export default class LoginPage {
  constructor() {
    this.presenter = new LoginPresenter({ view: this, model: StoriesAPI });
  }
  async render() {
    return `
      <h2>Login</h2>
      <form id="login-form">
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>

      <h2>Don't have an account? <a href="#/register">Register</a></h2>
    `;
  }

  async afterRender() {
    const form = document.getElementById("login-form");
    form.addEventListener("submit", this.onLogin.bind(this));
  }

  async onLogin(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";
    const email = e.target.email.value;
    const password = e.target.password.value;

    await this.presenter.handleLogin(email, password);

    submitBtn.disabled = false;
    submitBtn.textContent = "Register";
  }

  showError(message) {
    alert("Error: " + message);
    console.log(message);
  }
}
