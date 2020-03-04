
let passPoints = async points => {  
    const getAsmModule = function() {
          importObject = {
              env: {
                  abort: () => console.log("Abort!")
              },
              console: {
                  log: p  => console.log(p)
              },
              custom: {
                  returnSquare: (...args) => postMessage(args)
              }
          };
          return fetch('build/optimized.wasm')
          .then(r => r.arrayBuffer())
          .then(buffer => WebAssembly.instantiate(buffer, importObject));
      };
      
    let asmModule = await getAsmModule();
    var exports = asmModule.instance.exports;
    var findSquare = exports.find;
    const memory = exports.memory;
    const wasmByteMemoryArray = new Int16Array(memory.buffer);

    console.log('Start filtering dublicates');
    const filteredPoints = [];
    {
        let pointHashes = {};
        points.forEach( point => {
            const hash = `${point[0]}_${point[1]}`;
            if (!pointHashes[hash]) {
                pointHashes[hash] = true;
                filteredPoints.push(point);
            } 
        });
        console.log('@@@@@ pointHashes', pointHashes);
    }
    console.log('Finish filtering dublicates', filteredPoints.length);
    filteredPoints.forEach((element, index) => {
        wasmByteMemoryArray[ 2 * index ] = +filteredPoints[index][0];
        wasmByteMemoryArray[ 2 * index + 1] = +filteredPoints[index][1];
    });
    let s = findSquare(filteredPoints.length);
    console.log('number of points done', s, filteredPoints);
}
  
  
onmessage = function(e) {
    console.log('Message received from main script');
    passPoints(e.data)
}