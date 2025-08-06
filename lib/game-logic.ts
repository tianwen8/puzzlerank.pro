export type GameBoard = number[][]
export type Direction = "up" | "down" | "left" | "right"

export interface GameState {
  board: GameBoard
  score: number
  moves: number
  isGameOver: boolean
  isWon: boolean
  canUndo: boolean
  previousState?: {
    board: GameBoard
    score: number
    moves: number
  }
}

export function createEmptyBoard(): GameBoard {
  return Array(4)
    .fill(null)
    .map(() => Array(4).fill(0))
}

export function addRandomTile(board: GameBoard): GameBoard {
  const emptyCells: [number, number][] = []

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 0) {
        emptyCells.push([i, j])
      }
    }
  }

  if (emptyCells.length === 0) return board

  const newBoard = board.map((row) => [...row])
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
  const [row, col] = randomCell
  newBoard[row][col] = Math.random() < 0.9 ? 2 : 4

  return newBoard
}

export function initializeGame(): GameState {
  let board = createEmptyBoard()
  board = addRandomTile(board)
  board = addRandomTile(board)

  return {
    board,
    score: 0,
    moves: 0,
    isGameOver: false,
    isWon: false,
    canUndo: false,
  }
}

function slideArray(arr: number[]): { newArr: number[]; score: number } {
  const filtered = arr.filter((val) => val !== 0)
  const newArr = [...filtered]
  let score = 0

  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      newArr[i] = filtered[i] * 2
      newArr[i + 1] = 0
      score += newArr[i]
      i++
    }
  }

  const finalArr = newArr.filter((val) => val !== 0)
  while (finalArr.length < 4) {
    finalArr.push(0)
  }

  return { newArr: finalArr, score }
}

export function moveBoard(
  board: GameBoard,
  direction: Direction,
): { newBoard: GameBoard; scoreGained: number; moved: boolean } {
  let newBoard: GameBoard
  let totalScore = 0
  let moved = false

  switch (direction) {
    case "left":
      newBoard = board.map((row) => {
        const { newArr, score } = slideArray(row)
        totalScore += score
        if (JSON.stringify(newArr) !== JSON.stringify(row)) moved = true
        return newArr
      })
      break

    case "right":
      newBoard = board.map((row) => {
        const reversed = [...row].reverse()
        const { newArr, score } = slideArray(reversed)
        totalScore += score
        const result = newArr.reverse()
        if (JSON.stringify(result) !== JSON.stringify(row)) moved = true
        return result
      })
      break

    case "up":
      newBoard = createEmptyBoard()
      for (let col = 0; col < 4; col++) {
        const column = board.map((row) => row[col])
        const { newArr, score } = slideArray(column)
        totalScore += score
        if (JSON.stringify(newArr) !== JSON.stringify(column)) moved = true
        for (let row = 0; row < 4; row++) {
          newBoard[row][col] = newArr[row]
        }
      }
      break

    case "down":
      newBoard = createEmptyBoard()
      for (let col = 0; col < 4; col++) {
        const column = board.map((row) => row[col]).reverse()
        const { newArr, score } = slideArray(column)
        totalScore += score
        const result = newArr.reverse()
        if (JSON.stringify(result) !== JSON.stringify(board.map((row) => row[col]))) moved = true
        for (let row = 0; row < 4; row++) {
          newBoard[row][col] = result[row]
        }
      }
      break
  }

  return { newBoard, scoreGained: totalScore, moved }
}

export function isGameOver(board: GameBoard): boolean {
  // Check for empty cells
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 0) return false
    }
  }

  // Check for possible merges
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const current = board[i][j]
      if ((i < 3 && board[i + 1][j] === current) || (j < 3 && board[i][j + 1] === current)) {
        return false
      }
    }
  }

  return true
}

export function hasWon(board: GameBoard): boolean {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 2048) return true
    }
  }
  return false
}

export function getHighestTile(board: GameBoard): number {
  let highest = 0
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] > highest) {
        highest = board[i][j]
      }
    }
  }
  return highest
}
