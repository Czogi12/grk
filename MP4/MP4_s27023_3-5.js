// @ts-check

class Color {
    /**
     * @param {number} value
     */
    static normalizeValue(value) {
        if (value < 0) return 0;
        if (value > 255) return 255;
        return value;
    }

    /**
     * @type {number}
     */
    #red = 0;
    /**
     * @type {number}
     */
    #green = 0;
    /**
     * @type {number}
     */
    #blue = 0;
    /**
     * @type {number}
     */
    #alpha = 255;

    /**
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number | undefined} a
     */
    constructor(r, g, b, a = 255) {
        this.red = r;
        this.green = g;
        this.blue = b;
        this.alpha = a;
    }

    /**
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number | undefined} a
     */
    set(r, g, b, a = -1) {
        if(a !== -1) this.alpha = a;
        this.red = r;
        this.blue = b;
        this.green = g;
    }

    get red() {
        return this.#red;
    }

    set red(red) {
        this.#red = Color.normalizeValue(red);
    }

    get green() {
        return this.#green;
    }

    set green(green) {
        this.#green = Color.normalizeValue(green);
    }

    get blue() {
        return this.#blue;
    }

    set blue(blue) {
        this.#blue = Color.normalizeValue(blue);
    }

    get alpha() {
        return this.#alpha;
    }

    set alpha(alpha) {
        this.#alpha = Color.normalizeValue(alpha);
    }

