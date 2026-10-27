function preload() {
    window.originalImage = window.loadImage("https://raw.githubusercontent.com/scikit-image/scikit-image/v0.19.3/skimage/data/astronaut.png");
}
function setup() {
    const createImage = () => window.createImage(originalImage.width, originalImage.height);
    window.images = new Array(3).fill(0).map(_ => createImage())
    window.originalImage.resize(256, 256)
    frameRate(2);
}
function draw() {
    const originalImage = window.originalImage;
    const images = window.images;

    const CANVAS_WIDTH = originalImage.width * 2;
    const CANVAS_HEIGHT = originalImage.height * 2;

    images.forEach(img => img.loadPixels());
    originalImage.loadPixels();

    for (let y = 0; y < originalImage.height; y++) {
        for (let x = 0; x < originalImage.width; x++) {
            const pos = (originalImage.width * y + x) * 4;
            
            const redPos = pos;
            const greenPos = pos + 1;
            const bluePos = pos + 2;
            const alphaPos = pos + 3;

            const red = originalImage.pixels[redPos] / 255;
            const green = originalImage.pixels[greenPos] / 255;
            const blue = originalImage.pixels[bluePos] / 255;

            const colorMin = Math.min(red, green, blue);
            const colorMax = Math.max(red, green, blue);

            const value = colorMax;
            const lightness = (colorMax + colorMin) / 2;
            images[0].set(x,y,255*value);
            images[1].set(x,y,255*lightness);
            images[2].set(x,y,255 * ((window.frameCount % 2 === 0) ? value : lightness));
        }
    }
    console.log(window.frameCount)
    images.forEach(img => img.updatePixels());


    window.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    for (const colorIndex in images) {
        const image = images[colorIndex];
        const x = +colorIndex % 2 * CANVAS_WIDTH / 2;
        const y = ~~(+colorIndex / 2) * CANVAS_HEIGHT / 2;
        window.image(image, x, y, image.width, image.height);
    }

    window.image(originalImage, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, originalImage.width, originalImage.height);
}