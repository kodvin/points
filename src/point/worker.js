const reportFoundSquare = message => {
    console.log(message);
};

let sfh = {
    // no need for expensive sqrt because every distance will be squared
    getDistanceSquared(x1, y1, x2, y2) {
        return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
    },

    // return center point between two points
    getCenter(x1, y1, x2, y2) {
        let centerX = (x1 + x2) / 2;
        let centerY = (y1 + y2) / 2;

        return [centerX, centerY];
    },

    isDistanceSquaredEqual(pp1, pp2) {
        let d1 = this.getDsitanceSquared(pp1[0], pp1[1], pp1[2], pp1[3]);
        let d2 = this.getDsitanceSquared(pp2[0], pp2[1], pp2[2], pp2[3]);

        return d1 === d2;
    },

    isCenterEqual(pp1, pp2) {
        let c1 = this.getCenter(pp1[0], pp1[1], pp1[2], pp1[3]);
        let c2 = this.getCenter(pp2[0], pp2[1], pp2[2], pp2[3]);
        return Math.abs(c1[0] - c2[0]) < Number.EPSILON && Math.abs(c1[1] - c2[1]) < Number.EPSILON;
    },

    isSidesEqual(pp1, pp2) {
        // because we check centers before we know that centers match that is why we get intersecting pairs
        // that form a square abcd
        // pp1(a, c), pp2(b,d), pp1 = [x1, y1, x2, y2]
        //AB==BC==CD==DA, we can check squared
        let ab = this.getDistanceSquared(pp1[0], pp1[1], pp2[0], pp2[1]);
        let bc = this.getDistanceSquared(pp2[0], pp2[1], pp1[2], pp1[3]);
        let cd = this.getDistanceSquared(pp1[2], pp1[3], pp2[2], pp2[3]);
        let da = this.getDistanceSquared(pp2[2], pp2[3], pp1[0], pp1[1]);

        return ab === bc && bc === cd && cd === da && ab === da;
    },

    //this will work only for integer x and y
    //first check if centers are equal. remove parallel lines but rectangular shapes can be formed
    //second distance between a pair of points must be equal.
    isSquare(pp1, pp2) {
        //format [x11,y11,x12,y12][x21,y21,x22,y22]
        //after center check we can get rectangles
        if (!this.isCenterEqual(pp1, pp2)) return false;
        //after side check we get squares
        if (!this.isSidesEqual(pp1, pp2)) return false;

        return true;
    },

    getPossiblePairs(points) {
        if (!points) return [];

        // for point
        const X = 0;
        const Y = 1;
        //todo double check if the size is right
        let len = points.length;
        let pointPairs = new Array((len * (len - 1)) / 2);
        pointPairs.fill(new Int32Array(0, 0, 0, 0, 0));
        let count = 0;
        for (let i = 0; i < len; i++) {
            // point pair p1,p2 is same as p2,p1 that is why we start from i, +1 so that we eliminate p1,p1 pair
            for (let j = i + 1; j < len; j++) {
                pointPairs[count] = new Int32Array([
                    points[i][X],
                    points[i][Y],
                    points[j][X],
                    points[j][Y],
                    this.getDistanceSquared(points[i][X], points[i][Y], points[j][X], points[j][Y])
                ]);
                count++;
            }
        }

        return pointPairs;
    },

    //get squares on the go, the problem is that it is cpu intensive that and the browser does not update view
    //this will only unblock backend at every yield, but sorting might take a lot of time, so still blocking
    getSquaresNonBlocking(generator) {
        setTimeout(() => {
            let next = generator.next();
            if (!next.done) {
                reportFoundSquare(next.value);
                this.getSquaresNonBlocking(generator);
            } else {
                reportFoundSquare("Found all squares in the possible point space");
            }
        }, 0);
    }
};

function* findSquaresGenerator(points) {
    if (!points) {
        yield { state: "FINISHED", content: "bad data" };
        return;
    }
    //DS - distance squared
    const X1 = 0,
        Y1 = 1,
        X2 = 2,
        Y2 = 3,
        DS = 4;
    yield { state: "SORTING", content: "Removing dublicates" };
    const filteredPoints = [];
    {
        let pointHashes = {};
        points.forEach(point => {
            const hash = `${point[0]}_${point[1]}`;
            if (!pointHashes[hash]) {
                pointHashes[hash] = true;
                filteredPoints.push(point);
            }
        });
    }
    if (!filteredPoints || filteredPoints.length < 4) {
        yield { state: "FINISHED", content: "Too few points" };
        return;
    }
    yield { state: "GENERATING", content: "Generating point pairs" };
    let pointPairs = sfh.getPossiblePairs(filteredPoints);
    yield { state: "SORTING", content: "Sorting point pairs by distance between them" };
    pointPairs.sort((a, b) => {
        return a[DS] - b[DS];
    });
    let start = 0,
        end = 0,
        len = pointPairs.length - 1;

    yield { state: "ITERATING", content: "Finding squares" };
    for (let i = 0; i < len; i++) {
        //distances between point pairs equality indicates that it can be a square
        if (pointPairs[i][DS] === pointPairs[i + 1][DS]) {
            end = i + 1;
            continue;
        }
        // when current pair(i, i+1 )distances are not equal we check all that were equal before
        for (let i = start; i <= end; i++) {
            for (let j = i + 1; j <= end; j++) {
                // when current pair(i, i+1 )distances are not equal we check all that were equal before
                if (!sfh.isSquare(pointPairs[i], pointPairs[j])) continue;
                yield {
                    state: "SQUAREFOUND",
                    content: [
                        pointPairs[i][X1],
                        pointPairs[i][Y1],
                        pointPairs[i][X2],
                        pointPairs[i][Y2],
                        pointPairs[j][X1],
                        pointPairs[j][Y1],
                        pointPairs[j][X2],
                        pointPairs[j][Y2]
                    ]
                };
            }
        }
        start = end = i + 1;
    }
    // check if final pair can be a square
    if (sfh.isSquare(pointPairs[start], pointPairs[end])) {
        yield {
            state: "SQUAREFOUND",
            content: [
                pointPairs[start][X1],
                pointPairs[end][Y1],
                pointPairs[start][X2],
                pointPairs[end][Y2],
                pointPairs[start][X1],
                pointPairs[end][Y1],
                pointPairs[start][X2],
                pointPairs[end][Y2]
            ]
        };
    }
    console.timeEnd("squaresearch");
    yield { state: "FINISHED", content: "Found all squares in the possiible point space" };
}

const findSquares = points => {
    sfh.getSquaresNonBlocking(findSquaresGenerator(points));
    points;
};

onmessage = function(e) {
    console.log("Message received from main script");
    findSquares(e.data);
};