    get fillStyle() {
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha / 255})`
    }
}

class Position {
    /**
     * @type {number}
     */
    #x;
    /**
     * @type {number}
     */
    #y;

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }
}

class Pixel {
    /**
     * @type {Color}
     */
    #color;

    /**
     * @type {Position}
     */
    #position

    /**
     * 
     * @param {Position} position 
     * @param {Color} color 
     */
    constructor(position, color) {
        this.#position = position;
        this.#color = color;
    }

    get color() {
        return this.#color;
    }

    get position() {
        return this.#position;
    }
}

class CanvasImage {
    // /**
    //  * @type {Pixel[]}
    //  */
    // #pixels;

    /**
     * @type {ImageData}
     */
    #data

    /**
     * 
     * @param {number} width 
     * @param {number} height 
     * @param {Color | undefined } color 
     */
    constructor(width, height, color = new Color(255, 255, 255)) {
        this.#data = new ImageData(width, height);
        this.fill(color)
        // let index = 0;
        // this.#pixels = new Array(width * height).fill(0).map(_ => {
        //     const currentIndex = index++;
        //     const x = currentIndex % width;
        //     const y = Math.floor(currentIndex / width);
        //     const position = new Position(x, y);
        //     const color = new Color(0, 0, 0);
        //     return new Pixel(position, color);
        // });
    }

    get width() {
        return this.#data.width;
    }

    get height() {
        return this.#data.height;
    }

    get data() {
        return this.#data;
    }

    /**
     * @param {Vector} vector
     * @param {Color} color
     */
    drawVector(vector, color) {
        this.setPixel(vector.x, vector.y, color)
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {Color} color
     */
    setPixel(x, y, color) {
        x = Math.floor(x);
        y = Math.floor(y);
        const i = (y * this.width + x) * 4;
        const d = this.#data.data;
        d[i] = color.red;
        d[i + 1] = color.green;
        d[i + 2] = color.blue;
        d[i + 3] = color.alpha;
    }

    /**
     * @param {Color} color
     */
    fill(color) {
        const d = this.#data.data;
        const { red, green, blue, alpha } = color;
        for (let i = 0; i < d.length; i += 4) {
            d[i] = red;
            d[i + 1] = green;
            d[i + 2] = blue;
            d[i + 3] = alpha;
        }
    }

    /**
     * @param {Vector} start
     * @param {Vector} end
     * @param {Color} color
     */
    drawLine(start, end, color) {
    let x0 = Math.floor(start.x), y0 = Math.floor(start.y);
    const x1 = Math.floor(end.x), y1 = Math.floor(end.y);

    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;

    while (true) {
        this.setPixel(x0, y0, color);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
    }
}

    // get pixels() {
    //     return this.#pixels;
    // }
}

class Vector {
    /**
     * @type {number[]}
     */
    #array

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.#array = [x, y, 1];
    }

    get x() {
        return this.#array[0];
    }

    get y() {
        return this.#array[1];
    }
}

class Controls {
    static mouseHeld = false;
}

class Canvas {
    /**
     * @type {HTMLCanvasElement}
     */
    #element;
    /**
     * @type {CanvasRenderingContext2D}
     */
    #ctx;

    /**
     * @type {(function(MouseEvent): void)[]}
     */
    #mouseDraggedListeners = [];

    /**
     * @type {(function(MouseEvent): void)[]}
     */
    #mouseUpListeners = [];

    /**
     * @param {HTMLCanvasElement} element
     */
    constructor(element) {
        this.#element = element;
        const ctx = element.getContext("2d");
        if (!ctx) throw new Error("Error getting context 2d.")
        this.#ctx = ctx;
        this.#initListeners();
    }

    #initListeners() {
        this.#element.addEventListener("mousedown", this.#onMouseDown.bind(this));
        window.addEventListener("mouseup", this.#onMouseUp.bind(this));
        this.#element.addEventListener("mousemove", this.#onMouseMove.bind(this));
    }

    /**
     * 
     * @param {MouseEvent} event 
     */
    #onMouseDown(event) {
        const { button } = event
        if (button) return;
        Controls.mouseHeld = true;
    }

    /**
     * 
     * @param {MouseEvent} event 
     */
    #onMouseUp(event) {
        this.#mouseUpListeners.forEach(listener => listener(event));
        const { button } = event
        if (button) return;
        Controls.mouseHeld = false;
    }

    /**
     * 
     * @param {MouseEvent} event 
     */
    #onMouseMove(event) {
        if (Controls.mouseHeld) {
            this.#mouseDraggedListeners.forEach(listener => listener(event));
        }
    }

    /**
     * 
     * @param {number} value 
     */
    background(value) {
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle
        this.#ctx.fillStyle = `rgb(${value} ${value} ${value})`;
        this.#ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * 
     * @param {CanvasImage} image 
     */
    drawImage(image) {
        // console.time("drawingImage");
        // for(const pixel of image.pixels) {
        //         this.#ctx.fillStyle = pixel.color.fillStyle;
        //         const {x, y} = pixel.position;
        //         this.#ctx.fillRect(x, y, 1, 1);
        // }
        this.#ctx.putImageData(image.data, 0, 0);
        // console.timeEnd("drawingImage");
    }

    /**
     * 
     * @param {function(MouseEvent): void} listener 
     */
    addMouseDraggedListener(listener) {
        this.#mouseDraggedListeners.push(listener);
    }


    /**
     * 
     * @param {function(MouseEvent): void} listener 
     */
    addMouseUpListener(listener) {
        this.#mouseUpListeners.push(listener);
    }

    set width(width) {
        this.#element.width = width;
    }

    get width() {
        return this.#element.width;
    }
    
    set height(height) {
        this.#element.height = height;
    }

    get height() {
        return this.#element.height;
    }
}

class MP4 {
    /**
     * @type {Canvas}
     */
    #canvas

    #imageA = new CanvasImage(512, 512, new Color(240, 250, 240));
    #imageB = new CanvasImage(512, 512, new Color(240, 240, 250));

    /**
     * @param {number} width 
     * @param {number} height 
     */    
    constructor(width, height) {
        document.body.style.backgroundColor = "#ccc"
        this.#canvas = new Canvas(document.querySelector("canvas") || (()=>{
            const canvas = document.createElement("canvas");
            document.body.appendChild(canvas);
            return canvas;
        })());
        this.#canvas.width = width;
        this.#canvas.height = height;
        this.#canvas.background(255);

        /**
         * @type {Vector | null}
         */
        let last = null;
        this.#canvas.addMouseDraggedListener((e)=> {
            const current = new Vector(e.offsetX, e.offsetY);
            if (!last) this.#imageA.drawVector(current, new Color(0, 0, 0));
            else this.#imageA.drawLine(current, last, new Color(0, 0, 0));
            last = current;
        });
        this.#canvas.addMouseUpListener((e)=> {
            last = null;
        })

        this.#requestDraw();
    }

    #draw() {
        this.#canvas.drawImage(this.#imageA);
        this.#requestDraw();
    }

    #requestDraw() {
        requestAnimationFrame(this.#draw.bind(this));
    }
}

(()=>{
    new MP4(512, 512);
})();

export {}