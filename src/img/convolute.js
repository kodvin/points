const canvas = document.getElementById("canvas2");
const ctx = canvas.getContext("2d");

const getAsmModule = function() {
    const importObject = {
        env: {
            abort: () => console.log("Abort!")
        },
        console: {
            log: p => console.log(p)
        },
        custom: {
            log: (...args) => console.log(args)
        }
    };
    return fetch("build/optimized.wasm")
        .then(r => r.arrayBuffer())
        .then(buffer => WebAssembly.instantiate(buffer, importObject));
};

const onImgLoad = (exports, wasmByteMemoryArray, img) => {
    // execute drawImage statements here
    const w = canvas.offsetHeight;
    const h = canvas.offsetHeight; // canvas.offsetHeight;
    ctx.drawImage(img, 0, 0, w, h);
    const imgd = ctx.getImageData(0, 0, w, h);
    console.log(imgd);
    const { width, height } = imgd;
    imgd.data.forEach((element, i) => {
        wasmByteMemoryArray[i] = element;
    });
    const draw = () => {
        // exports.greyscale(width, height);
        exports.boxBlur(width, height);
        const cArray = new Uint8ClampedArray(width * height * 4);
        for (let i = 0; i < width * height * 4; i++) {
            cArray[i] = wasmByteMemoryArray[i];
        }
        ctx.putImageData(new ImageData(cArray, width, height), 0, 0);
    };
    draw();
};

const kickOff = async () => {
    const asmModule = await getAsmModule();
    const exports = asmModule.instance.exports;
    const memory = exports.memory;
    const wasmByteMemoryArray = new Int16Array(memory.buffer);
    const img = new Image(); // Create new img element
    img.addEventListener(
        "load",
        () => {
            onImgLoad(exports, wasmByteMemoryArray, img);
        },
        false
    );
    img.src = "assets/img/green.jpg"; // Set source path
};
kickOff();
