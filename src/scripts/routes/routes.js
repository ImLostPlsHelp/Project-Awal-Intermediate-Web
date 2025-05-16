import HomePage from "../pages/home/home-page";
import AddStory from "../pages/addstory/addstory-page";
import LoginPage from "../pages/login/login-page";
import { getTokenOrRedirect } from "../utils";
import { getActiveRoute } from "./url-parser";

const routes = {
  "/": new HomePage(),
  "/add": new AddStory(),
  "/login": new LoginPage(),
};

const publicRoutes = ["/login", "/register"];

function loadPage() {
  const route = getActiveRoute();

  if (!publicRoutes.includes(route)) {
    const token = getTokenOrRedirect();
    if (!token) return; // akan redirect otomatis jika tidak ada token
  }

  const page = routes[route];
  const app = document.getElementById("main-content");

  if (page) {
    page.render().then(html => {
      app.innerHTML = html;
      page.afterRender?.();
    });
  } else {
    app.innerHTML = "<h2>404 Not Found</h2>";
  }
}

window.addEventListener("hashchange", loadPage);
window.addEventListener("load", loadPage);

export default routes;
