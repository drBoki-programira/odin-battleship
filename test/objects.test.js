import { Ship, Gameboard, Player } from "../src/objects";

describe("Ship class tests: ", () => {
  let cruiser;

  beforeEach(() => {
    cruiser = new Ship(3);
  });

  test("length property: should return length of the ship", () => {
    const beachCraft = new Ship(42);
    expect(cruiser.length).toBe(3);
    expect(beachCraft.length).toBe(42);
  });

  test("hit method: should increase hits property but not above ship's length", () => {
    expect(cruiser.hits).toBe(0);
    cruiser.hit();
    expect(cruiser.hits).toBe(1);
    cruiser.hit();
    cruiser.hit();
    expect(cruiser.hits).toBe(3);
    cruiser.hit();
    expect(cruiser.hits).toBe(3);
  });

  test("isSunk method: should return true if hits equals length otherwise false", () => {
    cruiser.hit();
    cruiser.hit();
    expect(cruiser.isSunk()).toBe(false);
    cruiser.hit();
    expect(cruiser.isSunk()).toBe(true);
  });
});

describe("Gameboard class tests: ", () => {
  let board;

  beforeEach(() => {
    board = new Gameboard();
  });

  test("grid property: should initiate with array of 10 arrays with 10 elements of -1", () => {
    expect(board.grid.length).toBe(10);
    expect(board.grid[0].every((n) => n === -1)).toBe(true);
    expect(board.grid[9].every((n) => n === -1)).toBe(true);
  });

  test("place method: should put ship referance at the specific coordinates", () => {
    const ship = new Ship(2);
    board.place(ship, 8, 8, false);
    const shipIdx = board.grid[8][8];
    const shipIdx2 = board.grid[9][8];

    const boat = new Ship(5);
    board.place(boat, 0, 0, true);
    const boatIdx = board.grid[0][1];
    const boatIdx2 = board.grid[0][3];
    const boatIdx3 = board.grid[0][5];

    expect(board.ships[shipIdx]).toBe(ship);
    expect(board.ships[shipIdx2]).toBe(ship);
    expect(board.ships[boatIdx]).toBe(boat);
    expect(board.ships[boatIdx2]).toBe(boat);
    expect(boatIdx3).toBe(-1);
  });

  test("place method: should throw an error if ship is being placed out of bounds", () => {
    expect(() => board.place(new Ship(2), 9, 9, true)).toThrow(RangeError);
    expect(() => board.place(new Ship(4), 7, 7, false)).toThrow(RangeError);
  });

  test("place method: should throw an error if ship is being placed on another or next to another ship", () => {
    board.place(new Ship(10), 5, 0, true);
    board.place(new Ship(3), 0, 5, false);
    board.place(new Ship(10), 7, 0, true);
    board.place(new Ship(3), 0, 3, false);

    expect(() => board.place(new Ship(2), 3, 5, true)).toThrow(RangeError);
    expect(() => board.place(new Ship(4), 2, 2, false)).toThrow(RangeError);
  });

  test("recieveAttack: should take a pair of coordinates and return 'HIT' if a ship was hit, 'SUNK' if the ship is sunken or 'MISS' if there is no ship", () => {
    board.place(new Ship(4), 2, 1, true);
    board.place(new Ship(3), 6, 1, true);
    board.place(new Ship(2), 4, 1, true);

    expect(board.recieveAttack(4, 2)).toBe("HIT");
    expect(board.recieveAttack(4, 3)).toBe("MISS");
    expect(board.recieveAttack(4, 1)).toBe("SUNK");
  });

  test("allSunken: should return true if all ships are sunken, false otherwise", () => {
    board.place(new Ship(1), 0, 0, true);
    board.place(new Ship(1), 2, 0, true);
    expect(board.allSunken()).toBe(false);

    board.recieveAttack(0, 0);
    expect(board.allSunken()).toBe(false);

    board.recieveAttack(2, 0);
    expect(board.allSunken()).toBe(true);
  });
});

describe("Player class tests: ", () => {
  let player;

  beforeEach(() => {
    player = new Player("p1");
  });

  afterEach(() => {
    jest.spyOn(Math, "random").mockRestore();
  });

  test("randomCoords: should generate random set of coordinates", () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.9);
    expect(player.randomCoords()).toEqual([1, 9]);
  });

  test("randomCoords: coords should always be between 0 and 9 and never same pair of values", () => {
    for (let i = 0; i < 100; i++) {
      const [x, y] = player.randomCoords();

      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(9);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(9);
    }
    expect(player.madeAttacks.size).toEqual(100);
  });

  test("parseAttackResult: should take in a pair of coords and result of the attack, and place adequate coords into hitConfirmed and priorityAttack properties", () => {
    player.parseAttackResult([1, 1], "HIT");
    expect(player.hitConfirmed).toEqual(["[1,1]"]);
    expect(player.priorityAttack).toEqual(["[0,1]", "[2,1]", "[1,0]", "[1,2]"]);
    player.parseAttackResult([0, 0], "SUNK");
    player.parseAttackResult([0, 0], "HIT");
    expect(player.hitConfirmed).toEqual(["[0,0]"]);
    expect(player.priorityAttack).toEqual(["[1,0]", "[0,1]"]);
  });

  test("parseAttackResult: consecutive hits should update priorityAttack correctly", () => {
    player.parseAttackResult([0, 0], "HIT");
    player.parseAttackResult([0, 1], "HIT");
    player.parseAttackResult([0, 2], "HIT");
    expect(player.hitConfirmed).toEqual(["[0,0]", "[0,1]", "[0,2]"]);
    expect(player.priorityAttack).toEqual(["[0,3]"]);
    player.parseAttackResult([0, 0], "SUNK");
    player.parseAttackResult([1, 1], "HIT");
    player.parseAttackResult([1, 2], "HIT");
    expect(player.hitConfirmed).toEqual(["[1,1]", "[1,2]"]);
    expect(player.priorityAttack).toEqual(["[1,0]", "[1,3]"]);
  });

  test("parseAttackResult: should correctly update madeAttacks property when ship is sunk", () => {
    player.parseAttackResult([1, 1], "HIT");
    player.parseAttackResult([2, 1], "SUNK");
    const arr = [...player.madeAttacks].sort();
    expect(arr).toEqual([
      "[0,0]",
      "[0,1]",
      "[0,2]",
      "[1,0]",
      "[1,1]",
      "[1,2]",
      "[2,0]",
      "[2,1]",
      "[2,2]",
      "[3,0]",
      "[3,1]",
      "[3,2]",
    ]);
  });
});
