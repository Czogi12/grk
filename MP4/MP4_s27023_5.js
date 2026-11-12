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
        if (a !== -1) this.alpha = a;
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

class ImageHistoryPoint {
    /**
     * @type {Vector2D}
     */
    #vector;
    /**
     * @type {Vector2D | null}
     */
    #last = null

    /**
     * @type {Color}
     */
    #color;

    /**
     * @param {Vector2D} vector
     * @param {Color} color
     * @param {Vector2D | null} last
     */
    constructor(vector, color, last = null) {
        this.#vector = vector;
        this.#last = last;
        this.#color = color;
    }

    /**
     *
     * @param {IdentityMatrix} transformMatrix
     * @returns {ImageHistoryPoint}
     */
    transform(transformMatrix) {
        let last = null;
        if (this.#last) last = this.#last.transform(transformMatrix);
        return new ImageHistoryPoint(this.#vector.transform(transformMatrix), this.#color, last);
    }

    copy() {
        return new ImageHistoryPoint(this.#vector, this.#color, this.#last);
    }

    get vector() {
        return this.#vector;
    }

    get color() {
        return this.#color
    }

    get last() {
        return this.#last;
    }
}

class ImageHistory {
    /**
     * @type {ImageHistoryPoint[]}
     */
    #history;

    /**
     * @param {ImageHistoryPoint[]} history
     */
    constructor(history = []) {
        this.#history = history;
    }

    reset() {
        this.#history.length = 0;
    }

    /**
     * @param {Vector2D} vector
     * @param {Color} color
     * @param {Vector2D | null} last
     */
    addPoint(vector, color, last = null) {
        this.#history.push(new ImageHistoryPoint(vector, color, last));
    }

    /**
     *
     * @param {IdentityMatrix} transformMatrix
     * @returns {ImageHistory}
     */
    transform(transformMatrix) {
        return new ImageHistory(this.#history.map(point => point.transform(transformMatrix)));
    }

    copy() {
        return new ImageHistory(this.#history.map(p => p.copy()));
    }

    get list() {
        return this.#history;
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
     * @type {ImageHistory}
     */
    #history = new ImageHistory();

    #bgColor;

    /**
     *
     * @param {number} width
     * @param {number} height
     * @param {Color | undefined } backgroundColor
     */
    constructor(width, height, backgroundColor = new Color(255, 255, 255)) {
        this.#data = new ImageData(width, height);
        this.#bgColor = backgroundColor;
        this.reset();
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

    get history() {
        return this.#history;
    }

    /**
     * @param {ImageHistory} history
     */
    set history(history) {
        this.#history = history;
    }

    /**
     * @param {Vector2D} vector
     * @param {Color} color
     */
    drawVector(vector, color, saveHistory = true) {
        if (this.#last) {
            this.#drawLine(this.#last, vector, color)
        } else {
            this.#setPixel(vector.x, vector.y, color)
        }
        if (saveHistory) this.#history.addPoint(vector, color, this.#last);
        this.#last = vector;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {Color} color
     */
    #setPixel(x, y, color) {
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
        const {red, green, blue, alpha} = color;
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
            this.#setPixel(x0, y0, color);
            if (x0 === x1 && y0 === y1) break;
            const e2 = 2 * err;
            if (e2 >= dy) {
                err += dy;
                x0 += sx;
            }
            if (e2 <= dx) {
                err += dx;
                y0 += sy;
            }
        }
    }

    redraw() {
        this.reset();
        for (const point of this.#history.list) {
            this.#last = point.last;
            this.drawVector(point.vector, point.color, false)
        }
        this.#last = null;
    }

    reset() {
        this.fill(this.#bgColor)
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

    renderMatrix() {
        const table = document.createElement("table");
        for (let y = 0; y < this.#height; y++) {
            const row = document.createElement("tr");
            for (let x = 0; x < this.#width; x++) {
                const tableData = document.createElement("td");
                tableData.textContent = this.get(x, y).toString();
                row.append(tableData);
            }
            table.appendChild(row);
        }
        return table;
    }

    /**
     *
     * @param {function():void} changed
     * @returns {Element}
     */
    renderArguments(changed) {
        throw new Error("Abstract method is not implemented.");
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
        for (let x = 0, y = 0; x < dimention; x++, y++) {
            this.set(x, y, 1);
        }
    }

    renderArguments(changed) {
        return document.createElement("div")
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


    renderArguments(changed) {
        const xLabel = document.createElement("label");
        xLabel.textContent = "X"
        const xInput = UI.createNumberInput((value) => {
            this.set(this.width - 1, 0, value);
            changed();
        }, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, this.get(this.width - 1, 0));
        xLabel.append(xInput);
        const yLabel = document.createElement("label");
        yLabel.textContent = "Y"
        const yInput = UI.createNumberInput((value) => {
            this.set(this.width - 1, 1, value);
            changed();
        }, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, this.get(this.width - 1, 1));
        yLabel.append(yInput);
        const container = document.createElement("div")
        container.append(xLabel, yLabel);
        return container;
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

    renderArguments(changed) {
        const xLabel = document.createElement("label");
        xLabel.textContent = "X"
        const xInput = UI.createNumberInput((value) => {
            this.set(0, this.width - 1, value);
            changed();
        }, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, this.get(0, 0));
        xLabel.append(xInput);
        const yLabel = document.createElement("label");
        yLabel.textContent = "Y"
        const yInput = UI.createNumberInput((value) => {
            this.set(0, this.width - 1, value);
            changed();
        }, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, this.get(1, 1));
        yLabel.append(yInput);
        const container = document.createElement("div")
        container.append(xLabel, yLabel);
        return container;
    }
}

class RotationMatrix2D extends IdentityMatrix {
    static degToRad(deg) {
        return (deg / 180) * Math.PI;
    }

    /**
     * @param {number} rotation Degrees
     */
    constructor(rotation = 0) {
        super(3)
        const radians = RotationMatrix2D.degToRad(radians);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        this.set(0, 0, cos);
        this.set(1, 0, -sin);
        this.set(0, 1, sin);
        this.set(1, 1, cos);
    }

    renderArguments(changed) {
        const xLabel = document.createElement("label");
        xLabel.textContent = "Stopnie"
        const xInput = UI.createNumberInput((value) => {
            const radians = RotationMatrix2D.degToRad(value);
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);

            this.set(0, 0, cos);
            this.set(1, 0, -sin);
            this.set(0, 1, sin);
            this.set(1, 1, cos);
            changed();
        }, 0, 359, this.get(0, this.width - 1));
        xLabel.append(xInput);

        container.append(xLabel);
        return container;
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

    renderArguments(changed) {
        const xLabel = document.createElement("label");
        xLabel.textContent = "X"
        const xInput = UI.createNumberInput((value) => {
            this.set(1, 0, value);
            changed();
        }, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, this.get(0, this.width - 1));
        xLabel.append(xInput);
        const yLabel = document.createElement("label");
        yLabel.textContent = "Y"
        const yInput = UI.createNumberInput((value) => {
            this.set(0, 1, value);
            changed();
        }, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, this.get(1, this.width - 1));
        yLabel.append(yInput);
        const container = document.createElement("div")
        container.append(xLabel, yLabel);
        return container;
    }
}

class TransformationList {
    /**
     * @type {IdentityMatrix[]}
     */
    #list = [];

    /**
     * @type {IdentityMatrix}
     */
    #transformation;

    #dimention;

    /**
     *
     * @param {number} dimention
     */
    constructor(dimention) {
        this.#dimention = dimention;
        // TODO: revert to Identity
        // this.#list.push(new IdentityMatrix(dimention));
        this.#list.push(new ShiftMatrix2D(100, 0), new ScaleMatrix2D(100, 0));
        this.#transformation = this.#list[0];
    }

    /**
     *
     * @param {IdentityMatrix} transformationMatrix
     */
    addTransformation(transformationMatrix) {
        if (transformationMatrix.width !== this.#dimention || transformationMatrix.height !== this.#dimention) {
            throw new Error("TransformationMatrix has incorrect dimentions");
        }
        this.#list.push(transformationMatrix);
        this.#transformation = this.#transformation.multiply(transformationMatrix);
    }

    /**
     *
     * @param {number} index
     */
    removeTransformation(index) {
        this.#validateTransformationIndex(index);
        this.#list.splice(index, 1);
        this.#recalculateTransformation();
    }

    /**
     * @param {number} indexA
     * @param {number} indexB
     */
    swapTransformations(indexA, indexB) {
        this.#validateTransformationIndex(indexA);
        this.#validateTransformationIndex(indexB);
        const tmp = this.#list[indexA];
        this.#list[indexA] = this.#list[indexB];
        this.#list[indexB] = tmp;
        this.#recalculateTransformation();
    }

    reset() {
        this.#list.length = 1;
        this.#transformation = this.#list[0];
    }

    /**
     * @param {number} index
     */
    #validateTransformationIndex(index) {
        if (this.#list.length <= index || index < 0) throw new Error("Transformation index out of range");
    }

    #recalculateTransformation() {
        this.#transformation = this.#list.reduce((prev, next) => {
            return prev.multiply(next);
        }, this.#list[0]);
    }

    get transformation() {
        return this.#transformation;
    }

    get list() {
        return this.#list;
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
        const {button} = event
        if (button) return;
        Controls.mouseHeld = true;
    }

    /**
     *
     * @param {MouseEvent} event
     */
    #onMouseUp(event) {
        this.#mouseUpListeners.forEach(listener => listener(event));
        const {button} = event
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
        const {key} = event
        if (key === " ") Controls.spaceHeld = true;
    }

    /**
     *
     * @param {KeyboardEvent} event
     */
    #onKeyUp(event) {
        const {key} = event
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

class UI {
    /**
     * @type {TransformationList}
     */
    #transformationList;

    /**
     * @type {(function():void)[]}
     */
    #onListUpdated = [];

    /**
     * @type {Color | null}
     */

    #color = null;

    /**
     * @type {number[]}
     */
    #transformationsArgs = [];

    /**
     * @type {typeof IdentityMatrix | typeof ScaleMatrix2D | typeof ShiftMatrix2D | typeof ShearMatrix2D | typeof RotationMatrix2D}
     */
    #TransformationConstructor = IdentityMatrix

    /**
     * @type {function():void}
     */
    #redraw

    /**
     * @param {TransformationList} transformationList
     * @param {function():void} redraw
     */
    constructor(transformationList, redraw) {
        this.#transformationList = transformationList;
        this.#redraw = redraw;
        this.#initUI()
    }

    /**
     * @param {function():void} listener
     */
    addChangeListener(listener) {
        this.#onListUpdated.push(listener)
    }

    /**
     *
     * @param {function(number):void} onChange
     * @param {number} min
     * @param {number} max
     * @param {number | undefined} def */
    static createNumberInput(onChange, min, max, def = undefined) {
        const input = document.createElement("input");
        input.type = "number";
        input.max = `${max}`;
        input.min = `${min}`;
        if (typeof def !== "undefined") input.value = `${def}`

        input.addEventListener("input", (event) => {
            const target = /** @type {HTMLInputElement} */ (event.target);
            const decimalValue = parseInt(target.value);

            if (decimalValue > max) target.value = input.max;
            if (decimalValue < min) target.value = input.min;

            onChange(decimalValue);
        });
        return input;
    }

    #initUI() {
        const container = document.createElement("div");
        const controlContainer = document.createElement("div");
        const transformationsContainer = document.createElement("div");
        this.#initColorPicket(controlContainer);
        this.#initAlphaInput(controlContainer);
        this.#initTransformationSelector(controlContainer);
        this.#initTransformationTable(transformationsContainer);
        container.appendChild(controlContainer);
        container.appendChild(transformationsContainer);
        document.body.appendChild(container);
    }

    /**
     * @param {Element} container
     */
    #initColorPicket(container) {
        const colorLabel = document.createElement("label");
        colorLabel.textContent = "Kolor";
        const colorPicker = document.createElement("input");
        colorPicker.type = "color";
        colorPicker.addEventListener("change", (/** @type {Event} */ event) => {
            const {value} = /** @type {HTMLInputElement} */ (event.target);
            const decimalValue = parseInt(value.slice(1), 16);
            const blue = decimalValue & 255;
            const green = (decimalValue >> 8) & 255;
            const red = (decimalValue >> 16) & 255;
            this.#color = new Color(red, green, blue, this.#color?.alpha || 255);
        })
        colorLabel.appendChild(colorPicker)
        container.appendChild(colorLabel);
    }

    /**
     * @param {Element} container
     */
    #initAlphaInput(container) {
        const alphaLabel = document.createElement("label");
        alphaLabel.textContent = "Alfa";
        const alphaInput = UI.createNumberInput((value) => {
            const currColor = this.color;
            this.#color = new Color(currColor.red, currColor.green, currColor.blue, value);
        }, 0, 255, this.color.alpha);
        alphaLabel.appendChild(alphaInput);
        container.appendChild(alphaLabel);
    }

    /**
     * @param {Element} container
     */
    #initTransformationSelector(container) {
        const transformationLabel = document.createElement("label");
        transformationLabel.textContent = "Transformacja";
        const transformactionSelect = document.createElement("select");
        transformactionSelect.append(
            ...["Przesunięcie", "Obrót", "Skalowanie", "Pochylenie"].map(name => {
                const opt = document.createElement("option")
                opt.id = name;
                opt.text = name;
                return opt;
            })
        );

        const transformationDataFields = document.createElement("div");
        transformationDataFields.style.display = "flex";
        transformationDataFields.style.flexDirection = "column";
        this.#initTransformationDataFields(transformationDataFields, "Przesunięcie");

        transformactionSelect.addEventListener("change", (event) => {
            const target = /** @type {HTMLInputElement} */ (event.target);
            transformationDataFields.innerHTML = "";
            this.#initTransformationDataFields(transformationDataFields, target.value);
        });
        transformationLabel.appendChild(transformactionSelect);
        container.appendChild(transformationLabel);
        container.appendChild(transformationDataFields);
        this.#initTransformationButton(container);
        // container.appendChild(alphaInput);
    }

    /**
     * @param {Element} container
     * @param {string} transformationName
     */
    #initTransformationDataFields(container, transformationName) {
        this.#transformationsArgs.length = 0;
        switch (transformationName) {
            case "Przesunięcie":
                this.#TransformationConstructor = ShiftMatrix2D;
                this.#initShiftOrScaleOrShearTransformationFIelds(container);
                break;
            case "Obrót":
                this.#TransformationConstructor = RotationMatrix2D;
                this.#initRotationTransformationFields(container);
                break;
            case "Skalowanie":
                this.#TransformationConstructor = ScaleMatrix2D;
                this.#initShiftOrScaleOrShearTransformationFIelds(container);
                break;
            case "Pochylenie":
                this.#TransformationConstructor = ShearMatrix2D;
                this.#initShiftOrScaleOrShearTransformationFIelds(container);
                break;
        }
    }

    /**
     * @param {Element} container
     */
    #initShiftOrScaleOrShearTransformationFIelds(container) {
        this.#transformationsArgs.push(0, 0);
        const xLabel = document.createElement("label");
        xLabel.textContent = "X";
        xLabel.appendChild(UI.createNumberInput((val) => {
            this.#transformationsArgs[0] = val
        }, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0));

        const yLabel = document.createElement("label");
        yLabel.textContent = "Y";
        yLabel.appendChild(UI.createNumberInput((val) => {
            this.#transformationsArgs[1] = val
        }, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0));

        container.append(xLabel, yLabel);
    }

    /**
     * @param {Element} container
     */
    #initRotationTransformationFields(container) {
        this.#transformationsArgs.push(0);
        const degLabel = document.createElement("label");
        degLabel.textContent = "Stopnie";
        degLabel.appendChild(UI.createNumberInput((val) => {
            this.#transformationsArgs[0] = val
        }, 0, 359, 0));
        container.appendChild(degLabel)
    }

    /**
     * @param {Element} container
     */
    #initTransformationButton(container) {
        const addButton = document.createElement("button");
        addButton.textContent = "Dodaj";
        addButton.onclick = () => {
            console.log(this.#TransformationConstructor)
            //@ts-ignore
            this.#transformationList.addTransformation(new this.#TransformationConstructor(...this.#transformationsArgs));
            this.#onListUpdated.forEach(listener => listener());
        }
        container.appendChild(addButton);
    }

    /**
     * @param {Element} container
     */
    #initTransformationTable(container) {
        const table = document.createElement("table");
        table.style.border = "1px solid black";
        const tableRow = document.createElement("tr");
        const createHeader = (name) => {
            const header = document.createElement("th");
            header.style.border = "1px solid black";
            header.textContent = name;
            return header;
        }
        tableRow.append(createHeader("Transformacja"), createHeader("Wartości"), createHeader("Argumenty"), createHeader("Kontrola"));
        table.append(tableRow);

        let index = 0;
        for (const transformation of this.#transformationList.list) {
            const row = document.createElement("tr");
            const name = document.createElement("td");
            name.style.border = "1px solid black";
            name.textContent = transformation.constructor.name;
            row.appendChild(name);

            const values = document.createElement("td");
            values.style.border = "1px solid black";
            values.appendChild(transformation.renderMatrix());
            row.appendChild(values);

            const matrixArguments = document.createElement("td");
            matrixArguments.style.border = "1px solid black";
            matrixArguments.appendChild(transformation.renderArguments(()=>{
                values.innerHTML = "";
                values.append(transformation.renderMatrix());
                this.#redraw();
            }));
            row.appendChild(matrixArguments);
            index++;
            const matrixControl = document.createElement("td");
            matrixControl.style.border = "1px solid black";
            const upButton = document.createElement("button");
            if (index === 0) upButton.disabled = true;
            upButton.textContent = "^";

            const downButon = document.createElement("button");
            if (index === this.#transformationList.list.length - 1) upButton.disabled = true;
            downButon.textContent = "";

            matrixControl.append(upButton, downButon);

            // TODO: finish
            row.appendChild(matrixControl);


            table.append(row);
        }


        container.appendChild(table);
    }

    get color() {
        if (!this.#color) return new Color(0, 0, 0);
        return this.#color;
    }
}

class MP4 {
    /**
     * @type {Canvas}
     */
    #regulatCanvas

    /**
     * @type {Canvas}
     */
    #transformedCanvas

    #images = [
        new CanvasImage(512, 512, new Color(240, 250, 240)),
        new CanvasImage(512, 512, new Color(240, 240, 250))
    ];

    /**
     * @type {TransformationList}
     */
    #transformationList = new TransformationList(3);


    /**
     * @type {UI}
     */
    #ui;

    /**
     * @param {number} width
     * @param {number} height
     */
    constructor(width, height) {
        document.body.style.backgroundColor = "#ccc"

        const getOrCreateCanvas = (/** @type {number} */ nth) => document.querySelectorAll("canvas")[nth] || (() => {
            const canvas = document.createElement("canvas");
            document.body.appendChild(canvas);
            return canvas;
        })();

        this.#regulatCanvas = new Canvas(getOrCreateCanvas(0));
        this.#transformedCanvas = new Canvas(getOrCreateCanvas(1));

        const initCanvas = (/** @type {Canvas} */ canvas) => {
            canvas.width = width;
            canvas.height = height;
            canvas.background(255);
        };

        const redraw = () => {
            this.#images[1].history = this.#images[0].history.copy().transform(this.#transformationList.transformation);
            this.#images[1].redraw();
        }

        initCanvas(this.#regulatCanvas);
        initCanvas(this.#transformedCanvas);
        this.#ui = new UI(this.#transformationList, redraw.bind(this));
        this.#ui.addChangeListener(redraw.bind(this));

        this.#regulatCanvas.addMouseDraggedListener((e) => {
            const current = new Vector2D(e.offsetX, e.offsetY);
            this.#images[0].drawVector(current, this.#ui.color);
            this.#images[1].drawVector(current.transform(this.#transformationList.transformation), this.#ui.color);
        });

        this.#regulatCanvas.addMouseUpListener((e) => {
            this.#images.forEach(image => image.resetLast())
        })

        this.#requestDraw();
    }

    #draw() {
        this.#regulatCanvas.drawImage(this.#images[0]);
        this.#transformedCanvas.drawImage(this.#images[1]);
        this.#requestDraw();
    }

    #requestDraw() {
        requestAnimationFrame(this.#draw.bind(this));
    }
}

(() => {
    new MP4(512, 512);
})();

export {}