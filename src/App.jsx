import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Pagination from 'react-bootstrap/Pagination'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import ThemeSwitcher from './themeswitcher'
import useCursor from './usecursor.mjs'
import { XMLParser } from 'fast-xml-parser'

// convert a UNIX timestamp into a date string of the form "dd Mon yyyy", e.g. 21 Jan 2025
const getDate = timestamp => {
	const parts = Date(timestamp).toString().split(' ')
	return parts[2]+' '+parts[1]+' '+parts[3]
}

// some app-level constants

// the width for each card and the footer
const columnWidth = '512px'

// these are for pagination and cursor scrolling
const totalItems = 20
const itemsPerPage = 3
const totalPages = Math.ceil(totalItems/itemsPerPage)

function App() {

	// This is the current position in and article range of the full array of articles
	const cursor = useCursor(totalItems,itemsPerPage)

	const [articles,      setArticles]      = useState(null)
	const [cursorPos,     setCursorPos]     = useState(0)
	const [cursorRange,   setCursorRange]   = useState(cursor.getRange(0))

	/*
		Our app state, which controls which components are visible and hidden.
		States are: init, loading, loaded, error

		state			show button     show spinner   show feed   show error

		init			true			false		   false		false
		loading			false		 	true		   false		false
		loaded			false			false		   true	    	false
		error			false			false		   false		true

		Note that we could also have used userReducer() for this, but it
		would be overkill, and far more verbose with no performance gain.
	*/
	const [appState, setAppState] = useState('init') 

	useEffect(()=>{

		// If the feed was not requested yet, do nothing.
		// appState is a depndency, so when the
		// "load feed" button is clicked and the click
		// handler sets the app state to "loading, 
		// we are invoked again and can actually process the feed.
		if (appState !== 'loading')
			return

		// We have to fetch the feed through a CORS proxy because CORS.
		
		// try this one too? 
		// fetch('https://cors-proxy.htmldriven.com/?url=https://arstechnica.com/feed/')

		fetch('https://api.cors.lol/?url=https://arstechnica.com/feed/')
		.then(response => response.text())
		.then(xml => {

			/*
				First, convert the xml text string into an object,
				and retrieve the property which contains all of the articles.
			*/
			const parser = new XMLParser()
			const obj = parser.parse(xml)
			const items = obj['rss']['channel']['item']

			/*
				Now retrieve the thumbnail image URLs from
				the feed xml text string using a regex. 
				We do this because the xml parser does not 
				properly parse the image data in the xml.
			*/
			const regexp = /<media:thumbnail.+url="(.+)" width/g
			const thumbnails = [...xml.matchAll(regexp)]

			/*
				We now need to modify each element of the feed's items[] array:
					1. Add an id/key property.
					2. Create a new author property which is simply a copy
					of the dc:creator property for better naming.
					3. Assign the thumbnail image in the regex array
					   to a new thumbnail property in the items object.
					4. Modify the date property from something like:
						Thu, 16 Jan 2025 19:49:59 +0000
					to:
						16 Jan 2025
			*/
			for (let i=0; i < items.length; i++) {
				items[i].id 		= i
				items[i].author 	= items[i]['dc:creator']
				items[i].thumbnail	= thumbnails[i][1]
				items[i].pubDate 	= items[i].pubDate.split(' ').slice(1,4).join(' ')
			}	

			// set the articles state to the processed items
			setArticles(items)

			// hide the loading spinner and show the articles
			setAppState('loaded')
		})
		.catch(()=>{
			setAppState('error')
		}) 
	},[appState])


	// click handler for the "load feed" button
	const onLoadFeed = () => {
		setAppState('loading')
	}

	// click handler for the pagination buttons
	// Note that the number passed into the function is 1-based,
	// but all cursor state variables are 0-based, so we subtract
	// 1 from the number when using it with cursor data.
	const onSelectPage = (ev,number) => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		})		
		setCursorPos(number-1)
		setCursorRange(cursor.getRange(number-1))
	}

	// Build our pagination buttons.
	// Code is from bootstrap-react's own example
	let paginationButtons = []
	for (let number = 1; number <= totalPages; number++) {
		paginationButtons.push(
			<Pagination.Item key={number} active={number === cursorPos+1} onClick={e => onSelectPage(e,number)}>
			{number}
			</Pagination.Item>,
		)
	}

	return (
    <>
	<ThemeSwitcher />
	<h1 style={{textAlign:'center'}}>Ars Technica RSS Feed</h1>
	<h3 style={{textAlign:'center'}}>{getDate(Date.now())}</h3>
	{
		// if in our initial state, show the "load feed" button
		appState === 'init' && 
		<div className="text-center">
			<Button 
				className="rounded-pill"
				onClick={() => onLoadFeed()}
			>
				load feed...
			</Button>
		</div>
	}
	{
		// If the feed is loading, show our loading spinner
		appState === 'loading' &&
		<div className="d-flex justify-content-center">
			<Spinner animation="border" role="status">
				<span className="visually-hidden">Loading...</span>
			</Spinner>
		</div>
	}
	{
		// if we had an error, show the alert box
		appState === 'error' &&
		<div className="d-flex justify-content-center mt-3">
			<Alert variant="danger" onClose={() => {setAppState('init');setArticles(null)}} dismissible>
			<Alert.Heading>Unable to Load RSS Feed.</Alert.Heading>
			<p>
				This is most likely a CORS proxy error. Please try again in 5-10 seconds.
			</p>
		</Alert>
	  </div>
	}
	{
		// if the feed loaded and we have articles, show the article cards
		appState === 'loaded' && articles && 
		<Container style={{ margin: '0 auto' }} className="pt-3">
			{articles.slice(cursorRange.start,cursorRange.end+1).map(article => {
				return <Card key={article.id} className="mb-3" style={{ width: columnWidth, margin: '0 auto', borderWidth:'2px'}}>
					<Card.Img className="m-3 mb-0" style={{width: '100px',height:'auto',borderRadius:'50%'}} variant="top" src={article.thumbnail} />	
					<Card.Body>
						<Card.Title className="mt-0">{article.title}</Card.Title>
						<Card.Text>
							{article.description}
						</Card.Text>
						<hr/>
						<Card.Subtitle className="mb-2 atext-muted">{article.author}</Card.Subtitle>
						<Card.Subtitle className="mb-2 atext-muted">{article.pubDate}</Card.Subtitle>
						<hr/>
						<Button className="rounded-pill" target="_blank" href={article.link}>Read the article...</Button> 
					</Card.Body>
				</Card>
			})}
		</Container>
	}
	{
		// if the feed loaded and we have articles, show the page paginator
		appState === 'loaded' && articles && 
		<Pagination className="justify-content-center">
			{paginationButtons}
		</Pagination>
	}
	<footer
		style = {{
			width: columnWidth,
			margin: '0 auto',
			textAlign: 'center',
			fontFamily: 'monospace',
			fontSize: '0.8em',
			fontWeight: 'bold',
			lineHeight: '1.2'
		}}
	>
		<hr />
		<p>
			Copyright &copy; 2025 Charles E. Friedman.
			<br />
			This applet was built using vite, React, and React Bootstrap. 
			It uses a custom light/dark theme switcher, and Array.map(), a custom hook paginator, a custom error handler, and a promise-based fetch() call in useEffect() to load and display the article cards. 
			<br />
			The source code is available on GitHub <a href="https://github.com/seecoderun/atfeed">here</a>.
		</p>
	</footer>
	</>
	)
}

export default App
