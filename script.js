// Game options definitions.
const colors = ['#ff0000', '#0000ff', '#ffff00', '#00ff00', ' #666699',  '#ff00ff'];

const board = document.getElementById('board');
const hScoreDiv = document.getElementById('hScore');
const scoreDiv = document.getElementById('score');
const movesDiv = document.getElementById('moves');
const modeBut = document.getElementById('mode');
const resetBut = document.getElementById('reset');

const blockNum = 10;
const blockBorder = 2;
let boardSize = 600;
const transitionTime = 0.25;
const blockSize = boardSize / blockNum;
boardSize += blockNum * 2 * blockBorder;
const blockInfo = [];
const blockThreshold = 2;

// end of game options

// Game control variables
let challangeMode = false;
let checkQueue = [];
let score = 0;
let moves = 0;
let highScore = 0;
let clicked = -1;
let stopChanges = false;

// end of game control variables

// Initializing board
Object.assign(document.getElementById('main').style, {
    display :   'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginLeft: '100px'
});

const style = {
    height  :   `${boardSize}px`,
    width   :   `${boardSize}px`,
    position:   'relative',
};

Object.assign(board.style, style);
// end of board initializaion

modeBut.onclick = changeMode;
resetBut.onclick = checkReset;

/**
 * Simple funtion to get top and left positions (a numbers) off of a HTMLElement
 * @param {HTMLElement} elem 
 */
function getTopLeftNum(elem){
    const topString = elem.style.top;
    const leftString = elem.style.left;
    const top = Number(topString.slice(0, topString.indexOf('px')));
    const left = Number(leftString.slice(0, leftString.indexOf('px')));
    return [top, left];
}

/**
 * A mouse over handler to make the block under the cursor to be a little bigger
 * @param {Event} e 
 */
function mouseOverHandle(e) {
    if(clicked === Number(e.target.id)) return;
    target = e.target;
    target.style.height = `${blockSize * 1.2}px`,
    target.style.width = `${blockSize * 1.2}px`;
    const top = blockInfo[Number(target.id)].top;
    const left = blockInfo[Number(target.id)].left;
    target.style.top = `${top - blockSize*0.1}px`;
    target.style.left = `${left - blockSize*0.1}px`;
    target.style.zIndex = '2';
}

/**
 * Helping function that makes a element the "normal" size
 * @param {HTMLElement} elem 
 */
function normalSize(elem){
    elem.style.height = `${blockSize}px`,
    elem.style.width = `${blockSize}px`;
    const id = Number(elem.id);
    elem.style.top = `${blockInfo[id].top}px`;
    elem.style.left = `${blockInfo[id].left}px`;
    elem.style.zIndex = '0';
}

/**
 * Simple mouse out handler to make the block under the cursor "normal" size
 * @param {Event} e 
 */
function mouseOutHandle(e) {
    if(clicked === Number(e.target.id)) return;
    normalSize(e.target);
}

/**
 * Function that lets the player unselet a former selected block    
 * @param {HTMLElement} elem 
 */
function unClick(elem) {
    elem.style.borderColor = '#000000';
    elem.style.zIndex = '0';
    clicked = -1;
}

/**
 * Checks how many blocks the same color of the index one is in the specified direction
 * @param {number} index 
 * @param {string} relPos 
 */
function checkSC(index, relPos) {
    let step;
    let valid;
    if(relPos === 'left') {
        step = (x) => x - 1;
        valid = (x, y) => {
            if(x < 0) return false;
            else return x%blockNum < y%blockNum;
        };
    } else if(relPos === 'right') {
        step = (x) => x + 1;
        valid = (x, y) => {
            if(x >= blockNum * blockNum) return false;
            else return x%blockNum > y%blockNum;
        };
    } else if(relPos === 'up') {
        step = (x) => x - blockNum;
        valid = (x) => x > 0;
    } else if(relPos === 'down') {
        step = (x) => x + blockNum;
        valid = (x) => x < (blockNum * blockNum);
    } else return -1; // not a valid direction (at least for now)
    const color = blockInfo[index].color;
    let i = step(index);
    let count = 0;
    while(valid(i, index)) {
        if(blockInfo[i].color === color) {
            count++;
            i = step(i);
        }
        else break;
    }
    return count;  
}

/**
 * Awards points based on the combination made
 * @param {string} combination 
 * @param {number} amount 
 */
