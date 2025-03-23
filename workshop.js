document.addEventListener('DOMContentLoaded', () => {
  const uvBackground = document.querySelector('.uv-background');
  
  // Create floating bubbles
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
