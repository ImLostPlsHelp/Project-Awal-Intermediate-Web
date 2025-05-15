import HomePresenter from "./home-presenter";
import * as StoriesAPI from "../../data/api";

export default class HomePage {
  constructor() {
    this.presenter = new HomePresenter({ view: this, model: StoriesAPI });
    this.showError = this.showError.bind(this);
    this.onStoryAdded = this.onStoryAdded.bind(this);
    this.cameraStream = null;
  }

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

  stopCurrentStream = () => {
      if (!(this.cameraStream instanceof MediaStream)) return;
      this.cameraStream.getTracks().forEach((track) => track.stop());
      this.cameraStream = null;
    };

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
      <textarea name="description" placeholder="Description" required></textarea>
      <div class="camera">
        <video id="camera-video" autoplay></video>
        <button type="button" id="camera-take-button">Take Photo</button>
        <canvas id="camera-canvas" style="display: none;"></canvas>
        <ul id="camera-list-output"></ul>
        <select id="camera-list-select"></select>
      </div>
      <div id="map-form" class="map" style="height: 300px;"></div>
      <input type="hidden" name="lat" />
      <input type="hidden" name="lon" />
      <button type="submit">Submit</button>
    `;

    target.appendChild(form);

    this.initFormMap();
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      formData.append("photo", this.capturedPhotoFile);
      this.stopCurrentStream();
      await this.presenter.handleFormSubmit(formData);
    });
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

  initMap(stories) {
    const rasterTile = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const defaultLocation = [-7.2575, 112.7521];
    const map = L.map("stories-map").setView(defaultLocation, 13);

    L.tileLayer(rasterTile, {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const markerGroup = L.featureGroup();

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).bindPopup(
          `<strong>${story.name}</strong><br>${story.description}`
        );
        markerGroup.addLayer(marker);
      }
    });

    markerGroup.addTo(map);

    if (markerGroup.getLayers().length > 0) {
      map.fitBounds(markerGroup.getBounds());
    }
  }

  renderStories(stories) {
    const storiesList = document.getElementById("stories-list");
    storiesList.innerHTML = `
    <div id="stories-map" class="map" style="height: 400px; margin-bottom: 2rem;"></div>
  `;

    stories.forEach((story) => {
      const storyItem = document.createElement("div");
      storyItem.classList.add("story-item");
      storyItem.innerHTML = `
      <h3>${story.name}</h3>
      <p>${story.description}</p>
      <p>${story.createdAt}</p>
      <img src="${story.photoUrl}" alt="${story.name}" />
    `;
      storiesList.appendChild(storyItem);
    });

    this.initMap(stories);
  }

  async onStoryAdded() {
    alert("Story added!");
    document.getElementById("add-story-form").reset();
    this.capturedPhotoFile = null;

    try {
      const response = await this.presenter.getAllStories();
      const stories = response.listStory;
      this.renderStories(stories);
    } catch (error) {
      this.showError(error.message);
    }
  }

  showError(message) {
    alert("Error: " + message);
    console.log(message);
  }

  async afterRender() {
    try {
      const response = await this.presenter.getAllStories();
      const stories = response.listStory;

      this.renderStories(stories);
    } catch (error) {
      this.showError(error.message);
    }

    document
      .getElementById("add-story-button")
      .addEventListener("click", () => {
        const existingForm = document.getElementById("add-story-form");
        if (!existingForm) {
          this.renderAddStoryForm();
          this.initCamera();
          document.getElementById("add-story-form").style.display = "block";
        } else {
          existingForm.style.display =
            existingForm.style.display === "block" ? "none" : "block";
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

    const getStream = async () => {
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
    };

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

    const cameraLaunch = (stream) => {
      cameraVideo.srcObject = stream;
      cameraVideo.play();
    };

    cameraListSelect.addEventListener("change", async () => {
      this.stopCurrentStream();
      this.cameraStream = await getStream();
      cameraLaunch(this.cameraStream);
    });

    cameraTakeButton.addEventListener("click", async () => {
      const context = cameraCanvas.getContext("2d");

      if (width && height) {
        cameraCanvas.width = width;
        cameraCanvas.height = height;
        context.drawImage(cameraVideo, 0, 0, width, height);

        cameraCanvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "photo.png", { type: "image/png" });
            this.capturedPhotoFile = file;

            const previewURL = URL.createObjectURL(file);
            cameraOutputList.innerHTML = `<li><img src="${previewURL}" alt="Captured" /></li>`;
          } else {
            console.error("Gagal mengambil blob dari canvas.");
          }
        }, "image/png");
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

    this.cameraStream = await getStream();
    cameraLaunch(this.cameraStream);
  }
}
