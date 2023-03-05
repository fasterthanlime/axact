import { createReactor, onMounted, onUnmounted } from "yeap/app";
import { render } from "yeap/web";

let url = new URL("/realtime/cpus", location);
// http => ws
// https => wss
url.protocol = url.protocol.replace("http", "ws");

function createAsyncWSStream(defaultValue, ws, fetcher) {
  const data = createReactor(defaultValue);
  function refetch(e) {
    // this loop is to clean and optimize the HTML render and fix animation
    fetcher(e).forEach((item, i) => {
      if (!!data[i]) data[i](item);
      else data.push(item);
    });
  }

  onMounted(() => {
    ws.addEventListener("message", refetch);
  });
  onUnmounted(() => {
    ws.removeEventListener("message", refetch);
  });

  return data;
}

const color = (a, b) => (n) =>
  n < a ? "#264653" : n >= b ? "#532630" : "#aa964e";

let lastPing = Date.now();

function App() {
  const ws = new WebSocket(url);
  const ping = createReactor("0ms");
  const cpus = createAsyncWSStream([], ws, (event) => {
    const current = Date.now();
    ping(current - lastPing);
    lastPing = current;
    return JSON.parse(event.data);
  });

  return (
    <div>
      <div
        class="bar"
        style={{
          "background-color": ping.compute(color(200_000, 1_000_000)),
        }}
      >
        Ping:{" "}
        {ping.compute((time) => {
          if (time <= 1000) return `${time}µs`;
          if (time <= 1_000_000) return `${Math.round(time / 1000)}ms`;
          return `${Math.round(time / 1_000_000)}s`;
        })}
      </div>
      {cpus.mapReactor((cpu) => (
        <CPUBar cpu={cpu} />
      ))}
    </div>
  );
}

function CPUBar({ cpu }) {
  return (
    <div
      class="bar"
      classList={{
        "bar-orange": cpu.compute((cpu) => cpu >= 50 && cpu < 80),
        "bar-red": cpu.compute((cpu) => cpu >= 80),
      }}
    >
      <div
        class="bar-inner"
        style={{ width: cpu.compute((cpu) => `${cpu}%`) }}
      ></div>
      <span>{cpu.toFixed(2)}%</span>
    </div>
  );
}

render(<App />, document.body);
