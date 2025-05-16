import CONFIG from "../config";

const ENDPOINTS = {
  GET_ALL_STORIES: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
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

export async function login(email, password) {
  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    body: 
    JSON.stringify({
      email,
      password,
    })
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function register(name, email, password) {
    const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    body: 
    JSON.stringify({
      name,
      email,
      password,
    })
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}