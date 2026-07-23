const reviewInput = document.getElementById('review-input');
const toneSelect = document.getElementById('tone-select');
const generateBtn = document.getElementById('generate-btn');
const errorMessage = document.getElementById('error-message');
const resultSection = document.getElementById('result-section');
const replyOutput = document.getElementById('reply-output');
const copyBtn = document.getElementById('copy-btn');
const copyConfirmation = document.getElementById('copy-confirmation');

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function hideError() {
  errorMessage.classList.add('hidden');
}

generateBtn.addEventListener('click', async () => {
  const review = reviewInput.value.trim();
  const tone = toneSelect.value;

  hideError();
  resultSection.classList.add('hidden');
  copyConfirmation.classList.add('hidden');

  if (!review) {
    showError("Merci de coller le texte de l'avis client avant de générer une réponse.");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = 'Génération en cours...';

  try {
    const response = await fetch('/api/generate-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review, tone }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Une erreur est survenue.');
    }

    replyOutput.value = data.reply;
    resultSection.classList.remove('hidden');
  } catch (error) {
    showError(error.message);
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Générer la réponse';
  }
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(replyOutput.value);
    copyConfirmation.classList.remove('hidden');
    setTimeout(() => copyConfirmation.classList.add('hidden'), 2000);
  } catch (error) {
    showError('Impossible de copier automatiquement. Sélectionnez le texte manuellement.');
  }
});
