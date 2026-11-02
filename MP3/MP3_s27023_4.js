/**
 * @typedef {'from' | 'to'} PointName
 */

class MP3 {
    /**
     * @type {Map<PointName, Point>}
     */
    #points;
    #mouseDown;

    /**
     * @type {Element}
     */
    #canvas;

    #listeners

    constructor(canvas) {
        this.#canvas = canvas;
        this.#points = new Map([
            ["from", new Point()],
            ["to", new Point()]
        ])
        this.#listeners = new Map();
        this.#mouseDown = false;
        this.#initListeners();
    }

    #initListeners() {
        this.#initListener("mousedown", this.#onMouseDown);
        this.#initListener("mouseup", this.#onMouseUp);
        this.#initListener("mousemove", this.#onMouseMove);
    }

    #initListener(name, func) {
        if (this.#listeners.has(name)) {
            this.#canvas.removeEventListener(name, this.#listeners.get(name));
        }

        this.#listeners.set(name, func.bind(this));
        this.#canvas.addEventListener(name, this.#listeners.get(name));
    }

    #onMouseDown({x, y}) {
        this.#mouseDown = true;
        this.#points.get("from").updatePosition(x, y)
        console.log("mouseDown", x, y);
    }

    #onMouseUp({x, y}) {
        if (!this.#mouseDown) return;
        this.#mouseDown = false;
        this.#points.get("to").updatePosition(x, y)
        this.#drawLine();
        console.log("mouseUp", x, y);
    }

    #onMouseMove({x, y}) {
        if (!this.#mouseDown) return;
        const {x: x0, y: y0} = this.#points.get("from");
        const x1 = x;
        const y1 = y;
        window.background(255);
        window.noStroke();
        window.fill('red');
        window.ellipse(x0-3,y0-3,6);
        window.fill('green');
        window.ellipse(x1-3,y1-3,6);
        // console.log("mouseMove", x, y);
    }

    #drawLine() {
        window.loadPixels();
        const from = this.#points.get("from");
        const to = this.#points.get("to");

        const dX = (to.x - from.x);
        const dY = (to.y - from.y);

        const a = dY / (dX === 0 ? 0.0000001 : dX);
        const b = from.y - a * from.x;

        const dInitial = 2 * dY - dX;
        const dIncrement = 2 * dY - 2 * dX;
        const dDecrement = 2 * dY;

        const direction = from.x < to.x ? 1 : -1;
        for (let x = from.x, d = dInitial, y = from.y; x !== to.x; x += direction) {
            this.#setPixel(x, y, 0);
            if (d < 0) d += dDecrement;
            else {
                d += dIncrement;
                y++;
            }
        }
        window.updatePixels()
    }

    #setPixel(x,y,r,g,b) {
        if (typeof g === "undefined") g = r;
        if (typeof b === "undefined") b = r;
        const idx=(y*this.#canvas.width+x)*4;
        window.pixels[idx]=r;
        window.pixels[idx+1]=g;
        window.pixels[idx+2]=b;
        window.pixels[idx+3]=255;
    }
}

class Point {
    #x;
    #y;

    /**
     *
     * @param x {number|undefined}
     * @param y {number|undefined}
     */
    constructor(x, y) {
        if (typeof x !== "number") {
            this.#x = -1;
        } else {
            this.#x = x;
        }

        if (typeof y !== "number") {
            this.#y = -1;
        } else {
            this.#y = y;
        }
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    updatePosition(x, y) {
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

function setup() {
    const WIDTH = 512;
    const HEIGHT = 512;
    window.pixelDensity(1);
    const canvas = document.querySelector(`canvas[width='${WIDTH}'][height='${HEIGHT}']`) || createCanvas(WIDTH,HEIGHT).elt;
    if (!canvas) {
        throw new Error("Couldn't find or create canvas.")
    }
    new MP3(canvas);
    background(255);
}