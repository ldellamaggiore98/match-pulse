import styles from './MatchCard.module.css';

function formatTime(isoDate) {
  return new Date(isoDate).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

export function MatchCard({ match }) {
  const { homeTeam, awayTeam, homeScore, awayScore, status, minute, matchDate } = match;
  const isLive = status === 'LIVE';
  const isFinished = status === 'FT';

  return (
    <div className={`${styles.card} ${isLive ? styles.live : ''}`}>
      {isLive && (
        <div className={styles.liveBar}>
          <span className={styles.liveDot} />
          <span className={styles.liveLabel}>{minute || 'EN VIVO'}</span>
        </div>
      )}

      {!isLive && (
        <div className={styles.meta}>
          {isFinished ? (
            <span className={styles.finished}>Finalizado</span>
          ) : (
            <>
              <span className={styles.date}>{formatDate(matchDate)}</span>
              <span className={styles.time}>{formatTime(matchDate)}</span>
            </>
          )}
        </div>
      )}

      <div className={styles.teams}>
        <div className={`${styles.team} ${isFinished && homeScore > awayScore ? styles.winner : ''}`}>
          <span className={styles.teamName}>{homeTeam}</span>
          {(isLive || isFinished) && (
            <span className={styles.score}>{homeScore ?? 0}</span>
          )}
        </div>

        <div className={styles.vs}>
          {!isLive && !isFinished && <span>vs</span>}
        </div>

        <div className={`${styles.team} ${styles.away} ${isFinished && awayScore > homeScore ? styles.winner : ''}`}>
          {(isLive || isFinished) && (
            <span className={styles.score}>{awayScore ?? 0}</span>
          )}
          <span className={styles.teamName}>{awayTeam}</span>
        </div>
      </div>
    </div>
  );
}
