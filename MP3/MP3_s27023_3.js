class MP3 {
    #points;
    #mouseDown;

    #canvas;

    #listeners

    constructor(canvas) {
        this.#canvas = canvas;
        this.#points = Object.fromEntries([
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
        console.log("mouseDown", x, y);
    }

    #onMouseUp({x, y}) {
        this.#mouseDown = true;
        console.log("mouseUp", x, y);
    }

    #onMouseMove({x, y}) {
        console.log("mouseMove", x, y);
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
    new MP3(createCanvas(512,512).elt);
    background(255);
}