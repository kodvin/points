const openFile = event => {
    const input = event.target;
    const reader = new FileReader();
    const output = document.getElementById("output");
    reader.onload = () => {
        const points = reader.result.split("\n").map(point => point.trim().split(" "));
        const myWorker = new Worker("/src/point/worker.js");
        myWorker.onmessage = function(e) {
            const {
                data: { state, content }
            } = e;
            output.innerHTML += `
            <div class="container">
                <div class="left">
                    ${state}
                </div>
                <div class="right">
                    ${content}
                </div>
            </div>
            `;
        };
        myWorker.postMessage(points);
    };
    reader.readAsText(input.files[0]);
};

const input = document.getElementById("file-input");
input.onchange = openFile;
