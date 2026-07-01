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
        this.gameMode === "pve" ? "AI" : scn.querySelector("#p2name").value;

      if (p1name.length < 3 || p1name.length > 10) {
        this.ui.flashError("p1name");
        return;
      }

      if (this.gameMode === "pvp") {
        if (p2name.length < 3 || p2name.length > 10) {
          this.ui.flashError("p2name");
          return;
        }
      }

      this.p1 = new Player(p1name);
      this.p2 = new Player(p2name);

      this.ui.displayInfoAndBoards();
      this.ui.updateInfo(`${this.p1.name} place your ships.`);
      this.placementBoard = this.ui.displayPlacementBoard(
        this.p1,
        this.gameMode,
      );
      this.p1BoardDisplay = this.ui.displayBoard(this.p1, true);
      this.ui.updateShipPlacement(this.p1);
      this.placeShipsEvents(this.p1, this.p1BoardDisplay);
    });

    this.startScreen.addEventListener("change", (event) => {
      if (event.target.type === "radio") {
        const mode = event.target.value;
        this.ui.updatePlayer2(mode);
      }
    });
  }

  placeShipsEvents(player, playerBoardDisplay) {
    this.placementBoard.addEventListener("click", (event) => {
      const btn = event.target.closest(".btns");
      if (!btn) return;

      const action = btn.dataset.action;

      switch (action) {
        case "place":
          if (player.shipsToPlace.length === 0) {
            this.ui.updateInfo(
              "All ships are placed. Ready to start the game.",
            );
            return;
          }

          const shipLen = player.shipsToPlace.pop();
          try {
            const [x, y, dir] = this.parseInput();
            player.board.place(new Ship(shipLen), x, y, dir);
            this.ui.updateInfo("Ship placement succesful.");
            this.ui.removeBoard(playerBoardDisplay);
            playerBoardDisplay = this.ui.displayBoard(player, true);
            this.ui.updateShipPlacement(player);
            this.ui.resetInput("coords");
          } catch (err) {
            player.shipsToPlace.push(shipLen);
            this.ui.updateInfo(err.message);
            this.ui.flashError("coords");
          }
          break;
        case "random":
          this.randomShipPlacement(player);
          this.ui.removeBoard(playerBoardDisplay);
          playerBoardDisplay = this.ui.displayBoard(player, true);
          this.ui.updateInfo("All ships are placed. Ready to start the game.");
          this.ui.updateShipPlacement(player);
          break;
        case "restart":
          const playerName = player.name;
          player = new Player(playerName);
          this.ui.updateInfo("Start placing ships from the beggining again.");
          this.ui.removeBoard(playerBoardDisplay);
          playerBoardDisplay = this.ui.displayBoard(player, true);
          this.ui.updateShipPlacement(player);
          break;
        case "next":
          this.ui.displayInfoAndBoards();
          this.ui.updateInfo(`${this.p2.name} place your ships.`);
          this.placementBoard = this.ui.displayPlacementBoard(this.p2);
          this.p2BoardDisplay = this.ui.displayBoard(this.p2, true);
          this.ui.updateShipPlacement(this.p2);
          this.placeShipsEvents(this.p2, this.p2BoardDisplay);
          break;
        case "start":
          if (player.shipsToPlace.length !== 0) {
            this.ui.updateInfo("You still have ships to place!");
            return;
          }

          if (this.gameMode === "pve") {
            this.randomShipPlacement(this.p2);
            this.p2.resetMadeAttacks();
          }

          this.ui.displayInfoAndBoards();
          this.ui.updateInfo("Let the battle begin!");
          this.p1BoardDisplay = this.ui.displayBoard(this.p1, true);
          this.p2BoardDisplay = this.ui.displayBoard(this.p2, false);
          this.addBoardListener();
          break;
        default:
      }
    });
  }

  parseInput() {
    const letterToCoord = "ABCDEFGHIJ".split("");
    const coords = document.querySelector("#coords").value;

    if (coords.length !== 2) {
      throw new RangeError("Coordinates need two symbols. Example: G6");
    }

    const [xString, yString] = coords.split("");

    if (!letterToCoord.includes(xString.toUpperCase())) {
      throw new TypeError("First symbol must be a letter. (A-J)");
    }

    const x = letterToCoord.findIndex(
      (letter) => letter === xString.toUpperCase(),
    );
    const y = parseInt(yString);

    if (isNaN(y)) {
      throw new TypeError("Second symbol must be a number.");
    }

    const direction =
      document.querySelector("[name='direction']:checked").value ===
      "horizontal";

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
      else {
        this.ui.blockBoardClicks();
        setTimeout(() => {
          this.ui.changeBoardDimnes();
          this.ui.updateInfo(
            `Preparing for ${this.p2.name}'s turn. Click anywhere to continue.`,
          );
          this.ui.hideShips(this.p1BoardDisplay);
          window.addEventListener(
            "click",
            () => {
              this.ui.changeBoardDimnes();
              this.ui.unblockBoardClicks();
              this.ui.updateInfo(`Make your move, ${this.p2.name}`);
              this.ui.revealShips(this.p2BoardDisplay);
            },
            { once: true },
          );
        }, 1500);
      }
    });

    this.p1BoardDisplay.addEventListener("click", (event) => {
      const tile = event.target.closest(".tile");
      if (!tile) return;

      const status = tile.dataset.status;
      if (status) return;

      const x = parseInt(tile.dataset.x);
      const y = parseInt(tile.dataset.y);
      const result = this.p1.board.recieveAttack(x, y);
      this.ui.updateTile(tile, result, this.p1BoardDisplay);

      this.attackOutcome(result, this.p2, this.p1);

      if (this.gameOver) return;

      this.ui.blockBoardClicks();
      setTimeout(() => {
        this.ui.changeBoardDimnes();
        this.ui.updateInfo(
          `Preparing for ${this.p1.name}'s turn. Click anywhere to continue.`,
        );
        this.ui.hideShips(this.p2BoardDisplay);
        window.addEventListener(
          "click",
          () => {
            this.ui.changeBoardDimnes();
            this.ui.unblockBoardClicks();
            this.ui.updateInfo(`Make your move, ${this.p1.name}`);
            this.ui.revealShips(this.p1BoardDisplay);
          },
          { once: true },
        );
      }, 1500);
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
        this.ui.revealShips(this.p1BoardDisplay);
        this.ui.revealShips(this.p2BoardDisplay);
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
