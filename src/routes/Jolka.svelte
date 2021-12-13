<script>
    async function getData() {
        let URL = "./krzyzowka.json";
        let res = await fetch(URL);
        res = await res.json();
        //res.sort(() => 0.5 - Math.random())
        data = res;
    }
    $: data = getData();

    let originData = [];
    let wordsToPrint = [];
    let indexOfFinalWordLetter = [];
    let helpTab = [];
    let start;
    let hToGuess = [];
    let letterToCheck = "";
    let uses = 0;
    function getRandomIntInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
    function millisToMinutesAndSeconds(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }

    function shuffle(array) {
        let currentIndex = array.length,
            randomIndex;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex],
                array[currentIndex],
            ];
        }

        return array;
    }

    function onLoadToPrint() {
        start = Date.now();
        let a = 0;

        shuffle(data.slowa);
        originData = shuffle(data.slowa);

        originData.forEach((item) => {
            let tabWithRngPos = [];
            wordsToPrint.push(item.slowo);
            helpTab.push(item.slowo);
            wordsToPrint[a] = wordsToPrint[a].split("");
            helpTab[a] = helpTab[a].split("");

            for (let i = 0; i < item.slowo.length; i++) {
                wordsToPrint[a][i] = "";
                helpTab[a][i] = "";
            }

            let iOfR = 0;

            while (iOfR != 3) {
                let temp = getRandomIntInt(0, item.slowo.length);

                if (!tabWithRngPos.includes(temp) && temp != item.haslo) {
                    tabWithRngPos.push(temp);
                    iOfR++;
                }
            }
            for (let i = 0; i < item.slowo.length; i++) {
                wordsToPrint[a][tabWithRngPos[i]] =
                    item.slowo[tabWithRngPos[i]];
                helpTab[a][tabWithRngPos[i]] = item.slowo[tabWithRngPos[i]];
            }

            indexOfFinalWordLetter.push(item.haslo);
            tabWithRngPos = [];
            a++;
        });
    }

    function checkLetter() {
        if (uses < 3) {
            console.log(letterToCheck);
            let b = 0;
            originData.forEach((item) => {
                for (let i = 0; i < item.slowo.length; i++) {
                    if (letterToCheck == item.slowo[i] && uses < 3)
                        wordsToPrint[b][i] = item.slowo[i];
                }
                b++;
            });
            uses++;
        }
    }

    function hasloOnLoad() {
        for (let i = 0; i < data.haslo.length; i++) hToGuess.push("");
    }

    function changeH(posH) {
        hToGuess[originData[posH].posH] =
            originData[posH].slowo[originData[posH].haslo];
    }
    function win() {
        let czas = Date.now() - start;
        alert(
            `Gratulacje!!!\nPrzejście tej krzyżówki zajęło Ci ${millisToMinutesAndSeconds(
                czas
            )}`
        );
        location.reload(true);
    }
    let czas = start - start;
    let zebyZegarDzialal = 0;
    async function zegar() {
        if (zebyZegarDzialal > 1)
            document.querySelector("#zegar").innerText =
                millisToMinutesAndSeconds(czas);
        czas = Date.now() - start;
        zebyZegarDzialal++;
        setTimeout(zegar, 1000);
    }
    let files = [];
    async function sprawdz() {
        const text = await files[0].text();
        let json = JSON.parse(text);
        console.log(json);
        data = json;
    }
</script>

<div class="flex flex-col justify-evenly flex-wrap">
    {#await data}
        <p>Wczytywanie krzyżówki...</p>
    {:then data}
        <div on:load={zegar()} id="zegar" class="text-white">0:00</div>

        <div
            class="w-3/4 flex flex-row justify-start items-center text-xl text-white"
            id="question"
        >
            <label for="">Wprowadź plik z pytaniami</label>
            <input
                multiple="FALSE"
                bind:files
                on:change={sprawdz()}
                accept="application/json"
                type="file"
                id="file"
            />
        </div>

        <div on:load={onLoadToPrint()} class="flex flex-col text-white m-5">
            {#each wordsToPrint as slowo, j}
                <div class="flex justify-start flex-row">
                    {#each slowo as litera, i}
                        {#if wordsToPrint[j].join("") == data.slowa[j].slowo}
                            <div
                                class="flex flex-row justify-center items-center w-10 h-10 bg-green-600 border"
                                on:load={changeH(j)}
                            >
                                {data.slowa[j].slowo[i]}
                            </div>
                        {:else if indexOfFinalWordLetter[j] == i}
                            <div
                                class="flex flex-row justify-center items-center w-10 h-10 bg-gray-800 border"
                            >
                                <input
                                    type="text"
                                    class="w-10 h-10 bg-gray-800 border text-center"
                                    maxlength="1"
                                    bind:value={wordsToPrint[j][i]}
                                />
                            </div>
                        {:else if helpTab[j][i] == ""}
                            <div
                                class="flex flex-row justify-center items-center w-10 h-10 bg-gray-600 border"
                            >
                                <input
                                    type="text"
                                    class="w-10 h-10 bg-gray-600 border text-center"
                                    maxlength="1"
                                    posH={data.slowa[j].posH}
                                    bind:value={wordsToPrint[j][i]}
                                />
                            </div>
                        {:else}
                            <div
                                class="flex flex-row justify-center items-center w-10 h-10 bg-gray-500 border"
                            >
                                {litera}
                            </div>
                        {/if}
                    {/each}
                </div>
            {/each}
        </div>

        <div
            class="flex flex-row m-5 text-white text-xl"
            on:load={hasloOnLoad()}
        >
            {#if hToGuess.join("") == ""}
                {#each data.haslo as litera}
                    <div
                        class="flex flex-row justify-center items-center w-10 h-10 bg-yellow-700 border"
                    >
                        <p class="bg-transparent" />
                    </div>
                {/each}
            {:else}
                {#each hToGuess as litera}
                    <div
                        class="flex flex-row justify-center items-center w-10 h-10 bg-yellow-700 border"
                    >
                        <p class="bg-transparent">
                            {litera}
                        </p>
                    </div>
                {/each}
            {/if}
        </div>

        <div
            class="w-48 h-10 text-white flex flex-row justify-between items-center"
        >
            <input type="text" class="w-10" bind:value={letterToCheck} />
            <button class="text-sm h-10 w-20" on:click={() => checkLetter()}
                >Check Letter</button
            >
            <p>{uses}/3</p>
        </div>

        {#if hToGuess.join("") == data.haslo}
            <div on:load={win()} />
        {/if}
    {/await}
</div>
