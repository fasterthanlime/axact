document.addEventListener("DOMContentLoaded", () => {
  let i = 0;

  setInterval(() => {
    i = i + 1;
    document.body.textContent = `cycle ${i}`;
  }, 1000);
});
