import { createReactor, onMounted, onUnmounted } from "yeap/app";
import { render } from "yeap/web";

let url = new URL("/realtime/cpus", location);
// http => ws
// https => wss
url.protocol = url.protocol.replace("http", "ws");

function createAsyncWSStream(defaultValue, ws, fetcher) {
  const data = createReactor(defaultValue);
  function refetch(e) {
    Promise.all([fetcher(e)]).then(([result]) => {
      data(result);
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

function App() {
  const ws = new WebSocket(url);
  const cpus = createAsyncWSStream([], ws, (event) => JSON.parse(event.data));

  return (
    <div>
      {cpus.mapReactor((cpu) => (
        <CPUBar cpu={cpu.compute((cpu) => `${cpu.toFixed(2)}%`)} />
      ))}
    </div>
  );
}

function CPUBar({ cpu }) {
  return (
    <div class="bar">
      <div class="bar-inner" style={{ width: cpu }}></div>
      <label>{cpu}</label>
    </div>
  );
}

render(<App />, document.body);