function awardPoints(combination, amount){
    if(combination === "line") {
        if(amount === blockThreshold + 1) score += 10;   // 10 point for a line 1 block bigger than the threshold
        else if(amount === blockThreshold + 2) score += 30;// 30 points for a line 2 blocks bigger than the threshold
        else if(amount === blockThreshold + 3) score += 50;// 50 points for a line 3 blocks bigger than the threshold
        else if(amount >= blockThreshold + 4) score += 100; // 100 points for a line 4 or more blocks bigger than the threshold
    }
    scoreDiv.innerHTML = `Current Score:<br/>${score}`;
    if(challangeMode && score > highScore) {
        highScore = score;
        hScoreDiv.innerHTML = `High Score: <br/> ${highScore}`;
    }
}

/**
 * Uses the results of checkSC(...) to check if any (or wich) blocks should be destructed
 * @param {number} id 
 */
function checkDestroy(id) {
    const ret = [];
    let [left, right, up, down] = [checkSC(id, 'left'), checkSC(id, 'right'), checkSC(id, 'up'), checkSC(id, 'down')];
    let sumX = left + right;
    let sumY = up + down;

    //if a line can be made with any direction the function chooses the bigger line
    if(sumX >= blockThreshold && sumY >= blockThreshold) {
        // making the sumX 0 here will consider the y-axis as solution
        // not changing it will consider the x-axis as solution due to the function flow
        if(sumY > sumX) sumX = 0; 
    }
    if(sumX >= blockThreshold){
        awardPoints('line', left + right + 1);
        while(left) ret.push(id - (left--));
        ret.push(id);
        for(let i = 0; i < right; i++) ret.push(id + i + 1);
        return [ret, 'x'];
    }
    if(sumY >= blockThreshold) {
        awardPoints('line', up + down + 1);
        while(up) ret.push(id - blockNum * up--);
        ret.push(id);
        for(let i = 0; i < down; i++) ret.push(id + blockNum * (i + 1));
        return [ret, 'y'];
    }
    return [null, null];
}

/**
 * Animates all blocks indexed by numbers on the Array 'list' and returns the last 
 * animation created (given that when the last animation created ends the whole 
 * animation process ended).s
 * @param {number[]} list 
 */
function animateDestroyBlocks(list) {
    let lastAnimation;
    for(blockId of list){
        const div = document.getElementById(`${blockId}`);
        lastAnimation = div.animate([
            {
                left: blockInfo[blockId].left + "px",
                top: blockInfo[blockId].top + "px",
                height: blockSize + "px",
                width: blockSize + "px",
            },
            {
                left: (blockInfo[blockId].left + blockSize / 2) + "px",
                top: (blockInfo[blockId].top + blockSize / 2) + "px",
                height: 0,
                width: 0,
            }
        ], transitionTime * 1000);
    }
    return lastAnimation;
}

/**
 * Actually destroys every div indexed by the numbers in the list removing them from the
 * html.
 * @param {number[]} list 
 */
function destroyBlocks(list){
    for(i of list) document.getElementById(`${i}`).remove();
    return;
}

/**
 * Simple function to help create and stylize divs
 * @param {number} id 
 * @param {string} color 
 * @param {number} height 
 * @param {number} width 
 * @param {number} top 
 * @param {number} left 
 */
function createDiv(id, color, height, width, top, left) {
    const newDiv = document.createElement('div');
    const tempStyle = {
        position        :   'absolute',
        height          :   `${height}px`,
        width           :   `${width}px`,
        top             :   `${top}px`,
        left            :   `${left}px`,
        backgroundColor :   color,
        borderColor     :   '#000000',
        borderWidth      :   `${blockBorder}px`,
        borderStyle     :   'solid',
        zIndex          :    '0'
    };
    Object.assign(newDiv.style, tempStyle);
    newDiv.id = id;
    newDiv.onclick = clickHandle;
    newDiv.onmouseover = mouseOverHandle;
    newDiv.onmouseout = mouseOutHandle;
    return newDiv;
}

/**
 * Creates (and animate this creation) the blocks whose ids are in 'list'
 * @param {number[]} list 
 */
function createAndAnimateBlocks(list) {
    let lastAnimation;
    for(const blockId of list) {
        blockInfo[blockId].color = colors[Math.floor(Math.random() * colors.length)];
        const top = blockInfo[blockId].top + blockSize / 2;
        const left = blockInfo[blockId].left + blockSize / 2;
        const div = createDiv(blockId, blockInfo[blockId].color, blockSize, blockSize, blockInfo[blockId].top, blockInfo[blockId].left);
        lastAnimation = div.animate([
            {
                height: 0,
                width: 0,
                top: top + "px",
                left: left + "px"
            },
            {
                height: blockSize + "px",
                width: blockSize + "px",
                top: blockInfo[blockId].top + "px",
                left: blockInfo[blockId].left + "px"
            }
        ], transitionTime * 1000);
        board.append(div);
    }
    return lastAnimation;
}

