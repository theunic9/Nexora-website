/*
 * NEXORA — Digital Intelligence
 * Main application script
 *
 * - Immersive Three.js entry experience
 * - Navigation and mobile menu
 * - Scroll/reveal interactions
 * - FAQ accordion
 * - Form interactions
 * - Pointer / depth effects
 */
(function(){
  "use strict";

  /* ---------- 3D galaxy intro ---------- */
  var intro = document.getElementById('introScreen');
  var startExperience = document.getElementById('startExperience');
  var galaxyCanvas = document.getElementById('galaxyCanvas');
  var introContent = document.getElementById('introContent');

  if(intro && startExperience && galaxyCanvas && window.THREE){
    var introReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var introFinePointer = window.matchMedia('(pointer: fine)').matches;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, .1, 120);
    camera.position.set(0, 1.1, 10.5);

    var renderer = new THREE.WebGLRenderer({
      canvas: galaxyCanvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);

    var galaxyGroup = new THREE.Group();
    scene.add(galaxyGroup);

    var count = window.innerWidth < 700 ? 36000 : 62000;
    var radius = 8.8;
    var branches = 5;
    var positions = new Float32Array(count * 3);
    var colors = new Float32Array(count * 3);

    var inner = new THREE.Color('#8eb0ff');
    var outer = new THREE.Color('#172f78');
    var white = new THREE.Color('#dce7ff');

    for(var i=0;i<count;i++){
      var i3 = i * 3;
      var r = Math.pow(Math.random(), .72) * radius;
      var branch = (i % branches) / branches * Math.PI * 2;
      var spin = r * 1.18;
      var arm = branch + spin;

      var spread = .42 * (r / radius) + .025;
      var rand = Math.pow(Math.random(), 3.2) * (Math.random() < .5 ? -1 : 1) * spread * r;

      positions[i3] = Math.cos(arm) * r + rand;
      positions[i3 + 1] = (Math.random() - .5) * (.18 + r * .055) + rand * .12;
      positions[i3 + 2] = Math.sin(arm) * r + rand;

      var c = inner.clone();
      c.lerp(outer, r / radius);

      if(Math.random() > .94) c.lerp(white, .65);

      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    var galaxyGeometry = new THREE.BufferGeometry();
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions,3));
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors,3));

    var galaxyMaterial = new THREE.PointsMaterial({
      size: .014,
      sizeAttenuation:true,
      depthWrite:false,
      blending:THREE.AdditiveBlending,
      vertexColors:true,
      transparent:true,
      opacity:.88
    });

    var galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
    galaxy.rotation.x = .55;
    galaxyGroup.add(galaxy);

    // Central luminous core.
    var coreGeometry = new THREE.SphereGeometry(.36, 32, 32);
    var coreMaterial = new THREE.MeshBasicMaterial({
      color:0xbad0ff,
      transparent:true,
      opacity:.9
    });
    var core = new THREE.Mesh(coreGeometry, coreMaterial);
    galaxyGroup.add(core);

    var coreLight = new THREE.PointLight(0x5d88ff, 2.2, 10);
    coreLight.position.set(0,0,0);
    galaxyGroup.add(coreLight);

    // Dust halo around the center.
    var haloGeometry = new THREE.SphereGeometry(.95, 32, 32);
    var haloMaterial = new THREE.MeshBasicMaterial({
      color:0x4776ff,
      transparent:true,
      opacity:.065,
      blending:THREE.AdditiveBlending,
      depthWrite:false
    });
    var halo = new THREE.Mesh(haloGeometry, haloMaterial);
    galaxyGroup.add(halo);

    var mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    var galaxyClock = new THREE.Clock();

    if(introFinePointer && !introReduced){
      intro.addEventListener('mousemove', function(e){
        targetX = (e.clientX / window.innerWidth - .5) * 1.8;
        targetY = (e.clientY / window.innerHeight - .5) * 1.15;

        if(introContent){
          introContent.style.transform =
            'translate3d(calc(-50% + ' + (targetX * 5).toFixed(2) + 'px), calc(-50% + ' +
            (targetY * 3).toFixed(2) + 'px), 0)';
        }
      }, {passive:true});
    }

    function renderGalaxy(){
      var t = galaxyClock.getElapsedTime();

      if(!introReduced){
        galaxy.rotation.y = t * .055;
        galaxy.rotation.z = Math.sin(t * .13) * .025;
        galaxy.position.y = Math.sin(t * .22) * .08;

        mouseX += (targetX - mouseX) * .025;
        mouseY += (targetY - mouseY) * .025;

        galaxyGroup.rotation.y = mouseX * .18;
        galaxyGroup.rotation.x = .52 + mouseY * .08;

        var pulse = 1 + Math.sin(t * 1.35) * .055;
        core.scale.setScalar(pulse);
        halo.scale.setScalar(1 + Math.sin(t * .9) * .12);
      }

      camera.position.x += ((mouseX * .7) - camera.position.x) * .012;
      camera.position.y += ((1.1 - mouseY * .28) - camera.position.y) * .012;
      camera.lookAt(0,0,0);

      renderer.render(scene,camera);
      requestAnimationFrame(renderGalaxy);
    }

    renderGalaxy();

    window.addEventListener('resize', function(){
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    });

    function enterExperience(){
      intro.classList.add('is-exiting');
      document.body.classList.remove('intro-active');
      setTimeout(function(){
        intro.remove();
      }, 1100);
    }

    startExperience.addEventListener('click', enterExperience);
  }

  else if(intro && startExperience){
    startExperience.addEventListener('click', function(){
      intro.classList.add('is-exiting');
      document.body.classList.remove('intro-active');
      setTimeout(function(){ intro.remove(); }, 1100);
    });
  }


  /* ---------- Immersive intro ---------- */
  var intro = document.getElementById('introScreen');
  var introContent = document.getElementById('introContent');
  var startExperience = document.getElementById('startExperience');

  if(intro && startExperience){
    var introFinePointer = window.matchMedia('(pointer: fine)').matches;
    var introReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if(introFinePointer && !introReduced){
      var introRAF = null;
      var ix = 0, iy = 0, itx = 0, ity = 0;
      intro.addEventListener('mousemove', function(e){
        itx = ((e.clientX / window.innerWidth) - .5) * 18;
        ity = ((e.clientY / window.innerHeight) - .5) * 12;
        if(!introRAF) introRAF = requestAnimationFrame(updateIntroParallax);
      }, {passive:true});

      function updateIntroParallax(){
        ix += (itx - ix) * .12;
        iy += (ity - iy) * .12;
        if(introContent){
          introContent.style.setProperty('--intro-x', ix.toFixed(2) + 'px');
          introContent.style.setProperty('--intro-y', iy.toFixed(2) + 'px');
        }
        if(Math.abs(itx-ix) > .02 || Math.abs(ity-iy) > .02){
          introRAF = requestAnimationFrame(updateIntroParallax);
        } else {
          introRAF = null;
        }
      }
    }

    function enterExperience(){
      intro.classList.add('is-exiting');
      document.body.classList.remove('intro-active');
      document.documentElement.style.scrollBehavior = 'smooth';

      setTimeout(function(){
        intro.remove();
        var home = document.getElementById('home');
        if(home){
          home.setAttribute('tabindex','-1');
          home.focus({preventScroll:true});
        }
      }, 950);
    }

    startExperience.addEventListener('click', enterExperience);
    intro.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        if(document.activeElement === startExperience){
          e.preventDefault();
          enterExperience();
        }
      }
    });
  }


  /* ---------- Header scroll state ---------- */
  var header = document.getElementById('siteHeader');
  var lastY = window.scrollY;
  function onScroll(){
    if(window.scrollY > 24){ header.classList.add('scrolled'); }
    else{ header.classList.remove('scrolled'); }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById('burgerBtn');
  var panel = document.getElementById('mobilePanel');
  function closeMenu(){
    burger.classList.remove('active');
    panel.classList.remove('active');
    burger.setAttribute('aria-expanded','false');
    document.body.classList.remove('menu-open');
  }
  function toggleMenu(){
    var isOpen = panel.classList.toggle('active');
    burger.classList.toggle('active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  }
  burger.addEventListener('click', toggleMenu);
  panel.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', closeMenu);
  });
  window.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeMenu();
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.15, rootMargin:'0px 0px -6% 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------- Counter animation ---------- */
  var statNums = document.querySelectorAll('.stat .num');
  var countedOnce = new WeakSet();
  function animateCount(el){
    if(countedOnce.has(el)) return;
    countedOnce.add(el);
    var target = parseFloat(el.getAttribute('data-count'));
    var duration = 1400;
    var start = null;
    function step(ts){
      if(!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(target * eased);
      el.textContent = current;
      if(progress < 1){ requestAnimationFrame(step); }
      else { el.textContent = target; }
    }
    requestAnimationFrame(step);
  }
  if('IntersectionObserver' in window && statNums.length){
    var ioStats = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          animateCount(entry.target);
          ioStats.unobserve(entry.target);
        }
      });
    }, { threshold:0.4 });
    statNums.forEach(function(el){ ioStats.observe(el); });
  } else {
    statNums.forEach(function(el){ el.textContent = el.getAttribute('data-count'); });
  }

  /* ---------- Testimonials carousel ---------- */
  var slidesWrap = document.getElementById('testiSlides');
  var slides = slidesWrap ? slidesWrap.children : [];
  var dotsWrap = document.getElementById('testiDots');
  var prevBtn = document.getElementById('testiPrev');
  var nextBtn = document.getElementById('testiNext');
  var current = 0;
  var autoplayTimer = null;

  if(slidesWrap && slides.length){
    for(var i=0;i<slides.length;i++){
      var dot = document.createElement('button');
      dot.className = 'testi-dot' + (i===0 ? ' active' : '');
      dot.setAttribute('role','tab');
      dot.setAttribute('aria-label','Ir para depoimento ' + (i+1));
      (function(idx){ dot.addEventListener('click', function(){ goTo(idx); resetAutoplay(); }); })(i);
      dotsWrap.appendChild(dot);
    }

    function goTo(index){
      current = (index + slides.length) % slides.length;
      slidesWrap.style.transform = 'translateX(-' + (current*100) + '%)';
      Array.prototype.forEach.call(dotsWrap.children, function(d, idx){
        d.classList.toggle('active', idx === current);
      });
    }
    function next(){ goTo(current+1); }
    function prev(){ goTo(current-1); }

    nextBtn.addEventListener('click', function(){ next(); resetAutoplay(); });
    prevBtn.addEventListener('click', function(){ prev(); resetAutoplay(); });

    function startAutoplay(){
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(reduce) return;
      autoplayTimer = setInterval(next, 6500);
    }
    function resetAutoplay(){
      if(autoplayTimer) clearInterval(autoplayTimer);
      startAutoplay();
    }
    startAutoplay();

    /* swipe support */
    var startX = 0, deltaX = 0, dragging = false;
    var track = document.getElementById('testiTrack');
    track.addEventListener('touchstart', function(e){
      dragging = true; startX = e.touches[0].clientX; deltaX = 0;
      if(autoplayTimer) clearInterval(autoplayTimer);
    }, { passive:true });
    track.addEventListener('touchmove', function(e){
      if(!dragging) return;
      deltaX = e.touches[0].clientX - startX;
    }, { passive:true });
    track.addEventListener('touchend', function(){
      if(!dragging) return;
      dragging = false;
      if(Math.abs(deltaX) > 40){
        if(deltaX < 0) next(); else prev();
      }
      resetAutoplay();
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function(item){
    var btn = item.querySelector('.faq-q');
    var answer = item.querySelector('.faq-a');
    var inner = item.querySelector('.faq-a-inner');
    btn.addEventListener('click', function(){
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(other){
        if(other !== item){
          other.classList.remove('open');
          other.querySelector('.faq-q').setAttribute('aria-expanded','false');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      if(isOpen){
        item.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('open');
        btn.setAttribute('aria-expanded','true');
        answer.style.maxHeight = inner.offsetHeight + 'px';
      }
    });
  });

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById('contactForm');
  var successBox = document.getElementById('formSuccess');

  function setError(fieldName, hasError){
    var field = form.querySelector('[data-field="' + fieldName + '"]');
    if(field) field.classList.toggle('error', hasError);
  }

  function validate(){
    var valid = true;
    var nome = form.nome.value.trim();
    var email = form.email.value.trim();
    var telefone = form.telefone.value.trim();
    var assunto = form.assunto.value;
    var mensagem = form.mensagem.value.trim();

    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var telRe = /^[\d()+\-\s]{8,}$/;

    if(nome.length < 2){ setError('nome', true); valid = false; } else { setError('nome', false); }
    if(!emailRe.test(email)){ setError('email', true); valid = false; } else { setError('email', false); }
    if(telefone.length && !telRe.test(telefone)){ setError('telefone', true); valid = false; } else { setError('telefone', false); }
    if(!assunto){ setError('assunto', true); valid = false; } else { setError('assunto', false); }
    if(mensagem.length < 10){ setError('mensagem', true); valid = false; } else { setError('mensagem', false); }

    return valid;
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    successBox.classList.remove('active');
    if(validate()){
      successBox.classList.add('active');
      form.reset();
      successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(function(){ successBox.classList.remove('active'); }, 8000);
    } else {
      var firstError = form.querySelector('.field.error input, .field.error select, .field.error textarea');
      if(firstError) firstError.focus();
    }
  });

  ['nome','email','telefone','assunto','mensagem'].forEach(function(name){
    var el = form[name];
    if(el){
      el.addEventListener('input', function(){ setError(name, false); });
      el.addEventListener('change', function(){ setError(name, false); });
    }
  });

  /* ---------- Depth effects: only for fine-pointer, non-reduced-motion ---------- */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  var enableDepth = !prefersReduced && hasFinePointer;

  /* Global cursor glow following the pointer across the page */
  if(enableDepth){
    var glowRAF = null, glowX = 50, glowY = 20, glowTX = 50, glowTY = 20;
    window.addEventListener('mousemove', function(e){
      glowTX = (e.clientX / window.innerWidth) * 100;
      glowTY = (e.clientY / window.innerHeight) * 100;
      if(!glowRAF){
        glowRAF = requestAnimationFrame(updateGlow);
      }
    }, { passive:true });
    function updateGlow(){
      glowX += (glowTX - glowX) * 0.15;
      glowY += (glowTY - glowY) * 0.15;
      document.documentElement.style.setProperty('--gx', glowX + '%');
      document.documentElement.style.setProperty('--gy', glowY + '%');
      if(Math.abs(glowTX - glowX) > 0.05 || Math.abs(glowTY - glowY) > 0.05){
        glowRAF = requestAnimationFrame(updateGlow);
      } else {
        glowRAF = null;
      }
    }
  }

  /* 3D tilt + spotlight for showcase cards */
  function initTilt(selector, maxTilt, lift){
    if(!enableDepth) return;
    document.querySelectorAll(selector).forEach(function(el){
      var raf = null;
      el.addEventListener('mousemove', function(e){
        var rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        if(raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function(){
          var rx = (0.5 - py) * maxTilt;
          var ry = (px - 0.5) * maxTilt;
          el.style.transform = 'perspective(1000px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-' + lift + 'px)';
          el.style.setProperty('--mx', (px * 100) + '%');
          el.style.setProperty('--my', (py * 100) + '%');
        });
      });
      el.addEventListener('mouseleave', function(){
        if(raf) cancelAnimationFrame(raf);
        el.style.transform = 'perspective(1000px)';
      });
    });
  }
  initTilt('.svc', 8.4, 9.6);
  initTilt('.testi-card', 4.8, 7.2);

  /* Hero visual parallax */
  if(enableDepth){
    var heroSection = document.querySelector('.hero');
    var heroSvg = document.querySelector('.hero-visual svg');
    if(heroSection && heroSvg){
      heroSection.addEventListener('mousemove', function(e){
        var rect = heroSection.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        heroSvg.style.transform = 'rotateX(' + (-py * 14.4).toFixed(2) + 'deg) rotateY(' + (px * 14.4).toFixed(2) + 'deg)';
      });
      heroSection.addEventListener('mouseleave', function(){
        heroSvg.style.transform = '';
      });
    }
  }

  /* Magnetic buttons */
  if(enableDepth){
    document.querySelectorAll('.btn').forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.264).toFixed(2) + 'px,' + (y * 0.42).toFixed(2) + 'px)';
      });
      btn.addEventListener('mouseleave', function(){
        btn.style.transform = '';
      });
    });
  }

})();
