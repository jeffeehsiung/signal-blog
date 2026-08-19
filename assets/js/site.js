document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('[data-topic]');
  const cards = document.querySelectorAll('.research-card');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const topic = button.dataset.topic;
      buttons.forEach((item) => item.classList.toggle('is-active', item === button));
      cards.forEach((card) => {
        const topics = card.dataset.topics || '';
        card.hidden = topic !== 'all' && !topics.includes(topic);
      });
    });
  });
});
