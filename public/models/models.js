/* Behaviour for /models/ — the model gallery.
 *
 * Three small things, all of them optional: the page works without this file.
 *   1. the model switcher (tabs that swap the panel underneath)
 *   2. the entrance animation for each section's parts
 *   3. the caption under the diagram, which follows the step you are reading
 */

(function () {
  'use strict'

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab[data-model]'))
  var panels = Array.prototype.slice.call(document.querySelectorAll('.model-panel'))

  function select(slug, focus) {
    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-model') === slug
      tab.classList.toggle('is-active', on)
      tab.setAttribute('aria-selected', on ? 'true' : 'false')
      tab.tabIndex = on ? 0 : -1
      if (on && focus) tab.focus()
    })

    panels.forEach(function (panel) {
      panel.classList.toggle('is-active', panel.getAttribute('data-model') === slug)
    })
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      select(tab.getAttribute('data-model'))
    })

    tab.addEventListener('keydown', function (event) {
      var step = 0
      if (event.key === 'ArrowRight') step = 1
      else if (event.key === 'ArrowLeft') step = -1
      else return

      event.preventDefault()
      var next = tabs[(index + step + tabs.length) % tabs.length]
      select(next.getAttribute('data-model'), true)
    })
  })

  if (tabs.length) {
    select(tabs[0].getAttribute('data-model'))

    // A card in the directory can open a specific model: /models/ant/?model=ant-08b
    var requested = new URLSearchParams(window.location.search).get('model')
    if (requested && tabs.some(function (tab) { return tab.getAttribute('data-model') === requested })) {
      select(requested)
    }
  }

  /* ------------------------------------------------------ family filter */

  var familyTabs = Array.prototype.slice.call(document.querySelectorAll('.tab[data-family]'))
  var familyLists = Array.prototype.slice.call(document.querySelectorAll('[data-family-list]'))

  familyTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var family = tab.getAttribute('data-family')

      familyTabs.forEach(function (other) {
        var on = other === tab
        other.classList.toggle('is-active', on)
        other.setAttribute('aria-selected', on ? 'true' : 'false')
      })

      familyLists.forEach(function (list) {
        list.classList.toggle('is-active', list.getAttribute('data-family-list') === family)
      })
    })
  })

  /* ---------------------------------------------------------- entrances */

  var reveal = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'))

  if (!('IntersectionObserver' in window)) {
    reveal.forEach(function (el) {
      el.classList.add('is-in')
    })
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
    )
    reveal.forEach(function (el) {
      observer.observe(el)
    })
  }

  /* -------------------------------------------------------------- stage */

  var steps = Array.prototype.slice.call(document.querySelectorAll('.how-step'))
  var caption = document.querySelector('[data-stage-caption]')
  var captions = {
    encode: 'Encoding: one frozen decoder, two encoders.',
    score: 'Scoring: one logit per candidate, in a single forward pass.',
    route: 'Routing: a calibrated probability, then execute or escalate.',
  }

  if (steps.length && 'IntersectionObserver' in window) {
    var stepObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var step = entry.target.getAttribute('data-step')
          steps.forEach(function (el) {
            el.classList.toggle('is-active', el === entry.target)
          })
          if (caption && captions[step]) {
            caption.textContent = captions[step]
          }
        })
      },
      { threshold: 0.55 },
    )
    steps.forEach(function (el) {
      stepObserver.observe(el)
    })
  }
})()
