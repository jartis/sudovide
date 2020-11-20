//#region Meta
const VERSION = 1;
const WHITE = "#FFFFFF";
const BLACK = "#000000";
//#endregion

//#region Game Vars
var grid = [];
var winGrid = [];
var locks = [];
var fgcolor;
var bgcolor;
var nextGroup = 1; // The next group to start assigning on clicking empty
var mDown = false;
var lastCellX = -1;
var lastCellY = -1;
var lastLastX = -1;
var lastLastY = -1;
var groupHist = [];
var gameInProgress = false;
var youWon = false;
var difficulty = 0;
var showComplete = true;

var SHOWERROR = true;
//#endregion

//#region UI Vars
var resetButton = {
    show: false,
    down: false,
    over: false,
    x: 895,
    y: 765,
    contains: function (mx, my) {
        return (mx > this.x && mx < this.x + 270 && my > this.y && my < this.y + 90);
    },
    label: "Reset Puzzle",
    uiColor: 90,
};

var newGameButton = {
    show: true,
    down: false,
    over: false,
    x: 895,
    y: 135,
    contains: function (mx, my) {
        return (mx > this.x && mx < this.x + 270 && my > this.y && my < this.y + 90);
    },
    label: "New Game",
    uiColor: 90,
};

var difficultyButton = {
    show: true,
    down: false,
    over: false,
    x: 895,
    y: 225,
    contains: function (mx, my) {
        return (mx > this.x && mx < this.x + 270 && my > this.y && my < this.y + 90);
    },
    label: "Diff: Easy",
    uiColor: 90,
};

//#endregion


//#region Gfx Vars
var srcCanvas;
var ctx;
var dstCanvas;
var dstctx;
var screenOffsetX = 0;
var screenOffsetY = 0;
var newGameWidth = 0;
var newGameHeight = 0;
var dscale = 1920 / 1080;
var gameScale = 0;
var groupsImg;
//#endregion

//#region Base Puzzles
var basePuzzles = [
    "754819623632148759871326495485697312169254837243971568397562184918435276526783941882766666822766665822799995822779955822777955833474955834444915834441111333331111",
    "853217649761839452342976581618495327279541863926754138184362975597683214435128796666777222666777722866657722888855552888855552999933334999933334911134444111111444",
    "591487623928345716256973184783261459834156297467819532179632845315724968642598371416677288416677288411667288411667288441167228441557229435557299335555999333333999",
    "789314625195823764432679581256741839513486972948162357627935148371258496864597213331111119334444199333444119533544999555558899522258888222227888666627777666667777",
    "289475136497138265361859472574213689613782594725964318142697853856321947938546721775555555777785511788888221788822221766662221996666441996333441999333441993334441",
    "219835647864279153532416789795348216476921538153692874981763425327584961648157392666999922669999922663333322633343222644444488774111488711151188777155888777555555",
    "562943871439871265127536948843269157378692514954128736615784329281457693796315482885559999888555993888555993844411193644441133646471133666771132667772232677722222",
    "532694178978312654614785932346871295251439867497123586783956421129568743865247319777722888777222288577922388559923384555999384155993344151693344111666344111666664",
    "794236851325147968918652347843761592652489713571398426467513289139825674286974135144433399114433399114433999114473699177776666177776666888822222888852222855555555",
    "741265398924638571578149236635982714392856147817493625156327489483571962269714853227776611227676111277666111297756681299955588229558888999555388933333344334444444",
    "634852971892761453741289365157396824269543187583417692318975246425638719976124538114444777111454777111554479212554879222358879223355889233665889236666899333666899",
    "912873645543681972691745328354296187286534791735918264869127453178462539427359816111122234111122334555123334555223334556299884566999844776669884766699984777777888",
    "159683274342768915527819436281956743476392158935421687768134529894275361613547892111113333114443333211444443255547777255577777265558888266688888266669999222699999",
    "283749651498372165156987324712564938534126897961835742675491283849213576327658419111188888118888777111999977299999677222226677233366665233446655233444555334444555",
    "194725683567839214738214956329581467816397542485962731672453198941678325253146879111177766117776666211277766212288856222885555239988855339989455339999444333344444",
    "591374826952483761287651943374862159613598472468127395745916238129735684836249517177996665177996665117799655117799665117898855122888845322828445322223444333333444",
    "643729518259186743781654239427935861136598427874261395592317684968473152315842976188776666188776666188777655188775555118999555122994444122994444122993334222333333",
    "138574692214859367856193274965732148479261853327486519541327986682945731793618425111777666221887996221887996221887996221887966211877965333344955333444555334444555",
    "319786452934568271145892763678243519297614385786351924562139847421975638853427196111122222881111322888991332888999332879993334777795344767755554766665544666655444",
    "298453176817624953759386241341279685476531892963148527582917364124865739635792418177779995177778995111788995111888955221888965222266665222366665333344445333344444",
];
//#endregion

