const colors = ['#ff0000', '#0000ff', '#ffff00', '#00ff00', ' #666699',  '#ff00ff'];

const board = document.getElementById('board');
const scoreDiv = document.getElementById('score');

const blockNum = 10;
const blockBorder = 2;
let boardSize = 600;
const transitionTime = 0.25;
const blockSize = boardSize / blockNum;
boardSize += blockNum * 2 * blockBorder;
const blockInfo = [];
const blockThreshold = 2;

let score = 0;

Object.assign(document.getElementById('main').style, {
    display :   'flex',
    alignItems: 'center',
    justifyContent: 'space-around'
})

const style = {
    height  :   `${boardSize}px`,
    width   :   `${boardSize}px`,
    position:   'relative',
};

Object.assign(board.style, style);


let clicked = -1;

function getTopLeftNum(elem){
    const topString = elem.style.top;
    const leftString = elem.style.left;
    const top = Number(topString.slice(0, topString.indexOf('px')));
    const left = Number(leftString.slice(0, leftString.indexOf('px')));
    return [top, left];
}



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

function normalSize(elem){
    elem.style.height = `${blockSize}px`,
    elem.style.width = `${blockSize}px`;
    const id = Number(elem.id);
    elem.style.top = `${blockInfo[id].top}px`;
    elem.style.left = `${blockInfo[id].left}px`;
    elem.style.zIndex = '0';
}

function mouseOutHandle(e) {
    if(clicked === Number(e.target.id)) return;
    if(clicked === -2) {
        clicked = -1;
        return;
    }
    normalSize(e.target);
}

function unClick(elem) {
    elem.style.borderColor = '#000000';
    elem.style.zIndex = '0';
    clicked = -2;
}

function checkSC(index, relPos, step, valid) {
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
    }
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

function awardPoints(combination, amount){
    if(combination === "line") {
        if(amount === blockThreshold + 1) score += 10;   // 10 point for a line 1 block bigger than the threshold
        else if(amount === blockThreshold + 2) score += 30;// 30 points for a line 2 blocks bigger than the threshold
        else if(amount === blockThreshold + 3) score += 50;// 50 points for a line 3 blocks bigger than the threshold
        else if(amount >= blockThreshold + 4) score += 100; // 100 points for a line 4 or more blocks bigger than the threshold
    }
    scoreDiv.innerHTML = `Current Score:<br/>${score}`;
}

function checkDestroy(id) {
    const ret = [];
    let [left, right, up, down] = [checkSC(id, 'left'), checkSC(id, 'right'), checkSC(id, 'up'), checkSC(id, 'down')];
    if(left + right >= blockThreshold) {
        awardPoints('line', left + right + 1);
        while(left) ret.push(id - (left--));
        ret.push(id);
        for(let i = 0; i < right; i++) ret.push(id + i + 1);
        return [ret, 'x'];
    }
    if(up + down >= blockThreshold) {
        awardPoints('line', up + down + 1);
        while(up) ret.push(id - blockNum * up--);
        ret.push(id);
        for(let i = 0; i < down; i++) ret.push(id + blockNum * (i + 1));
        return [ret, 'y'];
    }
    return [null, null];
}

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

function destroyBlocks(toDestroy){
    for(i of toDestroy) document.getElementById(`${i}`).remove();
    return;
}


async function shiftBlocks(list) {
    return new Promise((res, rej) => {
        try{
            const divs = [];
            for(let shiftRule of list) divs.push(document.getElementById(`${shiftRule.from}`));
            for(let index = divs.length - 1; index >= 0; index--) {
                divs[index].style.setProperty('transition', `all ${transitionTime}s`);
                divs[index].style.top = blockInfo[list[index].to].top + 'px';
                divs[index].style.left = blockInfo[list[index].to].left + 'px';
                divs[index].id = `${list[index].to}`;

            }
            setTimeout(() => {
                try{
                    for(div of divs) div.style.removeProperty('transition');
                    res();
                } catch(e) {
                    console.log(e);
                    rej(e);
                }
            }, transitionTime * 1000);
        } catch(e) {
            console.log(e);
            rej(e);
        }
    })
}

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

// function moveBlocks(toMove){
//     for(const moveRule of toMove) {
//         const div = document.getElementById(`${moveRule.fom}`);
//         div.id = moveRule.to;
//         div.style.top = blockInfo[moveRule.to].top + "px";
//         div.style.left = blockInfo[moveRule.to].left + "px";
//         blockInfo[moveRule.to].color = blockInfo[moveRule.from].color;
//     }
// }

async function controlDestruction(index) { 
    return new Promise( async (res, rej) => {
        let [toDestroy, axis] = checkDestroy(index);
        if(!toDestroy) return res(); // don't have to destroy anything
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

        // destroyBlocks(toDestroy); // destroys the listed blocks
        // moveBlocks(toMove); // moves the listed blocks
        // createBlocks(toCreate); // created the listed blocks
        try{
            await (async () => new Promise((res, rej) => {
                const destroyLA = animateDestroyBlocks(toDestroy);
                destroyLA.onfinish = () => {
                    destroyBlocks(toDestroy);
                    const moveLA = moveAndAnimateBlocks(toMove);
                    if(!moveLA) {
                        const createLA = createAndAnimateBlocks(toCreate);
                        createLA.onfinish = () => {
                            return res();
                        };
                    } else {
                        moveLA.onfinish = () => {
                            // moveBlocks(toMove);
                            const createLA = createAndAnimateBlocks(toCreate);
                            createLA.onfinish = () => {
                                return res();
                            };
                        };
                    }
                };
            }))();
        } catch (e) { 
            console.log(e);
            rej(e);
        }
        for(const elem of toMove) await controlDestruction(elem.to);
        for(const elem of toCreate) await controlDestruction(elem);
    });
}

function changeElemPos(aElem, bElem, time) {
    normalSize(bElem);
    normalSize(aElem);
    const [aTop, aLeft] = getTopLeftNum(aElem);
    const [bTop, bLeft] = getTopLeftNum(bElem);
    aElem.style.setProperty('transition', `all ${time}s`);
    bElem.style.setProperty('transition', `all ${time}s`);
    aElem.style.top = bTop + 'px';
    aElem.style.left = bLeft + 'px';
    bElem.style.top = aTop + 'px';
    bElem.style.left = aLeft + 'px';
    setTimeout(() => {
        bElem.style.removeProperty('transition');
        aElem.style.removeProperty('transition');
    }, time * 1000);
    [aElem.id, bElem.id] = [bElem.id, aElem.id];
    aId = Number(aElem.id);
    bId = Number(bElem.id);
    [blockInfo[aId].color, blockInfo[bId].color] = [blockInfo[bId].color, blockInfo[aId].color];
}

function clickHandle(e) {
    if(clicked === -2) return;
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
            changeElemPos(document.getElementById(String(tempClicked)), e.target, transitionTime);
            controlDestruction(id);
            controlDestruction(tempClicked);
            return;
        } 

    }  else {
        normalSize(e.target);
        e.target.style.borderColor = '#ffffff';
        e.target.style.zIndex = '1';
        clicked = id;
    }
}


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



