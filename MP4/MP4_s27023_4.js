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
     * @type {Vector2D | null}
     */
    #last = null;

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
     * @param {Vector2D} vector
     * @param {Color} color
     */
    drawVector(vector, color) {
        if (this.#last) {
            this.#drawLine(this.#last, vector, color)
        } else {
            this.setPixel(vector.x, vector.y, color)
        }
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
        this.#last = new Vector2D(x, y);
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
     * @param {Vector2D} start
     * @param {Vector2D} end
     * @param {Color} color
     */
    #drawLine(start, end, color) {
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

    resetLast() {
        this.#last = null;
    }

    // get pixels() {
    //     return this.#pixels;
    // }
}

class Matrix {
    /**
     * @type {number}
     */
    #width;
    /**
     * @type {number}
     */
    #height;
    /**
     * @type {number[]}
     */
    #data;

    /**
     * @param {number} width
     * @param {number} height
     * @param {number[] | undefined} data
     */
    constructor(width, height, data = new Array(width * height).fill(0)) {
        if (data.length !== width * height) throw new Error("Wrong data length");
        this.#width = width;
        this.#height = height;
        this.#data = data;
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    #index(x, y) {
        if (x < 0 || x >= this.#width) throw new Error("X is out of bounds");
        if (y < 0 || y >= this.#height) throw new Error("Y is out of bounds");
        return this.#width * y + x;
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    get(x, y) {
        const index = this.#index(x, y);
        return this.#data[index]
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} value
     */
    set(x, y, value) {
        const index = this.#index(x, y);
        this.#data[index] = value
    }

    /**
     * @param {Matrix} other
     */
    multiply(other) {
        if (this.#width !== other.height) {
            console.error(this, other)
             throw new Error("Dimension mismatch");
        }
        const result = new Matrix(other.width, this.#height);
        for (let y = 0; y < this.#height; y++) {
            for (let x = 0; x < other.width; x++) {
                let sum = 0;
                for (let i = 0; i < this.#width; i++) sum += this.get(i, y) * other.get(x, i);
                result.set(x, y, sum);
            }
        }
        return result;
    }

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }
}

class Vector2D extends Matrix {
    /**
     * 
     * @param {Matrix} matrix 
     */
    static fromMatrix(matrix) {
        if (matrix.width !== 1 || matrix.height !== 3) throw new Error("Matrix is not a 2D vector");
        if (matrix.get(0, 2) !== 1) throw new Error("Matrix is invalid")
        return new Vector2D(matrix.get(0, 0), matrix.get(0, 1))
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        super(1, 3, [x, y, 1]);
    }

    get x() {
        return this.get(0, 0);
    }

    get y() {
        return this.get(0, 1);
    }

    /**
     * 
     * @param {Matrix} other 
     */
    transform(other) {
        return Vector2D.fromMatrix(other.multiply(this))
    }
}

class IdentityMatrix extends Matrix {
    /**
     * @param {number} dimention
     */
    constructor(dimention) {
        super(dimention, dimention)
        for(let x = 0, y = 0; x < dimention; x++, y++) {
            this.set(x, y, 1);
        }        
    }
}

class ShiftMatrix extends IdentityMatrix {
    /**
     * @param {number} dimention
     * @param {number[] | undefined} shifts
     */
    constructor(dimention, shifts = new Array(dimention - 1).fill(0)) {
        if (shifts.length + 1 !== dimention) throw new Error("Shifts length is invalid")
        super(dimention)
        for (let y = 0; y < dimention - 1; y++) this.set(this.width - 1, y, shifts[y])
    }
}

class ShiftMatrix2D extends ShiftMatrix {
    /**
     * @param {number} shiftX
     * @param {number} shiftY
     */
    constructor(shiftX, shiftY) {
        super(3, [shiftX, shiftY])
    }
}

class ScaleMatrix extends IdentityMatrix {
    /**
     * @param {number} dimention
     * @param {number[] | undefined} scales
     */
    constructor(dimention, scales = new Array(dimention - 1).fill(0)) {
        if (scales.length + 1 !== dimention) throw new Error("Scales length is invalid")
        super(dimention)
        for (let y = 0; y < dimention - 1; y++) this.set(y, y, scales[y])
    }
}

class ScaleMatrix2D extends ScaleMatrix {
    /**
     * @param {number} scaleX
     * @param {number} scaleY
     */
    constructor(scaleX, scaleY) {
        super(3, [scaleX, scaleY])
    }
}

class RotationMatrix2D extends IdentityMatrix {
    /**
     * @param {number} rotation Degrees
     */
    constructor(rotation = 0) {
        super(3)
        const radians = (rotation / 180) * Math.PI;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        this.set(0, 0, cos);
        this.set(1, 0, -sin);
        this.set(0, 1, sin);
        this.set(1, 1, cos);
    }
}

class ShearMatrix2D extends IdentityMatrix {
    /**
     * @param {number} shearX
     * @param {number} shearY
     */
    constructor(shearX, shearY) {
        super(3)
        this.set(1, 0, shearX);
        this.set(0, 1, shearY);
    }
}

class Controls {
    static mouseHeld = false;
    static spaceHeld = false;
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
        window.addEventListener("keydown", this.#onKeyDown.bind(this));
        window.addEventListener("keyup", this.#onKeyUp.bind(this));
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
     * @param {KeyboardEvent} event 
     */
    #onKeyDown(event) {
        const { key } = event
        if (key === " ") Controls.spaceHeld = true;
    }

    /**
     * 
     * @param {KeyboardEvent} event 
     */
    #onKeyUp(event) {
        const { key } = event
        if (key === " ") Controls.spaceHeld = false;
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

    #images = [
        new CanvasImage(512, 512, new Color(240, 250, 240)),
        new CanvasImage(512, 512, new Color(240, 240, 250))
    ];

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


        const shiftMatrix = new ShiftMatrix2D(50, 50);

        this.#canvas.addMouseDraggedListener((e)=> {
            const current = new Vector2D(e.offsetX, e.offsetY);
            this.#images[0].drawVector(current, new Color(0, 0, 0));
            this.#images[1].drawVector(current.transform(shiftMatrix), new Color(0, 0, 0));
        });
        this.#canvas.addMouseUpListener((e)=> {
            this.#images.forEach(image => image.resetLast())
        })

        this.#requestDraw();
    }

    #draw() {
        this.#canvas.drawImage(this.#images[Controls.spaceHeld ? 1 : 0]);
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