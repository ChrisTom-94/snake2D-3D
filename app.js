import { GameBoard as GameBoard3d } from "snake2D-3D/scripts/snake3d/Gameboard.js";
import { GameBoard as GameBoard2d } from "snake2D-3D/scripts/snake2d/Gameboard.js";
import { toggleFullScreen, detectWebGLContext } from "snake2D-3D/scripts/functions.js";

if (!localStorage.mode) localStorage.mode = "3d";
if (!localStorage.bestScore) localStorage.bestScore = 0;
if (!localStorage.bestLevel) localStorage.bestLevel = 0;
if (!localStorage.gameMode) localStorage.gameMode = "survival";
if (!localStorage.difficulty) localStorage.difficulty = "easy";

let button = document.getElementById("switchMode");
if (localStorage.mode == "2d") {
    new GameBoard2d(35, 20, 20);
    button.innerHTML = `Pass to 3d`;
    window.addEventListener("keydown", (e) => {
        if (e.key == "f") {
            toggleFullScreen();
        }
    });
} else if (localStorage.mode == "3d") {
    let canPlay3D = detectWebGLContext();
    if (canPlay3D == true) {
        new GameBoard3d(35, 25, 1);
        button.innerHTML = `Pass to 2d`;
    } else {
        alert("Your browser do not accept webGL, you have to play on 2D");
        localStorage.mode = "2d";
        window.location.reload();
    }
}

button.addEventListener("click", () => {
    if (localStorage.mode == "2d") {
        localStorage.mode = "3d";
        window.location.reload();
    } else if (localStorage.mode == "3d") {
        localStorage.mode = "2d";
        window.location.reload();
    }
});
