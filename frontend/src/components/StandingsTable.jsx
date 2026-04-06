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

function Table({ title, rows }) {
  return (
    <div className={styles.group}>
      <div className={styles.groupTitle}>Grupo {title}</div>
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
            return (
              <tr key={row.id ?? i} className={i < 4 ? styles.qualified : ''}>
                <td className={styles.colRank}>{i + 1}</td>
                <td className={styles.colTeam}>{row.team}</td>
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
      {standings.groupA.length > 0 && <Table title="A" rows={standings.groupA} />}
      {standings.groupB.length > 0 && <Table title="B" rows={standings.groupB} />}
    </div>
  );
}