//#region Drawing
function drawScreen() {
    ctx.fillStyle = bgcolor;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(0, 0, 1200, 900);
    ctx.globalAlpha = 1;

    //drawStatus();
    drawGroups();
    drawGrid();
    drawHud();

    dstctx.fillStyle = bgcolor;
    dstctx.fillRect(0, 0, dstCanvas.width, dstCanvas.height);
    dstctx.drawImage(srcCanvas, 0, 0, 1200, 900, screenOffsetX, screenOffsetY, newGameWidth, newGameHeight);
    window.requestAnimationFrame(drawScreen);
}

// Disabled until fixed
function drawStatus() {
    let grps = [];
    let highlightGrid = emptyBoolGrid();
    for (let grp = 0; grp < 9; grp++) {
        grps[grp] = false;
        let allFull = true;
        for (let dig = 0; dig < 9; dig++) {
            if (!winGrid[grp][dig]) {
                allFull = false;
            }
        }
        if (allFull && groupHist[grp + 1] == 9) {
            grps[grp] = true;
        }
    }

    ctx.translate(45, 45);
    ctx.font = "60px Sans";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            // if (SHOWCOMPLETE && grps[grid[x][y].group - 1]) {
            //     ctx.font = "60px Modak";
            //     ctx.globalAlpha = 0.5;
            //     ctx.fillText("✅", (90 * x) + 45, (90 * y) + 50);
            //     ctx.globalAlpha = 1;
            // }
            // if (SHOWERROR && grid[x][y].group > 0) {
            //     ctx.font = "70px Modak";
            //     ctx.globalAlpha = 0.25;
            //     ctx.fillText("⛔", (90 * x) + 45, (90 * y) + 50);
            //     ctx.globalAlpha = 1;
            // }            }
        }
    }
    ctx.setTransform();
}

