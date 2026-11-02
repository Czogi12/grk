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

        const direction = from.x < to.x ? 1 : -1;

        for (let x = from.x; Math.abs(x - to.x) !== 0; x += direction) {
            const y = ~~(a*x + b);
            this.#setPixel(x, y, 0);

            const nextX = x + direction;
            const nextY = ~~(a*nextX + b);
            if (Math.abs(y - nextY) < 1) continue;
            const yDirection = y < nextY ? 1 : -1;
            for (let fillY = y; Math.abs(fillY - nextY) !== 0; fillY += yDirection) {
                this.#setPixel(x, fillY, 0);
            }
        }
        window.updatePixels()
    }

    #setPixel(x,y,c) {
        const idx=(y*this.#canvas.width+x)*4;
        window.pixels[idx]=c;
        window.pixels[idx+1]=c;
        window.pixels[idx+2]=c;
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
    const canvas = document.querySelector(`canvas[width='${WIDTH}'][height='${HEIGHT}']`) || createCanvas(512,512).elt;
    if (!canvas) {
        throw new Error("Couldn't find or create canvas.")
    }
    new MP3(canvas);
    background(255);
}