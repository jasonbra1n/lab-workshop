function initLifePathCalculator() {
    const calculateBtn = document.getElementById('calculateBtn');
    calculateBtn.addEventListener('click', calculateLifePath);

    function calculateLifePath() {
        const dob = document.getElementById("dob").value;
        if (!dob) {
            alert("Please enter a valid date of birth.");
            return;
        }

        const [year, month, day] = dob.split('-').map(Number);
        const birthDate = new Date(year, month - 1, day);

        const dayNum = birthDate.getDate();
        const monthNum = birthDate.getMonth() + 1;
        const yearNum = birthDate.getFullYear();

        let lifePathNumber = calculateNumerology(dayNum, monthNum, yearNum);
        let personality = getPersonality(lifePathNumber);
        let birthCard = getBirthCard(lifePathNumber);

        document.getElementById("lifePathNumber").innerText = lifePathNumber;
        document.getElementById("personality").innerText = personality;
        document.getElementById("birthCard").innerText = birthCard;
        document.getElementById("result").style.display = "block";
    }

    function calculateNumerology(day, month, year) {
        let dayNum = reduceToSingleDigit(day);
        let monthNum = reduceToSingleDigit(month);
        let yearNum = reduceToSingleDigit(year);

        let sum = dayNum + monthNum + yearNum;
        return reduceToSingleDigit(sum);
    }

    function reduceToSingleDigit(num) {
        if (num === 11 || num === 22 || num === 33) {
            return num;
        }

        while (num > 9) {
            num = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
        }
        return num;
    }

    function getPersonality(lifePathNumber) {
        const personalityTraits = {
            1: "Independent, confident, and a natural leader.",
            2: "Diplomatic, cooperative, and sensitive.",
            3: "Creative, expressive, and social.",
            4: "Practical, hardworking, and reliable.",
            5: "Adventurous, dynamic, and freedom-loving.",
            6: "Compassionate, nurturing, and responsible.",
            7: "Introspective, spiritual, and analytical.",
            8: "Ambitious, determined, and goal-oriented.",
            9: "Idealistic, compassionate, and humanitarian.",
            11: "Intuitive, inspirational, and visionary.",
            22: "Master Builder, highly capable, and practical.",
            33: "Master Teacher, compassionate, and nurturing."
        };
        return personalityTraits[lifePathNumber] || "Unknown Personality";
    }

    function getBirthCard(lifePathNumber) {
        const cards = {
            1: "The Magician",
            2: "The High Priestess",
            3: "The Empress",
            4: "The Emperor",
            5: "The Hierophant",
            6: "The Lovers",
            7: "The Chariot",
            8: "Strength",
            9: "The Hermit",
            11: "Justice",
            22: "The Fool",
            33: "The World"
        };
        return cards[lifePathNumber] || "Unknown Card";
    }
}

// Run initialization when the script loads
if (document.getElementById('calculateBtn')) {
    initLifePathCalculator();
}
