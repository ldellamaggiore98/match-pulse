import styles from './MatchCard.module.css';

function formatTime(isoDate) {
  return new Date(isoDate).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

export function MatchCard({ match }) {
  const { homeTeam, awayTeam, homeScore, awayScore, status, minute, matchDate } = match;
  const isLive = status === 'LIVE';
  const isFinished = status === 'FT';
  const homeWins = isFinished && homeScore > awayScore;
  const awayWins = isFinished && awayScore > homeScore;

  return (
    <div className={`${styles.card} ${isLive ? styles.cardLive : ''}`}>

      {/* Top status row */}
      <div className={styles.statusRow}>
        {isLive && (
          <span className={styles.liveTag}>
            <span className={styles.liveDot} />
            {minute || 'En vivo'}
          </span>
        )}
        {isFinished && (
          <span className={styles.ftTag}>Finalizado</span>
        )}
        {!isLive && !isFinished && (
          <span className={styles.datetime}>
            <span className={styles.date}>{formatDate(matchDate)}</span>
            <span className={styles.sep}> • </span>
            <span className={styles.time}>{formatTime(matchDate)}</span>
          </span>
        )}
      </div>

      {/* Main match row */}
      <div className={styles.matchRow}>
        <span className={`${styles.teamName} ${homeWins ? styles.winner : ''} ${awayWins ? styles.loser : ''}`}>
          {homeTeam}
        </span>

        <div className={styles.centerBlock}>
          {(isLive || isFinished) ? (
            <div className={styles.scoreBlock}>
              <span className={`${styles.score} ${homeWins ? styles.scoreWinner : ''}`}>{homeScore ?? 0}</span>
              <span className={styles.scoreDash}>—</span>
              <span className={`${styles.score} ${awayWins ? styles.scoreWinner : ''}`}>{awayScore ?? 0}</span>
            </div>
          ) : (
            <span className={styles.vs}>VS</span>
          )}
        </div>

        <span className={`${styles.teamName} ${styles.teamRight} ${awayWins ? styles.winner : ''} ${homeWins ? styles.loser : ''}`}>
          {awayTeam}
        </span>
      </div>

    </div>
  );
}
