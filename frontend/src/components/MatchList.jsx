import { useState, useMemo } from 'react';
import { MatchCard } from './MatchCard';
import styles from './MatchList.module.css';

const ART_OFFSET_MS = 3 * 60 * 60 * 1000;

function toARTDateString(isoDate) {
  return new Date(new Date(isoDate).getTime() - ART_OFFSET_MS).toISOString().slice(0, 10);
}

function formatDateLabel(dateStr) {
  const todayStr = toARTDateString(new Date().toISOString());
  const tomorrowStr = toARTDateString(new Date(Date.now() + 86400000).toISOString());

  if (dateStr === todayStr) return 'Hoy';
  if (dateStr === tomorrowStr) return 'Mañana';

  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}`;
}

const STATUS_FILTERS = [
  { id: 'all',      label: 'Todos' },
  { id: 'LIVE',     label: 'En vivo' },
  { id: 'NS',       label: 'Próximos' },
  { id: 'FT',       label: 'Finalizados' },
];

function Section({ title, matches, accent }) {
  if (matches.length === 0) return null;
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle} style={{ color: accent }}>
        {title}
        <span className={styles.count}>{matches.length}</span>
      </h2>
      <div className={styles.list}>
        {matches.map((m) => <MatchCard key={m.flashscoreId} match={m} />)}
      </div>
    </div>
  );
}

export function MatchList({ matches, loading }) {
  const all = useMemo(
    () => [...matches.live, ...matches.upcoming, ...matches.finished],
    [matches]
  );

  const dates = useMemo(() => {
    const set = new Set(all.map((m) => toARTDateString(m.matchDate)));
    return Array.from(set).sort();
  }, [all]);

  const todayStr = toARTDateString(new Date().toISOString());
  const defaultDate = dates.includes(todayStr) ? todayStr : dates[0] ?? todayStr;

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Reset status filter when changing date
  function handleDateChange(date) {
    setSelectedDate(date);
    setSelectedStatus('all');
  }

  const filtered = useMemo(() => {
    const byDate = all.filter((m) => toARTDateString(m.matchDate) === selectedDate);
    if (selectedStatus === 'all') return byDate;
    return byDate.filter((m) => m.status === selectedStatus);
  }, [all, selectedDate, selectedStatus]);

  const live     = filtered.filter((m) => m.status === 'LIVE');
  const upcoming = filtered.filter((m) => m.status === 'NS');
  const finished = filtered.filter((m) => m.status === 'FT');

  if (loading) {
    return <div className={styles.empty}><span className={styles.spinner} /></div>;
  }

  if (all.length === 0) {
    return <div className={styles.empty}><p>No hay partidos disponibles.</p></div>;
  }

  return (
    <div className={styles.wrapper}>

      {/* Date bar */}
      <div className={styles.dateBar}>
        {dates.map((d) => (
          <button
            key={d}
            className={`${styles.datePill} ${selectedDate === d ? styles.datePillActive : ''}`}
            onClick={() => handleDateChange(d)}
          >
            {formatDateLabel(d)}
          </button>
        ))}
      </div>

      {/* Status filters */}
      <div className={styles.statusBar}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            className={`${styles.statusPill} ${selectedStatus === f.id ? styles.statusPillActive : ''}`}
            onClick={() => setSelectedStatus(f.id)}
          >
            {f.id === 'LIVE' && <span className={styles.liveDotSmall} />}
            {f.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>No hay partidos para este filtro.</p>
        </div>
      ) : (
        <div className={styles.sections}>
          <Section title="En vivo"    matches={live}     accent="var(--live)" />
          <Section title="Próximos"   matches={upcoming} accent="var(--accent)" />
          <Section title="Finalizados" matches={finished} accent="var(--text-muted)" />
        </div>
      )}
    </div>
  );
}
