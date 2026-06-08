/* =========================================================================
   pub-cards.js — shared publication renderer used by BOTH index.html
   (mode="selected") and publications.html (mode="all").
   Reads window.SITE_DATA.publications. No dependencies.
   ========================================================================= */
(function () {
  "use strict";

  const ICONS = {
    paper:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 1.6L18.4 8H15a1 1 0 0 1-1-1V3.6ZM8 12h8v1.6H8V12Zm0 3.6h8v1.6H8v-1.6Z"/></svg>',
    code:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4Zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4Z"/></svg>',
    web:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 6h-2.95a15.7 15.7 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8ZM12 4c.83 1.2 1.48 2.53 1.91 4h-3.82c.43-1.47 1.08-2.8 1.91-4ZM4.26 14a7.96 7.96 0 0 1 0-4h3.38a16.6 16.6 0 0 0 0 4H4.26Zm.81 2h2.95c.34 1.27.81 2.48 1.38 3.56A8.03 8.03 0 0 1 5.07 16Zm2.95-8H5.07a8.03 8.03 0 0 1 4.33-3.56A15.7 15.7 0 0 0 8.02 8ZM12 20c-.83-1.2-1.48-2.53-1.91-4h3.82A13.3 13.3 0 0 1 12 20Zm2.36-6H9.64a14.6 14.6 0 0 1 0-4h4.72a14.6 14.6 0 0 1 0 4Zm.27 5.56c.57-1.08 1.04-2.29 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56ZM16.36 14a16.6 16.6 0 0 0 0-4h3.38a7.96 7.96 0 0 1 0 4h-3.38Z"/></svg>',
    image:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3H3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Zm-1 15.59-4.3-4.3a1 1 0 0 0-1.4 0L11 18.59l-2.3-2.3a1 1 0 0 0-1.4 0L4 19.59V5h16ZM8.5 10A1.5 1.5 0 1 0 7 8.5 1.5 1.5 0 0 0 8.5 10Z"/></svg>',
  };

  const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function linkButtons(links) {
    if (!links || !links.length) return "";
    return (
      '<div class="pub-links">' +
      links
        .map(function (l) {
          const k = (l.label || "").toLowerCase();
          let icon = ICONS.web;
          if (/code|github/.test(k)) icon = ICONS.code;
          else if (/paper|pdf|arxiv|openreview|bib/.test(k)) icon = ICONS.paper;
          const ext =
            l.href && l.href.charAt(0) !== "#"
              ? ' target="_blank" rel="noopener"'
              : "";
          return (
            '<a href="' + l.href + '"' + ext + ">" +
            icon +
            "<span>" + esc(l.label) + "</span></a>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  // el: the #pub-list container. data: window.SITE_DATA.
  // el.dataset.mode === "selected"  → only items with selected:true, no group headings.
  // el.dataset.mode === "all" (default) → every item, grouped by `group`.
  window.renderPubCards = function (el, data) {
    if (!el || !data || !data.publications) return;
    const mode = el.dataset.mode || "all";
    let list = data.publications;
    if (mode === "selected") list = list.filter(function (p) { return p.selected; });

    let lastGroup = null;
    el.innerHTML = list
      .map(function (p) {
        let head = "";
        if (mode === "all" && p.group && p.group !== lastGroup) {
          lastGroup = p.group;
          head = '<h3 class="pub-group reveal">' + esc(p.group) + "</h3>";
        }
        const isSel = p.selected || (p.group && p.group.indexOf("Selected") === 0);
        const wantFig = !!p.image || isSel;
        const figInner = p.image
          ? '<img src="' + p.image + '" alt="' + esc(p.title) + ' teaser figure" loading="lazy" />'
          : '<div class="pub-fig-placeholder">' + ICONS.image + "<span>Figure</span></div>";
        const figure = wantFig ? '<div class="pub-thumb">' + figInner + "</div>" : "";
        const yr = p.year ? " " + esc(p.year) : "";
        const award = p.award ? '<span class="pub-award">' + esc(p.award) + "</span>" : "";
        const summary = p.summary ? '<p class="pub-summary">' + esc(p.summary) + "</p>" : "";
        return (
          head +
          '<article class="pub-item reveal' + (wantFig ? " has-thumb" : "") + '">' +
          figure +
          '<div class="pub-body">' +
          '<h3 class="pub-title">' + esc(p.title) + "</h3>" +
          '<p class="pub-authors">' + p.authors + "</p>" +
          '<div class="pub-meta"><span class="pub-venue">' + p.venue + yr + "</span>" + award + "</div>" +
          summary +
          linkButtons(p.links) +
          "</div></article>"
        );
      })
      .join("");
  };
})();
