// ------------------------------------------
// Focus Mode v23
// ------------------------------------------
(function () {

    // localStorage sécurisé
    function lsGet(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function lsSet(key, value) {
        try { localStorage.setItem(key, value); } catch (e) {}
    }

    // Détection topic
    function isTopic() {
        return $('body').hasClass('template-topic');
    }

    // Trouver le premier post visible dans le viewport
    function findAnchorPost() {
        var anchor = null;
        $('[component="post"]').each(function () {
            if (this.getBoundingClientRect().top >= -10) {
                anchor = this;
                return false;
            }
        });
        return anchor;
    }

    // Toast générique (hors topic + feedback activation)
    var toastTimeout = null;
    function showToast(message) {
        var existing = $('#fm-toast');
        if (existing.length) {
            clearTimeout(toastTimeout);
            existing.text(message).addClass('visible');
        } else {
            $('body').append($('<div id="fm-toast">').text(message));
            setTimeout(function () { $('#fm-toast').addClass('visible'); }, 20);
        }
        toastTimeout = setTimeout(function () {
            $('#fm-toast').removeClass('visible');
            setTimeout(function () { $('#fm-toast').remove(); }, 350);
        }, 3000);
    }

    // Effet glitch CRT — 600ms total
    function playGlitchEffect(callback) {
        if ($('#fm-glitch-overlay').length) return;
        // Pas de div enfant — le CSS utilise ::before et ::after
        $('body').append('<div id="fm-glitch-overlay"></div>');
        var overlay = $('#fm-glitch-overlay');

        // Phase 1 — glitch in (0-300ms)
        setTimeout(function () { overlay.addClass('glitch-in'); }, 10);

        // Callback au pic (300ms) + transition vers glitch-out
        setTimeout(function () {
            if (callback) callback();
            overlay.removeClass('glitch-in').addClass('glitch-out');
        }, 300);

        // Nettoyage
        setTimeout(function () {
            overlay.remove();
        }, 650);
    }

    // Protection anti-spam — scope IIFE
    var spamGuard = null;

    function focusMode() {

        // Désactivé sur mobile
        if ($(window).width() < 768) return;

        // Injection du bouton (une seule fois)
        if ($('#fm-toggle-btn').length === 0) {
            var focusItem = $('\
                <li class="nav-item mx-2" id="fm-nav-item">\
                  <a href="#" id="fm-toggle-btn"\
                     class="nav-link navigation-link d-flex gap-2 justify-content-between align-items-center"\
                     aria-label="Mode lecture">\
                    <span class="position-relative">\
                      <i class="fa fa-fw fa-book-open-reader"></i>\
                    </span>\
                  </a>\
                </li>');

            if ($('ul#logged-in-menu').length > 0) {
                $('ul#logged-in-menu').append(focusItem);
            } else {
                $('ul#logged-out-menu').append(focusItem);
            }

            $('#fm-toggle-btn').on('click.focusmode', function (e) {
                e.preventDefault();
                $('#fm-nav-item').tooltip('hide');
                if (!isTopic()) { showToast('Le mode lecture est disponible uniquement dans un topic'); return; }
                var current = lsGet('focusModeState') === 'true';
                applyFocusMode(!current, true);
                lsSet('focusModeState', (!current).toString());
            });
        }

        updateButtonState();

        // Raccourcis clavier
        $(document).off('keydown.focusmode').on('keydown.focusmode', function (e) {
            var tag = document.activeElement ? document.activeElement.tagName : '';
            if (tag === 'INPUT' || tag === 'TEXTAREA' || $(document.activeElement).attr('contenteditable') != null) return;

            if (e.key === 'f' || e.key === 'F') {
                if (e.ctrlKey || e.metaKey || e.altKey) return;
                if (spamGuard) {
                    clearTimeout(spamGuard);
                    spamGuard = null;
                    return;
                }
                if (!isTopic()) { showToast('Le mode lecture est disponible uniquement dans un topic'); return; }
                var current = lsGet('focusModeState') === 'true';
                applyFocusMode(!current, true);
                lsSet('focusModeState', (!current).toString());
                spamGuard = setTimeout(function () { spamGuard = null; }, 300);
            }

            if (e.key === 'Escape' && lsGet('focusModeState') === 'true') {
                spamGuard = null;
                applyFocusMode(false, true);
                lsSet('focusModeState', 'false');
            }
        });

        // Hooks : restaurer classes CSS sans toucher au scroll
        if (isTopic()) {
            applyFocusMode(lsGet('focusModeState') === 'true', false);
        } else {
            applyFocusMode(false, false);
        }
    }

    function updateButtonState() {
        var btn = $('#fm-toggle-btn');
        if (!btn.length) return;
        $('#fm-nav-item').tooltip('dispose');
        if (isTopic()) {
            btn.removeClass('fm-disabled');
            $('#fm-nav-item').tooltip({ placement: 'left', title: 'Mode lecture (F)', trigger: 'hover' });
        } else {
            btn.addClass('fm-disabled');
            $('#fm-nav-item').tooltip({ placement: 'left', title: 'Disponible uniquement dans un topic', trigger: 'hover' });
        }
    }

    // userAction = true  → effet glitch + toast + compenser le décalage
    // userAction = false → restaurer les classes seulement (hooks NodeBB)
    function applyFocusMode(isActive, userAction) {
        if ($(window).width() < 768) return;

        if (userAction) {
            var anchor = findAnchorPost();
            var topBefore = anchor ? anchor.getBoundingClientRect().top : 0;

            playGlitchEffect(function () {
                _doApply(isActive, userAction);
                if (anchor) {
                    var topAfter = anchor.getBoundingClientRect().top;
                    var shift = topAfter - topBefore;
                    if (shift !== 0) window.scrollBy(0, shift);
                }
            });
        } else {
            _doApply(isActive, false);
        }
    }

    function _doApply(isActive, userAction) {
        if (isActive) {
            $('body').addClass('focus-mode');
            $('#fm-toggle-btn').addClass('active');

            if ($('#fm-prog').length === 0) {
                $('body').append('<div id="fm-prog"><div id="fm-bar"></div></div>');
            }

            if ($('#fm-exit').length === 0) {
                var exitBtn = $('<button id="fm-exit"></button>');
                exitBtn.append($('<kbd class="fm-kbd">F</kbd>'));
                exitBtn.append(document.createTextNode(' ou '));
                exitBtn.append($('<kbd class="fm-kbd">Échap</kbd>'));
                exitBtn.append(document.createTextNode(' pour quitter'));
                exitBtn.on('click', function () {
                    applyFocusMode(false, true);
                    lsSet('focusModeState', 'false');
                });
                $('body').append(exitBtn);
            }
            setTimeout(function () { $('#fm-exit').addClass('visible'); }, 120);

            $(window).off('scroll.focusmode').on('scroll.focusmode', function () {
                var scrolled = $(window).scrollTop();
                var total = $(document).height() - $(window).height();
                var pct = total > 0 ? (scrolled / total) * 100 : 0;
                $('#fm-bar').css('width', Math.min(pct, 100) + '%');
            });

            if (userAction) showToast('Mode lecture activé');

        } else {
            $('body').removeClass('focus-mode');
            $('#fm-toggle-btn').removeClass('active');
            $('#fm-prog').remove();
            $('#fm-exit').remove();
            $(window).off('scroll.focusmode');

            if (userAction) showToast('Mode lecture désactivé');
        }
    }

    // Appel initial
    focusMode();

    // Hooks NodeBB SPA
    $(window).on('action:ajaxify.end',   function () { focusMode(); });
    $(window).on('action:posts.loaded',  function () { focusMode(); });
    $(window).on('action:topics.loaded', function () { focusMode(); });
    $(window).on('action:topic.loaded',  function () { focusMode(); });
    $(window).on('action:posts.edited',  function () { focusMode(); });

}());
