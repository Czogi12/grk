function preload() {
    window.originalImage = window.loadImage("https://raw.githubusercontent.com/scikit-image/scikit-image/v0.19.3/skimage/data/astronaut.png");
}
function setup() {
    const createImage = () => window.createImage(originalImage.width, originalImage.height);
    window.images = new Array(3).fill(0).map(_ => createImage());
    window.originalImage.resize(256, 256);
    window.CANVAS_WIDTH = window.originalImage.width * 2;
    window.CANVAS_HEIGHT = window.originalImage.height * 2;
    window.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT + 100);
    // frameRate(2);
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
    window.clear();
    const originalImage = window.originalImage;
    const images = window.images;

    const CANVAS_WIDTH = window.CANVAS_WIDTH;
    const CANVAS_HEIGHT = window.CANVAS_HEIGHT;

    images.forEach(img => img.loadPixels());
    originalImage.loadPixels();

    const isHSV = window.frameCount % 2 === 0;

    for (let y = 0; y < originalImage.height; y++) {
        for (let x = 0; x < originalImage.width; x++) {
            const pos = (originalImage.width * y + x) * 4;
            
            const redPos = pos;
            const greenPos = pos + 1;
            const bluePos = pos + 2;

            const red = originalImage.pixels[redPos] / 255;
            const green = originalImage.pixels[greenPos] / 255;
            const blue = originalImage.pixels[bluePos] / 255;

            const colorMin = Math.min(red, green, blue);
            const colorMax = Math.max(red, green, blue);

            const value = colorMax;
            const lightness = (colorMax + colorMin) / 2;
            const chroma = colorMax - colorMin;

            const saturationHSV = (colorMax === 0) ? 0 : chroma / colorMax;
            const saturationHSL = (colorMax === 0) ? 0 : chroma / (1 - Math.abs(2 * lightness - 1));

            let hue = calcHue(red, green, blue, value, chroma) / 6;
            if (hue < 0) {
                hue += 1
            }

            images[0].set(x,y,255*hue);
            images[1].set(x,y,255*saturationHSV);
            images[2].set(x,y,255 * value);
        }
    }
    images.forEach(img => img.updatePixels());


    for (const colorIndex in images) {
        const image = images[colorIndex];
        const x = +colorIndex % 2 * CANVAS_WIDTH / 2;
        const y = ~~(+colorIndex / 2) * CANVAS_HEIGHT / 2;
        window.image(image, x, y, image.width, image.height);
    }

    window.image(originalImage, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, originalImage.width, originalImage.height);
}