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

  displayBoard(boardData, revealed) {
    const board = this._makeChildOf(this.main, "div", { className: "board" });

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const tile = this._makeChildOf(board, "div", { className: "tile" });
        tile.dataset.x = x;
        tile.dataset.y = y;
        tile.dataset.status = "";

        if (revealed) {
          if (boardData.grid[x][y] > -1) tile.classList.add("ship");
        }
      }
    }

    return board;
  }

  updateTile(tile, result) {
    tile.textContent = "X";
    if (result === "HIT" || result === "SUNK") tile.dataset.status = "hit";
    else tile.dataset.status = "miss";
  }
}
