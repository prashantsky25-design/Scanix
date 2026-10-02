import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

export const errorMessage = (err, fallback = "Something went wrong. Try again.") =>
  err.response?.data?.message || fallback;
