/**
 * ZFIT — Waitlist Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('waitlist-form');
  const emailInput = document.getElementById('email-input');
  const submitBtn = document.getElementById('submit-btn');
  const errorMsg = document.getElementById('form-error');
  const successBox = document.getElementById('waitlist-success');
  const userSpotDisplay = document.getElementById('user-spot');
  const referralInput = document.getElementById('referral-link');
  const copyBtn = document.getElementById('copy-ref-btn');

  const STORAGE_KEY = 'zfit_waitlist_registered';
  const STORAGE_SPOT_KEY = 'zfit_waitlist_spot';

  // Check if user is already registered in this browser
  const savedEmail = localStorage.getItem(STORAGE_KEY);
  const savedSpot = localStorage.getItem(STORAGE_SPOT_KEY);

  if (savedEmail && savedSpot) {
    showSuccessState(savedSpot, savedEmail);
  }

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const email = emailInput.value.trim();

    if (!validateEmail(email)) {
      showError('Please enter a valid email address.');
      emailInput.focus();
      return;
    }

    // Set loading state
    setLoading(true);

    try {
      // Simulate API registration delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Calculate spot number
      const randomSpot = Math.floor(Math.random() * 60) + 420;
      const spotFormatted = `#${randomSpot}`;

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, email);
      localStorage.setItem(STORAGE_SPOT_KEY, spotFormatted);

      // Trigger Confetti
      triggerCelebration();

      // Switch to success view
      showSuccessState(spotFormatted, email);
    } catch (err) {
      showError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  });

  // Copy Referral Link Handler
  if (copyBtn && referralInput) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(referralInput.value);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied! 🎉';
        copyBtn.style.background = 'rgba(16, 185, 129, 0.2)';
        copyBtn.style.borderColor = 'rgba(16, 185, 129, 0.5)';

        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.style.background = '';
          copyBtn.style.borderColor = '';
        }, 2200);
      } catch (err) {
        // Fallback for older browsers
        referralInput.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy Link';
        }, 2000);
      }
    });
  }

  // Helper Functions
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.add('visible');
  }

  function clearError() {
    errorMsg.textContent = '';
    errorMsg.classList.remove('visible');
  }

  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      emailInput.disabled = true;
    } else {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      emailInput.disabled = false;
    }
  }

  function showSuccessState(spot, email) {
    form.style.display = 'none';
    successBox.classList.remove('hidden');
    userSpotDisplay.textContent = spot;

    // Personalize referral link with hash
    const cleanId = btoa(email.toLowerCase()).substring(0, 8);
    referralInput.value = `https://zfits.in/?ref=${cleanId}`;
  }

  // Pure Canvas Confetti Burst
  function triggerCelebration() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#863bff', '#38bdf8', '#a855f7', '#ffffff', '#10b981', '#fbbf24'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 18,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        spin: (Math.random() - 0.5) * 10,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01,
      });
    }

    let animationId;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravity
        p.rotation += p.spin;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
          ctx.restore();
        }
      });

      if (alive) {
        animationId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationId);
        canvas.remove();
      }
    }

    render();
  }
});

