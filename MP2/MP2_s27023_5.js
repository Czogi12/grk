function preload() {
    window.originalImage = window.loadImage("https://raw.githubusercontent.com/scikit-image/scikit-image/v0.19.3/skimage/data/astronaut.png");
}
function setup() {
    window.originalImage.filter("gray");

    window.CANVAS_WIDTH = 256;
    window.CANVAS_HEIGHT = 256;
    window.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    window.histogram = new Array(256).fill(0);
    noLoop()
}

function calcHue(red, green, blue, value, chroma) {
    if (typeof value !== "number") value = Math.max(red, green, blue);
    if (typeof chroma !== "number") chroma = value - Math.min(red, green, blue);
    if (chroma === 0) return 0;
    if (value === red) return ((green - blue) / chroma) % 6;
    if (value === green) return ((blue - red) / chroma) + 2;
    if (value === blue) return ((red - green) / chroma) + 4;
    throw new Error(`Unexpected value: ${value}, r: ${red}, g:${green}, b: ${blue}`);
}

function draw() {
    const originalImage = window.originalImage;
    /**
     * @type {number[]}
     */
    const histogram = window.histogram;

    const CANVAS_WIDTH = window.CANVAS_WIDTH;
    const CANVAS_HEIGHT = window.CANVAS_HEIGHT;

    originalImage.loadPixels();

    for (let y = 0; y < originalImage.height; y++) {
        for (let x = 0; x < originalImage.width; x++) {
            const pos = (originalImage.width * y + x) * 4;
            histogram[originalImage.pixels[pos]]++
        }
    }
    console.log(histogram)
    window.background("white");
    window.stroke("black");
    window.strokeWeight(1);

    const max = Math.max(...histogram);
    let x = 0;
    for (let val of histogram.map(val => val / max * CANVAS_HEIGHT * 10)) {
        window.line(x, CANVAS_HEIGHT, x++, CANVAS_HEIGHT - val);
    }
}