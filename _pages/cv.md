---
layout: modern
permalink: /bio/
title: "Biography"
nav_key: bio
description: "Biography, academic appointments, education, honors, service, and recruiting information for Yiping Lu."
redirect_from:
  - /cv/
  - /resume/
---

<header class="page-intro">
  <div class="shell page-intro-grid">
    <div>
      <span class="page-number">05 · Biography</span>
      <h1>CV</h1>
    </div>
    <div>
      <div class="button-row">
        <a class="button button-outline" href="https://www.overleaf.com/read/swtsssgpcwnz#b5c621">Current CV</a>
        <a class="button button-outline" href="/files/rs.pdf">Research statement</a>
      </div>
    </div>
  </div>
  <nav class="shell bio-section-nav" aria-label="Biography sections">
    <a href="#academic-path">Academic path</a>
    <a href="#recognition">Honors and service</a>
    <a href="#selected-talks">Selected talks and tutorials</a>
  </nav>
</header>

<section class="section section-soft" id="academic-path">
  <div class="shell">
    <div class="section-head">
      <div>
        <div class="eyebrow">Appointments and education</div>
        <h2>Academic path</h2>
      </div>
      <p>Training in applied mathematics, scientific computing, probability, and machine learning.</p>
    </div>
    <div class="timeline">
      <div class="timeline-item">
        <div class="timeline-date">2026 · Present</div>
        <div>
          <h3>Assistant Professor · Beijing International Center for Mathematical Research</h3>
          <p>Peking University</p>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-date">2024 · 2026</div>
        <div>
          <h3>Assistant Professor · Industrial Engineering and Management Sciences</h3>
          <p>Northwestern University, with a courtesy appointment in Engineering Sciences and Applied Mathematics</p>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-date">2023 · 2024</div>
        <div>
          <h3>Courant Instructor · Courant Institute of Mathematical Sciences</h3>
          <p>New York University</p>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-date">2019 · 2023</div>
        <div>
          <h3>PhD · Computational and Mathematical Engineering</h3>
          <p>Stanford University · advised by Lexing Ying and Jose Blanchet</p>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-date">2015 · 2019</div>
        <div>
          <h3>BS · Applied Mathematics</h3>
          <p>School of Mathematical Sciences, Peking University</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="recognition">
  <div class="shell">
    <div class="section-head">
      <div>
        <div class="eyebrow">Recognition</div>
        <h2>Honors and service</h2>
      </div>
      <p>Selected recognition and professional service across machine learning and applied mathematics.</p>
    </div>
    <div class="fact-grid recognition-grid">
      <article class="fact-card">
        <div class="project-meta">Awards</div>
        <h3>CPAL Rising Star Award</h3>
        <p>Conference on Parsimony and Learning, 2024.</p>
      </article>
      <article class="fact-card">
        <div class="project-meta">Awards</div>
        <h3>Rising Star in Data Science</h3>
        <p>University of Chicago, 2022.</p>
      </article>
      <article class="fact-card">
        <div class="project-meta">Fellowship</div>
        <h3>Stanford Interdisciplinary Graduate Fellowship</h3>
        <p>Support for interdisciplinary doctoral research, 2021 to 2024.</p>
      </article>
      <article class="fact-card">
        <div class="project-meta">Editorial service</div>
        <h3>Associate Editor</h3>
        <p>Mathematics of Operations Research.</p>
      </article>
      <article class="fact-card">
        <div class="project-meta">Conference service</div>
        <h3>Area Chair</h3>
        <p>Service for major machine learning conferences including ICML, NeurIPS, ICLR, and AISTATS.</p>
      </article>
      <article class="fact-card">
        <div class="project-meta">Community</div>
        <h3>Scientific ML leadership</h3>
        <p>Tutorials, seminars, workshops, and interdisciplinary community building.</p>
      </article>
    </div>
  </div>
</section>

<section class="section section-soft" id="selected-talks">
  <div class="shell">
    <div class="section-head">
      <div>
        <div class="eyebrow">Academic talks</div>
        <h2>Selected talks and tutorials</h2>
      </div>
      <p>Conference tutorials and university seminars, with dates and host locations.</p>
    </div>
    <div class="timeline bio-talk-list">
      {% for talk in site.data.bio_talks %}
      <article class="timeline-item bio-talk">
        <div class="timeline-date"><time datetime="{{ talk.date | escape }}">{{ talk.date_label | escape }}</time></div>
        <div class="bio-talk-copy">
          <h3>{{ talk.host | escape }}</h3>
          <p class="bio-talk-series">{{ talk.series | escape }}</p>
          <p class="bio-talk-title">{{ talk.title | escape }}</p>
          <p class="bio-talk-location">{{ talk.location | escape }}</p>
        </div>
        <a class="text-link bio-talk-link" href="{{ talk.url | escape }}" target="_blank" rel="noopener noreferrer">Event details</a>
      </article>
      {% endfor %}
    </div>
    <div class="section-action">
      <a class="text-link" href="/talks/">Browse talk slides and recordings</a>
    </div>
  </div>
</section>

<section class="section section-soft" id="join">
  <div class="shell">
    <div class="join-panel">
      <div>
        <div class="eyebrow" style="color: #8fb2ff">Join the research group</div>
        <h2>Students and postdocs</h2>
        <p>
          <strong style="color: #fff">I am actively recruiting undergraduate students, graduate students, and postdocs to join my research group.
          Interested candidates are encouraged to email yipinglu [at] bicmr.pku.edu.cn.</strong>
        </p>
      </div>
      <div>
        <p style="margin-bottom: 1.5rem">
          In your message, briefly describe your background, the questions you want to work on,
          and one research direction from this site that genuinely interests you.
        </p>
        <a class="button" href="mailto:yipinglu@bicmr.pku.edu.cn">Email Yiping</a>
      </div>
    </div>
  </div>
</section>
