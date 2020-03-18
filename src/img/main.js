const canvas = document.getElementById("canvas");
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

const onImgLoad = (dim, wasmByteMemoryArray, img) => {
    // execute drawImage statements here
    const w = 200;
    const h = 100; // canvas.offsetHeight;
    ctx.drawImage(img, 0, 0, w, h);
    const imgd = ctx.getImageData(0, 0, w, h);

    imgd.data.forEach((element, i) => {
        wasmByteMemoryArray[i] = element;
    });
    let speed = -10;
    let alpha = 255;
    const draw = alpha => {
        dim(80000, alpha);
        const cArray = new Uint8ClampedArray(80_000);
        for (let i = 0; i < 80_000; i++) {
            cArray[i] = wasmByteMemoryArray[i];
        }
        ctx.putImageData(new ImageData(cArray, w, h), 0, 0);
    };
    setInterval(() => {
        alpha += speed;
        if (alpha < 0 || alpha > 254) {
            speed *= -1;
        }
        draw(alpha);
    }, 100);
};

const kickOff = async () => {
    const asmModule = await getAsmModule();
    const exports = asmModule.instance.exports;
    const dim = exports.dim;
    const memory = exports.memory;
    const wasmByteMemoryArray = new Int16Array(memory.buffer);
    const img = new Image(); // Create new img element
    img.addEventListener(
        "load",
        () => {
            onImgLoad(dim, wasmByteMemoryArray, img);
        },
        false
    );
    img.src = "assets/img/bar.png"; // Set source path
};
kickOff();
