function calculateLifePath() {
            // Get the user's birth date
            const dob = document.getElementById("dob").value;
            if (!dob) {
                alert("Please enter a valid date of birth.");
                return;
            }

            // Split the input into year, month, and day
            const [year, month, day] = dob.split('-').map(Number);

            // Create a new date object with the correct components
            const birthDate = new Date(year, month - 1, day); // JavaScript months are 0-based

            console.log("Original date from input:", dob);  // Log input date
            console.log("Parsed Date Object:", birthDate); // Log parsed date object

            const dayNum = birthDate.getDate();
            const monthNum = birthDate.getMonth() + 1; // months are 0-indexed
            const yearNum = birthDate.getFullYear();

            // Calculate Life Path Number
            let lifePathNumber = calculateNumerology(dayNum, monthNum, yearNum);

            // Determine Personality based on Life Path Number (simplified)
            let personality = getPersonality(lifePathNumber);

            // Determine Birth Card based on Life Path Number
            let birthCard = getBirthCard(lifePathNumber);

            // Show the result
            document.getElementById("lifePathNumber").innerText = lifePathNumber;
            document.getElementById("personality").innerText = personality;
            document.getElementById("birthCard").innerText = birthCard;
            document.getElementById("result").style.display = "block";
        }

        function calculateNumerology(day, month, year) {
            // Reduce the components to a single digit
            let dayNum = reduceToSingleDigit(day);
            let monthNum = reduceToSingleDigit(month);
            let yearNum = reduceToSingleDigit(year);

            // Sum the reduced digits
            let sum = dayNum + monthNum + yearNum;
            console.log("Sum of reduced digits:", sum);  // Log sum

            // Reduce the sum to a single digit or a Master Number (11, 22, 33)
            return reduceToSingleDigit(sum);
        }

        function reduceToSingleDigit(num) {
            // Check for Master Numbers
            if (num === 11 || num === 22 || num === 33) {
                console.log("Master Number:", num);  // Log Master Numbers
                return num;
            }

            // Reduce to a single digit
            while (num > 9) {
                num = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
                console.log("Reducing:", num);  // Log reduction process
            }
            return num;
        }

        function getPersonality(lifePathNumber) {
            // Personality traits based on Life Path Number
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
