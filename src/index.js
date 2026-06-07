import "./styles.css";
import { Ship, Player } from "./objects";
import DOMHandler from "./display";

class Game {
  constructor() {
    this.ui = new DOMHandler();
  }

  init() {
    this.startScreen = this.ui.displayStartScreen()
    this.startScreenEvents()
  }

  startScreenEvents() {
    this.startScreen.addEventListener("click", (event) => {
      const scn = event.currentTarget
      const btn = event.target.closest("button")
      if (!btn) return

      this.gameMode = scn.querySelector("[name='mode']:checked").value
      const p1name = scn.querySelector("#p1name").value
      const p2name = this.gameMode === "pve" ? "AI" : scn.querySelector("#p2name>input").value
      
      this.p1 = new Player(p1name);
      this.p2 = new Player(p2name);
      
      this.placeShipsStage()
    })

    this.startScreen.addEventListener("change", (event) => {
      if (event.target.type === "radio") {
        const mode = event.target.value
        this.ui.updatePlayer2(mode)
      }
    })
  }

  placeShipsStage() {
    this.randomPlaceShips();
    this.p1BoardDisplay = this.ui.displayBoard(this.p1, true);
    this.p2BoardDisplay = this.ui.displayBoard(this.p2, false);
    this.addBoardListener();
  }

  randomPlaceShips() {
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
