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

  displayStartScreen() {
    this.main.innerHTML = "";
    const content = this._makeChildOf(this.main, "div", {
      className: "base",
      id: "start-screen",
    });

    this._makeChildOf(content, "h2", { textContent: "Welcome to the game" });
    this._makeChildOf(content, "h4", { textContent: "Choose game mode" });

    const modes = this._makeChildOf(content, "div", {});
    const pveLabel = this._makeChildOf(modes, "label", {
      className: "radio-field",
      textContent: "PvE",
    });
    this._makeChildOf(pveLabel, "input", {
      type: "radio",
      id: "pve",
      name: "mode",
      value: "pve",
      checked: true,
    });
    this._makeChildOf(modes, "span", { textContent: "or" });
    const pvpLabel = this._makeChildOf(modes, "label", {
      className: "radio-field",
      textContent: "PvP",
    });
    this._makeChildOf(pvpLabel, "input", {
      type: "radio",
      id: "pvp",
      name: "mode",
      value: "pvp",
    });

    const nameLabels = this._makeChildOf(content, "div", {
      className: "center-children",
    });
    this._makeChildOf(nameLabels, "h4", { textContent: "Enter player names" });
    this._makeChildOf(nameLabels, "p", {
      textContent: "(between 3 and 10 characters)",
    });

    this.names = this._makeChildOf(content, "div", {
      className: "row",
      id: "player-names",
    });
    const p1Label = this._makeChildOf(this.names, "label", {
      textContent: "Player 1",
    });
    this._makeChildOf(p1Label, "input", {
      className: "inputs",
      type: "text",
      id: "p1name",
      name: "p1name",
      minlength: 3,
      maxlength: 10,
    });
    this._makeChildOf(this.names, "span", { textContent: "vs." });
    this._makeChildOf(this.names, "div", {
      className: "ai-label",
      textContent: "AI",
      id: "p2label",
    });

    this._makeChildOf(content, "button", {
      className: "btns",
      textContent: "Place ships",
    });

    return content;
  }

  updatePlayer2(mode) {
    const p2 = this.names.querySelector("#p2label");
    p2.remove();

    if (mode === "pvp") {
      const p2Label = this._makeChildOf(this.names, "label", {
        textContent: "Player 2",
        id: "p2label",
      });
      this._makeChildOf(p2Label, "input", {
        className: "inputs",
        type: "text",
        name: "p2name",
        id: "p2name",
        minlength: 3,
        maxlength: 10,
      });
    } else {
      this._makeChildOf(this.names, "div", {
        className: "ai-label",
        textContent: "AI",
        id: "p2label",
      });
    }
  }

  displayInfoAndBoards() {
    this.main.innerHTML = "";

    this.info = this._makeChildOf(this.main, "div", {
      className: "base",
      id: "info-text",
    });

    this.boards = this._makeChildOf(this.main, "div", {
      className: "row",
      id: "boards",
    });
  }

  updateInfo(message) {
    this.info.textContent = message;
  }

  displayPlacementBoard(player, mode) {
    const ships = player.shipsToPlace;
    let shipIdx = 0;
    const placement = this._makeChildOf(this.boards, "div", {
      className: "base",
      id: "ship-placement",
    });

    this._makeChildOf(placement, "p", {
      textContent:
        "Place highlited ship on the board by entering coordinates to drop anchor on and chose direction of your ship... Or just click random placement.",
    });

    const shipDisplay = this._makeChildOf(placement, "div", {
      id: "ship-display",
    });
    for (let ship of ships) {
      const shipElement = this._makeChildOf(shipDisplay, "div", {
        className: "ship-element",
      });
      shipElement.dataset.idx = shipIdx;
      shipElement.dataset.placement = "docked";
      shipIdx++;

      for (let i = 0; i < ship; i++) {
        this._makeChildOf(shipElement, "div", { className: "ship-section" });
      }
    }

    const rowInput = this._makeChildOf(placement, "div", { className: "row" });
    const coordLabel = this._makeChildOf(rowInput, "label", {
      textContent: "Coordinates",
    });
    this._makeChildOf(coordLabel, "input", {
      className: "inputs",
      type: "text",
      id: "coords",
      name: "coords",
      maxlength: 2,
    });
    const dir = this._makeChildOf(rowInput, "div", {});
    this._makeChildOf(dir, "div", { textContent: "Direction" });
    const dirRadios = this._makeChildOf(dir, "div", { id: "dir-radios" });
    const horLabel = this._makeChildOf(dirRadios, "label", {
      className: "radio-field horizontal",
    });
    this._makeChildOf(horLabel, "input", {
      type: "radio",
      id: "horizontal",
      name: "direction",
      value: "horizontal",
      checked: true,
    });
    const verLabel = this._makeChildOf(dirRadios, "label", {
      className: "radio-field vertical",
    });
    this._makeChildOf(verLabel, "input", {
      type: "radio",
      id: "vertical",
      name: "direction",
      value: "vertical",
    });
    const placeBtn = this._makeChildOf(rowInput, "button", {
      className: "btns",
      textContent: "Place Ship",
    });
    placeBtn.dataset.action = "place";

    const rowBtns = this._makeChildOf(placement, "div", {
      className: "row",
      id: "plc-btns",
    });
    const rngBtn = this._makeChildOf(rowBtns, "button", {
      className: "btns",
      textContent: "Random",
    });
    rngBtn.dataset.action = "random";
    const restartBtn = this._makeChildOf(rowBtns, "button", {
      className: "btns",
      textContent: "Restart",
    });
    restartBtn.dataset.action = "restart";
    const startBtn = this._makeChildOf(rowBtns, "button", {
      className: "btns",
      textContent: "Start Game",
    });
    startBtn.dataset.action = "start";
    if (mode === "pvp") {
      startBtn.textContent = "Next Player";
      startBtn.dataset.action = "next";
    }

    return placement;
  }

  updateShipPlacement(player) {
    const len = player.shipsToPlace.length - 1;
    const shipELements = document.querySelectorAll(".ship-element");
    shipELements.forEach((ship) => {
      const idx = parseInt(ship.dataset.idx);
      if (len === idx) ship.dataset.placement = "pending";
      else if (len < idx) ship.dataset.placement = "anchored";
      else ship.dataset.placement = "docked";
    });
  }

  displayBoard(player, revealed) {
    const playerBoard = this._makeChildOf(this.boards, "div", {
      className: "base",
    });
    this._makeChildOf(playerBoard, "div", {
      className: "board-name",
      textContent: player.name,
    });
    const boardTiles = this._makeChildOf(playerBoard, "div", {
      className: "board-tiles",
    });
    const rowLabels = "ABCDEFGHIJ".split("");
    const columnLabels = "0123456789".split("");
    columnLabels.unshift("");

    for (let x = -1; x < 10; x++) {
      for (let y = -1; y < 10; y++) {
        const tile = this._makeChildOf(boardTiles, "div", {
          className: "tile",
        });

        if (x === -1) {
          tile.textContent = columnLabels[y + 1];
          tile.className = "label";
        } else if (y === -1) {
          tile.textContent = rowLabels[x];
          tile.className = "label";
        } else {
          tile.dataset.x = x;
          tile.dataset.y = y;
          tile.dataset.status = "";
          tile.dataset.id = player.board.grid[x][y];

          if (revealed) {
            if (player.board.grid[x][y] > -1) tile.classList.add("ship");
          }
        }
      }
    }

    if (!revealed) boardTiles.dataset.visible = "no";

    return playerBoard;
  }

  updateTile(tile, result, board) {
    tile.textContent = "X";
    if (result === "HIT") tile.dataset.status = "hit";
    else if (result === "SUNK") {
      const shipID = tile.dataset.id;
      const shipSections = board.querySelectorAll(`.tile[data-id="${shipID}"`);
      shipSections.forEach((section) => (section.dataset.status = "sunk"));
    } else tile.dataset.status = "miss";
  }

  removeBoard(boardElement) {
    boardElement.remove();
  }

  blockBoardClicks() {
    const boards = document.querySelectorAll(".board-tiles");
    boards.forEach((board) => board.classList.add("blocked"));
  }

  unblockBoardClicks() {
    const boards = document.querySelectorAll(".board-tiles");
    boards.forEach((board) => board.classList.remove("blocked"));
  }

  flashError(selector) {
    const element = document.getElementById(selector);

    element.classList.toggle("invalid");
    setTimeout(() => {
      element.classList.toggle("invalid");
      element.value = "";
      element.focus();
    }, 1000);
  }

  resetInput(selector) {
    const element = document.getElementById(selector);
    element.value = "";
    element.focus();
  }

  revealShips(boardElement) {
    const boardTiles = boardElement.querySelector(".board-tiles");
    boardTiles.dataset.visible = "yes";
    const allTiles = [...boardElement.querySelectorAll(".tile[data-id]")];
    const hiddenShips = allTiles.filter((tile) => tile.dataset.id > -1);
    hiddenShips.forEach((ship) => ship.classList.add("ship"));
  }

  hideShips(boardElement) {
    const boardTiles = boardElement.querySelector(".board-tiles");
    boardTiles.dataset.visible = "no";
    const hiddenShips = boardElement.querySelectorAll(".ship[data-status='']");
    hiddenShips.forEach((ship) => ship.classList.remove("ship"));
  }

  changeBoardDimnes() {
    const boards = document.querySelectorAll(".board-tiles");
    boards.forEach((board) => board.classList.toggle("dim"));
  }
}
