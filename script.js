let cart = JSON.parse(localStorage.getItem('cart')) || []

function start() {
	gapi.client
		.init({
			apiKey: 'AIzaSyBqfegNzLdXeh2J0z5HosC9G1YF8vzOMmo',
			discoveryDocs: [
				'https://sheets.googleapis.com/$discovery/rest?version=v4',
			],
		})
		.then(function () {
			console.log('API Initialized')
			loadSheetData()
			updateCartUI()
		})
		.catch(function (error) {
			console.log('Error initializing API:', error)
		})
}

function loadSheetData() {
	var spreadsheetId = '1Xj6SNVMKKgCS3jDN5_FLwmGfwEQ_eTl4yOmC4EbXVPk'
	var range = 'Sheet1!A1:D10'

	gapi.client.sheets.spreadsheets.values
		.get({
			spreadsheetId: spreadsheetId,
			range: range,
		})
		.then(
			function (response) {
				var data = response.result.values
				if (data && data.length) {
					displayData(data)
				} else {
					console.log('No data found.')
				}
			},
			function (error) {
				console.log('Error: ' + error.result.error.message)
			}
		)
}

function displayData(data) {
	let container = document.getElementById('productsContainer')
	container.innerHTML = ''

	data.forEach(row => {
		if (row.length > 0 && row.some(cell => cell.trim() !== '')) {
			let card = document.createElement('div')
			card.classList.add('product-card')

			let img = document.createElement('img')
			let imageUrl = row[0] || 'https://via.placeholder.com/400'

			if (imageUrl.includes('drive.google.com')) {
				let fileId = imageUrl.split('/d/')[1]?.split('/')[0]
				imageUrl = fileId
					? `https://drive.google.com/uc?export=view&id=${fileId}`
					: imageUrl
			}

			img.src = imageUrl
			card.appendChild(img)

			let title = document.createElement('h3')
			title.textContent = row[1] || 'Нет названия'
			card.appendChild(title)

			let description = document.createElement('p')
			description.textContent = row[2] || 'Описание отсутствует'
			card.appendChild(description)

			let price = document.createElement('p')
			price.classList.add('price')
			price.textContent = row[3] ? `${row[3]} грн` : 'Цена не указана'
			card.appendChild(price)

			let button = document.createElement('button')
			button.textContent = 'Купить'
			button.onclick = function () {
				addToCart(imageUrl, row[1], row[3])
			}
			card.appendChild(button)

			container.appendChild(card)
		}
	})
}

function addToCart(image, name, price) {
	cart.push({ image, name, price })
	localStorage.setItem('cart', JSON.stringify(cart))
	updateCartUI()
}

function updateCartUI() {
	let cartContainer = document.getElementById('cartContainer')
	cartContainer.innerHTML = ''

	cart.forEach((item, index) => {
		let cartItem = document.createElement('div')
		cartItem.classList.add('cart-item')

		let img = document.createElement('img')
		img.src = item.image
		cartItem.appendChild(img)

		let name = document.createElement('p')
		name.textContent = item.name
		cartItem.appendChild(name)

		let price = document.createElement('p')
		price.textContent = item.price ? `${item.price} грн` : 'Цена не указана'
		cartItem.appendChild(price)

		cartContainer.appendChild(cartItem)
	})

	document.getElementById('cartCount').textContent = cart.length
}

gapi.load('client', start)
function toggleCart() {
	let cartModal = document.getElementById('cartModal')
	cartModal.style.display = cartModal.style.display === 'flex' ? 'none' : 'flex'
}

function closeCart() {
	document.getElementById('cartModal').style.display = 'none'
}

function clearCart() {
	cart = []
	localStorage.setItem('cart', JSON.stringify(cart))
	updateCartUI()
}
function updateCartUI() {
	let cartContainer = document.getElementById('cartContainer')
	cartContainer.innerHTML = ''

	let total = 0 // Сумма всех товаров

	cart.forEach((item, index) => {
		let cartItem = document.createElement('div')
		cartItem.classList.add('cart-item')

		let img = document.createElement('img')
		img.src = item.image
		cartItem.appendChild(img)

		let name = document.createElement('p')
		name.textContent = item.name
		cartItem.appendChild(name)

		let price = document.createElement('p')
		price.textContent = item.price ? `${item.price} грн` : 'Цена не указана'
		cartItem.appendChild(price)

		// Добавляем кнопку удаления товара
		let removeBtn = document.createElement('button')
		removeBtn.textContent = 'X'
		removeBtn.onclick = function () {
			removeFromCart(index)
		}
		cartItem.appendChild(removeBtn)

		cartContainer.appendChild(cartItem)

		// Считаем сумму
		if (item.price) {
			total += parseFloat(item.price)
		}
	})

	// Отображаем общую сумму
	let totalElement = document.createElement('p')
	totalElement.textContent = `Общая сумма: ${total} грн`
	totalElement.style.fontWeight = 'bold'
	totalElement.style.marginTop = '10px'
	cartContainer.appendChild(totalElement)

	document.getElementById('cartCount').textContent = cart.length
}

// Функция для удаления товара из корзины
function removeFromCart(index) {
	cart.splice(index, 1)
	localStorage.setItem('cart', JSON.stringify(cart))
	updateCartUI()
}
function sendOrderToTelegram() {
	if (cart.length === 0) {
		alert('Ваша корзина пуста!')
		return
	}

	let totalPrice = 0
	let orderText = '🛒 *Ваш заказ:*\n\n'

	cart.forEach((item, index) => {
		orderText += `${index + 1}. ${item.name} - ${item.price} грн\n`
		totalPrice += parseFloat(item.price)
	})

	orderText += `\n💰 *Общая сумма: ${totalPrice} грн*`

	let encodedText = encodeURIComponent(orderText)
	let telegramLink = `https://t.me/nicestbeer?text=${encodedText}`

	window.open(telegramLink, '_blank')
}
let lastScrollTop = 0
const header = document.querySelector('header')

window.addEventListener('scroll', function () {
	let scrollTop = window.scrollY || document.documentElement.scrollTop

	if (scrollTop > lastScrollTop) {
		header.style.top = '-60px' // Прячем хедер
	} else {
		header.style.top = '0' // Показываем хедер
	}

	lastScrollTop = scrollTop
})
