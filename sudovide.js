var AUTOGAME = false;

window.onload = function () {

    // Initialize the canvas
    var srcCanvas = document.createElement('canvas');
    srcCanvas.width = 1200;
    srcCanvas.height = 900;

    var ctx = srcCanvas.getContext('2d');

    var dstCanvas = document.getElementById('canvas');
    var dstctx = dstCanvas.getContext('2d');

    var screenOffsetX = 0;
    var screenOffsetY = 0;
    var gameScale = 0;
    var newGameWidth = 0;
    var newGameHeight = 0;
    var dscale = 1920 / 1080;

    var highlightList = [];
    var drawHighlights = false;

    var canMove = true;

    var colors = [];

    var score = 0;
    var dscore = 0;

    window.addEventListener('resize', resizeGame);
    if (!AUTOGAME) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', handleClick);
    }

    function handleClick(e) {
        if (!canMove) return;

        let mX = (e.offsetX - screenOffsetX) / gameScale;
        let mY = (e.offsetY - screenOffsetY) / gameScale;
        let cellX = Math.floor(mX / 90);
        let cellY = Math.floor(mY / 90);

        setHighlights(cellX, cellY);
        clickCell(cellX, cellY);
    }

    function clickCell(cellX, cellY) {
        let newVal = highlightList.length * curGrid[cellX][cellY].val;
        let newty = curGrid[cellX][cellY].ty;
        for (let i = 0; i < highlightList.length; i++) {
            let ccx = highlightList[i][0];
            let ccy = highlightList[i][1];

            curGrid[ccx][ccy].val = 0;
            curGrid[ccx][ccy].cy = -90 * (10 - ccy);
        }
        curGrid[cellX][cellY].val = newVal;
        curGrid[cellX][cellY].cy = newty;
        canMove = false;
        score += newVal;
        drawHighlights = false;
    }

    function setHighlights(cellX, cellY) {
        clearCheckedList();
        highlightList = [];
        drawHighlights = addHighlightCells(cellX, cellY);
    }

    function handleMouseMove(e) {
        if (!canMove) return;
        let mX = (e.offsetX - screenOffsetX) / gameScale;
        let mY = (e.offsetY - screenOffsetY) / gameScale;
        let cellX = Math.floor(mX / 90);
        let cellY = Math.floor(mY / 90);

        setHighlights(cellX, cellY);
    }

    function clearCheckedList() {
        checkedList = [];
        for (let x = 0; x < 10; x++) {
            checkedList[x] = [];
            for (let y = 0; y < 10; y++) {
                checkedList[x][y] = 0;
            }
        }
    }

    function addHighlightCells(x, y) {
        if (x < 0) return false;
        if (x > 9) return false;
        if (y < 0) return false;
        if (y > 9) return false;

        if (checkedList[x][y] == 1) return false;

        checkedList[x][y] = 1;
        let addedCell = false;
        highlightList.push([x, y]);

        if (x > 0 && curGrid[x - 1][y].val == curGrid[x][y].val) {
            addedCell = true;
            addHighlightCells(x - 1, y);
        }

        if (x < 9 && curGrid[x + 1][y].val == curGrid[x][y].val) {
            addedCell = true;
            addHighlightCells(x + 1, y);
        }

        if (y > 0 && curGrid[x][y - 1].val == curGrid[x][y].val) {
            addedCell = true;
            addHighlightCells(x, y - 1);
        }

        if (y < 9 && curGrid[x][y + 1].val == curGrid[x][y].val) {
            addedCell = true;
            addHighlightCells(x, y + 1);
        }

        return addedCell;
    }

    function resizeGame() {
        dstCanvas.width = window.innerWidth;
        dstCanvas.height = window.innerHeight;

        if (dstCanvas.width / dstCanvas.height > dscale) {
            newGameHeight = dstCanvas.height;
            newGameWidth = newGameHeight / 3 * 4;
            gameScale = newGameHeight / 900;
        } else {
            newGameWidth = dstCanvas.width;
            newGameHeight = newGameWidth / 4 * 3;
            gameScale = newGameWidth / 1200;
        }

        screenOffsetX = Math.abs((dstCanvas.width - newGameWidth)) / 2;
        screenOffsetY = Math.abs((dstCanvas.height - newGameHeight)) / 2;

    }

    var curGrid = [ // 10x10
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    var checkedList = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    var bgcolor = getRandomRgb(0, 64);
    var fgcolor = getRandomRgb(150, 250);
    initGrid();
    resizeGame();
    window.setTimeout(update, 1000 / 60);
    drawScreen();

    function initGrid() {
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                curGrid[x][y] = {
                    val: Math.ceil(Math.random() * 5),
                    cx: 90 * x,
                    cy: 90 * y,
                    tx: 90 * x,
                    ty: 90 * y,
                    vx: 0,
                    vy: 0
                };
                //curGrid[x][y] = Math.ceil(Math.random() * 3);
            }
        }
    }

    function update() {
        if (dscore < score) {
            dscore += Math.ceil(Math.random() * Math.random() * (score - dscore));
            if (dscore > score) {
                dscore = score;
            }
        }

        if (!canMove) {
            canMove = settleGrid();
        } else if (AUTOGAME && hasMoves()) {
            for (let y = 0; y < 10; y++) {
                for (let x = 0; x < 10; x++) {
                    setHighlights(x, y);
                    if (drawHighlights) {
                        clickCell(x, y);
                        window.setTimeout(update, 1000 / 60);
                        return;
                    }
                }
            }
        }
        window.setTimeout(update, 1000 / 60);
    }

    function hasMoves() {
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 9; y++) {
                if (curGrid[x][y].val == curGrid[x][y + 1].val) return true;
            }
        }
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 9; x++) {
                if (curGrid[x][y].val == curGrid[x + 1][y].val) return true;
            }
        }
        return false;
    }

    function settleGrid() {
        let safeToMove = true;
        for (let x = 0; x < 10; x++) {

            let repeatSettle = true;
            while (repeatSettle) {
                repeatSettle = false;
                for (let y = 9; y >= 1; y--) {
                    if (curGrid[x][y].val == 0) {
                        // Make this the one above it, if it's not a zero
                        if (curGrid[x][y - 1].val != 0) {
                            curGrid[x][y] = JSON.parse(JSON.stringify(curGrid[x][y - 1]));
                            curGrid[x][y].ty = 90 * y;
                            curGrid[x][y - 1].val = 0;
                            repeatSettle = true;
                        }
                        safeToMove = false;
                    }
                }
            }

            for (let y = 0; y < 10; y++) {
                if (curGrid[x][y].val == 0) {
                    // Pick a random number from the grid
                    let sx = Math.floor(Math.random() * 10);
                    let sy = Math.floor(Math.random() * 10);
                    curGrid[x][y].val = Math.max(1, curGrid[sx][sy].val);
                    curGrid[x][y].cy = -90 * ((9 - y));
                }
            }
        }

        // Okay, those are good and reset-ish. Next we update the actual positions.
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                if (curGrid[x][y].cy < curGrid[x][y].ty) {
                    safeToMove = false;
                    if (curGrid[x][y].vy == 0) {
                        curGrid[x][y].vy = 1;
                    } else {
                        curGrid[x][y].vy *= 1.1;
                    }
                    curGrid[x][y].cy += curGrid[x][y].vy;
                    if (curGrid[x][y].cy >= curGrid[x][y].ty) {
                        curGrid[x][y].cy = curGrid[x][y].ty;
                        curGrid[x][y].vy = 0;
                    }
                }
            }
        }
        return safeToMove;
    }

    function drawScreen() {
        // Clear dark
        ctx.fillStyle = bgcolor;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(0, 0, 1920, 1080);
        ctx.globalAlpha = 1;

        drawGrid();

        drawHud();

        dstctx.fillStyle = bgcolor;
        dstctx.fillRect(0, 0, dstCanvas.width, dstCanvas.height);
        dstctx.drawImage(srcCanvas, 0, 0, 1200, 900, screenOffsetX, screenOffsetY, newGameWidth, newGameHeight);
        window.requestAnimationFrame(drawScreen);
    }

    function drawHud() {
        ctx.font = "60px Comic Sans MS";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "#000000";
        ctx.fillText("SumGame", 1051, 51);
        ctx.fillStyle = fgcolor;
        ctx.fillText("SumGame", 1049, 49);

        ctx.font = "30px Comic Sans MS";

        ctx.fillStyle = "#000000";
        ctx.fillText("Score:", 1051, 151);
        ctx.fillStyle = fgcolor;
        ctx.fillText("Score:", 1049, 149);

        ctx.fillStyle = "#000000";
        ctx.fillText(dscore, 1051, 201);
        ctx.fillStyle = fgcolor;
        ctx.fillText(dscore, 1049, 199);

    }

    function drawGrid() {
        ctx.lineWidth = 3;
        ctx.strokeStyle = fgcolor;

        // Highlights?
        if (drawHighlights && canMove) {
            ctx.fillStyle = "rgb(255, 255, 200, 0.25)";
            for (let i = 0; i < highlightList.length; i++) {
                ctx.fillRect(90 * highlightList[i][0], 90 * highlightList[i][1], 90, 90);
            }
        }

        // Grid & Numbers
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {

                ctx.beginPath();
                ctx.strokeStyle = colors[curGrid[x][y].val];
                ctx.rect(curGrid[x][y].cx + 2, curGrid[x][y].cy + 2, 86, 86);
                ctx.stroke();

                if (curGrid[x][y].val > 0) {
                    if (colors[curGrid[x][y].val] == undefined) {
                        colors[curGrid[x][y].val] = getRandomRgb(150, 250);
                    }

                    ctx.font = "36 Comic Sans MS";
                    ctx.textBaseline = "middle";
                    ctx.textAlign = "center";
                    ctx.fillStyle = "#000000";
                    ctx.fillText(curGrid[x][y].val, curGrid[x][y].cx + 46, curGrid[x][y].cy + 51);
                    ctx.fillStyle = colors[curGrid[x][y].val];
                    ctx.fillText(curGrid[x][y].val, curGrid[x][y].cx + 45, curGrid[x][y].cy + 50);
                }
            }
        }
    }

    function getRandomRgb(lo, hi) {
        var r = (lo + Math.round((hi - lo) * Math.random()));
        var g = (lo + Math.round((hi - lo) * Math.random()));
        var b = (lo + Math.round((hi - lo) * Math.random()));
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
};