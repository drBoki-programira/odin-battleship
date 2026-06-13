class Ship {
  constructor(length) {
    this.length = length;
    this.hits = 0;
  }

  hit() {
    if (this.hits !== this.length) this.hits++;
  }

  isSunk() {
    return this.hits === this.length;
  }
}

class Gameboard {
  constructor() {
    this.grid = Array.from({ length: 10 }, () => new Array(10).fill(-1));
    this.ships = [];
    this.occupiedCoords = new Set();
  }

  _addOccupiedCoords(x, y) {
    this.occupiedCoords.add(JSON.stringify([x - 1, y - 1]));
    this.occupiedCoords.add(JSON.stringify([x - 1, y]));
    this.occupiedCoords.add(JSON.stringify([x - 1, y + 1]));
    this.occupiedCoords.add(JSON.stringify([x, y - 1]));
    this.occupiedCoords.add(JSON.stringify([x, y]));
    this.occupiedCoords.add(JSON.stringify([x, y + 1]));
    this.occupiedCoords.add(JSON.stringify([x + 1, y - 1]));
    this.occupiedCoords.add(JSON.stringify([x + 1, y]));
    this.occupiedCoords.add(JSON.stringify([x + 1, y + 1]));
  }

  place(ship, x, y, horizontal) {
    if (horizontal) {
      if (y + ship.length > 10)
        throw RangeError("Can't place ship out of bounds.");
      for (let i = 0; i < ship.length; i++) {
        if (this.occupiedCoords.has(JSON.stringify([x, y + i])))
          throw RangeError("Can't place ship onto or next to another ship.");
      }
    } else {
      if (x + ship.length > 10)
        throw RangeError("Can't place ship out of bounds.");
      for (let i = 0; i < ship.length; i++) {
        if (this.occupiedCoords.has(JSON.stringify([x + i, y])))
          throw RangeError("Can't place ship onto or next to another ship.");
      }
    }

    this.ships.push(ship);
    const shipIdx = this.ships.length;

    if (horizontal) {
      for (let i = 0; i < ship.length; i++) {
        this.grid[x][y + i] += shipIdx;
        this._addOccupiedCoords(x, y + i);
      }
    } else {
      for (let i = 0; i < ship.length; i++) {
        this.grid[x + i][y] += shipIdx;
        this._addOccupiedCoords(x + i, y);
      }
    }
  }

  recieveAttack(x, y) {
    const idx = this.grid[x][y];

    if (idx >= 0) {
      const ship = this.ships[idx];
      ship.hit();

      if (ship.isSunk()) return "SUNK";
      else return "HIT";
    } else {
      this.grid[x][y]--;
      return "MISS";
    }
  }

  allSunken() {
    const allShipsTest = this.ships.map((ship) => ship.isSunk());

    return allShipsTest.every(Boolean);
  }
}

class Player {
  constructor(name) {
    this.name = name;
    this.board = new Gameboard();
    this.shipsToPlace = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4]
    this.madeAttacks = [];
  }

  randomCoords() {
    while (true) {
      const x = Math.floor(Math.random() * 10);
      const y = Math.floor(Math.random() * 10);
      const coords = [x, y];

      if (!this.madeAttacks.includes(JSON.stringify(coords))) {
        this.madeAttacks.push(JSON.stringify(coords));
        return coords;
      }
    }
  }
}

export { Ship, Gameboard, Player };
