<script> 
    async function getQuiz(){
        let URL = "./pytania.json"
        let res = await fetch(URL);
        res = await res.json()
        console.log(res)
        return res
    }
    let quiz = getQuiz();

    let i = 0
    let x = 0

    function handleClick(pickedQuestion, answer){
        window.setTimeout(()=>{
        if(pickedQuestion == answer){
            console.log("dobrze")
            x++
            pickedQuestion
        }else{
            console.log("źle")
        }
        
        i++
    },100)
    }

    function akturalizuj(odpowiedz, poprawna, e){

    }
    $:quiz = getQuiz();

    let files = [];
    async function sprawdz(){
        const text = await files[0].text()
        let json= JSON.parse(text)
        console.log(json)
        quiz = json
    }
    
</script>



<div class="pytania flex flex-col w-full items-center">
     <div class="w-3/4 flex flex-row justify-between items-center text-xl text-white" id="question">
        <label for="">Wprowadź plik z pytaniami</label>
        <input multiple="FALSE" bind:files on:change={()=>sprawdz()} accept="application/json" type="file" id="file">
    </div>
{#await quiz}
loading
{:then quiz}
{#if i < quiz.length}
    {#each quiz.slice(i,i+1) as item}
        <div class="w-3/4 flex flex-row justify-between items-center">
            <div class="text-3xl text-yellow-400" id="question">
                Pytanie {i}/{quiz.length}
            </div>
            <div id="points" class="text-3xl text-yellow-400">
                {x}ptk
            </div>
        </div>
        <h2 class=" text-3xl m-5 text-yellow-400">{i+1}.{item.pytanie}</h2>
        <div class="flex flex-row flex-wrap w-full items-center justify-center">
            {#each item.q as pytanie}
                <button class="justify-center rounded-md transition duration-500 ease-in-out hover:bg-yellow-800 transform hover:-translate-y-1 hover:scale-110 m-3 p-4 bg-yellow-400 flex w-1/3 content-center text-white" on:click={()=>handleClick(pytanie, item.odp)}>{pytanie}</button>
            {/each}
        </div>
    {/each}
{:else}
<div class=" h-96 flex justify-center items-center"><p class=" text-yellow-400 text-6xl">To twój wynik {x}/{quiz.length}</p></div>
{/if}
{/await}
</div>

<style>
    button{
        text-align: center;
    }
</style>