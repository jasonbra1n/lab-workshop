document.addEventListener('DOMContentLoaded', () => {
  // Load Head
  fetch('/head.html')
    .then(response => response.text())
    .then(data => {
      document.head.innerHTML += data; // Append AdSense script and other head content

      // Wait for AdSense script to load
      const adSenseScript = document.querySelector('script[src*="adsbygoogle.js"]');
      if (adSenseScript) {
        adSenseScript.onload = function() {
          // Trigger ads once script is ready
          if (document.querySelector('ins.adsbygoogle')) {
            (adsbygoogle = window.adsbygoogle || []).push({});
          } else {
            console.log('No ad slots found yet; waiting for header/footer');
          }
        };
        // If script somehow loaded already, trigger immediately
        if (adSenseScript.complete) {
          (adsbygoogle = window.adsbygoogle || []).push({});
        }
      }

      // Allow pages to override the title after loading
      const pageTitle = document.querySelector('meta[name="page-title"]');
      if (pageTitle) {
        document.title = pageTitle.getAttribute('content');
      }
    })
    .catch(error => console.error('Error loading head:', error));

  // Load Header
  fetch('/header.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('header-placeholder').innerHTML = data;
      // If ad slots are in header, trigger AdSense
      if (document.querySelector('ins.adsbygoogle') && window.adsbygoogle) {
        (adsbygoogle = window.adsbygoogle || []).push({});
      }
    })
    .catch(error => console.error('Error loading header:', error));

  // Load Footer
  fetch('/footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
      // If ad slots are in footer, trigger AdSense
      if (document.querySelector('ins.adsbygoogle') && window.adsbygoogle) {
        (adsbygoogle = window.adsbygoogle || []).push({});
      }
    })
    .catch(error => console.error('Error loading footer:', error));

  // Load Bubbles (unchanged)
  const uvBackground = document.querySelector('.uv-background');
  for (let i = 0; i < 10; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.style.left = `${Math.random() * 100}vw`;
    bubble.style.top = `${Math.random() * 100}vh`;
    bubble.style.width = `${Math.random() * 20 + 10}px`;
    bubble.style.height = bubble.style.width;
    bubble.style.animationDuration = `${Math.random() * 5 + 5}s`;
    uvBackground.appendChild(bubble);
  }
});
