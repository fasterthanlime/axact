import { h, Component, render } from "https://unpkg.com/preact?module";

let i = 0;

setInterval(async () => {
  let response = await fetch("/api/cpus");
  if (response.status !== 200) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  let json = await response.json();

  const app = h("pre", null, JSON.stringify(json, null, 2));

  render(app, document.body);
}, 1000);
