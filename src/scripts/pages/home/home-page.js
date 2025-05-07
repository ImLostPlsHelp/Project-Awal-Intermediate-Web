import HomePresenter from "./home-presenter";
import * as StoriesAPI from "../../data/api";

export default class HomePage {
  async render() {
    return `
      <section class="container">
        <h1>Home Page</h1>
      </section>

      <section class="container form">
        <button id="add-story-button">Add Story</button>
      </section>

      <section id="stories" class="container">
        <h2>Stories</h2>
        <div id="stories-list" class="stories-list"></div>
      </section>
    `;
  }

  renderAddStoryForm() {
    const form = document.createElement("form");
    const target = document.querySelector(".form");
    form.classList.add("container");
    form.id = "add-story-form";
    form.innerHTML = `
      <style>
        #add-story-form {
          display: none;
      }
      </style>
      <h2>Add New Story</h2>
      <input type="text" name="name" placeholder="Name" required />
      <textarea name="description" placeholder="Description" required></textarea>
      <div class="camera">
        <video id="camera-video" autoplay></video>
        <button type="button" id="camera-take-button">Take Photo</button>
        <canvas id="camera-canvas" style="display: none;"></canvas>
        <ul id="camera-list-output"></ul>
        <select id="camera-list-select"></select>
      </div>
      <input type="hidden" name="photoBase64" />
      <div id="map-form" class="map" style="height: 300px;"></div>
      <input type="hidden" name="lat" />
      <input type="hidden" name="lon" />
      <button type="submit">Submit</button>
    `;

    target.appendChild(form);

    this.initFormMap();
    form.addEventListener("submit", this.handleFormSubmit.bind(this));
  }

  async handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
  
    const formData = new FormData(form);
    const storyData = {
      name: formData.get('name'),
      description: formData.get('description'),
      lat: parseFloat(formData.get('lat')),
      lon: parseFloat(formData.get('lon')),
      photoBase64: formData.get('photoBase64'),
    };    
  
    try {
      await StoriesAPI.addStory(storyData);
      alert('Story added!');
      form.reset();
      this.afterRender(); // Refresh stories
    } catch (err) {
      console.error('Failed to add story:', err);
    }
  }
  

  //TODO: Pilih lokasi add story
  initFormMap() {
    const map = L.map("map-form").setView([-7.2575, 112.7521], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    let marker;
    map.on("click", function (e) {
      const { lat, lng } = e.latlng;
      if (marker) marker.setLatLng(e.latlng);
      else marker = L.marker(e.latlng).addTo(map);

      document.querySelector('[name="lat"]').value = lat;
      document.querySelector('[name="lon"]').value = lng;
    });
  }

  initMap(story) {
    const rasterTile = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const map = L.map(`map-${story.id}`).setView([story.lat, story.lon], 13);
    L.tileLayer(rasterTile, {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    L.marker([story.lat, story.lon])
      .addTo(map)
      .bindPopup(`<strong>${story.name}</strong>`);
  }

  renderStories(stories) {
    const storiesList = document.getElementById("stories-list");

    stories.forEach((story) => {
      const storyItem = document.createElement("div");
      storyItem.classList.add("story-item");
      storyItem.classList.add(story.id);
      storyItem.innerHTML = `
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <p>${story.createdAt}</p>
        <img src="${story.photoUrl}" alt="${story.name}" />
        <div id="map-${story.id}" class="map" style="height: 300px; width:500px; margin-top: 1rem;"></div>
      `;
      storiesList.appendChild(storyItem);

      if (story.lat && story.lon) {
        this.initMap(story);
      }
    });
  }
  catch(error) {
    console.error(error);
  }

  async afterRender() {
    const homePresenter = new HomePresenter({
      view: this,
      model: StoriesAPI,
    });

    try {
      const response = await homePresenter.getAllStories();
      const stories = response.listStory;

      this.renderStories(stories);
    } catch (error) {
      console.error("Failed to fetch stories:", error);
    }

    document.getElementById("add-story-button").addEventListener("click", () => {
      const existingForm = document.getElementById("add-story-form");
      if (!existingForm) {
        this.renderAddStoryForm();
        this.initCamera(); // Optional: jika kamera perlu langsung aktif
      } else {
        existingForm.style.display = existingForm.style.display === "none" ? "block" : "none";
      }
    });
  }

  async initCamera() {
    let streaming = false;
    const width = 320;
    let height = 0;

    const cameraVideo = document.getElementById("camera-video");
    const cameraCanvas = document.getElementById("camera-canvas");
    const cameraTakeButton = document.getElementById("camera-take-button");
    const cameraOutputList = document.getElementById("camera-list-output");
    const cameraListSelect = document.getElementById("camera-list-select");
    const hiddenInput = document.querySelector('[name="photoBase64"]');

    let currentStream;

    function stopCurrentStream() {
      if (!(currentStream instanceof MediaStream)) return;
      currentStream.getTracks().forEach((track) => track.stop());
    }

    async function getStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: {
              exact: !streaming ? undefined : cameraListSelect.value,
            },
            width: 1280,
            height: 720,
          },
        });
        await populateCameraList();
        return stream;
      } catch (error) {
        console.error("Camera error:", error);
      }
    }

    async function populateCameraList() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      cameraListSelect.innerHTML = videoDevices
        .map(
          (device, i) =>
            `<option value="${device.deviceId}">${
              device.label || `Camera ${i + 1}`
            }</option>`
        )
        .join("");
    }

    function cameraLaunch(stream) {
      cameraVideo.srcObject = stream;
      cameraVideo.play();
    }

    cameraListSelect.addEventListener("change", async () => {
      stopCurrentStream();
      currentStream = await getStream();
      cameraLaunch(currentStream);
    });

    cameraTakeButton.addEventListener("click", () => {
      const context = cameraCanvas.getContext("2d");
      if (width && height) {
        cameraCanvas.width = width;
        cameraCanvas.height = height;
        context.drawImage(cameraVideo, 0, 0, width, height);

        const dataUrl = cameraCanvas.toDataURL("image/png");
        cameraOutputList.innerHTML = `<li><img src="${dataUrl}" alt="Captured" /></li>`;
        hiddenInput.value = dataUrl;
      }
    });

    cameraVideo.addEventListener("canplay", () => {
      if (!streaming) {
        height = cameraVideo.videoHeight / (cameraVideo.videoWidth / width);
        cameraVideo.setAttribute("width", width);
        cameraVideo.setAttribute("height", height);
        cameraCanvas.setAttribute("width", width);
        cameraCanvas.setAttribute("height", height);
        streaming = true;
      }
    });

    currentStream = await getStream();
    cameraLaunch(currentStream);
  }
}

