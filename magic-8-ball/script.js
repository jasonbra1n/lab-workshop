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

const vibrationPatterns = [
  [100],
  [200, 100, 200],
  [50, 50, 50, 50],
  [300],
  [100, 100, 100]
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

function askQuestion(event) {
  if (isAnimating) return;

  // Prevent default for touch events to ensure vibration works
  if (event && event.type === "touchstart") {
    event.preventDefault();
  }

  isAnimating = true;
  triangleContainer.style.opacity = "0";
  ball.classList.remove("float");
  ball.classList.add("shake");

  // Trigger vibration
  if ("vibrate" in navigator) {
    const vibration = getRandomVibration();
    console.log("Vibrating with pattern:", vibration); // Debug
    navigator.vibrate(vibration);
  } else {
    console.log("Vibration API not supported");
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

// Event listeners
askButton.addEventListener("click", askQuestion);
ball.addEventListener("click", askQuestion);

// Enhanced touch support for mobile
ball.addEventListener("touchstart", askQuestion, { passive: false });
// Optional: Add touchend for extra reliability
ball.addEventListener("touchend", (e) => {
  e.preventDefault();
  askQuestion(e);
}, { passive: false });

// Enter key support
document.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !isAnimating) {
    askQuestion();
  }
});
