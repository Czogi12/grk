/**
 * @typedef {'from' | 'to' | 'last'} PointName
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

    #stack

    constructor(canvas) {
        document.querySelector("body").oncontextmenu = (e) => {e.preventDefault();}
        this.#canvas = canvas;
        this.#points = new Map([
            ["from", new Point()],
            ["to", new Point()],
            ["last", new Point()]
        ])
        this.#listeners = new Map();
        this.#stack = new Array();
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

    #onMouseDown({x, y, button}) {
        if (!this.#mouseDown) this.#mouseDown = button === 0;
        this.#points.get("from").updatePosition(x, y)
        console.log("mouseDown", x, y);
    }

    #onMouseUp({x, y, button}) {
        this.#points.get("last").updatePosition(-1, -1);
        switch (button) {
            case 0:
                if (!this.#mouseDown) return;
                this.#mouseDown = false;
                this.#points.get("to").updatePosition(x, y)
                // this.#drawLine();
                break;
            case 2:
                window.loadPixels();
                this.#floodFill(x, y);
                window.updatePixels();
                break;
        }
    }

    #onMouseMove({x, y}) {
        if (!this.#mouseDown) return;
        // const {x: x0, y: y0} = this.#points.get("from");
        // const x1 = x;
        // const y1 = y;
        // window.background(255);
        // window.noStroke();
        // window.fill('red');
        // window.ellipse(x0-3,y0-3,6);
        // window.fill('green');
        // window.ellipse(x1-3,y1-3,6);
        const last = this.#points.get("last");
        if (last.x > 0) window.line(last.x, last.y, x, y);
        last.updatePosition(x, y);
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

    #floodFill(x, y) {
        this.#stack.length = 0;
        this.#stack.push(new Point(x, y));
        const WIDTH = this.#canvas.width;
        const HEIGHT = this.#canvas.height;

        const oob = (point) => point.x < 0 || point.x > WIDTH || point.y < 0 || point.y > HEIGHT;

        while (this.#stack.length) {
            const curr = this.#stack.pop();
            if (oob(curr)) continue;

            const col = this.#getPixel(curr.x, curr.y);
            if (col !== 255) continue;
            this.#setPixel(curr.x, curr.y, 127);
            for (const [shiftX, shiftY] of [[0,1], [0, -1], [1, 0], [-1, 0]]) {
                this.#stack.push(new Point(curr.x + shiftX, curr.y + shiftY));
            }
        }
    }

    #getPixel(x, y) {
        return window.pixels[(y*this.#canvas.width+x)*4];
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