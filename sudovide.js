var AUTOGAME = false;
var DIFFICULTY = 3;

window.onload = function () {

    // Resource loading
    var groupsImg = new Image(); // Create new img element
    groupsImg.addEventListener('load', function () {
        let loaded = true;
    }, false);
    groupsImg.src = 'img/cellbg.png'; // Set source path

    // Initialize the canvas
    var srcCanvas = document.createElement('canvas');
    srcCanvas.width = 1200;
    srcCanvas.height = 900;
    var ctx = srcCanvas.getContext('2d');
    var dstCanvas = document.getElementById('canvas');
    var dstctx = dstCanvas.getContext('2d');
    var screenOffsetX = 0;
    var screenOffsetY = 0;
    var newGameWidth = 0;
    var newGameHeight = 0;
    var dscale = 1920 / 1080;
    var gameScale = 0;

    // Declare game vars

    var grid;
    var fgcolor = getRandomRgb(50, 100);
    var bgcolor = getRandomRgb(200, 250);
    var nextGroup = 1; // The next group to start assigning on clicking empty
    var mDown = false;
    var lastCellX = -1;
    var lastCellY = -1;
    var lastLastX = -1;
    var lastLastY = -1;

    // Add the handlers
    window.addEventListener('resize', resizeGame);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick); // Maybe?
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mouseup', mouseUp);

    // Kick everything off!
    initGrid();
    makeSampleGrid(); // CUT THIS
    resizeGame();
    window.setTimeout(update, 1000 / 60);
    drawScreen();

    //------------ Method definitions below ------------//

    // Handlers
    function mouseDown(e) {
        mDown = true;
        let mX = (e.offsetX - screenOffsetX) / gameScale;
        let mY = (e.offsetY - screenOffsetY) / gameScale;
        lastCellX = Math.floor((mX - 45) / 90);
        lastCellY = Math.floor((mY - 45) / 90);
        lastLastX = -1;
        lastLastY = -1;
    }

    function mouseUp(e) {
        mDown = false;
        let mX = (e.offsetX - screenOffsetX) / gameScale;
        let mY = (e.offsetY - screenOffsetY) / gameScale;
        let newX = Math.floor((mX - 45) / 90);
        let newY = Math.floor((mY - 45) / 90);

        if (lastLastX == -1 && lastLastY == -1) {
            if (newX == lastCellX && newY == lastCellY) {
                if (grid[newX][newY].group != 0) {
                    grid[newX][newY].group = 0;
                }
            }
        }
    }

    function handleClick(e) {}

    function handleMouseMove(e) {
        if (!mDown) return;

        let mX = (e.offsetX - screenOffsetX) / gameScale;
        let mY = (e.offsetY - screenOffsetY) / gameScale;
        let cellX = Math.floor((mX - 45) / 90);
        let cellY = Math.floor((mY - 45) / 90);
        if (cellX < 0 || cellX > 8 || cellY < 0 || cellY > 8) return;
        if (cellX != lastCellX || cellY != lastCellY) {
            if (grid[lastCellX][lastCellY].group == 0) {
                // TODO: Init new groups
                // Drag emptiness into the square?
                grid[cellX][cellY].group = 0;
                lastLastX = lastCellX;
                lastLastY = lastCellY;
                lastCellX = cellX;
                lastCellY = cellY;
            } else
            if (grid[lastCellX][lastCellY].group > 0) {
                if (lastLastX == -1 || lastLastY == -1) {
                    if (grid[cellX][cellY].group != grid[lastCellX][lastCellY].group) {
                        grid[cellX][cellY].group = grid[lastCellX][lastCellY].group;
                        lastLastX = lastCellX;
                        lastLastY = lastCellY;
                        lastCellX = cellX;
                        lastCellY = cellY;
                    } else {
                        grid[lastCellX][lastCellY].group = 0;
                        lastLastX = lastCellX;
                        lastLastY = lastCellY;
                        lastCellX = cellX;
                        lastCellY = cellY;
                    }
                } else {
                    if (grid[cellX][cellY].group != grid[lastCellX][lastCellY].group) {
                        grid[cellX][cellY].group = grid[lastCellX][lastCellY].group;
                        lastLastX = lastCellX;
                        lastLastY = lastCellY;
                        lastCellX = cellX;
                        lastCellY = cellY;
                    }
                }
            }
        }
    }

    function initGrid() {
        grid = [];
        for (let x = 0; x < 10; x++) {
            grid[x] = [];
            for (let y = 0; y < 10; y++) {
                grid[x][y] = {
                    val: 0,
                    group: 0,
                };
            }
        }
    }

    function update() {
        window.setTimeout(update, 1000 / 60);
    }

    function drawHud() {
        ctx.font = "60px Arial";
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.fillStyle = "#000000";
        ctx.fillText("Sudovide", 1051, 51);
        ctx.fillStyle = fgcolor;
        ctx.fillText("Sudovide", 1049, 49);

        ctx.font = "30px Arial";

        // ctx.fillStyle = "#000000";
        // ctx.fillText("Score:", 1051, 151);
        // ctx.fillStyle = fgcolor;
        // ctx.fillText("Score:", 1049, 149);

        // ctx.fillStyle = "#000000";
        // ctx.fillText(dscore, 1051, 201);
        // ctx.fillStyle = fgcolor;
        // ctx.fillText(dscore, 1049, 199);
    }

    // Graphics and Drawing

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

    function getRandomRgb(lo, hi) {
        var r = (lo + Math.round((hi - lo) * Math.random()));
        var g = (lo + Math.round((hi - lo) * Math.random()));
        var b = (lo + Math.round((hi - lo) * Math.random()));
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }

    function drawScreen() {
        // Clear to bg
        ctx.fillStyle = bgcolor;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(0, 0, 1200, 900);
        ctx.globalAlpha = 1;

        drawGroups();
        drawGrid();
        drawHud();

        dstctx.fillStyle = bgcolor;
        dstctx.fillRect(0, 0, dstCanvas.width, dstCanvas.height);
        dstctx.drawImage(srcCanvas, 0, 0, 1200, 900, screenOffsetX, screenOffsetY, newGameWidth, newGameHeight);
        window.requestAnimationFrame(drawScreen);
    }

    function drawGrid() {
        ctx.lineWidth = 3;
        ctx.strokeStyle = fgcolor;

        // Highlights?
        // if (drawHighlights && canMove) {
        //     ctx.fillStyle = "rgb(255, 255, 200, 0.25)";
        //     for (let i = 0; i < highlightList.length; i++) {
        //         ctx.fillRect(90 * highlightList[i][0], 90 * highlightList[i][1], 90, 90);
        //     }
        // }

        // Grid & Numbers
        ctx.translate(45, 45);
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {

                ctx.beginPath();
                ctx.strokeStyle = fgcolor;
                ctx.rect(90 * x, 90 * y, 90, 90);
                ctx.stroke();

                if (grid[x][y].val > 0) {
                    ctx.font = "60px Arial";
                    ctx.textBaseline = "middle";
                    ctx.textAlign = "center";
                    ctx.fillStyle = "#000000";
                    ctx.fillText(grid[x][y].val, (90 * x) + 46, (90 * y) + 51);
                    ctx.fillStyle = fgcolor;
                    ctx.fillText(grid[x][y].val, (90 * x) + 44, (90 * y) + 49);
                }
            }
        }
        ctx.setTransform();
    }

    // Up = 1, Rt = 2, Dn = 4, Lt = 8
    function drawGroups() {
        ctx.translate(45, 45);

        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                if (grid[x][y].group > 0) { // We're in a group!
                    let which = 0; // No walls
                    if (y == 0 || grid[x][y - 1].group != grid[x][y].group) {
                        which += 1; // Up
                    }
                    if (x == 8 || grid[x + 1][y].group != grid[x][y].group) {
                        which += 2; // Rt
                    }
                    if (y == 8 || grid[x][y + 1].group != grid[x][y].group) {
                        which += 4; // Dn
                    }
                    if (x == 0 || grid[x - 1][y].group != grid[x][y].group) {
                        which += 8; // Lt
                    }
                    ctx.drawImage(groupsImg, 90 * which, 90 * grid[x][y].group, 90, 90, 90 * x, 90 * y, 90, 90);

                    // Check for corner addons!
                    // Top Left Corners:
                    if (x > 0 && y > 0) {
                        if (grid[x - 1][y].group == grid[x][y].group &&
                            grid[x][y - 1].group == grid[x][y].group &&
                            grid[x - 1][y - 1].group != grid[x][y].group) {
                            ctx.drawImage(groupsImg, 1440, 90 * grid[x][y].group, 45, 45, 90 * x, 90 * y, 45, 45);
                        }
                    }

                    // Bottom Left Corners:
                    if (x > 0 && y < 9) {
                        if (grid[x - 1][y].group == grid[x][y].group &&
                            grid[x][y + 1].group == grid[x][y].group &&
                            grid[x - 1][y + 1].group != grid[x][y].group) {
                            ctx.drawImage(groupsImg, 1440, (90 * grid[x][y].group) + 45, 45, 45, 90 * x, (90 * y) + 45, 45, 45);
                        }
                    }

                    // Top Right Corners:
                    if (x < 9 && y > 0) {
                        if (grid[x + 1][y].group == grid[x][y].group &&
                            grid[x][y - 1].group == grid[x][y].group &&
                            grid[x + 1][y - 1].group != grid[x][y].group) {
                            ctx.drawImage(groupsImg, 1440 + 45, 90 * grid[x][y].group, 45, 45, (90 * x) + 45, 90 * y, 45, 45);
                        }
                    }

                    // Bottom Right Corners:
                    if (x < 9 && y < 9) {
                        if (grid[x + 1][y].group == grid[x][y].group &&
                            grid[x][y + 1].group == grid[x][y].group &&
                            grid[x + 1][y + 1].group != grid[x][y].group) {
                            ctx.drawImage(groupsImg, 1440 + 45, (90 * grid[x][y].group) + 45, 45, 45, (90 * x) + 45, (90 * y) + 45, 45, 45);
                        }
                    }
                }
            }
        }

        ctx.setTransform();
    }

    function makeSampleGrid() {
        let puzNum = Math.floor(Math.random() * 10);
        let puz = basePuzzles[puzNum];

        // Make an empty grid
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                grid[x][y] = {
                    val: 0,
                    group: 0
                };
            }
        }

        // Populate the values
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                grid[y][x].val = parseInt(puz.charAt(0));
                puz = puz.substr(1);
            }
        }

        // Populate the groups
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                grid[y][x].group = parseInt(puz.charAt(0));
                puz = puz.substr(1);
            }
        }

        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                // Difficulty settings!
                switch (DIFFICULTY) {
                    case 0: // Easiest: Just connect them
                        if (grid[x][y].val % 3 == grid[x][y].group % 3) {
                            grid[x][y].group = 0;
                        }
                        break;
                    case 1: // Easy: Connect patchier groups
                        if (grid[x][y].val % 2 != grid[x][y].group % 2) {
                            grid[x][y].group = 0;
                        }
                        break;
                    case 2: // Medium: Connect with only 3
                        if (grid[x][y].val % 3 != grid[x][y].group % 3) {
                            grid[x][y].group = 0;
                        }
                        break;
                    case 3: // Hard: Each group has a unique number
                        if (grid[x][y].val != grid[x][y].group) {
                            grid[x][y].group = 0;
                        }
                        break;
                    case 4: // Mean: No groups.
                        grid[x][y].group = 0;
                        break;
                }
            }
        }
    }
};