// Up = 1, Rt = 2, Dn = 4, Lt = 8
function drawGroups() {
    ctx.translate(45, 45);

    checkForWin();
    let grps = [];
    let highlightGrid = emptyBoolGrid();
    for (let grp = 0; grp < 9; grp++) {
        grps[grp] = false;
        let allFull = true;
        for (let dig = 0; dig < 9; dig++) {
            if (!winGrid[grp][dig]) {
                allFull = false;
            }
        }
        if (allFull && groupHist[grp + 1] == 9) {
            grps[grp] = true;
        }
    }

    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            if (grid[x][y].group > 0) { // We're in a group!
                let which = 0; // No walls
                let fullOffset = grps[grid[x][y].group - 1] ? 900 : 0;
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
                ctx.drawImage(groupsImg, 90 * which, 90 * grid[x][y].group + fullOffset, 90, 90, 90 * x, 90 * y, 90, 90);

                // Check for corner addons!
                // Top Left Corners:
                if (x > 0 && y > 0) {
                    if (grid[x - 1][y].group == grid[x][y].group &&
                        grid[x][y - 1].group == grid[x][y].group &&
                        grid[x - 1][y - 1].group != grid[x][y].group) {
                        ctx.drawImage(groupsImg, 1440, 90 * grid[x][y].group + fullOffset, 45, 45, 90 * x, 90 * y, 45, 45);
                    }
                }

                // Bottom Left Corners:
                if (x > 0 && y < 8) {
                    if (grid[x - 1][y].group == grid[x][y].group &&
                        grid[x][y + 1].group == grid[x][y].group &&
                        grid[x - 1][y + 1].group != grid[x][y].group) {
                        ctx.drawImage(groupsImg, 1440, (90 * grid[x][y].group + fullOffset) + 45, 45, 45, 90 * x, (90 * y) + 45, 45, 45);
                    }
                }

                // Top Right Corners:
                if (x < 8 && y > 0) {
                    if (grid[x + 1][y].group == grid[x][y].group &&
                        grid[x][y - 1].group == grid[x][y].group &&
                        grid[x + 1][y - 1].group != grid[x][y].group) {
                        ctx.drawImage(groupsImg, 1440 + 45, 90 * grid[x][y].group + fullOffset, 45, 45, (90 * x) + 45, 90 * y, 45, 45);
                    }
                }

                // Bottom Right Corners:
                if (x < 8 && y < 8) {
                    if (grid[x + 1][y].group == grid[x][y].group &&
                        grid[x][y + 1].group == grid[x][y].group &&
                        grid[x + 1][y + 1].group != grid[x][y].group) {
                        ctx.drawImage(groupsImg, 1440 + 45, (90 * grid[x][y].group + fullOffset) + 45, 45, 45, (90 * x) + 45, (90 * y) + 45, 45, 45);
                    }
                }
            }
        }
    }

    ctx.setTransform();
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

            // ctx.beginPath();
            // ctx.strokeStyle = fgcolor;
            // ctx.rect(90 * x, 90 * y, 90, 90);
            // ctx.stroke();

            if (grid[x][y].val > 0) {
                ctx.font = '60px "Fredoka One"';
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                if (locks[x][y]) {
                    ctx.font = '60px "Fredoka One"';
                    ctx.fillStyle = BLACK;
                    ctx.strokeStyle = WHITE;
                    ctx.lineWidth = 2;
                    ctx.strokeText(grid[x][y].val, (90 * x) + 45, (90 * y) + 50);
                    ctx.fillText(grid[x][y].val, (90 * x) + 45, (90 * y) + 50);
                } else {
                    ctx.font = '60px "Fredoka One"';
                    ctx.fillStyle = BLACK;
                    ctx.fillText(grid[x][y].val, (90 * x) + 48, (90 * y) + 51);
                    ctx.fillStyle = WHITE;
                    ctx.fillText(grid[x][y].val, (90 * x) + 44, (90 * y) + 49);
                    ctx.fillStyle = grid[x][y].group > 0 ? WHITE : fgcolor;
                    ctx.fillText(grid[x][y].val, (90 * x) + 45, (90 * y) + 50);
                }
            }
        }
    }
    ctx.setTransform();
}

function drawHud() {
    ctx.font = '60px "Fredoka One"';
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = BLACK;
    ctx.fillText("Sudovide", 1031, 96);
    ctx.fillStyle = fgcolor;
    ctx.fillText("Sudovide", 1029, 94);

    if (youWon) {
        ctx.font = '120px "Fredoka One"';

        ctx.fillStyle = WHITE;
        ctx.lineWidth = 10;
        ctx.strokeStyle = BLACK;
        ctx.strokeText("You Won!", 450, 400);
        ctx.fillText("You Won!", 450, 400);
    }

    if (resetButton.show) {
        drawButton(resetButton);
    }

    if (newGameButton.show) {
        drawButton(newGameButton);
    }

    if (difficultyButton.show) {
        drawButton(difficultyButton);
    }
}

