// ===============================
// NETFLIX CLONE - JAVASCRIPT
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    // ===============================
    // 1. FAQ ACCORDION
    // ===============================

    const faqBoxes = document.querySelectorAll(".faqbox");

    const faqAnswers = [
        "Netflix is a streaming service that offers a wide variety of TV shows, movies, documentaries, and more.",
        "Netflix plans in India start at ₹149 per month. The price depends on the plan you choose.",
        "You can watch Netflix on smart TVs, smartphones, tablets, laptops, gaming consoles and other supported devices.",
        "You can cancel your Netflix membership anytime through your account settings.",
        "Netflix has movies, TV shows, documentaries, anime, kids' content and Netflix Originals.",
        "Yes. Netflix provides a separate kids experience with content designed especially for children."
    ];

    faqBoxes.forEach(function (box, index) {

        box.addEventListener("click", function () {

            let existingAnswer = box.nextElementSibling;

            if (
                existingAnswer &&
                existingAnswer.classList.contains("faq-answer")
            ) {
                existingAnswer.remove();
                return;
            }

            const answer = document.createElement("div");

            answer.classList.add("faq-answer");

            answer.textContent = faqAnswers[index];

            answer.style.backgroundColor = "#2d2d2d";
            answer.style.color = "white";
            answer.style.maxWidth = "60vw";
            answer.style.margin = "-25px auto 34px auto";
            answer.style.padding = "20px 24px";
            answer.style.fontSize = "18px";
            answer.style.lineHeight = "1.5";

            box.after(answer);
        });

    });


    // ===============================
    // 2. GET STARTED BUTTON
    // ===============================

    const emailInput = document.querySelector(".hero input");
    const getStartedButton = document.querySelector(".btn-red");

    getStartedButton.addEventListener("click", function () {

        const email = emailInput.value.trim();

        if (email === "") {
            alert("Please enter your email address.");
            emailInput.focus();
            return;
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            alert("Please enter a valid email address.");
            emailInput.focus();
            return;
        }

        // Open Sign Up with email already filled
        openSignup(email);
    });


    // ===============================
    // 3. SIGN IN BUTTON
    // ===============================

    const signInButton =
        document.querySelector(".btn-red-sm");

    signInButton.addEventListener("click", function () {
        openSignin();
    });


    // ===============================
    // 4. SIGN UP
    // ===============================

    function openSignup(prefilledEmail = "") {

        const overlay = document.createElement("div");

        overlay.classList.add("login-overlay");

        overlay.innerHTML = `
            <div class="login-box">

                <button class="close-login">×</button>

                <h2>Sign Up</h2>

                <p>Create your Netflix account</p>

                <input
                    type="email"
                    id="signupEmail"
                    placeholder="Email address"
                    value="${prefilledEmail}"
                >

                <input
                    type="password"
                    id="signupPassword"
                    placeholder="Password"
                >

                <input
                    type="password"
                    id="signupConfirmPassword"
                    placeholder="Confirm password"
                >

                <button class="login-submit">
                    Sign Up
                </button>

                <p class="signup-text">
                    Already have an account?
                    <span class="switch-signin">
                        Sign in
                    </span>
                </p>

            </div>
        `;

        document.body.appendChild(overlay);


        // Close popup

        overlay
            .querySelector(".close-login")
            .addEventListener("click", function () {
                overlay.remove();
            });


        // Switch to Sign In

        overlay
            .querySelector(".switch-signin")
            .addEventListener("click", function () {

                overlay.remove();

                openSignin();

            });


        // ===============================
        // SIGN UP SUBMIT
        // ===============================

        overlay
            .querySelector(".login-submit")
            .addEventListener("click", async function () {

                const email =
                    overlay
                        .querySelector("#signupEmail")
                        .value
                        .trim();

                const password =
                    overlay
                        .querySelector("#signupPassword")
                        .value;

                const confirmPassword =
                    overlay
                        .querySelector("#signupConfirmPassword")
                        .value;


                // Validation

                if (
                    email === "" ||
                    password === "" ||
                    confirmPassword === ""
                ) {
                    alert("Please fill all fields.");
                    return;
                }


                const emailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!emailPattern.test(email)) {
                    alert("Please enter a valid email.");
                    return;
                }


                if (password.length < 6) {
                    alert(
                        "Password must contain at least 6 characters."
                    );
                    return;
                }


                if (password !== confirmPassword) {
                    alert("Passwords do not match.");
                    return;
                }


                // ===============================
                // SEND DATA TO NODE.JS
                // ===============================

                try {

                    const response = await fetch(
                        "/api/signup",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        alert(
                            data.message ||
                            "Signup failed."
                        );

                        return;
                    }


                    alert(data.message);

                    overlay.remove();

                    // Open Sign In
                    openSignin();


                } catch (error) {

                    console.error(error);

                    alert(
                        "Unable to connect to the server."
                    );

                }

            });

    }


    // ===============================
    // 5. SIGN IN
    // ===============================

    function openSignin() {

        const overlay = document.createElement("div");

        overlay.classList.add("login-overlay");

        overlay.innerHTML = `
            <div class="login-box">

                <button class="close-login">×</button>

                <h2>Sign In</h2>

                <input
                    type="email"
                    id="loginEmail"
                    placeholder="Email or mobile number"
                >

                <input
                    type="password"
                    id="loginPassword"
                    placeholder="Password"
                >

                <button class="login-submit">
                    Sign In
                </button>

                <p class="signup-text">
                    New to Netflix?
                    <span class="switch-signup">
                        Sign up now.
                    </span>
                </p>

            </div>
        `;

        document.body.appendChild(overlay);


        // Close

        overlay
            .querySelector(".close-login")
            .addEventListener("click", function () {
                overlay.remove();
            });


        // Switch to Sign Up

        overlay
            .querySelector(".switch-signup")
            .addEventListener("click", function () {

                overlay.remove();

                openSignup();

            });


        // ===============================
        // SIGN IN SUBMIT
        // ===============================

        overlay
            .querySelector(".login-submit")
            .addEventListener("click", async function () {

                const email =
                    overlay
                        .querySelector("#loginEmail")
                        .value
                        .trim();

                const password =
                    overlay
                        .querySelector("#loginPassword")
                        .value;


                if (email === "" || password === "") {

                    alert(
                        "Please enter your email and password."
                    );

                    return;
                }


                try {

    const response = await fetch("/api/login", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    const data = await response.json();

    if (!response.ok) {

        alert(data.message);
        return;

    }

    alert("Welcome back! " + data.email);

    overlay.remove();
    window.location.href = "/home.html";

} catch (error) {

    console.error("Login error:", error);

    alert(
        "Unable to connect to the server."
    );

}

            });

    }


    // ===============================
    // 6. ENGLISH BUTTON
    // ===============================

    const languageButton =
        document.querySelector("nav .btn");

    languageButton.addEventListener("click", function () {

        if (languageButton.textContent === "English") {

            languageButton.textContent = "हिन्दी";

        } else {

            languageButton.textContent = "English";

        }

    });


    // ===============================
    // 7. FOOTER LINKS
    // ===============================

    const footerLinks =
        document.querySelectorAll(".footer a");

    footerLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            event.preventDefault();

            alert(
                "This page is part of the Netflix clone."
            );

        });

    });
    // ===============================
// CHECK LOGIN STATUS
// ===============================

fetch("/api/me")
    .then(response => {

        if (!response.ok) {
            throw new Error("Not logged in");
        }

        return response.json();

    })
    .then(data => {

        console.log("Logged-in user:", data.user.email);

        const signInButton =
            document.querySelector(".btn-red-sm");

        if (signInButton) {

            signInButton.textContent =
                "Logout";

            signInButton.style.backgroundColor =
                "red";

            // Change Sign In button to Logout
            signInButton.onclick = async function () {

                try {

                    const response =
                        await fetch("/api/logout", {
                            method: "POST"
                        });

                    const result =
                        await response.json();

                    console.log(result.message);

                    alert("You have been logged out.");

                    location.reload();

                } catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                }

            };

        }

    })
    .catch(error => {

        console.log("User is not logged in.");

    });

});