//------------ Sample Data ------------//
var baseGrid = [
    [7, 5, 4, 8, 1, 9, 6, 2, 3],
    [6, 3, 2, 1, 4, 8, 7, 5, 9],
    [8, 7, 1, 3, 2, 6, 4, 9, 5],
    [4, 8, 5, 6, 9, 7, 3, 1, 2],
    [1, 6, 9, 2, 5, 4, 8, 3, 7],
    [2, 4, 3, 9, 7, 1, 5, 6, 8],
    [3, 9, 7, 5, 6, 2, 1, 8, 4],
    [9, 1, 8, 4, 3, 5, 2, 7, 6],
    [5, 2, 6, 7, 8, 3, 9, 4, 1]
];

var baseGroups = [
    [1, 1, 2, 3, 4, 4, 4, 4, 4],
    [1, 2, 2, 3, 4, 4, 4, 4, 5],
    [1, 2, 2, 3, 6, 6, 6, 6, 5],
    [1, 2, 2, 3, 3, 6, 6, 5, 5],
    [1, 2, 2, 3, 3, 3, 6, 5, 5],
    [1, 7, 7, 8, 3, 8, 6, 5, 5],
    [1, 7, 8, 8, 8, 8, 6, 9, 5],
    [1, 7, 8, 8, 8, 9, 9, 9, 9],
    [7, 7, 7, 7, 7, 9, 9, 9, 9]
];