function drawButton(btn) {
    let bOffset = btn.over ? 900 : 0;
    if (btn.down) {
        bOffset = 1800;
    }
    ctx.drawImage(groupsImg, 90 * 13, bOffset + btn.uiColor, 90, 90, btn.x, btn.y, 90, 90);
    ctx.drawImage(groupsImg, 90 * 5, bOffset + btn.uiColor, 90, 90, btn.x + 90, btn.y, 90, 90);
    ctx.drawImage(groupsImg, 90 * 7, bOffset + btn.uiColor, 90, 90, btn.x + 180, btn.y, 90, 90);

    ctx.font = '36px "Fredoka One"';
    ctx.fillStyle = BLACK;
    ctx.fillText(btn.label, btn.x + 136, btn.y + 49);
    ctx.fillStyle = bgcolor;
    if (btn.over || btn.down) {
        ctx.fillStyle = WHITE;
    }
    ctx.fillText(btn.label, btn.x + 134, btn.y + 47);
}

function getRandomRgb(lo, hi) {
    var r = (lo + Math.round((hi - lo) * Math.random()));
    var g = (lo + Math.round((hi - lo) * Math.random()));
    var b = (lo + Math.round((hi - lo) * Math.random()));
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}
//#endregion

//#region Handlers
function mouseDown(e) {
    mDown = true;
    let mX = (e.offsetX - screenOffsetX) / gameScale;
    let mY = (e.offsetY - screenOffsetY) / gameScale;
    lastCellX = Math.floor((mX - 45) / 90);
    lastCellY = Math.floor((mY - 45) / 90);
    lastLastX = -1;
    lastLastY = -1;

    if (lastCellX < 0 || lastCellY < 0 || lastCellX > 8 || lastCellX > 8) {
        // Not on the grid, do non grid things
        mDown = false;

        // Reset button
        if (resetButton.contains(mX, mY)) {
            resetButton.down = true;
        } else if (newGameButton.contains(mX, mY)) {
            newGameButton.down = true;
        } else if (difficultyButton.contains(mX, mY)) {
            difficultyButton.down = true;
        }
    } else {
        if (youWon || !gameInProgress) {
            return;
        }
        // Special case: Group hist check, if there are any empty groups, start one here.
        if (grid[lastCellX][lastCellY].group == 0) {
            updateGroupHist();
            for (let i = 1; i < 10; i++) {
                if (groupHist[i] == 0) {
                    grid[lastCellX][lastCellY].group = i;
                    lastLastX = lastCellX;
                    lastLastY = lastCellY;
                    return;
                }
            }
        }
    }
}

function mouseUp(e) {
    mDown = false;
    let mX = (e.offsetX - screenOffsetX) / gameScale;
    let mY = (e.offsetY - screenOffsetY) / gameScale;
    let newX = Math.floor((mX - 45) / 90);
    let newY = Math.floor((mY - 45) / 90);

    if (newX > 8 || newY > 8 || newX < 0 || newY < 0) {
        // Off grid
        mDown = false;
        if (resetButton.contains(mX, mY) && resetButton.down) {
            resetGroups();
        } else if (newGameButton.contains(mX, mY) && newGameButton.down) {
            startGame();
        } else if (difficultyButton.contains(mX, mY) && difficultyButton.down) {
            changeDiff();
        }

        resetButton.down = false;
        newGameButton.down = false;
        difficultyButton.down = false;
    } else {
        if (youWon || !gameInProgress) {
            return;
        }
        if (lastLastX == -1 && lastLastY == -1) {
            if (newX == lastCellX && newY == lastCellY) {
                if (grid[newX][newY].group != 0 && !locks[newX][newY]) {
                    grid[newX][newY].group = 0;
                }
            }
        }
    }
}

