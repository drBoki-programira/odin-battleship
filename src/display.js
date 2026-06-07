export default class DOMHandler {
  constructor() {
    this.main = document.getElementById("content");
  }

  _makeChildOf(parent, tag, properties) {
    const child = document.createElement(tag);

    for (const [property, value] of Object.entries(properties)) {
      child[property] = value;
    }

    parent.appendChild(child);

    return child;
  }

  displayBoard(player, revealed) {
    const board = this.main.querySelector(".boards")

    const playerBoard = this._makeChildOf(board, "div", {})
    this._makeChildOf(playerBoard, "h2", {"textContent": player.name})
    const boardTiles = this._makeChildOf(playerBoard, "div", { className: "board-tiles" });

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const tile = this._makeChildOf(boardTiles, "div", { className: "tile" });
        tile.dataset.x = x;
        tile.dataset.y = y;
        tile.dataset.status = "";

        if (revealed) {
          if (player.board.grid[x][y] > -1) tile.classList.add("ship");
        }
      }
    }

    return playerBoard;
  }

  updateTile(tile, result) {
    tile.textContent = "X";
    if (result === "HIT" || result === "SUNK") tile.dataset.status = "hit";
    else tile.dataset.status = "miss";
  }

  displayStartScreen() {
    this.main.innerHTML = ""
    const content = this._makeChildOf(this.main, "div", {"id": "start-screen"})

    this._makeChildOf(content, "h2", {"textContent": "Welcome to the game"})
    this._makeChildOf(content, "h4", {"textContent": "Choose game mode: "})
    
    const modes = this._makeChildOf(content, "div", {})
    const pveLabel = this._makeChildOf(modes, "label", {"textContent": "PvE"})
    this._makeChildOf(pveLabel, "input", {"type": "radio", "id": "pve", "name": "mode", "value": "pve", "checked": true})
    const pvpLabel = this._makeChildOf(modes, "label", {"textContent": "PvP"})
    this._makeChildOf(pvpLabel, "input", {"type": "radio", "id": "pvp", "name": "mode", "value": "pvp"})

    this._makeChildOf(content, "h4", {"textContent": "Enter player names: "})
    
    this.names = this._makeChildOf(content, "div", {"id": "radio-btns"})
    const p1Label = this._makeChildOf(this.names, "label", {"textContent": "Player 1"})
    this._makeChildOf(p1Label, "input", {"type": "text", "id": "p1name", "name": "p1name"})
    this._makeChildOf(this.names, "h5", {"textContent": "AI", "id": "p2name"})

    this._makeChildOf(content, "button", {"textContent": "Place ships"})

    return content
  }

  updatePlayer2 (mode) {
    const p2 = this.names.querySelector("#p2name")
    p2.remove()

    if (mode === "pvp") {
      const p2Label = this._makeChildOf(this.names, "label", {"textContent": "Player 2", "id": "p2name"})
      this._makeChildOf(p2Label, "input", {"type": "text", "name": "p2name"})
    } else {
      this._makeChildOf(this.names, "h5", {"textContent": "AI", "id": "p2name"})
    }
  }

  displayPlaceShips () {
    this.main.innerHTML = ""

    this.info = this._makeChildOf(this.main, "div", {"id": "info-text", "textContent": "Ship placement"})

    const placement = this._makeChildOf(this.main, "div", {"id": "ship-placement"})
    const rngBtn = this._makeChildOf(placement, "button", {"className": "btn", "textContent": "Random Placement"})
    rngBtn.dataset.action = "random"
    const startBtn = this._makeChildOf(placement, "button", {"className": "btn", "textContent": "Start Game"})
    startBtn.dataset.action = "start"

    this._makeChildOf(this.main, "div", {"className": "boards"})

    return placement
  }

  updateInfo(message) {
    this.info.textContent = message
  }

  displayGameScreen () {
    this.main.innerHTML = ""

    this.info = this._makeChildOf(this.main, "div", {"id": "info-text", "textContent": "Game loop"})

    this._makeChildOf(this.main, "div", {"className": "boards"})
  }

  removeBoard (boardElement) {
    boardElement.remove()
  }

  blockBoardClicks (yes, board) {
    if (yes) board.classList.add("blocked")
    else board.classList.remove("blocked")
  }
}
