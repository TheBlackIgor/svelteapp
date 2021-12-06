<script>
    async function getData(){
        let URL = "./krzyzowka.json"
        let res = await fetch(URL);
        res = await res.json()
        console.log(res)
        return res
    }
    let data = getData()
    $:data = 
{
    "slowa":
    [
        {"slowo":"react", "haslo": 0, "posH": 1},
        {"slowo":"javascript", "haslo": 8, "posH": 0},
        {"slowo":"python", "haslo": 4, "posH": 2},
        {"slowo":"bootstrap", "haslo": 6, "posH": 4},
        {"slowo":"angular", "haslo": 0, "posH": 5},
        {"slowo":"html", "haslo": 2, "posH": 6},
        {"slowo":"django", "haslo": 4, "posH": 3}
    ],
    "haslo": "program"
}
    let wordsToPrint = []
    let indexOfFinalWordLetter = []
    let helpTab = []
    let start
    let hToGuess = []
    function getRandomIntInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
    function millisToMinutesAndSeconds(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }
    
    function onLoadToPrint(){
        start = Date.now()
        let a = 0
        data.slowa.forEach(item => {
            let tabWithRngPos = []
            wordsToPrint.push(item.slowo)
            helpTab.push(item.slowo)
            wordsToPrint[a] = wordsToPrint[a].split('')
            helpTab[a] = helpTab[a].split('')

            for(let i = 0; i<item.slowo.length;i++)
            {
                wordsToPrint[a][i] = ""
                helpTab[a][i] = ""
            }

            let iOfR = 0

            while(iOfR != 3)
            {
                let temp = getRandomIntInt(0, item.slowo.length)

                if(!tabWithRngPos.includes(temp) && temp != item.haslo)
                {
                    tabWithRngPos.push(temp)
                    iOfR++
                } 
            }
            for(let i = 0; i<item.slowo.length;i++)
            {
                wordsToPrint[a][tabWithRngPos[i]] = item.slowo[tabWithRngPos[i]]
                helpTab[a][tabWithRngPos[i]] = item.slowo[tabWithRngPos[i]]
            }
            
            indexOfFinalWordLetter.push(item.haslo)
            tabWithRngPos = []
            a++
        })
        
        
    }
    function hasloOnLoad(){
        for(let i = 0; i<data.haslo.length;i++)
            hToGuess.push('')
    }
    
    function changeH(posH) {
        hToGuess[data.slowa[posH].posH] = data.slowa[posH].slowo[data.slowa[posH].haslo]
    }
    function win(){
        let czas = Date.now() - start
        alert(`Gratulacje!!!\nPrzejście tej krzyżówki zajęło Ci ${millisToMinutesAndSeconds(czas)}`)
        location.reload(true)
    }
</script>
<div class="flex flex-col justify-evenly flex-wrap">
    {#await data}
        loading
    {:then data}    
    <div on:load={onLoadToPrint()} class="flex flex-col text-white m-5">
        {#each wordsToPrint as slowo, j}
        <div class="flex justify-start flex-row" >
            {#each slowo as litera,i}
                {#if wordsToPrint[j].join("")==data.slowa[j].slowo}
                <div class="flex flex-row justify-center items-center w-10 h-10 bg-green-600 border" on:load={changeH(j)}>{data.slowa[j].slowo[i]}</div>
                {:else if indexOfFinalWordLetter[j] == i}
                <div class="flex flex-row justify-center items-center w-10 h-10 bg-gray-800 border">
                    <input type="text" class="w-10 h-10 bg-gray-800 border text-center" maxlength="1" bind:value={wordsToPrint[j][i]}>
                </div>
                {:else if helpTab[j][i] == ""}
                <div class="flex flex-row justify-center items-center w-10 h-10 bg-gray-600 border">
                    <input type="text" class="w-10 h-10 bg-gray-600 border text-center" maxlength="1" posH={data.slowa[j].posH} bind:value={wordsToPrint[j][i]}>
                </div>
                {:else}
                <div class="flex flex-row justify-center items-center w-10 h-10 bg-gray-500 border">{litera}</div>
                {/if}
            {/each}
        </div>
        {/each}
    </div>

    <div class="flex flex-row m-5 text-white text-xl" on:load={hasloOnLoad()}>
        {#if hToGuess.join("") == ""}
        {#each data.haslo as litera}
        <div class="flex flex-row justify-center items-center w-10 h-10 bg-yellow-700 border">
            <p class="bg-transparent"></p>
        </div>
        {/each}
        {:else}
        {#each hToGuess as litera}
        <div class="flex flex-row justify-center items-center w-10 h-10 bg-yellow-700 border">
            <p class="bg-transparent">
                {litera}
            </p>
        </div>
        {/each}
        {/if}
    </div>
    {#if hToGuess.join("")==data.haslo}
    <div on:load={win()}></div>
    {/if}
    {/await}

</div>

