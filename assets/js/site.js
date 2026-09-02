(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  const papers = Array.from(document.querySelectorAll('.paper'));
  const filterButtons = Array.from(document.querySelectorAll('.filter-button'));
  const search = document.querySelector('.publication-search');
  const empty = document.querySelector('.paper-empty');
  let activeFilter = 'all';

  function updatePapers() {
    if (!papers.length) return;
    const query = search ? search.value.trim().toLowerCase() : '';
    let visible = 0;

    papers.forEach(function (paper) {
      const category = paper.dataset.category || '';
      const haystack = paper.textContent.toLowerCase();
      const categoryMatch = activeFilter === 'all' || category.split(' ').includes(activeFilter);
      const searchMatch = !query || haystack.includes(query);
      paper.hidden = !(categoryMatch && searchMatch);
      if (!paper.hidden) visible += 1;
    });

    if (empty) empty.hidden = visible !== 0;
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.dataset.filter || 'all';
      filterButtons.forEach(function (item) {
        item.setAttribute('aria-pressed', String(item === button));
      });
      updatePapers();
    });
  });

  if (search) search.addEventListener('input', updatePapers);

  const courseContent = document.querySelector('.course-content');
  const courseToc = document.querySelector('.course-toc');

  if (courseContent && courseToc) {
    const headings = Array.from(courseContent.querySelectorAll(':scope > h1, :scope > h2'));

    headings.forEach(function (heading, index) {
      if (!heading.id) heading.id = 'course-section-' + (index + 1);
      const link = document.createElement('a');
      link.href = '#' + heading.id;
      link.textContent = heading.textContent.trim();
      courseToc.appendChild(link);
    });
  }
})();
