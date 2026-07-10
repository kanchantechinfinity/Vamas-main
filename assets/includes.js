(function () {

  /* ============================================================
     VAMAS — shared site behaviours (Shopify-native cart)
     ============================================================ */

  /* ---------- Cart badge (real Shopify cart) ---------- */
  function updateCartBadge(count) {
    var badge = document.getElementById('vamas-nav-cart-badge');
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  window.VamasCart = {
    refresh: function () {
      fetch('/cart.js')
        .then(function (r) { return r.json(); })
        .then(function (cart) { updateCartBadge(cart.item_count); })
        .catch(function () {});
    },
    add: function (formData) {
      return fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formData)
      })
      .then(function (r) { return r.json(); })
      .then(function (item) {
        if (!item.status) {
          window.VamasCart.refresh();
          document.dispatchEvent(new CustomEvent('vamas:cartAdded', { detail: item }));
        }
        return item;
      });
    }
  };

  document.addEventListener('vamas:cartAdded', function (e) {
    var toast = document.getElementById('vc-toast');
    if (!toast) return;
    var item = e.detail;
    document.getElementById('vc-toast-img').src = item.featured_image ? item.featured_image.url : (item.image || '');
    document.getElementById('vc-toast-name').textContent = item.product_title || item.title || 'Item';
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toast.classList.remove('show'); }, 3200);
  });

  /* ---------- Toast markup ---------- */
  function initToast() {
    if (document.getElementById('vc-toast')) return;
    var toastDiv = document.createElement('div');
    toastDiv.innerHTML = '<div id="vc-toast">'
      + '<img id="vc-toast-img" src="" alt="">'
      + '<div style="flex:1;min-width:0;">'
      + '<div id="vc-toast-label">&#10003; ADDED TO CART</div>'
      + '<div id="vc-toast-name"></div>'
      + '<button id="vc-toast-btn" onclick="window.location.href=\'/cart\'">VIEW CART &rarr;</button>'
      + '</div>'
      + '<button id="vc-toast-close">&times;</button>'
      + '</div>';
    document.body.appendChild(toastDiv.firstChild);
    document.getElementById('vc-toast-close').addEventListener('click', function () {
      document.getElementById('vc-toast').classList.remove('show');
    });
  }

  /* ---------- WhatsApp Widget ---------- */
  function initWA() {
    var trigger = document.body.getAttribute('data-wa-number');
    if (!trigger) return; // widget disabled unless a number is configured
    var WA_NUM = trigger;
    var WA_MSG = encodeURIComponent(document.body.getAttribute('data-wa-message') || 'Hi! I am interested in your products.');
    var WA_ICON = '<svg viewBox="0 0 32 32" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M16 3C8.832 3 3 8.832 3 16c0 2.625.77 5.074 2.086 7.129L3.05 28.855 9 26.875C10.973 28.023 13.41 29 16 29c7.168 0 13-5.832 13-13S23.168 3 16 3zm0 2c6.086 0 11 4.914 11 11s-4.914 11-11 11c-2.324 0-4.48-.766-6.25-2.063l-.399-.297-3.586.945.992-2.843-.334-.426A10.945 10.945 0 0 1 5 16C5 9.914 9.914 5 16 5zm-4.695 4.852c-.196 0-.504.07-.766.36-.261.292-1 .977-1 2.437s1.063 2.824 1.211 3.028c.148.203 2.121 3.351 5.199 4.585 2.547 1.032 3.082.844 3.656.793.574-.055 1.856-.719 2.106-1.41.25-.695.25-1.285.176-1.41-.074-.125-.277-.199-.578-.348-.3-.148-1.758-.863-2.035-.961-.277-.101-.477-.152-.676.149-.2.297-.773.961-.949 1.16-.176.2-.351.223-.652.075-.3-.149-1.282-.466-2.437-1.496-.9-.813-1.508-1.813-1.684-2.114-.176-.305-.02-.469.133-.617.136-.133.3-.348.45-.52.148-.175.197-.3.296-.5.098-.199.05-.372-.026-.52-.074-.149-.625-1.617-.875-2.207-.25-.574-.5-.492-.676-.5a12.71 12.71 0 0 0-.574-.008 1.1 1.1 0 0 0-.25 0z"/></svg>';

    var waHTML = ''
      + '<button id="wa-fab" title="Chat on WhatsApp">' + WA_ICON + '</button>'
      + '<div id="wa-popup">'
      + '<div id="wa-popup-head">'
      + '<div id="wa-popup-avatar">' + WA_ICON + '</div>'
      + '<div><div id="wa-popup-name">' + (document.body.getAttribute('data-shop-name') || 'Shop') + '</div><div id="wa-popup-status">&#9679; Typically replies in minutes</div></div>'
      + '<button id="wa-popup-close" title="Close">&times;</button>'
      + '</div>'
      + '<div id="wa-chat-area">'
      + '<div id="wa-bubble">Namaste! &#128075; Welcome. How can we help you today?<div id="wa-bubble-time">Now</div></div>'
      + '</div>'
      + '<div id="wa-quick-replies">'
      + '<button class="wa-qr" data-msg="Hi! I want to place an order.">&#128722; Place an Order</button>'
      + '<button class="wa-qr" data-msg="Hi! I need help with custom size / stitching.">&#9986; Custom Size / Stitching</button>'
      + '<button class="wa-qr" data-msg="Hi! I want to track my order.">&#128666; Track My Order</button>'
      + '</div>'
      + '<a id="wa-cta" href="https://wa.me/' + WA_NUM + '?text=' + WA_MSG + '" target="_blank" rel="noopener">'
      + WA_ICON + ' Open WhatsApp Chat'
      + '</a>'
      + '</div>';

    var waWrap = document.createElement('div');
    waWrap.innerHTML = waHTML;
    while (waWrap.firstChild) document.body.appendChild(waWrap.firstChild);

    var fab = document.getElementById('wa-fab');
    var popup = document.getElementById('wa-popup');
    document.getElementById('wa-popup-close').addEventListener('click', function (e) {
      e.stopPropagation();
      popup.classList.remove('open');
    });
    fab.addEventListener('click', function () { popup.classList.toggle('open'); });
    document.querySelectorAll('.wa-qr').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var msg = encodeURIComponent(this.dataset.msg);
        window.open('https://wa.me/' + WA_NUM + '?text=' + msg, '_blank');
      });
    });
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    initToast();
    initWA();
    window.VamasCart.refresh();
  });

})();