function handleMouseMove(e) {

    let mX = (e.offsetX - screenOffsetX) / gameScale;
    let mY = (e.offsetY - screenOffsetY) / gameScale;
    let cellX = Math.floor((mX - 45) / 90);
    let cellY = Math.floor((mY - 45) / 90);
    if (cellX < 0 || cellX > 8 || cellY < 0 || cellY > 8) {
        resetButton.over = resetButton.contains(mX, mY);
        newGameButton.over = newGameButton.contains(mX, mY);
        difficultyButton.over = difficultyButton.contains(mX, mY);
    } else {
        if (!mDown) {
            return;
        }
        if (youWon || !gameInProgress) {
            return;
        }
        if (cellX != lastCellX || cellY != lastCellY) {
            if (grid[lastCellX][lastCellY].group == 0) {
                // TODO: Init new groups
                // Drag emptiness into the square?
                if (!locks[cellX][cellY]) {
                    grid[cellX][cellY].group = 0;
                }
                lastLastX = lastCellX;
                lastLastY = lastCellY;
                lastCellX = cellX;
                lastCellY = cellY;
            } else
            if (grid[lastCellX][lastCellY].group > 0) {
                if (lastLastX == -1 || lastLastY == -1) {
                    if (grid[cellX][cellY].group != grid[lastCellX][lastCellY].group) {
                        if (!locks[cellX][cellY]) {
                            grid[cellX][cellY].group = grid[lastCellX][lastCellY].group;
                        }
                        lastLastX = lastCellX;
                        lastLastY = lastCellY;
                        lastCellX = cellX;
                        lastCellY = cellY;
                    } else {
                        if (!locks[lastCellX][lastCellY]) {
                            grid[lastCellX][lastCellY].group = 0;
                        }
                        lastLastX = lastCellX;
                        lastLastY = lastCellY;
                        lastCellX = cellX;
                        lastCellY = cellY;
                    }
                } else {
                    if (grid[cellX][cellY].group != grid[lastCellX][lastCellY].group) {
                        if (!locks[cellX][cellY]) {
                            grid[cellX][cellY].group = grid[lastCellX][lastCellY].group;
                        }
                        lastLastX = lastCellX;
                        lastLastY = lastCellY;
                        lastCellX = cellX;
                        lastCellY = cellY;
                    }
                }
            }
        }
    }
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

function update() {
    window.setTimeout(update, 1000 / 24);
    if (!gameInProgress) {
        // Switch a random group and a random digit! Animated!
        let gx = Math.floor(Math.random() * 9);
        let gy = Math.floor(Math.random() * 9);
        let nx = Math.floor(Math.random() * 9);
        let ny = Math.floor(Math.random() * 9);
        let grp = Math.ceil(Math.random() * 9);
        let num = Math.ceil(Math.random() * 9);
        grid[gx][gy].group = grp;
        grid[nx][ny].val = num;
    } else if (!youWon) {
        if (checkForWin()) {
            youWon = true;
            resetButton.show = false;
            difficultyButton.show = true;
        }
    }
}
//#endregion

//#region Game Logic
function checkForWin() {
    let didWin = true;
    updateGroupHist();
    if (!contigGroups()) {
        didWin = false;
    }

    // Check if there's the right number in each group
    for (let i = 1; i < 10; i++) {
        if (groupHist[i] != 9) {
            didWin = false;
        }
    }

    // Okay, let's do the real big check. 
    winGrid = [];
    for (let i = 0; i < 9; i++) {
        winGrid[i] = [];
        for (let j = 0; j < 9; j++) {
            winGrid[i][j] = false;
        }
    }

    // Make the win grid
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            let cVal = grid[x][y].val;
            let cGrp = grid[x][y].group;
            if (cGrp == 0) {
                didWin = false;
            } else {
                winGrid[cGrp - 1][cVal - 1] = true;
            }
        }
    }

    // VERIFY the win grid
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            if (!winGrid[x][y]) {
                didWin = false;
            }
        }
    }

    return didWin;
}

function emptyBoolGrid() {
    let g = [];
    for (let x = 0; x < 9; x++) {
        g[x] = [];
        for (let y = 0; y < 9; y++) {
            g[x][y] = false;
        }
    }
    return g;
}

function resetGroups() {
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            if (locks[x][y]) continue;
            grid[x][y].group = 0;
        }
    }
}

