<script>
    let tab = [
        ["","",""],
        ["","",""],
        ["","",""]
        ]
        let win = false
        let whoWin =""
        let tak
    let flaga = 'x'
    function zmien(i,j){
        
        if(tab[i][j]==''){   
        tab[i][j]=flaga;
        if(flaga=='x')flaga="o"
        else if(flaga=='o')flaga='x'
        for(let x=0;x<3;x++){
        if((tab[0][x]=='o'&&tab[1][x]=='o'&&tab[2][x]=='o')||(tab[x][0]=='o'&&tab[x][1]=='o'&&tab[x][2]=='o')){
        alert("O wygrało")
        whoWin="O"
        }
        else if((tab[0][x]=='x'&&tab[1][x]=='x'&&tab[2][x]=='x')||(tab[x][0]=='x'&&tab[x][1]=='x'&&tab[x][2]=='x')){
            alert("X wygrał")
            whoWin="X"
        }
        console.log(whoWin)
        if(whoWin!=""){
            window.location.reload(true);
            
        }
    }}}

</script>

<div class="w-full h-screen flex flex-col justify-center ">
    {#each tab as row,i}
    <div class="flex justify-center">
        {#each row as col,j}
        <button class="cell w-40 h-40" on:click={()=>zmien(i,j)}>{col}</button>
        {/each}
    </div>
    {/each}
</div>

<style>

/* .center{
display: flex;
align-items: center;
justify-content: center;
}
    .cell{
        width: 100px;
        height: 100px;

    } */
</style>