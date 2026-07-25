// Hausio — portfolio photo slider (vanilla, no deps)
(function () {
  var sliders = document.querySelectorAll('[data-slider]');
  Array.prototype.forEach.call(sliders, function (slider) {
    var track = slider.querySelector('[data-slider-track]');
    if (!track) return;
    var slides = Array.prototype.slice.call(track.querySelectorAll('.work-slide'));
    var prev = slider.querySelector('[data-slider-prev]');
    var next = slider.querySelector('[data-slider-next]');
    var dotsWrap = slider.querySelector('[data-slider-dots]');

    if (slides.length <= 1) {
      if (prev) prev.style.display = 'none';
      if (next) next.style.display = 'none';
      return;
    }

    var index = 0;
    var dots = [];

    if (dotsWrap) {
      dotsWrap.removeAttribute('aria-hidden');
      slides.forEach(function (_, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Go to photo ' + (i + 1));
        b.addEventListener('click', function () { go(i); });
        dotsWrap.appendChild(b);
        dots.push(b);
      });
    }

    function update() {
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === index); });
      if (prev) prev.disabled = (index === 0);
      if (next) next.disabled = (index === slides.length - 1);
    }

    function go(i) {
      index = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: track.clientWidth * index, behavior: 'smooth' });
      update();
    }

    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });

    // Keep dots/arrows in sync when the user swipes the track
    var t;
    track.addEventListener('scroll', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        var i = Math.round(track.scrollLeft / track.clientWidth);
        if (i !== index) { index = i; update(); }
      }, 120);
    });

    update();
  });
})();
