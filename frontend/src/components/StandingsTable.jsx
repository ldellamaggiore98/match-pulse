import styles from './StandingsTable.module.css';

const FORM_LABELS = { V: 'Victoria', E: 'Empate', L: 'Derrota' };

function FormBadge({ result }) {
  return (
    <span
      className={`${styles.formBadge} ${styles[`form${result}`]}`}
      title={FORM_LABELS[result] ?? result}
    >
      {result}
    </span>
  );
}

const TABLE_LABELS = {
  apertura:  (group) => `Grupo ${group}`,
  anual:     () => 'Tabla Anual',
  promedios: () => 'Promedios',
};

function Table({ title, rows, tableType }) {
  const showRelegation = tableType === 'anual' || tableType === 'promedios';
  const groupLabel = (TABLE_LABELS[tableType] ?? TABLE_LABELS.apertura)(title);
  return (
    <div className={styles.group}>
      <div className={styles.groupTitle}>{groupLabel}</div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.colRank}>#</th>
            <th className={styles.colTeam}>Equipo</th>
            <th className={styles.colNum} title="Partidos jugados">PJ</th>
            <th className={styles.colNum} title="Partidos ganados">V</th>
            <th className={styles.colNum} title="Partidos empatados">E</th>
            <th className={styles.colNum} title="Partidos perdidos">D</th>
            <th className={styles.colNum} title="Goles a favor">GF</th>
            <th className={styles.colNum} title="Goles en contra">GC</th>
            <th className={styles.colNum} title="Diferencia de gol">DG</th>
            <th className={styles.colPts} title="Puntos">Pts</th>
            <th className={styles.colForm}>Forma</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const diff = row.goalsFor - row.goalsAgainst;
            const form = row.form ? row.form.split(',').filter(Boolean) : [];
            const isLast = i === rows.length - 1;
            const rowClass = showRelegation && isLast
              ? styles.relegated
              : i < 4 ? styles.qualified : '';
            return (
              <tr key={row.id ?? i} className={rowClass}>
                <td className={styles.colRank}>{i + 1}</td>
                <td className={styles.colTeam}>
                  <div className={styles.teamCell}>
                    {row.logo && <img src={row.logo} alt={row.team} className={styles.teamLogo} />}
                    <span>{row.team}</span>
                  </div>
                </td>
                <td className={styles.colNum}>{row.played}</td>
                <td className={styles.colNum}>{row.won}</td>
                <td className={styles.colNum}>{row.drawn}</td>
                <td className={styles.colNum}>{row.lost}</td>
                <td className={styles.colNum}>{row.goalsFor}</td>
                <td className={styles.colNum}>{row.goalsAgainst}</td>
                <td className={styles.colNum}>{diff > 0 ? `+${diff}` : diff}</td>
                <td className={styles.colPts}>{row.points}</td>
                <td className={styles.colForm}>
                  <div className={styles.formList}>
                    {form.slice(-6).map((r, j) => <FormBadge key={j} result={r} />)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StandingsTable({ standings, loading }) {
  if (loading) {
    return <div className={styles.empty}><span className={styles.spinner} /></div>;
  }

  const hasData = standings.groupA.length > 0 || standings.groupB.length > 0;

  if (!hasData) {
    return <div className={styles.empty}><p>No hay posiciones disponibles.</p></div>;
  }

  return (
    <div className={styles.wrapper}>
      {standings.groupA.length > 0 && <Table title="A" rows={standings.groupA} tableType={standings.tableType} />}
      {standings.groupB.length > 0 && <Table title="B" rows={standings.groupB} tableType={standings.tableType} />}
    </div>
  );
}
