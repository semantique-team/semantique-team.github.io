const people = [
  {
    name: 'Roberto Zanolli',
    href: 'https://www.linkedin.com/in/roberto-zanolli-2003-bo/',
  },
  {
    name: 'Tancredi Bosi',
    href: 'https://www.linkedin.com/in/tancredi-bosi-747004298/',
  },
]

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <path d="M3.25 8h9.5M8.5 3.75 12.75 8 8.5 12.25" />
    </svg>
  )
}

function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Semantique home">
          <img src="/logo.svg" alt="Semantique" />
        </a>

        <nav aria-label="Main navigation">
          <a href="#lab">Lab</a>
          <a href="#about">About</a>
          <a href="#articles">Articles</a>
        </nav>
      </header>

      <main id="main">
        <section className="hero page-shell" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" /> AI engineering lab</p>
            <h1 id="hero-title">
              Creative uses of language models, <em>for real problems.</em>
            </h1>
            <p className="hero-description">
              Semantique is a small lab exploring how large language models can be
              applied to practical problems in new ways.
            </p>
            <a className="text-link" href="#lab">
              Explore the lab <ArrowIcon />
            </a>
          </div>

          <div className="hero-panel" aria-label="Current experiment: System 1 models">
            <div className="panel-topline">
              <span>Semantique / Lab notes</span>
              <span className="panel-index">01</span>
            </div>
            <div className="mark-stage">
              <span className="stage-label">Current experiment</span>
              <img className="spider-mark" src="/favicon.png" alt="" />
              <span className="stage-coordinate">S · 01</span>
            </div>
            <div className="panel-bottomline">
              <div>
                <span className="micro-label">Focus</span>
                <p>System 1 models</p>
              </div>
              <div className="panel-arrow" aria-hidden="true">
                <ArrowIcon />
              </div>
            </div>
          </div>

          <div className="hero-index" aria-hidden="true">
            <span>01 — 03</span>
            <span className="index-rule" />
            <span>Scroll to explore</span>
          </div>
        </section>

        <section className="lab-section page-shell section-grid" id="lab" aria-labelledby="lab-title">
          <div className="section-intro">
            <p className="eyebrow"><span className="section-slash">//</span> The lab</p>
            <h2 id="lab-title">We study creative ways to put LLMs to work.</h2>
          </div>
          <div className="section-body">
            <p className="body-lead">
              We prototype applications for open-source language models and put
              them in front of real problems.
            </p>
            <p>
              We share every experiment as it happens: what worked, what failed,
              and what we&apos;d try next.
            </p>
            <div className="focus-card">
              <div className="focus-card-heading">
                <span className="micro-label">Current experiment</span>
                <span className="focus-spark" aria-hidden="true">✳</span>
              </div>
              <h3>System 1 models</h3>
              <p>
                We are currently experimenting with System 1 models using
                open-source language models.
              </p>
              <div className="focus-tags" aria-label="Research focus">
                <span>Open source</span>
                <span>Language models</span>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section page-shell" id="about" aria-labelledby="about-title">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow"><span className="section-slash">//</span> About</p>
              <h2 id="about-title">Two young AI engineers.</h2>
            </div>
          </div>

          <div className="people-list">
            {people.map((person) => (
              <a
                className="person-row"
                key={person.name}
                href={person.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${person.name} on LinkedIn (opens in a new tab)`}
              >
                <span className="person-name">{person.name}</span>
                <span className="person-cta">
                  LinkedIn <ArrowIcon />
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="articles-section page-shell" id="articles" aria-labelledby="articles-title">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow"><span className="section-slash">//</span> Articles</p>
              <h2 id="articles-title">Notes from the lab.</h2>
            </div>
            <span className="micro-label article-count">0 articles</span>
          </div>

          <div className="empty-state">
            <span className="empty-symbol" aria-hidden="true">✳</span>
            <div>
              <h3>Nothing published yet.</h3>
              <p>When we have something to share, it will find its way here.</p>
            </div>
            <span className="empty-coordinate">S / NOTES</span>
          </div>
        </section>
      </main>

      <footer className="site-footer page-shell">
        <a className="footer-brand" href="#top">semantique.</a>
        <span>AI engineering lab</span>
        <a href="#top" className="back-to-top">Back to top <ArrowIcon /></a>
      </footer>
    </>
  )
}

export default App
