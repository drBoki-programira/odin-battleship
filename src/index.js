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

      if (this.gameMode === "pvp") {
        alert("Not implemented yet!")
        return
      }

      if (p1name.length < 3 || p1name.length > 10) {
        this.ui.flashError("p1name")
        return
      }

      this.p1 = new Player(p1name);
      this.p2 = new Player(p2name);

      this.ui.displayInfoAndBoards();
      this.placementBoard = this.ui.displayPlacementBoard(this.p1);
      this.p1BoardDisplay = this.ui.displayBoard(this.p1, true);
      this.ui.updateShipPlacement(this.p1);
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
    this.placementBoard.addEventListener("click", (event) => {
      const container = event.currentTarget;
      const btn = event.target.closest(".btns");
      if (!btn) return;

      const action = btn.dataset.action;

      switch (action) {
        case "place":
          const shipLen = this.p1.shipsToPlace.pop();
          try {
            const [x, y, dir] = this.parseInput();
            this.p1.board.place(new Ship(shipLen), x, y, dir);
            this.ui.updateInfo("Ship placement succesful");
            this.ui.removeBoard(this.p1BoardDisplay);
            this.p1BoardDisplay = this.ui.displayBoard(this.p1, true);
            this.ui.updateShipPlacement(this.p1);
          } catch (err) {
            this.p1.shipsToPlace.push(shipLen);
            this.ui.updateInfo(err.message);
          }
          break;
        case "random":
          this.randomShipPlacement(this.p1);
          this.ui.removeBoard(this.p1BoardDisplay);
          this.p1BoardDisplay = this.ui.displayBoard(this.p1, true);
          this.ui.updateInfo("All ships are placed. Ready for game start.");
          this.ui.updateShipPlacement(this.p1);
          break;
        case "start":
          if (this.gameMode === "pve") {
            this.randomShipPlacement(this.p2);
            this.p2.resetMadeAttacks();
          }

          this.ui.displayInfoAndBoards();
          this.p1BoardDisplay = this.ui.displayBoard(this.p1, true);
          this.p2BoardDisplay = this.ui.displayBoard(this.p2, false);
          this.addBoardListener();
        default:
      }
    });
  }

  parseInput() {
    const coords = document.querySelector("#coords").value;
    const [x, y] = coords.split("").map((coord) => parseInt(coord));
    const direction = document.querySelector("[name='direction']:checked").value === "horizontal"

    return [x, y, direction];
  }

  randomShipPlacement(player) {
    const shipsToPlace = player.shipsToPlace;

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
      this.ui.updateTile(tile, result, this.p2BoardDisplay);

      this.attackOutcome(result, this.p1, this.p2);

      if (this.gameOver) return;

      if (this.gameMode === "pve") this.AIAttack();
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

  AIAttack() {
    this.ui.blockBoardClicks();
    setTimeout(() => {
      this.ui.unblockBoardClicks();
      const prioAtts = this.p2.priorityAttack;
      let coords;

      if (prioAtts.length > 0) {
        let strCoords = prioAtts.at(Math.floor(Math.random * prioAtts.length));
        console.log("Attacked: ", strCoords);
        coords = JSON.parse(strCoords);
      } else {
        coords = this.p2.randomCoords();
      }

      const [x, y] = coords;
      const result = this.p1.board.recieveAttack(x, y);
      this.p2.parseAttackResult(coords, result);

      const tile = this.p1BoardDisplay.querySelector(
        `[data-x="${x}"][data-y="${y}"]`,
      );
      this.ui.updateTile(tile, result, this.p1BoardDisplay);
      this.attackOutcome(result, this.p2, this.p1);
    }, 1500);
  }
}

const game = new Game();
game.init();
