import HomePage from "../pages/home/home-page";
import AddStory from "../pages/addstory/addstory-page";

const routes = {
  "/": new HomePage(),
  "/add": new AddStory(),
};

export default routes;
