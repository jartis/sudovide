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
var timer = 0;
var timerString = "00:00";
var myTimer;

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
    y: 225,
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
    y: 315,
    contains: function (mx, my) {
        return (mx > this.x && mx < this.x + 270 && my > this.y && my < this.y + 90);
    },
    label: "Diff: Easy",
    uiColor: 90,
};

var saveButton = {
    show: false,
    down: false,
    over: false,
    x: 895,
    y: 495,
    contains: function (mx, my) {
        return (mx > this.x && mx < this.x + 270 && my > this.y && my < this.y + 90);
    },
    label: "Save",
    uiColor: 90,
};

var loadButton = {
    show: true,
    down: false,
    over: false,
    x: 895,
    y: 585,
    contains: function (mx, my) {
        return (mx > this.x && mx < this.x + 270 && my > this.y && my < this.y + 90);
    },
    label: "Load",
    uiColor: 90,
};

//#endregion

//#region Saving and Loading

function buildSaveString() {
    let saveString = "";
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            saveString = saveString.concat(grid[x][y].val.toString());
            if (grid[x][y].group > 0) {
                if (locks[x][y]) {
                    let grp = String.fromCharCode(96 + grid[x][y].group);
                    saveString = saveString.concat(grp);
                } else {
                    let grp = String.fromCharCode(64 + grid[x][y].group);
                    saveString = saveString.concat(grp);
                }
            }
        }
    }
    return saveString;
}

function parseSaveString(saveString) {
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            if (!isNum(saveString[0]) || saveString.length < 1) {
                return false;
            }
            grid[x][y].value = parseInt(saveString[0]);
            locks[x][y] = false;
            grid[x][y].group = 0;
            saveString = saveString.substring(1);
            if (isAlpha(saveString[0])) {
                let grp = saveString.charCodeAt(0);
                if (grp > 96 && grp < 106) {
                    grid[x][y].group = grp - 96;
                    locks[x][y] = true;
                } else if (grp > 64 && grp < 74) {
                    grid[x][y].group = grp - 64;
                    locks[x][y] = false;
                } else {
                    return false;
                }
                saveString = saveString.substring(1);
            }
        }
    }
    return true;
}

function isAlpha(ch) {
    return /^[A-Z]$/i.test(ch);
}

function isNum(ch) {
    return /^[1-9]$/.test(ch);
}

function doSave() {
    let saveString = buildSaveString();
    window.prompt("Copy this save data!", saveString);
}