/* ── Wishlist (localStorage) ─────────────────────────── */
(function () {
  var KEY = 'vamas_wishlist_v1';
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function write(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); document.dispatchEvent(new CustomEvent('vamas:wishlist')); updateBadge(); }
  function has(id) { return read().some(function (i) { return String(i.id) === String(id); }); }
  function toggle(item) {
    var arr = read(), idx = -1;
    for (var i = 0; i < arr.length; i++) { if (String(arr[i].id) === String(item.id)) { idx = i; break; } }
    if (idx > -1) { arr.splice(idx, 1); } else { arr.push(item); }
    write(arr);
    return idx === -1;
  }
  function remove(id) { write(read().filter(function (i) { return String(i.id) !== String(id); })); }
  function count() { return read().length; }
  function updateBadge() {
    var b = document.getElementById('vamas-nav-wish-badge');
    if (b) { var c = count(); b.textContent = c; b.style.display = c > 0 ? 'flex' : 'none'; }
  }
  function wireButtons() {
    document.querySelectorAll('.vamas-prod-card__wishlist').forEach(function (btn) {
      var id = btn.getAttribute('data-product-id');
      if (has(id)) btn.classList.add('active');
      if (btn.dataset.wlWired) return;
      btn.dataset.wlWired = '1';
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var item = {
          id: id, handle: btn.dataset.handle, title: btn.dataset.title,
          type: btn.dataset.type, price: btn.dataset.price, compare: btn.dataset.compare || '',
          discount: btn.dataset.discount || '', image: btn.dataset.image, url: btn.dataset.url,
          variant: btn.dataset.variant
        };
        btn.classList.toggle('active', toggle(item));
      });
    });
  }
  window.VamasWishlist = { get: read, has: has, toggle: toggle, remove: remove, count: count };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { updateBadge(); wireButtons(); });
  else { updateBadge(); wireButtons(); }
})();
