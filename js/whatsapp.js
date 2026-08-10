const WA_NUMBER = '27638305734';
const WA_BASE_URL = 'https://wa.me/' + WA_NUMBER;

function openWhatsApp(message) {
  const url = message
    ? WA_BASE_URL + '?text=' + encodeURIComponent(message)
    : WA_BASE_URL;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function notifyWhatsApp(formData) {
  const message = '*New Inquiry from Gamewiztech ZA Website*\n\n*Name:* ' + formData.name + '\n*Email:* ' + formData.email + '\n*Subject:* ' + formData.subject + '\n*Message:* ' + formData.message;
  openWhatsApp(message);
}
