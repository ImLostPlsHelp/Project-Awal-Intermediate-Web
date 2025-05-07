import CONFIG from "../config";

const ENDPOINTS = {
  GET_ALL_STORIES: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
};

export async function getAllStories() {
  const fetchResponse = await fetch(ENDPOINTS.GET_ALL_STORIES, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${CONFIG.ACCESS_TOKEN}`,
    },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };

}

export async function addStory(formData) {
  const fetchResponse = await fetch(ENDPOINTS.ADD_STORY, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${CONFIG.ACCESS_TOKEN}`,
    },
    body: formData,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}