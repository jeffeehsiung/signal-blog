function initTopicFilter(root = document) {
  const buttons = root.querySelectorAll('[data-topic]');
  const cards = root.querySelectorAll('.research-card');

  if (!buttons.length || !cards.length) return;

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
}

window.DualityModules = window.DualityModules || {};
window.DualityModules.initTopicFilter = initTopicFilter;
