const answers = [
  { text: "It is certain", type: "positive" },
  { text: "It is decidedly so", type: "positive" },
  { text: "Without a doubt", type: "positive" },
  { text: "Yes - definitely", type: "positive" },
  { text: "You may rely on it", type: "positive" },
  { text: "As I see it, yes", type: "positive" },
  { text: "Most likely", type: "positive" },
  { text: "Outlook good", type: "positive" },
  { text: "Yes", type: "positive" },
  { text: "Signs point to yes", type: "positive" },
  { text: "Reply hazy, try again", type: "neutral" },
  { text: "Ask again later", type: "neutral" },
  { text: "Better not tell you now", type: "neutral" },
  { text: "Cannot predict now", type: "neutral" },
  { text: "Concentrate and ask again", type: "neutral" },
  { text: "Don't count on it", type: "negative" },
  { text: "My reply is no", type: "negative" },
  { text: "My sources say no", type: "negative" },
  { text: "Outlook not so good", type: "negative" },
  { text: "Very doubtful", type: "negative" }
];

const easterEggAnswers = [
  { text: "The answer lies within you… or Google.", type: "easter-egg" },
  { text: "Behold! The universe has spoken. The answer is: Meh.", type: "easter-egg" },
  { text: "You have unlocked the secret of the 8 Ball. Now, roll a D20.", type: "easter-egg" }
];

// Vibration patterns for mobile (in milliseconds)
const vibrationPatterns = [
  [100],           // Short pulse
  [200, 100, 200], // Double pulse
  [50, 50, 50, 50], // Quick bursts
  [300],           // Longer pulse
  [100, 100, 100]  // Triple pulse
];

const askButton = document.getElementById("askButton");
const answerDisplay = document.getElementById("answer");
const ball = document.getElementById("magicBall");
const triangleContainer = document.querySelector(".triangle-container");

let isAnimating = false;

function getRandomVibration() {
  const randomIndex = Math.floor(Math.random() * vibrationPatterns.length);
  return vibrationPatterns[randomIndex];
}

function askQuestion() {
  if (isAnimating) return;

  isAnimating = true;
  triangleContainer.style.opacity = "0";
  ball.classList.remove("float");
  ball.classList.add("shake");

  // Trigger vibration on mobile
  if ("vibrate" in navigator) {
    const vibration = getRandomVibration();
    navigator.vibrate(vibration);
  }

  setTimeout(() => {
    let response;
    if (Math.random() < 1/50) {
      response = easterEggAnswers[Math.floor(Math.random() * easterEggAnswers.length)];
    } else {
      response = answers[Math.floor(Math.random() * answers.length)];
    }

    ball.classList.remove("shake");
    ball.classList.add("float");
    answerDisplay.textContent = response.text;
    triangleContainer.style.opacity = "1";
    isAnimating = false;
  }, 2000);
}

// Event listeners for button and ball
askButton.addEventListener("click", askQuestion);
ball.addEventListener("click", askQuestion);

// Support touch events for mobile
ball.addEventListener("touchstart", (e) => {
  e.preventDefault(); // Prevent scrolling or other defaults
  askQuestion();
});

// Allow Enter key to trigger
document.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !isAnimating) {
    askQuestion();
  }
});
