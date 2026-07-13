// Hausio — homepage testimonials: fetch approved reviews and render cards.
// The #reviews section stays hidden until at least one published review loads,
// so the homepage never shows an empty "reviews" shell before any exist.
(function () {
  var section = document.getElementById('reviews');
  var grid = document.getElementById('reviews-grid');
  if (!section || !grid) return;

  fetch('/api/reviews')
    .then(function (r) { return r.ok ? r.json() : { reviews: [] }; })
    .then(function (data) {
      var list = (data && data.reviews) || [];
      if (!list.length) return; // leave the section hidden
      grid.innerHTML = list.slice(0, 12).map(cardHtml).join('');
      section.hidden = false;
    })
    .catch(function () { /* stay hidden on error */ });

  function esc(s) {
    return String(s == null ? '' : s).replace(/[<>&"]/g, function (c) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c];
    });
  }

  function stars(n) {
    n = Math.max(0, Math.min(5, parseInt(n, 10) || 0));
    return '<span class="filled">' + '★'.repeat(n) + '</span>' + '☆'.repeat(5 - n);
  }

  function cardHtml(r) {
    var photo = r.photoUrl
      ? '<div class="review-photo"><img src="' + esc(r.photoUrl) + '" alt="Photo shared by a Hausio customer" loading="lazy" /></div>'
      : '';
    var avatar = r.avatarUrl
      ? '<img class="review-avatar" src="' + esc(r.avatarUrl) + '" alt="" loading="lazy" />'
      : '<span class="review-avatar review-avatar-initial" aria-hidden="true">' + esc((r.authorName || '?').charAt(0)) + '</span>';
    var badge = r.verified ? '<span class="review-badge" title="Identity verified via Google">&#10003; Verified</span>' : '';
    var tag = [r.service, r.borough].filter(Boolean).map(esc).join(' · ');
    return '<article class="review-card">'
      + '<div class="review-stars" aria-label="' + (parseInt(r.rating, 10) || 0) + ' out of 5 stars">' + stars(r.rating) + '</div>'
      + (r.title ? '<h3 class="review-title">' + esc(r.title) + '</h3>' : '')
      + '<p class="review-body">' + esc(r.body) + '</p>'
      + photo
      + '<div class="review-author">' + avatar
      + '<span class="review-meta"><b>' + esc(r.authorName) + '</b>' + badge
      + (tag ? '<small>' + tag + '</small>' : '') + '</span></div>'
      + '</article>';
  }
})();
