<script>

    // Javascript program for above approach
    
    // N is the size of the 2D matrix N*N
    let N = 9;
    
    /* Takes a partially filled-in grid and attempts
        to assign values to all unassigned locations in
        such a way to meet the requirements for
        Sudoku solution (non-duplication across rows,
        columns, and boxes) */
    function solveSuduko(grid, row, col)
    {
        if (row == N - 1 && col == N)
            return true;
    
        if (col == N)
        {
            row++;
            col = 0;
        }
    
        if (grid[row][col] != 0)
            return solveSuduko(grid, row, col + 1);
    
        for(let num = 1; num < 10; num++)
        {
            if (isSafe(grid, row, col, num))
            {
                grid[row][col] = num;
    
                if (solveSuduko(grid, row, col + 1))
                    return true;
            }

            grid[row][col] = 0;
        }
        return false;
    }
    
    /* A utility function to print grid */
    function print(grid)
    {
        for(let i = 0; i < N; i++)
        {
            for(let j = 0; j < N; j++)
                document.write(grid[i][j] + " ");
                
            document.write("<br>");
        }
    }
    
    // Check whether it will be legal
    // to assign num to the
    // given row, col
    function isSafe(grid, row, col, num)
    {
        
        // Check if we find the same num
        // in the similar row , we
        // return false
        for(let x = 0; x <= 8; x++)
            if (grid[row][x] == num)
                return false;
    
        // Check if we find the same num
        // in the similar column ,
        // we return false
        for(let x = 0; x <= 8; x++)
            if (grid[x][col] == num)
                return false;
    
        // Check if we find the same num
        // in the particular 3*3
        // matrix, we return false
        let startRow = row - row % 3,
            startCol = col - col % 3;
            
        for(let i = 0; i < 3; i++)
            for(let j = 0; j < 3; j++)
                if (grid[i + startRow][j + startCol] == num)
                    return false;
    
        return true;
    }
    
    let grid = [ [ 3, 0, 6, 5, 0, 8, 4, 0, 0 ],
                [ 5, 2, 0, 0, 0, 0, 0, 0, 0 ],
                [ 0, 8, 7, 0, 0, 0, 0, 3, 1 ],
                [ 0, 0, 3, 0, 1, 0, 0, 8, 0 ],
                [ 9, 0, 0, 8, 6, 3, 0, 0, 5 ],
                [ 0, 5, 0, 0, 9, 0, 6, 0, 0 ],
                [ 1, 3, 0, 0, 0, 0, 2, 5, 0 ],
                [ 0, 0, 0, 0, 0, 0, 0, 7, 4 ],
                [ 0, 0, 5, 2, 0, 6, 3, 0, 0 ] ]
    
    
    if (solveSuduko(grid, 0, 0)){
        //print(grid)
        console.log(grid)
        grid = grid;
    }
    else
        document.write("no solution exists ")
    </script>
    


    <div class="flex w-full justify-center items-center">
        <div class="w-2/5 flex flex-row flex-wrap border-2">
        {#each grid as blok,i}
            <div class="w-full flex flex-row">
            {#each blok as el,j}
                {#if (i+j) % 2 == 0}
                    <div class="el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid
                    border border-gray-100 text-white">{el}</div>
                {:else}
                    <div class="el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid
                    border border-gray-100 text-white">{el}</div>
                {/if}
            {/each}
            </div>
        {/each}
        </div>
    </div>


    <style>
    </style>