/**
 * Moves (and animate this movement) the blocks whose ids are in 'list'
 * @param {number[]} list 
 */
function moveAndAnimateBlocks(list) {
    if(!list || !list.length) return null;
    let lastAnimation;
    for(const moveRule of list) {
        const div = document.getElementById(`${moveRule.from}`);
        div.id = moveRule.to;
        div.style.top = blockInfo[moveRule.to].top + "px";
        div.style.left = blockInfo[moveRule.to].left + "px";
        blockInfo[moveRule.to].color = blockInfo[moveRule.from].color;
        lastAnimation = div.animate([
            {
                top: blockInfo[moveRule.from].top + "px",
                left: blockInfo[moveRule.from].left + "px"
            },
            {
                top: blockInfo[moveRule.to].top + "px",
                left: blockInfo[moveRule.to].left + "px"
            }
        ], transitionTime * 1000);
    }
    return lastAnimation;
}

/**
 * Main function to control all processes of destruction, moving, and creating of blocks.
 * To better controll concurrent changes, every block moved or created is pushed into a 
 * queue, and the function calls itself "recursively" (but not actually because it is called
 * from the Animation's 'onfinish' event and by that time the first instance of controlChange 
 * would even already be over) untill this queue empties.
 * @returns {void}
 */
function controlChanges() { 
    if(!checkQueue.length || stopChanges) return;
    const index = checkQueue.shift();
    let [toDestroy, axis] = checkDestroy(index);
    if(!toDestroy) return controlChanges(); // don't have to destroy anything this iteraton
    const toMove = [];
    const toCreate = [];
    if(axis === 'x') {
        let row = Math.floor(toDestroy[0] / blockNum);
        // Creates the top row blocks
        for(const i of toDestroy) toCreate.push(i - blockNum * row);
        for(let mul = 0; mul < row; mul++) { //there is at least a row above the destructed one to be moved down
            for(const i of toDestroy) {
                const id = i - (blockNum * (mul + 1));
                toMove.push({from: id, to: id + blockNum});
            }
        }
    } else if(axis === 'y') {
        let col = toDestroy[0] % blockNum;
        // lists the blocks that will be created
        for(const i in toDestroy) toCreate.push(col + i * blockNum);
        let mul = 1;
        let id;
        // gets every block in the sabe column that whill be moved down
        while((id = (toDestroy[0] - (blockNum * (mul++)))) >= 0) 
            toMove.push({from: id, to: id + toDestroy.length * blockNum});
    }

    for(const rule of toMove) checkQueue.push(rule.to);
    for(const elem of toCreate) checkQueue.push(elem);
    try{
        const destroyLA = animateDestroyBlocks(toDestroy);
        destroyLA.onfinish = () => {
            destroyBlocks(toDestroy);
            const moveLA = moveAndAnimateBlocks(toMove);
            if(!moveLA) {
                const createLA = createAndAnimateBlocks(toCreate);
                createLA.onfinish = () => {
                    return controlChanges(); // calls controlChanges back to run up untill the que empties
                };
            } else {
                moveLA.onfinish = () => {
                    const createLA = createAndAnimateBlocks(toCreate);
                    createLA.onfinish = () => {
                        return controlChanges(); // calls controlChanges back to run up untill the que empties
                    };
                };
            }
        };
    } catch (e) { 
        console.log(e);
    }
    return;
}

/**
 * Change position of two Blocks... that's pretty much it.
 * @param {HTMLElement} aElem 
 * @param {HTMLElement} bElem 
 */
function changeElemPos(aElem, bElem) {
    normalSize(bElem);
    normalSize(aElem);
    const [aTop, aLeft] = getTopLeftNum(aElem);
    const [bTop, bLeft] = getTopLeftNum(bElem);
    aElem.style.setProperty('transition', `all ${transitionTime}s`);
    bElem.style.setProperty('transition', `all ${transitionTime}s`);
    aElem.style.top = bTop + 'px';
    aElem.style.left = bLeft + 'px';
    bElem.style.top = aTop + 'px';
    bElem.style.left = aLeft + 'px';
    setTimeout(() => {
        bElem.style.removeProperty('transition');
        aElem.style.removeProperty('transition');
    }, transitionTime * 1000);
    [aElem.id, bElem.id] = [bElem.id, aElem.id];
    aId = Number(aElem.id);
    bId = Number(bElem.id);
    [blockInfo[aId].color, blockInfo[bId].color] = [blockInfo[bId].color, blockInfo[aId].color];
}