function updateGroupHist() {
    for (let i = 0; i < 10; i++) {
        groupHist[i] = 0;
    }
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            if (grid[x][y].group > 0) {
                groupHist[grid[x][y].group]++;
            }
        }
    }
}

function contigGroups() {
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            // Only groups
            if (grid[x][y].groups != 0) {
                let cGrid = emptyBoolGrid();
                cGrid = markGroup(x, y, cGrid);
                for (let cx = 0; cx < 9; cx++) {
                    for (let cy = 0; cy < 9; cy++) {
                        if (grid[cx][cy].group == grid[x][y].group && !cGrid[cx][cy]) {
                            return false;
                        }
                    }
                }
            }
        }
    }
    return true;
}

function markGroup(x, y, cGrid) {
    if (cGrid[x][y]) return cGrid;
    cGrid[x][y] = true;
    if (x > 0 && grid[x - 1][y].group == grid[x][y].group) {
        cGrid = markGroup(x - 1, y, cGrid);
    }
    if (x < 8 && grid[x + 1][y].group == grid[x][y].group) {
        cGrid = markGroup(x + 1, y, cGrid);
    }
    if (y > 0 && grid[x][y - 1].group == grid[x][y].group) {
        cGrid = markGroup(x, y - 1, cGrid);
    }
    if (y < 8 && grid[x][y + 1].group == grid[x][y].group) {
        cGrid = markGroup(x, y + 1, cGrid);
    }
    return cGrid;
}

//#endregion

//#region Puzzle Generation
function generatePuzzle(shouldLock) {
    let puzNum = Math.floor(Math.random() * basePuzzles.length);
    console.log("Puznum: " + puzNum);
    let puz = basePuzzles[puzNum];

    winGrid = emptyBoolGrid();
    locks = emptyBoolGrid();
    grid = emptyBoolGrid();

    // Make an empty grid
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            grid[x][y] = {
                val: 0,
                group: 0
            };
            locks[x][y] = false;
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

    // Difficulty settings!
    if (shouldLock) {
        switch (difficulty) {
            case 0: // Easiest: Just connect them
                for (let x = 0; x < 9; x++) {
                    for (let y = 0; y < 9; y++) {
                        if (grid[x][y].val % 3 == grid[x][y].group % 3) {
                            grid[x][y].group = 0;
                        } else {
                            locks[x][y] = true;
                        }
                    }
                }
                break;
            case 1: // Easy: Connect patchier groups
                for (let x = 0; x < 9; x++) {
                    for (let y = 0; y < 9; y++) {
                        if (grid[x][y].val % 2 != grid[x][y].group % 2) {
                            grid[x][y].group = 0;
                        } else {
                            locks[x][y] = true;
                        }
                    }
                }
                break;
            case 2: // Medium: Connect with only 3
                for (let x = 0; x < 9; x++) {
                    for (let y = 0; y < 9; y++) {
                        if (grid[x][y].val % 3 != grid[x][y].group % 3) {
                            grid[x][y].group = 0;
                        } else {
                            locks[x][y] = true;
                        }
                    }
                }
                break;
            case 4: // Hard: Each group has a unique number
                for (let x = 0; x < 9; x++) {
                    for (let y = 0; y < 9; y++) {
                        if (grid[x][y].val != grid[x][y].group) {
                            grid[x][y].group = 0;
                        } else {
                            locks[x][y] = true;
                        }
                    }
                }
                break;
            case 3: // Master: Find a spot where three/four intersect
                for (let x = 0; x < 8; x++) {
                    for (let y = 0; y < 8; y++) {
                        if (grid[x][y].group != grid[x + 1][y].group &&
                            grid[x][y].group != grid[x][y + 1].group &&
                            grid[x + 1][y].group != grid[x][y + 1].group) {
                            locks[x][y] = true;
                            locks[x + 1][y] = true;
                            locks[x][y + 1] = true;
                            // x = 8;
                            // y = 8;
                            // continue;
                        }
                    }
                }
                for (let x = 0; x < 9; x++) {
                    for (let y = 0; y < 9; y++) {
                        if (!locks[x][y]) {
                            grid[x][y].group = 0;
                        }
                    }
                }
                break;
        }
    } else {
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                grid[x][y].group = 0;
            }
        }
    }

    // Shuffle the grid!
    for (let i = 0; i < 50; i++) {
        switch (Math.floor(Math.random() * 4)) {
            case 0:
                break;
            case 1:
                swapDigits();
                break;
            case 2:
                rotateGrid();
                break;
            case 3:
                flipGrid();
                break;
        }
    }
}

