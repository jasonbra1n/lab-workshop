document.addEventListener('DOMContentLoaded', () => {
  // Load Head
  fetch('/head.html')
    .then(response => response.text())
    .then(data => {
      document.head.innerHTML += data; // Append to existing head content
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
    })
    .catch(error => console.error('Error loading header:', error));

  // Load Footer
  fetch('/footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error loading footer:', error));

  // Load Bubbles
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
