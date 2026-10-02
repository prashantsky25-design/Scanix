export const formatDate = (d) =>
  new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
