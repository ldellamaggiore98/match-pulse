import styles from './StandingsTable.module.css';

function Table({ title, rows }) {
  return (
    <div className={styles.group}>
      <h3 className={styles.groupTitle}>Grupo {title}</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.rank}>#</th>
            <th className={styles.teamCol}>Equipo</th>
            <th className={styles.pts}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className={i < 4 ? styles.qualified : ''}>
              <td className={styles.rank}>{i + 1}</td>
              <td className={styles.teamCol}>{row.team}</td>
              <td className={styles.pts}>{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StandingsTable({ standings, loading }) {
  if (loading) {
    return (
      <div className={styles.empty}>
        <span className={styles.spinner} />
      </div>
    );
  }

  const hasData = standings.groupA.length > 0 || standings.groupB.length > 0;

  if (!hasData) {
    return (
      <div className={styles.empty}>
        <p>No hay posiciones disponibles.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {standings.groupA.length > 0 && <Table title="A" rows={standings.groupA} />}
      {standings.groupB.length > 0 && <Table title="B" rows={standings.groupB} />}
    </div>
  );
}
