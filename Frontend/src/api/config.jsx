import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // note the /api
  withCredentials: true,
});

export default api;
