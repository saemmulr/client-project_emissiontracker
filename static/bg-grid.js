display: block;const canvas = document.getElementById("bg-grid");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0, 255, 80, 0.2)";

    const spacing = 40;

    for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
            ctx.fillRect(x, y, 2, 2);
        }
    }

    requestAnimationFrame(drawGrid);
}

drawGrid();
