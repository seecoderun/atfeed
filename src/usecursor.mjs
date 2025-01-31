/*
	useCursor

	A custom hook wrapping an instance of a pagination cursor class.
	The class is described in detail below.
*/

/*
	class Cursor
	
	A cursor class for paginating data

	The class is data-agnositc; it does not care if you use
	in-memory data, or use the page data as cursor data for
	database queries.

	All numbers and ranges are 0-based.

	The class has the following methods:

		constructor(count, itemsPerPage)
		forward()
		back()
		current()
		getRange(index)
		toStart()
		toEnd()
		count()
		atStart()
		atEnd()

	constructor(count,itemsPerPage)
	-------------------------------
	The constructor takes two required parameters:
		count			- how many items are in the data set
		itemsPerPage	- how many items to display at once

	The constructor sets the current item to 0.

	forward()
	---------
	Moves the cursor to the next block of items. 
	Returns the new current block range:
		{
			start: starting item,
			end: ending item
		}
	If the cursor is currently on the last block,
	it returns the last block.

	back()
	------
	Moves the cursor to the previous block of items.
	Returns the new current block range:
		{
			start: starting item,
			end: ending item
		}
	If the cursor is currently on the first block,
	it returns the first block.

	current()
	---------
	Returns the range for the current block:
		{
			start: starting item,
			end: ending item
		}

	getRange(index)
	---------------
	Returns the range for the specified block.
	The index parameter is 0-based.
	The cursor is NOT moved

	toStart()
	---------
	Moves the cursor to the first block and returns it.

	toEnd()
	---------
	Moves the cursor to the last block and returns it.

	atStart()
	---------
	Returns true if we're on the first block, otherwise false

	atEnd()
	-------
	Returns true if we're on the last block, otherwise false

	count()
	-------
	Returns the count of ranges.
	e.g., consider the following cursor data:
		[
			{start: 0, end: 3},
			{start: 4, end: 7}
		]

	For the above data, count() returns 2,
	because there are two scroll ranges
	stored in the class based on the data
	passed into the constructor.

	Example
	-------

	Let's say you have 20 items, and you want to show
	6 per page. This means you will have 4 pages of
	scroll ranges. The first 3 will each contain
	a range of 6 items, and the last page will contain
	a range of 2 items. 
	
	You would call the constructor as follows:

		const cursor = new Cursor(20,6)

	The data stored in the class would look like this:

		scroll ranges:
			[
				{start: 0, end: 5},
				{start: 6, end: 11},
				{start: 12, end: 17},
				{start: 18, end: 19}
			]
*/

class Cursor
{
	constructor(count,itemsPerPage) {

		// initialize to first bucket
		this.currentBucket = 0

		// our range buckets
		this.buckets = []

		// populate the range bucket array
		const fullbuckets = Math.floor(count /itemsPerPage)
		const endbucketcount = count % itemsPerPage
		const totalbucketcount = fullbuckets + (endbucketcount === 0 ? 0 : 1)

		for (let i=0; i < totalbucketcount; i++)
			this.buckets[i] = {start: i*itemsPerPage, end: ((i+1)*itemsPerPage)-1}
	
		if (endbucketcount !== 0)
			this.buckets[totalbucketcount-1].end = count-1
	}
	
	forward() {
		if (this.currentBucket === this.buckets.length-1)
			return this.buckets[this.buckets.length-1]

		return this.buckets[++this.currentBucket]
	}

	back() {
		if (this.currentBucket === 0)
			return this.buckets[0]

		return this.buckets[--this.currentBucket]
	}

	get count() 	{ return this.buckets.length }

	get current() 	{ return this.buckets[this.currentBucket] }

	getRange(index)	{ return this.buckets[index] }

	toStart()		{ this.currentBucket=0; return this.buckets[this.currentBucket]}

	toEnd()			{ this.currentBucket=this.buckets.length-1; return this.buckets[this.currentBucket]}

	atStart() 		{ return this.currentBucket === 0 }

	atEnd() 		{ return this.currentBucket === thils.buckets.length-1 }
}

// All the hook does is return a new instance of the Cursor class
// based on parameters passed into the hook.
const useCursor = (count,itemsPerPage) =>  {
	return new Cursor(count,itemsPerPage)
}

export default useCursor
