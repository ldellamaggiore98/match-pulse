import { useState } from 'react';
import { useMatches } from './hooks/useMatches';
import { useStandings } from './hooks/useStandings';
import { useLogos } from './hooks/useLogos';
import { MatchList } from './components/MatchList';
import { StandingsTable } from './components/StandingsTable';
import styles from './App.module.css';

const COMPETITIONS = [
  { id: 'liga-profesional', label: 'Liga Profesional' },
  { id: 'copa-argentina',   label: 'Copa Argentina'   },
  { id: 'copa-libertadores', label: 'Copa Libertadores' },
];

const STANDINGS_TABS = [
  { id: 'apertura',  label: 'Apertura'    },
  { id: 'anual',     label: 'Tabla Anual' },
  { id: 'promedios', label: 'Promedios'   },
];

export default function App() {
  const [competition, setCompetition]   = useState('liga-profesional');
  const [mainTab, setMainTab]           = useState('matches');
  const [standingsTab, setStandingsTab] = useState('apertura');

  const { matches, loading: matchesLoading, connected } = useMatches();
  const { standings, loading: standingsLoading }        = useStandings(standingsTab);
  const logos                                           = useLogos();

  const isLiga = competition === 'liga-profesional';

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
              className={`${styles.tabBtn} ${mainTab === 'matches' ? styles.tabActive : ''}`}
              onClick={() => setMainTab('matches')}
            >
              Partidos
            </button>
            <button
              className={`${styles.tabBtn} ${mainTab === 'standings' ? styles.tabActive : ''}`}
              onClick={() => setMainTab('standings')}
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

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <p className={styles.sidebarTitle}>Competiciones</p>
          <nav>
            {COMPETITIONS.map((c) => (
              <button
                key={c.id}
                className={`${styles.sidebarItem} ${competition === c.id ? styles.sidebarActive : ''}`}
                onClick={() => setCompetition(c.id)}
              >
                {c.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className={styles.main}>
          {!isLiga ? (
            <div className={styles.comingSoon}>
              <p className={styles.comingSoonText}>Próximamente</p>
              <p className={styles.comingSoonSub}>
                {COMPETITIONS.find((c) => c.id === competition)?.label} estará disponible pronto.
              </p>
            </div>
          ) : mainTab === 'matches' ? (
            <div className={styles.matchesLayout}>
              <section className={styles.column}>
                <h2 className={styles.columnTitle}>Liga Profesional</h2>
                <MatchList matches={matches} loading={matchesLoading} logos={logos} />
              </section>
            </div>
          ) : (
            <div className={styles.standingsLayout}>
              <div className={styles.standingsHeader}>
                <h2 className={styles.columnTitle}>Posiciones — Liga Profesional</h2>
                <nav className={styles.subtabs}>
                  {STANDINGS_TABS.map((t) => (
                    <button
                      key={t.id}
                      className={`${styles.subtabBtn} ${standingsTab === t.id ? styles.subtabActive : ''}`}
                      onClick={() => setStandingsTab(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </nav>
              </div>
              <StandingsTable standings={standings} loading={standingsLoading} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
