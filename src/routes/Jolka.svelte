
<script>
    import { words } from "../stores/words.js"

    const data = ["react","javascript","svelte","tailwind","bootstrap","html","django"]
    console.log(data)
    let slowa = data
    console.log(slowa)

    function setWordsLen(){
        let wordsLen = 0
        slowa.forEach(i => {
            if(i.length>wordsLen) wordsLen=i.length
        });
        slowa.forEach(i =>{
            while(i.length!=wordsLen) i.push(',')
        })
        console.log(slowa)
    }
    //setWordsLen()


</script>



<div class="flex ">
    {#each slowa as slowo}
    <div>
        {#each slowo as litera}
            <div class="flex flex-row justify-center items-center"><div>{litera}</div></div>
        {/each}
    </div>
    {/each}
</div>