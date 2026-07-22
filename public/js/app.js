const form = document.getElementById('search-form');
const searchBtn = document.getElementById('search-btn');
const statusPanel = document.getElementById('status-panel');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error-message');
const resultsPanel = document.getElementById('results-panel');
const resultsTitle = document.getElementById('results-title');
const resultsBody = document.getElementById('results-body');

const GAME_MODE_LABELS = {
  solo: 'Solo',
  'solo-fpp': 'Solo FPP',
  duo: 'Duo',
  'duo-fpp': 'Duo FPP',
  squad: 'Squad',
  'squad-fpp': 'Squad FPP',
};

function formatGameMode(mode) {
  return GAME_MODE_LABELS[mode] || mode;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function showLoading() {
  statusPanel.classList.remove('hidden');
  loadingEl.classList.remove('hidden');
  errorEl.classList.add('hidden');
  resultsPanel.classList.add('hidden');
}

function showError(message) {
  statusPanel.classList.remove('hidden');
  loadingEl.classList.add('hidden');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
  resultsPanel.classList.add('hidden');
}

function hideStatus() {
  statusPanel.classList.add('hidden');
  loadingEl.classList.add('hidden');
  errorEl.classList.add('hidden');
}

function renderResults(data) {
  hideStatus();
  resultsTitle.textContent = `Dernières parties de ${data.playerName}`;
  resultsBody.innerHTML = '';

  const table = document.getElementById('results-table');
  const emptyState = document.getElementById('empty-state');

  if (data.matches.length === 0) {
    table.classList.add('hidden');
    emptyState.classList.remove('hidden');
    emptyState.innerHTML = `
      <p class="empty-icon">🎯</p>
      <p>Aucune partie récente trouvée pour <strong>${escapeHtml(data.playerName)}</strong>.</p>
      <p class="empty-hint">L'API PUBG ne conserve que les 14 derniers jours de parties : ce joueur n'a peut-être pas joué récemment.</p>
    `;
  } else {
    table.classList.remove('hidden');
    emptyState.classList.add('hidden');

    for (const match of data.matches) {
      const row = document.createElement('tr');
      if (match.chickenDinner) row.classList.add('chicken-dinner');

      row.innerHTML = `
        <td>${formatGameMode(match.gameMode)}</td>
        <td>${formatDate(match.createdAt)}</td>
        <td>${match.kills}</td>
        <td>${match.damage}</td>
        <td class="rank-cell ${match.rank === 1 ? 'rank-1' : ''}">#${match.rank}</td>
        <td>${match.chickenDinner ? '<span class="chicken-badge">🏆 Winner Winner</span>' : '—'}</td>
      `;
      resultsBody.appendChild(row);
    }
  }

  resultsPanel.classList.remove('hidden');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const playerName = document.getElementById('player-name').value.trim();
  const platform = document.getElementById('platform').value;

  if (!playerName) return;

  searchBtn.disabled = true;
  showLoading();

  try {
    const params = new URLSearchParams({ name: playerName, platform });
    const response = await fetch(`/api/player?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Une erreur est survenue');
    }

    renderResults(data);
  } catch (err) {
    showError(err.message);
  } finally {
    searchBtn.disabled = false;
  }
});
