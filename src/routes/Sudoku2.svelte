<script>
    let grid = [
      [3, 0, 6, 5, 0, 8, 4, 0, 0],
      [5, 2, 0, 0, 0, 0, 0, 0, 0],
      [0, 8, 7, 0, 0, 0, 0, 3, 1],
      [0, 0, 3, 0, 1, 0, 0, 8, 0],
      [9, 0, 0, 8, 6, 3, 0, 0, 5],
      [0, 5, 0, 0, 9, 0, 6, 0, 0],
      [1, 3, 0, 0, 0, 0, 2, 5, 0],
      [0, 0, 0, 0, 0, 0, 0, 7, 4],
      [0, 0, 5, 2, 0, 6, 3, 0, 0],
    ];
  let N = 9;
  let bledy = 0;

  function isSafe(grid, row, col, num) {
    for (let d = 0; d < grid.length; d++) {
      if (grid[row][d] == num) {
        return false;
      }
    }

    for (let r = 0; r < grid.length; r++) {
      if (grid[r][col] == num) {
        return false;
      }
    }

    let sqrt = Math.floor(Math.sqrt(grid.length));
    let boxRowStart = row - (row % sqrt);
    let boxColStart = col - (col % sqrt);

    for (let r = boxRowStart; r < boxRowStart + sqrt; r++) {
      for (let d = boxColStart; d < boxColStart + sqrt; d++) {
        if (grid[r][d] == num) {
          return false;
        }
      }
    }

    return true;
  }

  function valid(arraySolution) {
    // for (let i = 0; i < 9; ++i) {
    //   for (let j = 0; j < 9; ++j) {
    //     if (arraySolution[i][j] == 0) arraySolution[i][j] == 1;
    //   }
    // }

    for (var y = 0; y < 9; ++y) {
      for (var x = 0; x < 9; ++x) {
        var value = arraySolution[y][x];

        if (value) {
          // Check the line
          for (var x2 = 0; x2 < 9; ++x2) {
            if (x2 != x && arraySolution[y][x2] == value) {
              return false;
            }
          }

          // Check the column
          for (var y2 = 0; y2 < 9; ++y2) {
            if (y2 != y && arraySolution[y2][x] == value) {
              return false;
            }
          }

          // Check the square
          var startY = Math.floor(y / 3) * 3;
          for (var y2 = startY; y2 < startY + 3; ++y2) {
            var startX = Math.floor(x / 3) * 3;
            for (x2 = startX; x2 < startX + 3; ++x2) {
              if ((x2 != x || y2 != y) && arraySolution[y2][x2] == value) {
                return false;
              }
            }
          }
        }
      }
    }

    return true;
  }

  function solveSudoku(grid, n) {
    let row = -1;
    let col = -1;
    let isEmpty = true;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (grid[i][j] == 0) {
          row = i;
          col = j;

          isEmpty = false;
          break;
        }
      }
      if (!isEmpty) {
        break;
      }
    }

    if (isEmpty) {
      return true;
    }

    for (let num = 1; num <= n; num++) {
      if (isSafe(grid, row, col, num)) {
        grid[row][col] = num;
        if (solveSudoku(grid, n)) {
          return true;
        } else {
          grid[row][col] = 0;
        }
      }
    }
    return false;
  }



  if (solveSudoku(grid,N)) {
    console.log(grid);
    grid = grid;
  } else document.write("no solution exists ");

  let gridToPrint = [
    [3, 0, 6, 5, 0, 8, 4, 0, 0],
    [5, 2, 0, 0, 0, 0, 0, 0, 0],
    [0, 8, 7, 0, 0, 0, 0, 3, 1],
    [0, 0, 3, 0, 1, 0, 0, 8, 0],
    [9, 0, 0, 8, 6, 3, 0, 0, 5],
    [0, 5, 0, 0, 9, 0, 6, 0, 0],
    [1, 3, 0, 0, 0, 0, 2, 5, 0],
    [0, 0, 0, 0, 0, 0, 0, 7, 4],
    [0, 0, 5, 2, 0, 6, 3, 0, 0],
  ];
  let gridToSolve = [
    [3, 0, 6, 5, 0, 8, 4, 0, 0],
    [5, 2, 0, 0, 0, 0, 0, 0, 0],
    [0, 8, 7, 0, 0, 0, 0, 3, 1],
    [0, 0, 3, 0, 1, 0, 0, 8, 0],
    [9, 0, 0, 8, 6, 3, 0, 0, 5],
    [0, 5, 0, 0, 9, 0, 6, 0, 0],
    [1, 3, 0, 0, 0, 0, 2, 5, 0],
    [0, 0, 0, 0, 0, 0, 0, 7, 4],
    [0, 0, 5, 2, 0, 6, 3, 0, 0],
  ];

  let b;
  let num;
  function solve() {
    // document.getElementById("rozw").innerHTML =
    gridToPrint = grid;
  }
  
  function changeVal(x, y, thisDiv) {
    if (num > 0 && num < 10 && !thisDiv.hasAttribute("po")) {
      console.log(num);
      gridToSolve[y][x] = num;
      console.log(grid);
      if (gridToSolve[y][x] === grid[y][x]) {
        thisDiv.innerText = num;
        thisDiv.classList.add("text-green-500");
        thisDiv.setAttribute("po", "tak");
      }else{
        bledy++;
      }
      if (JSON.stringify(grid) === JSON.stringify(gridToSolve)) {
        alert("Gratulacje, wygrałeś");
        window.location.reload(true);
      }
      if(bledy==10){
          alert("Przykro mi ale przegrałeś :(")
          location.reload(true)
      }
      document.getElementById("inp").focus();
      thisDiv.innerText = num;
    }
  }


  let files = [];
  async function sprawdz(){
        const text = await files[0].text()
        let json = JSON.parse(text)
        let json1 = JSON.parse(text)
        let json2 = JSON.parse(text)
        console.log(json)
        grid = await json
        gridToPrint = json1
        gridToSolve = json2
        solveSudoku(grid,N)
        bledy = 0
        console.log(grid)
    }
