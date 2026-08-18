console.log("HOME.JS IS LOADING");


// ===============================
// CHECK LOGIN
// ===============================

fetch("/api/me")
    .then(response => {

        if (!response.ok) {
            window.location.href = "/";
            return;
        }

        return response.json();

    })
    .then(data => {

        if (!data) return;

        document.getElementById("userEmail").textContent =
            data.user.email;

    })
    .catch(error => {

        console.error("Authentication error:", error);

        window.location.href = "/";

    });


// ===============================
// LOGOUT
// ===============================

document
    .getElementById("logoutButton")
    .addEventListener("click", async function () {

        try {

            const response = await fetch("/api/logout", {
                method: "POST"
            });

            const data = await response.json();

            console.log(data.message);

            window.location.href = "/";

        } catch (error) {

            console.error("Logout error:", error);

        }

    });
let selectedMovieVideo = "";

// ===============================
// MOVIE DETAILS
// ===============================

const searchCards =
    document.querySelectorAll(".movie-card");

const movieModal =
    document.getElementById("movieModal");

const closeModal =
    document.getElementById("closeModal");

const modalTitle =
    document.getElementById("modalTitle");

const modalDescription =
    document.getElementById("modalDescription");

const modalInfo =
    document.getElementById("modalInfo");


searchCards.forEach(function (card) {

    card.addEventListener("click", function () {

        const title =
            card.dataset.title || "Movie";

        const description =
            card.dataset.description ||
            "Movie information is not available yet.";

        const year =
            card.dataset.year || "2025";

        const rating =
            card.dataset.rating || "13+";
            selectedMovieVideo =
    card.dataset.video || "";
    selectedMovieImage =
    card.querySelector("img").getAttribute("src");

        modalTitle.textContent = title;

        modalDescription.textContent =
            description;

        modalInfo.textContent =
            `${year} • ${rating}`;

        movieModal.style.display = "flex";

    });

});


// ===============================
// CLOSE MOVIE DETAILS
// ===============================

closeModal.addEventListener("click", function () {

    movieModal.style.display = "none";

});


const playMovieButton = document.getElementById("playMovie");
const heroPlayButton = document.querySelector(".play-button");

const videoModal = document.getElementById("videoModal");
const movieVideo = document.getElementById("movieVideo");
const closeVideo = document.getElementById("closeVideo");


// ===============================
// HERO PLAY BUTTON
// ===============================

if (heroPlayButton) {

    heroPlayButton.addEventListener("click", function () {

        videoModal.style.display = "flex";

        movieVideo.src = "assets/videos/stranger.mp4";

        movieVideo.currentTime = 0;

        movieVideo.play();

    });

}


// ===============================
// MODAL PLAY BUTTON
// ===============================

if (playMovieButton) {

    playMovieButton.addEventListener("click", function () {

        movieModal.style.display = "none";

        videoModal.style.display = "flex";

        movieVideo.src = selectedMovieVideo;

        movieVideo.currentTime = 0;

        movieVideo.play();

    });

}


// CLOSE VIDEO
// ===============================
// SAVE WATCH PROGRESS
// ===============================

async function saveWatchProgress() {

    if (!selectedMovieVideo) {
        return;
    }

    if (!movieVideo.duration) {
        return;
    }

    const progress = movieVideo.currentTime;
    const duration = movieVideo.duration;

    // Don't save if movie is almost finished
    if (progress >= duration - 10) {
        return;
    }

    try {

        await fetch("/api/continue-watching", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                title:
                    modalTitle.textContent,

                image:
    selectedMovieImage ||
    "assets/images/strangerthings.jpg",
                video:
                    selectedMovieVideo,

                progress:
                    progress,

                duration:
                    duration

            })

        });

        console.log(
            "Watch progress saved:",
            progress
        );

        loadContinueWatching();

    } catch (error) {

        console.error(
            "Could not save watch progress:",
            error
        );

    }

}


// ===============================
// CLOSE VIDEO
// ===============================

if (closeVideo) {

    closeVideo.addEventListener("click", async function () {

        await saveWatchProgress();

        movieVideo.pause();

        movieVideo.currentTime = 0;

        videoModal.style.display = "none";

    });

}
// ===============================
// SEARCH MOVIES
// ===============================

const searchInput = document.getElementById("searchInput");
const movieCards = document.querySelectorAll(".movie-card");

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const searchText = this.value.toLowerCase().trim();

        movieCards.forEach(function (card) {

            const title =
                (card.dataset.title || "").toLowerCase();

            if (title.includes(searchText)) {

                card.style.display = "";

            } else {

                card.style.display = "none";

            }

        });

    });

}
// ===============================
// HERO MORE INFO
// ===============================

const infoButton = document.querySelector(".info-button");

if (infoButton) {

    infoButton.addEventListener("click", function () {

        modalTitle.textContent = "Stranger Things";

        modalDescription.textContent =
            "When a young boy disappears, his friends and family uncover a supernatural mystery involving secret experiments and strange forces.";

        modalInfo.textContent =
            "2025 • TV-14";

        selectedMovieVideo =
            "assets/videos/stranger.mp4";

        selectedMovieImage =
            "assets/images/strangerthings.jpg";

        movieModal.style.display = "flex";

    });

}
// ===============================
// MY LIST
// ===============================