var basePuzzles = [
    "754819623632148759871326495485697312169254837243971568397562184918435276526783941882766666822766665822799995822779955822777955833474955834444915834441111333331111",
    "853217649761839452342976581618495327279541863926754138184362975597683214435128796666777222666777722866657722888855551888855551999933334999933334911134444111111444",
    "591487623928345716256973184783261459834156297467819532179632845315724968642598371416677288416677288411667288411667288441167118441557229435557299335555999333333999",
    "789314625195823764432679581256741839513486972948162357627935148371258496864597213331111119334444199333444119533544999555558899522258888222227888666617777666667777",
    "289475136497138265361859472574213689613782594725964318142697853856321947938546721775555555777785511788888221788822221766662221996666441996333441999333441993334441",
    "219835647864279153532416789795348216476921538153692874981763425327584961648157392666999922669999922663333322633343222644444488774111488711151188777155888777555555",
    "562943871439871265127536948843269157378692514954128736615784329281457693796315482885559999888555993888555993844411193644441133646471133666771132667772232677722222",
    "532694178978312654614785932346871295251439867497123586783956421129568743865247319777722888777222288577922388559923384555999384155993344151693344111666344111666664",
    "794236851325147968918652347843761592652489713571398426467513289139825674286974135144433399114433399114433999114473699177776666177776666888822222888852222855555555",
    "741265398924638571578149236635982714392856147817493625156327489483571962269714853227776611227676111277666111297756681299955588229558888999555388933333344334444444"
];