</script>

<div class="flex w-full justify-center items-center flex-col" id="rozw">
    <div class="w-3/4 flex flex-row justify-between items-center text-xl text-yellow-400 m-5" id="question">
        <label>Wprowadź plik z sudoku</label>
        <input multiple="FALSE" bind:files on:change={()=>sprawdz()} accept="application/json" type="file" id="file">
    </div>
    <div class="w-2/5 flex flex-row flex-wrap border-2">
    {#each gridToPrint as blok, i}
      <div class="w-full flex flex-row">
        {#each blok as el, j}
          {#if el == 0 && (i + j) % 2 == 0 && i % 3 == 2 && i != 8 && j % 3 == 2 && j != 8}
            <div
              class="el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid
                border border-gray-100 text-red-600 border-b-4 border-r-4"
              on:click={(e) => changeVal(j, i, e.target)}
            />
          {:else if el == 0 && (i + j) % 2 != 0 && i % 3 == 2 && i != 8 && j % 3 == 2 && j != 8}
            <div
              class="el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid
                border border-gray-100 text-red-600 border-b-4 border-r-4"
              on:click={(e) => changeVal(j, i, e.target)}
            />
          {:else if el == 0 && (i + j) % 2 == 0 && i % 3 == 2 && i != 8}
            <div
              class="el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid
                border border-gray-100 text-red-600 border-b-4"
              on:click={(e) => changeVal(j, i, e.target)}
            />
          {:else if el == 0 && (i + j) % 2 == 0 && j % 3 == 2 && j != 8}
            <div
              class="el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid
                border border-gray-100 text-red-600 border-r-4"
              on:click={(e) => changeVal(j, i, e.target)}
            />
          {:else if el == 0 && (i + j) % 2 != 0 && i % 3 == 2 && i != 8}
            <div
              class="el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid
                border border-gray-100 text-red-600 border-b-4"
              on:click={(e) => changeVal(j, i, e.target)}
            />
          {:else if el == 0 && (i + j) % 2 != 0 && j % 3 == 2 && j != 8}
            <div
              class="el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid
                border border-gray-100 text-red-600 border-r-4"
              on:click={(e) => changeVal(j, i, e.target)}
            />
          {:else if el == 0 && (i + j) % 2 == 0}
            <div
              class="el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid
                border border-gray-100 text-red-600"
              on:click={(e) => changeVal(j, i, e.target)}
            />
          {:else if el == 0 && (i + j) % 2 != 0}
            <div
              class="el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid
                border border-gray-100 text-red-600"
              on:click={(e) => changeVal(j, i, e.target)}
            />
          {:else if (i + j) % 2 == 0 && el != 0 && i % 3 == 2 && i != 8 && j % 3 == 2 && j != 8}
            <div
              class="el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid
                border border-gray-100 text-white border-b-4 border-r-4"
            >
              {el}
            </div>
          {:else if (i + j) % 2 != 0 && el != 0 && i % 3 == 2 && i != 8 && j % 3 == 2 && j != 8}
            <div
              class="el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid
                border border-gray-100 text-white border-b-4 border-r-4"
            >
              {el}
            </div>
          {:else if (i + j) % 2 == 0 && el != 0 && j % 3 == 2 && j != 8}
            <div
              class="el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid
                border border-gray-100 text-white border-r-4"
            >
              {el}
            </div>
          {:else if (i + j) % 2 != 0 && el != 0 && j % 3 == 2 && j != 8}
            <div
              class="el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid
                border border-gray-100 text-white border-r-4"
            >
              {el}
            </div>
          {:else if (i + j) % 2 == 0 && el != 0 && i % 3 == 2 && i != 8}
            <div
              class="el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid
                border border-gray-100 text-white border-b-4"
            >
              {el}
            </div>
          {:else if (i + j) % 2 != 0 && el != 0 && i % 3 == 2 && i != 8}
            <div
              class="el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid
                border border-gray-100 text-white border-b-4"
            >
              {el}
            </div>
          {:else if (i + j) % 2 == 0 && el != 0}
            <div
              class="el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid
                border border-gray-100 text-white"
            >
              {el}
            </div>
          {:else}
            <div
              class="el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid
                border border-gray-100 text-white"
            >
              {el}
            </div>
          {/if}
        {/each}
      </div>
    {/each}
  </div>
  <label><p class="text-white">Błędy {bledy}/10</p></label>
  <label
    ><span class="text-white">Podaj liczbę 1-9</span>
    <input
      id="inp"
      autofocus
      type="number"
      bind:value={num}
      min="1"
      max="9"
      class="w-10 text-white m-3 text-center"
    /></label
  >
  <button
    on:click={() => solve()}
    class="w-24 text-center text-white rounded-md">Rozwiąz</button
  >
</div>

<style>
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type="number"] {
    -moz-appearance: textfield;
  }
</style>
