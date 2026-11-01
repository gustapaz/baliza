import ClientBoot from "./client-boot";
export default function Home() {
  return (
    <>
      <a className="skip" href="#app-root">
        Ir ao nonograma
      </a>
      <header>
        <span>JORNAL DE PEQUENAS DESCOBERTAS</span>
        <a href="/" className="brand">
          baliza<span>PASSATEMPOS PARA OLHAR DE NOVO</span>
        </a>
        <span>EDIÇÃO 001 / SEM CRONÔMETRO</span>
      </header>
      <nav>
        <span>RACIOCÍNIO / ESPAÇO / INTERVALO</span>
        <a href="/api-docs.html">Regras e API ↗</a>
      </nav>
      <main id="app-root">
        <p>Preparando o caderno…</p>
      </main>
      <footer>
        <span>Uma experiência de Gustavo Paz</span>
        <a href="/credits.html">Créditos ↗</a>
        <a href="https://github.com/gustapaz/baliza">Código ↗</a>
        <button id="motion-toggle" aria-pressed="false">
          Pausar movimento
        </button>
      </footer>
      <ClientBoot />
    </>
  );
}
