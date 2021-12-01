<script>
	import Gallery from "./routes/Gallery.svelte";
	import Router from "svelte-spa-router";
	import Home from "./routes/Home.svelte";
	import NotFound from "./routes/NotFound.svelte";
	import Tailwindcss from "./Tailwindcss.svelte";
	import Header from "./components/header.svelte";
	import Footer from "./components/footer.svelte";
	import Shop from "./routes/Shop.svelte";
	import Contact from "./routes/Contact.svelte";
	import Lottery from "./routes/Lottery.svelte";
	import TicTacToe from "./routes/TicTacToe.svelte";
	import Country from "./routes/Country.svelte";
	import Quiz from "./routes/quiz.svelte";
	import Cars from "./routes/Cars.svelte";
	import Sudoku from "./routes/Sudoku.svelte";
	import Sudoku2 from "./routes/Sudoku2.svelte";
	import Jolka from "./routes/Jolka.svelte";
</script>

<Tailwindcss />
<Header />
<Router
	routes={{
		"/": Home,
		"/gallery": Gallery,
		"/shop": Shop,
		"/contact": Contact,
		"/TicTacToe": TicTacToe,
		"/lottery": Lottery,
		"/country": Country,
		"/quiz": Quiz,
		"/cars": Cars,
		"/sudoku": Sudoku,
		"/sudoku2": Sudoku2,
		"/jolka": Jolka,
		"*": NotFound,
	}}
/>

<Footer />