/**
 * Function to control what clicking do.
 * if nothing was clicked (clicked = -1) the current is selected*
 * if the clicked block is the one selected it is unselected
 * if there is a selected one and it is different than the target they change places
 * 
 * * selected block has a higher z-index and a white border
 * @param {Event} e 
 */
function clickHandle(e) {
    mouseOutHandle(e);
    const id = Number(e.target.id) 
    if(id === clicked) {
        unClick(e.target);
        return;
    } 
    if (clicked !== -1) {
        tempClicked = clicked;
        unClick(document.getElementById(String(clicked)));
        if(id === tempClicked + 1 || id === tempClicked - 1 || id === tempClicked + blockNum || id === tempClicked - blockNum) {
            if(challangeMode) 
                scoreDiv.innerHTML = `CurrentScore: <br/>${score -= moves}`;
            moves++;
            movesDiv.innerHTML = `Moves made: <br/>${moves}`;
            changeElemPos(document.getElementById(String(tempClicked)), e.target);
            checkQueue.push(id);
            checkQueue.push(tempClicked);
            console.log(checkQueue.length);

            //if the queue was empty priror to the pushes then it must begin the function chain
            if(checkQueue.length === 2) controlChanges(); 
            return;
        } 

    }  else {
        normalSize(e.target);
        e.target.style.borderColor = '#ffffff';
        e.target.style.zIndex = '1';
        clicked = id;
    }
}

/**
 * Erases every block from the board and creates new ones
 */
function reset() {
    score = 0;
    moves = 0;
    scoreDiv.innerHTML = `Current Score: <br/>0`;
    movesDiv.innerHTML = `Moves Made: <br/>0`;
    for(let i = 0; i < blockNum * blockNum; i++) document.getElementById(`${i}`).remove();
    init();
}

/**
 * Checks wether there are animations to be finished (or better saying, changes to be checked)
 * and if isn't it calls the reset function.
 */
function checkReset() {
    if(checkQueue.length) {
        return alert("Could not reset :( , wait untill all ongoing changes end and try again.");
    }
    stopChanges = true;
    reset();
    stopChanges = false;
}

/**
 * hecks wether there are animations to be finished (or better saying, changes to be checked)
 * and if isn't it calls the reset function and proceeds to change the game mode.
 * @param {Event} e 
 */
function changeMode(e) {
    if(checkQueue.length) {
        return alert("Could not change mode :( , wait untill all ongoing changes end and try again.")
    }
    stopChanges = true;
    reset();
    challangeMode = !challangeMode;
    if(challangeMode) e.target.innerHTML = "Casual Mode";
    else e.target.innerHTML = "Challange Mode";
    stopChanges = false;    
}

/**
 * Initializes the board
 */
function init() {
    for(let i = 0; i < blockNum; i++) 
        for(let j = 0; j < blockNum; j++){
            let colorId = Math.floor(Math.random() * colors.length);
            let color = colors[colorId];
            const id = i * blockNum + j;
            blockInfo[id] = {
                top     :   i * (blockSize + 2 * blockBorder),
                left    :   j * (blockSize + 2 * blockBorder),
                color   :   color
            };
            while(checkSC(id, 'left') >= blockThreshold || checkSC(id, 'up') >= blockThreshold) {
                colorId = (colorId + 1) % colors.length;
                color = colors[colorId];
                blockInfo[id].color = color;
            };
            const tempStyle = {
                position        :   'absolute',
                height          :   `${blockSize}px`,
                width           :   `${blockSize}px`,
                top             :   `${i * (blockSize + 2 * blockBorder)}px`,
                left            :   `${j * (blockSize + 2 * blockBorder)}px`,
                backgroundColor :   color,
                borderColor     :   '#000000',
                borderWidth      :   `${blockBorder}px`,
                borderStyle     :   'solid',
                zIndex          :    '0'
            };
            const temp = document.createElement('div');
            Object.assign(temp.style, tempStyle);
            temp.id = id;
            temp.onmouseover = mouseOverHandle;
            temp.onmouseout = mouseOutHandle;
            temp.onclick = clickHandle;
            board.append(temp);
        }
}

init();


