import "./styles/index.css";

export function App() {
  return (
    <main className="app">
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">CMPT 310</p>
        <h1 id="page-title">Neural Network Walkthrough</h1>
        <p>
          A React and TypeScript foundation for an interactive visualization of
          forward passes, loss, backpropagation, and weight updates.
        </p>
      </section>
    </main>
  );
}
