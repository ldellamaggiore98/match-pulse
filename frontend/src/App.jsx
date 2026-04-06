import { useState } from 'react';
import { useMatches } from './hooks/useMatches';
import { useStandings } from './hooks/useStandings';
import { MatchList } from './components/MatchList';
import { StandingsTable } from './components/StandingsTable';
import styles from './App.module.css';

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
          <nav className={styles.tabs}>
            <button
              className={`${styles.tabBtn} ${tab === 'matches' ? styles.tabActive : ''}`}
              onClick={() => setTab('matches')}
            >
              Partidos
            </button>
            <button
              className={`${styles.tabBtn} ${tab === 'standings' ? styles.tabActive : ''}`}
              onClick={() => setTab('standings')}
            >
              Posiciones
            </button>
          </nav>
          <div className={styles.connectionStatus}>
            <span className={`${styles.statusDot} ${connected ? styles.online : styles.offline}`} />
            <span className={styles.statusLabel}>{connected ? 'En vivo' : 'Conectando...'}</span>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {tab === 'matches' && (
          <div className={styles.matchesLayout}>
            <section className={styles.column}>
              <h2 className={styles.columnTitle}>Liga Profesional</h2>
              <MatchList matches={matches} loading={matchesLoading} />
            </section>
          </div>
        )}

        {tab === 'standings' && (
          <div className={styles.standingsLayout}>
            <h2 className={styles.columnTitle}>Posiciones — Liga Profesional</h2>
            <StandingsTable standings={standings} loading={standingsLoading} />
          </div>
        )}
      </main>
    </div>
  );
}