function swapDigits() {
    let digA = Math.ceil(Math.random() * 9);
    let digB = Math.ceil(Math.random() * 9);
    while (digA == digB) {
        digB = Math.ceil(Math.random() * 9);
    }
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            if (grid[x][y].val == digA) {
                grid[x][y].val = digB;
            } else if (grid[x][y].val == digB) {
                grid[x][y].val = digA;
            }
        }
    }
}

function rotateGrid() {
    let newGrid = [];
    let newLocks = [];
    for (let i = 0; i < 9; i++) {
        newGrid[i] = [];
        newLocks[i] = [];
    }

    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            newGrid[y][x] = grid[x][y];
            newLocks[y][x] = locks[x][y];
        }
    }
    grid = newGrid;
    locks = newLocks;
}

function flipGrid() {
    let newGrid = [];
    let newLocks = [];
    for (let i = 0; i < 9; i++) {
        newGrid[i] = [];
        newLocks[i] = [];
    }

    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            newGrid[x][y] = grid[8 - x][y];
            newLocks[x][y] = locks[8 - x][y];
        }
    }
    grid = newGrid;
    locks = newLocks;
}
//#endregion

window.onload = function () {
    // Init Gfx
    fgcolor = getRandomRgb(100, 150);
    bgcolor = getRandomRgb(200, 250);
    newGameButton.uiColor = 90 * Math.ceil(Math.random() * 9);
    resetButton.uiColor = 90 * Math.ceil(Math.random() * 9);
    difficultyButton.uiColor = 90 * Math.ceil(Math.random() * 9);
    srcCanvas = document.createElement('canvas');
    srcCanvas.width = 1200;
    srcCanvas.height = 900;
    ctx = srcCanvas.getContext('2d');
    dstCanvas = document.getElementById('canvas');
    dstctx = dstCanvas.getContext('2d');

    // Resource loading
    groupsImg = new Image(); // Create new img element
    groupsImg.addEventListener('load', function () {
        let loaded = true;
    }, false);
    groupsImg.src = 'img/cellbg3.png'; // Set source path

    // Add the handlers
    window.addEventListener('resize', resizeGame);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mouseup', mouseUp);

    // Kick everything off!
    makeAttractScreen();
    resizeGame();
    window.setTimeout(update, 1000 / 60);
    drawScreen();
};

function makeAttractScreen() {
    generatePuzzle(false);
}

function startGame() {
    generatePuzzle(true);
    youWon = false;
    gameInProgress = true;
    resetButton.show = true;
    difficultyButton.show = false;
    fgcolor = getRandomRgb(100, 150);
    bgcolor = getRandomRgb(200, 250);
    newGameButton.uiColor = 90 * Math.ceil(Math.random() * 9);
    resetButton.uiColor = 90 * Math.ceil(Math.random() * 9);
    difficultyButton.uiColor = 90 * Math.ceil(Math.random() * 9);
}

function changeDiff() {
    difficulty += 1;
    difficulty %= 5;
    switch (difficulty) {
        case 0:
            difficultyButton.label = "Diff: Easy";
            break;
        case 1:
            difficultyButton.label = "Diff: Cool";
            break;
        case 2:
            difficultyButton.label = "Diff: Warm";
            break;
        case 3:
            difficultyButton.label = "Diff: Hard";
            break;
        case 4:
            difficultyButton.label = "Diff: Mean";
            break;
    }
}