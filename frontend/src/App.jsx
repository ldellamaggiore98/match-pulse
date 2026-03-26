import { useState } from 'react';
import { useMatches } from './hooks/useMatches';
import { useStandings } from './hooks/useStandings';
import { MatchList } from './components/MatchList';
import { StandingsTable } from './components/StandingsTable';
import styles from './App.module.css';

const TABS = [
  { id: 'matches', label: 'Partidos' },
  { id: 'standings', label: 'Posiciones' },
];

export default function App() {
  const [tab, setTab] = useState('matches');
  const { matches, loading: matchesLoading, connected } = useMatches();
  const { standings, loading: standingsLoading } = useStandings();

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <span className={styles.brandDot} />
            <span className={styles.brandName}>MatchPulse</span>
          </div>
          <div className={styles.connectionStatus}>
            <span className={`${styles.statusDot} ${connected ? styles.online : styles.offline}`} />
            <span className={styles.statusLabel}>{connected ? 'En vivo' : 'Conectando...'}</span>
          </div>
        </div>
      </header>

      {/* Mobile tabs — only visible below 768px */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.layout}>

          {/* Left column — Partidos */}
          <section className={`${styles.column} ${tab !== 'matches' ? styles.hideMobile : ''}`}>
            <h2 className={styles.columnTitle}>Liga Profesional</h2>
            <MatchList matches={matches} loading={matchesLoading} />
          </section>

          {/* Right column — Posiciones */}
          <aside className={`${styles.sidebar} ${tab !== 'standings' ? styles.hideMobile : ''}`}>
            <h2 className={styles.columnTitle}>Posiciones</h2>
            <StandingsTable standings={standings} loading={standingsLoading} />
          </aside>

        </div>
      </main>
    </div>
  );
}
