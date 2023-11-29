// define baseUrl:
const isLocalHost = window.location.href.includes("localhost");

export const baseUrl = isLocalHost ? "http://localhost:4001" : "";