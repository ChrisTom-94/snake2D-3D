/**
 * Return à random integer between two values
 *
 * @param {Number} min lower number to return
 * @param {Number} max bigger number to return
 * @return {Number}
 */
function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

/**
 * Alternate between fullscreen or normal
 */
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

/**
 * Check if navigator support WwebGL
 * @return {Boolean}
 */
function detectWebGLContext() {
    let canvas = document.createElement("canvas");
    let gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl && gl instanceof WebGLRenderingContext) {
        return true;
    } else {
        return false;
    }
}

export { getRandomInt, toggleFullScreen, detectWebGLContext };
