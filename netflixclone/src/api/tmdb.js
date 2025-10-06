// src/api/tmdb.js
import axios from "axios";

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";

const tmdb = axios.create({
  baseURL: BASE,
  params: { api_key: API_KEY, language: "en-US" },
});

export const fetchMovies = (path) =>
  tmdb.get(path).then((res) => res.data.results);

export const fetchVideos = (type, id) =>
  tmdb.get(`/${type}/${id}/videos`).then((res) => res.data.results);

export default tmdb;
