/////////////////// SETUP /////////////////
let linksObj = {
	listOfLinks: []
}

//Intro
const totalLinksSaved = document.getElementById('totalLinksSaved')
const masterList = document.getElementById('masterList')

const errorMessage = document.getElementById('errorMessage')
const errorMessageTxt = document.querySelector('#errorMessage span')
const thanksMessage = document.getElementById('thanksMessage')
const thanksMessageTxt = document.querySelector('#thanksMessage span')
const removeMessage = document.getElementById('removeMessage')
const removeMessageTxt = document.querySelector('#removeMessage span')
const messages = document.getElementById('messages')

const closeMessage = document.querySelectorAll('#messages a')

const newUrlField = document.querySelector('#newLink input[name="newLink"]')
const submitBtn = document.querySelector('#newLink input[type="submit"]')

//Pagination
const pagination = document.getElementById('pagination')
const pgNums = document.querySelector('#pagination span')
const prevBtn = document.querySelector('#pagination a[data-pg="prev"]')
const nextBtn = document.querySelector('#pagination a[data-pg="next"]')
let currentPage = 1
let totalLinks = 0
let totalPages = 0
let perPage = 20
let onThisPage = 0





//////////////////URL CHECKER///////////////////////////
const checkUrl = url=> {
	return fetch(url, {mode: 'no-cors'}).then( r=> {
		if (r.status == 404) {
			return false
		} else {
			return true
		}
	})
	.catch( e=> {
		return false
	})
}

/////////////////////PRINT ARRAY/////////////////
const printLinks = (newPageNum)=> {
	//Clear links
	masterList.innerHTML = ''
	nextBtn.classList.remove('shown')
	prevBtn.classList.remove('shown')
	pgNums.innerHTML = ''

	//Pagination
	currentPage = newPageNum
	totalLinks = linksObj.listOfLinks.length
	totalPages = Math.ceil(totalLinks / perPage)
	
	//Set number of links on current page
	if (currentPage == totalPages) {
		onThisPage = totalLinks - ((totalPages - 1) * perPage)
	} else {
		onThisPage = perPage
	}
	
	//Show total links (no plural if only 1)
	let linkWord = 'links'
	if (totalLinks == 1) { linkWord = 'link' }
	totalLinksSaved.innerHTML = totalLinks + ' ' + linkWord

	//Show previous button if not on first page
	if (currentPage > 1) {
		prevBtn.classList.add('shown')
	}

	//Show next button if more than one page
	if (currentPage < totalPages) {
		nextBtn.classList.add('shown')
	}

	//Create page links
	for (let i=1;i<=totalPages;i++) {
		const pgNum = document.createElement('a')
		pgNum.setAttribute('data-pg', i)
		pgNum.addEventListener('click', e=> {
			e.preventDefault()
			printLinks(i)
		})

		pgNums.append(pgNum)
		pgNum.innerHTML = i
		pgNum.classList.add('shown')
	}

	if (totalLinks > 0) {
		const currentLink = document.querySelector('#pagination a[data-pg="' + currentPage + '"]')
		currentLink.classList.add('currentLink')
	}

	//add links
	if (totalLinks > 0) {
		for (let i = (currentPage - 1) * perPage; i < ((currentPage - 1) * perPage) + onThisPage; i++) {
			const link = linksObj.listOfLinks[i]
			const listItem = document.createElement('li')

			//Create remove button
			const removeBtn = document.createElement('a')
			removeBtn.innerHTML = 'X'
			removeBtn.classList.add('cta')
			//Remove button remove
			removeBtn.addEventListener('click', e=> {
				e.preventDefault()

				messages.classList.add('shown')
				removeMessage.classList.add('active')
				removeMessageTxt.innerHTML = link

				linksObj.listOfLinks.splice(i,1)
				setCookie()
				printLinks(1)
			})

			
			listItem.innerHTML = link
			listItem.appendChild(removeBtn)

			masterList.append(listItem)
		}
	}
}

/////PREV & NEXT /////
prevBtn.addEventListener('click', e=>{
	e.preventDefault()
	currentPage--
	printLinks(currentPage)
})

nextBtn.addEventListener('click', e=>{
	e.preventDefault()
	currentPage++
	printLinks(currentPage)
})



//////////LOAD FROM COOKIE//////////////
const pushLinks = loadedLinks=> {
	loadedLinks.listOfLinks.forEach( link=> {
		//Check for duplicates
		if(linksObj.listOfLinks.indexOf(link) == -1) {
			linksObj.listOfLinks.push(link)
		}
	})
	printLinks(1)
}

const loadFromCookie = ()=> {
	const cookieArray = document.cookie.split('; ')
	let loadedLinks = null

	cookieArray.forEach(cookie => {
		//Check if any links saved as cookie
		if(cookie.indexOf('listOfLinks') > -1) {
			//Unpack cookie string and push links
			loadedLinks = JSON.parse(cookie)
		}
	})
	if (loadedLinks) {
		pushLinks(loadedLinks)
	}
}
loadFromCookie()


///////////////////SET COOKIE/////////////////
const setCookie = ()=> {
	const linksObjStr = JSON.stringify(linksObj)
	document.cookie = linksObjStr
}


/////////////////////FORM SUBMIT//////////////
const newLink = document.getElementById('newLink')
newLink.addEventListener('submit', e=> {
	e.preventDefault()

	const urlToSubmit = newUrlField.value
	checkUrl(urlToSubmit).then(function(result) {
		if (!result) {
			linkFail(urlToSubmit,urlToSubmit + ' does not exist')
		} else {
			//Check for duplicates
			if(linksObj.listOfLinks.indexOf(urlToSubmit) == -1) {
				linkSuccess(urlToSubmit)
			} else {
				linkFail(urlToSubmit,urlToSubmit + ' is already on your list')
			}
		}
	})
})

////////////////////MESSAGES///////////////////
const linkFail = (url,reason)=> {
	messages.classList.add('shown')
	errorMessage.classList.add('active')
	errorMessageTxt.innerHTML = reason
}

const linkSuccess = url=> {
	messages.classList.add('shown')
	thanksMessage.classList.add('active')
	thanksMessageTxt.innerHTML = url

	newUrlField.value = ''

	linksObj.listOfLinks.unshift(url)
	setCookie()
	printLinks(1)
}

Array.from(closeMessage).forEach( closeBtn=> {
	closeBtn.addEventListener('click', e=> {
		e.preventDefault()
		messages.classList.remove('shown')
		errorMessage.classList.remove('active')
		thanksMessage.classList.remove('active')
		removeMessage.classList.remove('active')

		//Clear text after animation
		setTimeout(()=>{
			thanksMessageTxt.innerHTML = ''
			errorMessageTxt.innerHTML = ''
			removeMessageTxt.innerHTML = ''
		}, 320)
	})
})