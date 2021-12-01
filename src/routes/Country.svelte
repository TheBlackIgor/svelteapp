<script defer>
    async function getUsers() {
      let response = await fetch("./kraje.json");
      let users = await response.json();
      return users;
    }
    const selCities = document.querySelector("#miasta")
    const promise = getUsers();
    console.log(promise)
    //let selected = selCities.options[selCities.selectedIndex].text
    //console.log(selected)
    let wartosc
    function zmien(){
        let link = `https://www.countryflags.io/${wartosc}/flat/64.png`
        document.getElementById('flaga').src = link
    }
  </script>

<div>
    {#await promise}
        <p>Loading...</p>
    {:then user}
    <select class="text-white" name="" id="miasta"  bind:value={wartosc}  on:change={zmien}>
        {#each user as user}
        <option value="{user.code}">{user.name}</option>
        {/each}
    </select>
    <div>
        <img id="flaga" src="https://www.countryflags.io/af/flat/64.png">
    </div>

    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
    

    </div>