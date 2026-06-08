import "./styles.css";
import { Ship, Player } from "./objects";
import DOMHandler from "./display";

class Game {
  constructor() {
    this.ui = new DOMHandler();
    this.gameOver = false;
  }

  init() {
    this.startScreen = this.ui.displayStartScreen();
    this.startScreenEvents();
  }

  startScreenEvents() {
    this.startScreen.addEventListener("click", (event) => {
      const scn = event.currentTarget;
      const btn = event.target.closest("button");
      if (!btn) return;

      this.gameMode = scn.querySelector("[name='mode']:checked").value;
      const p1name = scn.querySelector("#p1name").value;
      const p2name =
        this.gameMode === "pve"
          ? "AI"
          : scn.querySelector("#p2name>input").value;

      this.p1 = new Player(p1name);
      this.p2 = new Player(p2name);

      this.placementScreen = this.ui.displayPlaceShips();
      this.p1BoardDisplay = this.ui.displayBoard(this.p1, true);
      this.placeShipsEvents();
    });

    this.startScreen.addEventListener("change", (event) => {
      if (event.target.type === "radio") {
        const mode = event.target.value;
        this.ui.updatePlayer2(mode);
      }
    });
  }

  placeShipsEvents() {
    this.placementScreen.addEventListener("click", (event) => {
      const btn = event.target.closest(".btn");
      if (!btn) return;

      const action = btn.dataset.action;

      switch (action) {
        case "random":
          this.randomShipPlacement(this.p1);
          this.ui.removeBoard(this.p1BoardDisplay);
          this.p1BoardDisplay = this.ui.displayBoard(this.p1, true);
          break;
        case "start":
          this.randomShipPlacement(this.p2);
          this.ui.displayGameScreen();
          this.p1BoardDisplay = this.ui.displayBoard(this.p1, true);
          this.p2BoardDisplay = this.ui.displayBoard(this.p2, false);
          this.addBoardListener();
        default:
      }
    });
  }

  randomShipPlacement(player) {
    const shipsToPlace = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

    while (shipsToPlace.length > 0) {
      const shipLen = shipsToPlace.pop();
      try {
        const [x, y] = player.randomCoords();
        const direction = Math.random() >= 0.5;
        player.board.place(new Ship(shipLen), x, y, direction);
      } catch {
        shipsToPlace.push(shipLen);
      }
    }
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

      this.attackOutcome(result, this.p1, this.p2);

      if (this.gameOver) return;

      if (this.gameMode === "pve") this.computerAttack();
    });
  }

  attackOutcome(result, attacker, reciever) {
    if (result === "HIT") {
      this.ui.updateInfo(
        `${attacker.name} has HIT the ship of ${reciever.name}!`,
      );
    } else if (result === "SUNK") {
      if (reciever.board.allSunken()) {
        this.gameOver = true;
        this.ui.updateInfo(`GAME OVER. ${attacker.name} wins!`);
        this.ui.blockBoardClicks();
      } else {
        this.ui.updateInfo(
          `${attacker.name} has SUNK the ship of ${reciever.name}!`,
        );
      }
    } else {
      this.ui.updateInfo(`${attacker.name} attacks... And it's a MISS!`);
    }
  }

  computerAttack() {
    this.ui.blockBoardClicks();
    setTimeout(() => {
      this.ui.unblockBoardClicks();
      const [x, y] = this.p2.randomCoords();
      const result = this.p1.board.recieveAttack(x, y);

      const tile = this.p1BoardDisplay.querySelector(
        `[data-x="${x}"][data-y="${y}"]`,
      );
      this.ui.updateTile(tile, result);
      this.attackOutcome(result, this.p2, this.p1);
    }, 1500);
  }
}

const game = new Game();
game.init();