const myListLink =
    document.getElementById("myListLink");

const myListSection =
    document.getElementById("myListSection");

if (myListLink) {

    myListLink.addEventListener("click", function (event) {

        event.preventDefault();

        myListSection.scrollIntoView({
            behavior: "smooth"
        });

    });

}
// ===============================
// MY LIST
// ===============================

const addToMyList =
    document.getElementById("addToMyList");

const myListRow =
    document.getElementById("myListRow");

const emptyMyList =
    document.getElementById("emptyMyList");


// ===============================
// SELECTED MOVIE IMAGE
// ===============================

let selectedMovieImage = "";


// ===============================
// LOAD MY LIST
// ===============================

async function loadMyList() {

    try {

        const response = await fetch("/api/mylist");

        if (!response.ok) {
            console.error("Could not load My List");
            return;
        }

        const data = await response.json();

        // Remove old movie cards
        myListRow
            .querySelectorAll(".movie-card")
            .forEach(card => card.remove());


        if (!data.myList || data.myList.length === 0) {

            emptyMyList.style.display = "block";

            return;
        }


        emptyMyList.style.display = "none";


        data.myList.forEach(function (movieData) {

    const movie = document.createElement("div");

    movie.className = "movie-card";

    const image =
        movieData.image && movieData.image.trim() !== ""
            ? movieData.image
            : "assets/images/strangerthings.jpg";

    movie.innerHTML = `
        <img
            src="${image}"
            alt="${movieData.title}"
        >

        <button class="remove-list-button">
            ×
        </button>
    `;

    const removeButton =
        movie.querySelector(".remove-list-button");

    removeButton.addEventListener("click", async function (event) {

        event.stopPropagation();

        try {

            const response = await fetch(
                `/api/mylist/${encodeURIComponent(movieData.title)}`,
                {
                    method: "DELETE"
                }
            );

            const result = await response.json();

            console.log(result.message);

            if (response.ok) {

                loadMyList();

            }

        } catch (error) {

            console.error(
                "Remove from My List error:",
                error
            );

        }

    });

    myListRow.appendChild(movie);

});

    } catch (error) {

        console.error(
            "My List loading error:",
            error
        );

    }

}


// ===============================
// ADD TO MY LIST
// ===============================

if (addToMyList) {

    addToMyList.addEventListener("click", async function () {

        const title =
            modalTitle.textContent;

        try {

            const response = await fetch("/api/mylist", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    title: title,

                   image:
    selectedMovieImage ||
    "assets/images/strangerthings.jpg",

                    video: selectedMovieVideo

                })

            });


            const data = await response.json();

            console.log(data.message);


            if (response.ok) {

                loadMyList();

            }

        } catch (error) {

            console.error(
                "Add to My List error:",
                error
            );

        }

    });

}


// ===============================
// LOAD WHEN PAGE OPENS
// ===============================

loadMyList();
// ===============================
// CONTINUE WATCHING
// ===============================

const continueWatchingRow =
    document.getElementById("continueWatchingRow");

const emptyContinueWatching =
    document.getElementById("emptyContinueWatching");


// ===============================
// LOAD CONTINUE WATCHING
// ===============================

async function loadContinueWatching() {

    try {

        const response =
            await fetch("/api/continue-watching");

        if (!response.ok) {
            console.error(
                "Could not load Continue Watching"
            );
            return;
        }

        const data =
            await response.json();

        continueWatchingRow
            .querySelectorAll(".movie-card")
            .forEach(card => card.remove());


        if (
            !data.continueWatching ||
            data.continueWatching.length === 0
        ) {

            emptyContinueWatching.style.display =
                "block";

            return;
        }


        emptyContinueWatching.style.display =
            "none";


        data.continueWatching.forEach(function (movieData) {
console.log("CONTINUE MOVIE:", movieData);
            const movie =
                document.createElement("div");

            movie.className =
                "movie-card";


            const imagePath =
    movieData.image && movieData.image.trim() !== ""
        ? movieData.image
        : "assets/images/strangerthings.jpg";

movie.innerHTML = `
    <img
        src="${imagePath}"
        alt="${movieData.title}"
    >
`;


            movie.addEventListener(
                "click",
                function () {

                    selectedMovieVideo =
                        movieData.video;

                    selectedMovieImage =
                        movieData.image;

                    modalTitle.textContent =
                        movieData.title;

                    modalDescription.textContent =
                        "Continue watching this movie.";

                    modalInfo.textContent = "";

                    movieModal.style.display =
                        "flex";


                    playMovieButton.onclick =
                        function () {

                            movieModal.style.display =
                                "none";

                            videoModal.style.display =
                                "flex";

                            movieVideo.src =
                                movieData.video;

                            movieVideo.onloadedmetadata =
                                function () {

                                    movieVideo.currentTime =
                                        movieData.progress || 0;

                                    movieVideo.play();

                                };

                        };

                }
            );


            continueWatchingRow.appendChild(movie);

        });


    } catch (error) {

        console.error(
            "Continue Watching loading error:",
            error
        );

    }

}


loadContinueWatching();