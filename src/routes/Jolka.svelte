
<script>
    // async function getData(){
    //     let URL = "./krzyzowka.json"
    //     let res = await fetch(URL);
    //     res = await res.json()
    //     return res
    // }
    const data = {
    "slowa":
    [
        {"slowo":"react", "haslo": 0},
        {"slowo":"javascript", "haslo": 9},
        {"slowo":"python", "haslo": 4},
        {"slowo":"tailwind", "haslo": 1},
        {"slowo":"bootstrap", "haslo": 8},
        {"slowo":"angular", "haslo": 0},
        {"slowo":"html", "haslo": 2},
        {"slowo":"django", "haslo": 4}
    ],
    "haslo": "program"
}
    let wordsToPrint = []
    function getRandomIntInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
    
    function onLoadToPrint(){
        let a = 0
        data.slowa.forEach(item => {
            let strToPush = ''
            let tabWithRngPos = []
            wordsToPrint.push(item.slowo)
            wordsToPrint[a] = wordsToPrint[a].split('')

            for(let i = 0; i<item.slowo.length;i++)
                wordsToPrint[a][i]= "-"

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
            console.log(tabWithRngPos)
            for(let i = 0; i<item.slowo.length;i++)
                

            tabWithRngPos = []
            a++
        })
        console.log(wordsToPrint)
    }
    let guess
    function checkWord() {
        data.slowa.forEach(item => {
            if(item.slowo == guess)
            {

            }
        });
    }
    onLoadToPrint()

</script>
<div class="flex flex-col justify-evenly flex-wrap">
    {#await data }
        loading
    {:then data}    
    <div class="flex flex-col text-white m-5" onload="onLoadToPrint()">
        {#each data.slowa as slowo}
        <div class="flex justify-start flex-row" >
            {#each slowo.slowo as litera,i}
                {#if slowo.haslo == i}
                <div class="flex flex-row justify-center items-center w-10 h-10 bg-gray-800 border"><p class="bg-transparent" id="{slowo.slowo}"></p></div>
                {:else}
                <div class="flex flex-row justify-center items-center w-10 h-10 bg-gray-600 border"><p class="bg-transparent" id="{slowo.slowo}"></p></div>
                {/if}
            {/each}
        </div>
        {/each}
    </div>
    <div class="flex flex-row m-5">
        {#each data.haslo as litera}
        <div class="flex flex-row justify-center items-center w-10 h-10 bg-yellow-700 border"><p class="bg-transparent" id="{litera}"></p></div>
        {/each}
    </div>
    {/await}

</div>

