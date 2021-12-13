import { writable } from "svelte/store"

export const words = writable([])

const fetchData = async()=>{
        let URL = "./krzyzowka.json"
        let res = await fetch(URL);
        data = await res.json()
        console.log(res + " przyjmowane dane")
        words.set(data)
}

fetchData()