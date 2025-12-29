// game.js - 完整游戏逻辑
console.log('大富翁游戏加载中...');

// 游戏配置
const CONFIG = {
    START_MONEY: 1500,
    BOARD_SIZE: 40,
    PLAYER_COLORS: ['#FF5252', '#448AFF', '#69F0AE', '#FFD740']
};

// 游戏状态
let gameState = {
    players: [],
    currentPlayer: 0,
    gameStarted: false,
    roomId: null,
    board: []
};

// 初始化游戏
function initGame() {
    console.log('初始化游戏...');
    createBoard();
    createDemoPlayers();
    renderBoard();
}

// 创建棋盘
function createBoard() {
    const board = [];
    
    // 定义棋盘格子
    const cellTypes = [
        { type: 'start', name: '起点', action: 'collect' },
        { type: 'property', name: '地中海', price: 60, color: '#8B4513' },
        { type: 'chest', name: '机会', action: 'chance' },
        { type: 'property', name: '北非', price: 60, color: '#8B4513' },
        { type: 'tax', name: '所得税', amount: 200 },
        { type: 'railroad', name: '火车站', price: 200 },
        { type: 'property', name: '中东', price: 100, color: '#87CEEB' },
        { type: 'chance', name: '机会', action: 'chance' },
        { type: 'property', name: '土耳其', price: 100, color: '#87CEEB' },
        { type: 'property', name: '巴尔干', price: 120, color: '#87CEEB' },
        { type: 'jail', name: '监狱', action: 'visit' },
        // ... 可以继续添加更多格子
    ];
    
    // 填充棋盘（简化版）
    for (let i = 0; i < CONFIG.BOARD_SIZE; i++) {
        const cell = cellTypes[i % cellTypes.length] || { type: 'property', name: `地产 ${i}`, price: 100 };
        board.push({
            id: i,
            ...cell,
            owner: null,
            houses: 0
        });
    }
    
    gameState.board = board;
}

// 创建演示玩家
function createDemoPlayers() {
    gameState.players = [
        {
            id: 1,
            name: '玩家1',
            color: CONFIG.PLAYER_COLORS[0],
            money: CONFIG.START_MONEY,
            position: 0,
            properties: [],
            inJail: false
        },
        {
            id: 2,
            name: '玩家2',
            color: CONFIG.PLAYER_COLORS[1],
            money: CONFIG.START_MONEY,
            position: 0,
            properties: [],
            inJail: false
        }
    ];
}

// 渲染棋盘
function renderBoard() {
    const container = document.getElementById('gameContainer');
    if (!container) return;
    
    let boardHTML = '<div class="board-container">';
    boardHTML += '<div class="board">';
    
    // 显示玩家信息
    boardHTML += '<div class="players-info">';
    gameState.players.forEach(player => {
        boardHTML += `
            <div class="player-info" style="border-left: 5px solid ${player.color};">
                <div class="player-name">${player.name}</div>
                <div class="player-money">💰 ${player.money}</div>
                <div class="player-position">📍 位置: ${player.position}</div>
            </div>
        `;
    });
    boardHTML += '</div>';
    
    // 显示棋盘格子
    boardHTML += '<div class="board-cells">';
    for (let i = 0; i < Math.min(12, gameState.board.length); i++) {
        const cell = gameState.board[i];
        boardHTML += `
            <div class="board-cell" style="border-color: ${cell.color || '#666'};">
                <div class="cell-name">${cell.name}</div>
                ${cell.price ? `<div class="cell-price">$${cell.price}</div>` : ''}
            </div>
        `;
    }
    boardHTML += '</div>';
    
    // 控制按钮
    boardHTML += `
        <div class="game-controls">
            <button onclick="rollDice()" class="control-btn">🎲 掷骰子</button>
            <button onclick="endTurn()" class="control-btn">⏭️ 结束回合</button>
            <button onclick="buyProperty()" class="control-btn">🏠 购买地产</button>
        </div>
        <div id="gameMessages" class="game-messages">
            <div>等待开始...</div>
        </div>
    `;
    
    boardHTML += '</div></div>';
    container.innerHTML = boardHTML;
}

// 游戏功能函数
function rollDice() {
    if (!gameState.gameStarted) {
        addGameMessage('游戏尚未开始！');
        return;
    }
    
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;
    
    const player = gameState.players[gameState.currentPlayer];
    const newPosition = (player.position + total) % CONFIG.BOARD_SIZE;
    player.position = newPosition;
    
    addGameMessage(`${player.name} 掷出 ${dice1}+${dice2}=${total}，移动到位置 ${newPosition}`);
    
    // 处理当前位置
    const currentCell = gameState.board[newPosition];
    handleCellAction(currentCell, player);
    
    renderBoard();
}

function handleCellAction(cell, player) {
    switch(cell.type) {
        case 'start':
            player.money += 200;
            addGameMessage(`${player.name} 经过起点，获得200元`);
            break;
        case 'property':
            if (!cell.owner) {
                addGameMessage(`${player.name} 来到了 ${cell.name}，可以购买`);
            } else if (cell.owner !== player.id) {
                const rent = Math.floor(cell.price * 0.1);
                player.money -= rent;
                addGameMessage(`${player.name} 支付租金 ${rent} 元`);
            }
            break;
        case 'tax':
            player.money -= cell.amount;
            addGameMessage(`${player.name} 缴纳税款 ${cell.amount} 元`);
            break;
    }
}

function buyProperty() {
    const player = gameState.players[gameState.currentPlayer];
    const cell = gameState.board[player.position];
    
    if (cell.type === 'property' && !cell.owner) {
        if (player.money >= cell.price) {
            player.money -= cell.price;
            cell.owner = player.id;
            player.properties.push(cell.id);
            addGameMessage(`${player.name} 购买了 ${cell.name}！`);
            renderBoard();
        } else {
            addGameMessage('资金不足！');
        }
    }
}

function endTurn() {
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    const nextPlayer = gameState.players[gameState.currentPlayer];
    addGameMessage(`轮到 ${nextPlayer.name} 的回合`);
    renderBoard();
}

function addGameMessage(message) {
    const messagesDiv = document.getElementById('gameMessages');
    if (messagesDiv) {
        const msg = document.createElement('div');
        msg.className = 'game-message';
        msg.innerHTML = `[${new Date().toLocaleTimeString().slice(0,5)}] ${message}`;
        messagesDiv.appendChild(msg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    console.log('游戏消息:', message);
}

// 开始游戏
function startGame() {
    gameState.gameStarted = true;
    gameState.currentPlayer = 0;
    addGameMessage('游戏开始！');
    renderBoard();
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}