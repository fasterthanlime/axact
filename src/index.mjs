import htm from "https://unpkg.com/htm?module";
import {
  useEffect,
  useState,
} from "https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module";
import { h, render } from "https://unpkg.com/preact@latest?module";

const html = htm.bind(h);

function percentageToColor(percentage, maxHue = 0, minHue = 120) {
  const hue = 120 - percentage;
  return `hsl(${hue}, 100%, 50%)`;
}

const map = (x, in_min, in_max, out_min, out_max) => {
  return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

const mapper = (range) => {
  return (x) => {
    return map(x, 0, 100, 0, range);
  };
};

const m = mapper(120);

function Proc({ cpu, total }) {
  return html`<div
    class="bar-inner"
    style="
      width: ${cpu}%;
      opacity: ${cpu / 100};
      background: ${percentageToColor(m(cpu))}
    "
  ></div>`;
}

function CpuGraph({ cpus }) {
  if (cpus) {
    return html`
      <div class="procs">
        ${cpus
          .map((cpu, i) => ({ cpu, i }))
          .sort((a, b) => (a.cpu < b.cpu ? 1 : -1))
          .map(({ cpu, i }) => {
            return html`<div class="bar">
              <${Proc} cpu=${cpu} total=${cpus.length} />
              <label>${i}</label>
            </div>`;
          })}
      </div>
    `;
  }
}

function App() {
  let url = new URL("/realtime/cpus", window.location.href);
  url.protocol = url.protocol.replace("http", "ws");
  const [cpus, setCpus] = useState();
  useEffect(() => {
    let ws = new WebSocket(url.href);
    ws.onmessage = (ev) => {
      let cpusUpdate = JSON.parse(ev.data);
      setCpus(cpusUpdate);
    };
    return () => {
      ws.close();
    };
  }, []);

  return html`<${CpuGraph} cpus=${cpus}></${CpuGraph}>`;
}

render(html`<${App} />`, document.body);
