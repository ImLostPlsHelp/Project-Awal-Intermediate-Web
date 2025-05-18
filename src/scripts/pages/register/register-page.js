import RegisterPresenter from "./register-presenter";
import * as StoriesAPI from "../../data/api";

export default class RegisterPage {
  constructor() {
    this.presenter = new RegisterPresenter({ view: this, model: StoriesAPI });
    this.showError = this.showError.bind(this);
  }

  async render() {
    return `
      <h2>Register</h2>
      <form id="register-form">
        <label for="name">Name</label>
        <input type="name" name="name" placeholder="Name" required />
        <label for="email">Email</label>
        <input type="email" name="email" placeholder="Email" required />
        <label for="password">Password</label>
        <input type="password" name="password" placeholder="Password" required />
        <br>
        <button type="submit">Register</button>
      </form>

      <h2>Already have an account? <a href="#/login">Login</a></h2>
    `;
  }

  async afterRender() {
    const form = document.getElementById("register-form");
    form.addEventListener("submit", this.onRegister.bind(this));
  }

  async onRegister(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Registering...";

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (password < 8) {
        this.showError("Password must be at least 8 characters long.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Register";
        return;
    }

    await this.presenter.register(name, email, password);

    submitBtn.disabled = false;
    submitBtn.textContent = "Register";
  }

  showError(message) {
    alert("Error: " + message);
    console.log(message);
  }
}
