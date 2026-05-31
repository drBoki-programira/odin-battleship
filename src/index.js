import "./styles.css";
import { Ship, Player } from "./objects";
import DOMHandler from "./display";

class Game {
  constructor() {
    this.p1 = new Player("P1 name");
    this.p2 = new Player("P2 name");
    this.ui = new DOMHandler();
    this.gameMode = "pve";
  }

  init() {
    this.placeShips();
    this.p1BoardDisplay = this.ui.displayBoard(this.p1.board, true);
    this.p2BoardDisplay = this.ui.displayBoard(this.p2.board, false);
    this.addBoardListener();
  }

  placeShips() {
    this.p1.board.place(new Ship(4), 0, 0, true);
    this.p1.board.place(new Ship(3), 2, 0, false);
    this.p1.board.place(new Ship(2), 0, 6, true);
    this.p1.board.place(new Ship(1), 2, 6, true);

    this.p2.board.place(new Ship(4), 4, 4, true);
    this.p2.board.place(new Ship(3), 6, 0, false);
    this.p2.board.place(new Ship(2), 8, 8, true);
    this.p2.board.place(new Ship(1), 1, 2, true);
  }

  addBoardListener() {
    this.p2BoardDisplay.addEventListener("click", (event) => {
      const tile = event.target.closest(".tile");
      if (!tile) return;

      const status = tile.dataset.status;
      if (status) return;

      const x = parseInt(tile.dataset.x);
      const y = parseInt(tile.dataset.y);
      const result = this.p2.board.recieveAttack(x, y);
      this.ui.updateTile(tile, result);

      if (result === "SUNK" && this.p2.board.allSunken())
        console.log("GAME OVER");

      if (this.gameMode === "pve") this.computerAttack();
    });
  }

  computerAttack() {
    const [x, y] = this.p2.randomAttack();
    const result = this.p1.board.recieveAttack(x, y);

    const tile = this.p1BoardDisplay.querySelector(
      `[data-x="${x}"][data-y="${y}"]`,
    );
    this.ui.updateTile(tile, result);

    if (result === "SUNK" && this.p1.board.allSunken())
      console.log("GAME OVER");
  }
}

const game = new Game();
game.init();
