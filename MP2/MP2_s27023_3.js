function preload() {
    window.originalImage = window.loadImage("https://raw.githubusercontent.com/scikit-image/scikit-image/v0.19.3/skimage/data/astronaut.png");

}
function setup() {
    const originalImage = window.originalImage;

    const createImage = () => window.createImage(originalImage.width, originalImage.height);

    const images = new Array(3).fill(0).map(_ => createImage())
    const sumImage = createImage();

    const CANVAS_WIDTH = originalImage.width * 2;
    const CANVAS_HEIGHT = originalImage.height * 2;

    images.forEach(img => img.loadPixels());

    originalImage.loadPixels();
    for (let y = 0; y < originalImage.height; y++) {
        for (let x = 0; x < originalImage.width; x++) {
            const pos = (originalImage.width * y + x) * 4;
            const alphaPos = pos + 3;
            for (let colorIndex in images) {
                const image = images[+colorIndex];
                const pixelPos = pos + +colorIndex;
                image.pixels[pixelPos] = originalImage.pixels[pixelPos];
                image.pixels[alphaPos] = 255;
            }
        }
    }

    images.forEach(img => img.updatePixels());


    window.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    for (const colorIndex in images) {
        const image = images[colorIndex];
        const x = +colorIndex % 2 * CANVAS_WIDTH / 2;
        const y = ~~(+colorIndex / 2) * CANVAS_HEIGHT / 2;
        window.image(image, x, y, image.width, image.height);
        sumImage.blend(image, 0, 0, image.width, image.height, 0, 0, sumImage.width, sumImage.height, window.ADD);
    }

    window.image(sumImage, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, sumImage.width, sumImage.height);
}