

<head>
  
  
</head>

<div class="center">
    <div id="top" class="top">
        <label for>Ile liczb</label>
        <input type="number" value={liczba}>
        <button on:click={losowanie} id="losuj" class="py-1 px-4  bg-indigo-500 text-white ">Losuj</button>
    </div>
    <div id="allBills" class="middle">
    
    </div>
    <div class="bottom">
        <input type="text">
        <button></button>
    </div>
</div>
<script>
    
    // const allBills = document.querySelector('#middle')
    
    let liczba, zgadnij;
    let liczby = []
    
    function losowanie(){
        const los = document.querySelector('#losuj')
        console.log('xx')
    
        for(let i = 1; i <= liczba; i++)liczby.push(i)
    
        liczby.forEach((element) =>{
            const newDiv = document.createElement('div')
            newDiv.setAttribute('class','bill')
            newDiv.textContent = element
            allBills.appendChild(newDiv)
        })
    }
    </script>

<style>
    .center{
        display: flex;
        justify-content: space-around;
        flex-direction: column;
        align-items: center;
    }
    .top{
        width: 400px;
    }
    .middle{
        height: 300px;
        width: 80%;
        border: 2px solid indigo;
    }
    .top, .middle, .bottom{
        display: flex;
        justify-content: space-around;
        flex-direction: row;
        align-items: center;
        margin: 10px;
    }
    .bill{
        border-radius: 50%;
        width: 2em;
        height: 2em;
        display: flex;
        align-items: center;
        justify-content: center;
        color: black;
        background: yellow;
    }
    #middle{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
    }
</style>