function doLoad() {
    let saveData = window.prompt("Paste puzzle data:");
    timer = 0;
    window.clearInterval(myTimer);
    myTimer = window.setInterval(tickTimer, 1000);
    tickTimer();
    if (!parseSaveString(saveData)) {
        window.alert("Error loading puzzle!");
        generatePuzzle(true);
    }
    youWon = false;
    gameInProgress = true;
    resetButton.show = true;
    difficultyButton.show = false;
    saveButton.show = true;
    loadButton.show = true;
    fgcolor = getRandomRgb(100, 150);
    bgcolor = getRandomRgb(200, 250);
    newGameButton.uiColor = 90 * Math.ceil(Math.random() * 9);
    resetButton.uiColor = 90 * Math.ceil(Math.random() * 9);
    difficultyButton.uiColor = 90 * Math.ceil(Math.random() * 9);
    saveButton.uiColor = 90 * Math.ceil(Math.random() * 9);
    loadButton.uiColor = 90 * Math.ceil(Math.random() * 9);
}

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
    "785842871696662636683222174686765695887212372969499955488252679779391525186292275747893575284333947714596585389374546424198145981384443451217161532363738331914111",
    "865636271777624292766616873797475222384626967567578212681888489555352572287898584515856532992969795343133384198949396323937354599171618334241444413151112181749464",
    "549116468777622838942186364757721868245161967637128848748131266617425898843441115667229278446471851597523229147395653527824959331355752545996989634323539383397919",
    "738391311141612159139354842434716949433323647494518119255363754414893999551535458568987929954282126528385878622272923257184888367616265287479767866646569677271737",
    "278795457555153565479777173885256151376818885898427221577848281232628291671636768622529241792956966646341481194926639373845431895969332313944471993983534364742411",
    "261696893959694272866649297999195232563623431363738292769353334483221262467464942414543888175734619121847848978111716531412858372777518545986818674787155575359525",
    "586825954539897919483898857515296953182878553565994983884434246191115973367484649421511343965446142781713363661656778741312392268617475772629332769767371252428222",
    "573727679242187888977787321222625848651747798252933828354569897213239854255515493999836874419575192933538464718531965963432414112191566686734434816151264676361694",
    "719444243363835919312154144373936989911184645323394979814134746713569929615727478796761636517717379786462666486878581232228292183898882552627242288565957545153555",
    "724217276756369181922247663786517111527787164696213161623957978526761841329929895565154878821279459538682858195969352575438898498333537313936424236394741444845434",
    "613144845424977717819121746514475737714111258594346759125172359564882749226292534538188779528233431575689829321383967655284869422356663686781999937363162646583989",
    "911121817232624354514131618212937324659515714253332384355545229263138374258566523949789814753656991989286444876796162679485834177686466929593894472777375797881868",
    "115191618133237343314124746483931353522171841494443463228515955467774737427565359727175787923655452518688878726686163848582898829646267659396919621232564979899929",
    "218131714898685818419188387828176757115161998979392747721929596949963787523242122266869777926313833656764625627353449416268535824393241434557565332374645484451595",
    "119141712757678636516177873796261646723181221747975666322192528818486576821262389875554525428359996828783515637329495839149585934319697989342454235333134464847494",
    "519717397946862665915727498936766615218177675919964535317147876929165695611137589988487525416282182878389455734252981268243485132292723253648444833363234393541474",
    "614838772796561686215898178766764636718818675747263595412878973755856515113168599989452575817242296914349454519222391974648444916282497933135324321252834323937363",
    "113181577747669626221241885897396976825261189837297946926251783827194986427291286817895636322171488767591695534313332474998565638323944454753515739334641484452555",
    "311191718262425222983841516181237212184858899921736332687888294939531392289779691943338354778767375915932444576627173595854574472616967655653484865636462575149464",
    "219787475739197965811777672748995935715191378868294915314111287898698555427261583818899625926232124686562675528222931676366645132343836454743495633353739424441484",
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
                    ctx.fillStyle = WHITE;
                    ctx.strokeStyle = BLACK;
                    ctx.lineWidth = 2;
                    ctx.strokeText(grid[x][y].val, (90 * x) + 45, (90 * y) + 50);
                    ctx.fillText(grid[x][y].val, (90 * x) + 45, (90 * y) + 50);
                } else {
                    ctx.font = '60px "Fredoka One"';
                    ctx.fillStyle = BLACK;
                    ctx.fillText(grid[x][y].val, (90 * x) + 48, (90 * y) + 51);
                    ctx.fillStyle = WHITE;
                    ctx.fillText(grid[x][y].val, (90 * x) + 44, (90 * y) + 49);
                    ctx.fillStyle = fgcolor;
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

    if (gameInProgress) {
        ctx.font = '36px "Fredoka One"';
        ctx.fillStyle = BLACK;
        ctx.fillText(timerString, 1031, 179);
        ctx.fillStyle = fgcolor;
        ctx.fillText(timerString, 1029, 177);

    }

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

    if (saveButton.show) {
        drawButton(saveButton);
    }

    if (loadButton.show) {
        drawButton(loadButton);
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
        } else if (saveButton.contains(mX, mY)) {
            saveButton.down = true;
        } else if (loadButton.contains(mX, mY)) {
            loadButton.down = true;
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
        if (resetButton.contains(mX, mY) && resetButton.down && resetButton.show) {
            resetGroups();
        } else if (newGameButton.contains(mX, mY) && newGameButton.down && newGameButton.show) {
            startGame();
        } else if (difficultyButton.contains(mX, mY) && difficultyButton.down && difficultyButton.show) {
            changeDiff();
        } else if (saveButton.contains(mX, mY) && saveButton.down && saveButton.show) {
            doSave();
        } else if (loadButton.contains(mX, mY) && loadButton.down && loadButton.show) {
            doLoad();
        }

        resetButton.down = false;
        newGameButton.down = false;
        difficultyButton.down = false;
        saveButton.down = false;
        loadButton.down = false;
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
        saveButton.over = saveButton.contains(mX, mY);
        loadButton.over = loadButton.contains(mX, mY);
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
            window.clearInterval(myTimer);
            youWon = true;
            resetButton.show = false;
            difficultyButton.show = true;
            saveButton.show = false;
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

    // Populate the values and groups!
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            grid[y][x].val = parseInt(puz.charAt(0));
            puz = puz.substr(1);
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

function tickTimer() {
    timer++;
    timerString = new Date(timer * 1000).toISOString().substr(11, 8);
}

window.onload = function () {
    // Init Gfx
    fgcolor = getRandomRgb(100, 150);
    bgcolor = getRandomRgb(200, 250);
    newGameButton.uiColor = 90 * Math.ceil(Math.random() * 9);
    resetButton.uiColor = 90 * Math.ceil(Math.random() * 9);
    difficultyButton.uiColor = 90 * Math.ceil(Math.random() * 9);
    saveButton.uiColor = 90 * Math.ceil(Math.random() * 9);
    loadButton.uiColor = 90 * Math.ceil(Math.random() * 9);
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
    groupsImg.src = 'img/cellbg.png'; // Set source path

    // Add the handlers
    window.addEventListener('resize', resizeGame);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mouseup', mouseUp);

    // Touch controls (from SO)
    window.addEventListener("touchstart", touchHandler, true);
    window.addEventListener("touchmove", touchHandler, true);
    window.addEventListener("touchend", touchHandler, true);
    window.addEventListener("touchcancel", touchHandler, true);   

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
    timer = 0;
    window.clearInterval(myTimer);
    myTimer = window.setInterval(tickTimer, 1000);
    tickTimer();
    generatePuzzle(true);
    youWon = false;
    gameInProgress = true;
    resetButton.show = true;
    difficultyButton.show = false;
    saveButton.show = true;
    loadButton.show = true;
    fgcolor = getRandomRgb(100, 150);
    bgcolor = getRandomRgb(200, 250);
    newGameButton.uiColor = 90 * Math.ceil(Math.random() * 9);
    resetButton.uiColor = 90 * Math.ceil(Math.random() * 9);
    difficultyButton.uiColor = 90 * Math.ceil(Math.random() * 9);
    saveButton.uiColor = 90 * Math.ceil(Math.random() * 9);
    loadButton.uiColor = 90 * Math.ceil(Math.random() * 9);
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

// Touch events (from SO)
function touchHandler(event)
{
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
    switch(event.type)
    {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type = "mousemove"; break;        
        case "touchend":   type = "mouseup";   break;
        default:           return;
    }

    // initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //                screenX, screenY, clientX, clientY, ctrlKey, 
    //                altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                                  first.screenX, first.screenY, 
                                  first.clientX, first.clientY, false, 
                                  false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

