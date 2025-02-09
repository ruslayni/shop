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
			console.log('API ініціалізовано')
			loadSheetData()
			updateCartUI()
		})
		.catch(function (error) {
			console.log('Помилка ініціалізації API:', error)
		})
}

function loadSheetData() {
	var spreadsheetId = '1Xj6SNVMKKgCS3jDN5_FLwmGfwEQ_eTl4yOmC4EbXVPk'
	var range = 'Sheet1!A1:D20'

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
					console.log('Дані не знайдено.')
				}
			},
			function (error) {
				console.log('Помилка: ' + error.result.error.message)
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
			title.textContent = row[1] || 'Немає назви'
			card.appendChild(title)

			let description = document.createElement('p')
			description.textContent = row[2] || 'Опис відсутній'
			card.appendChild(description)

			let price = document.createElement('p')
			price.classList.add('price')
			price.textContent = row[3] ? `${row[3]} грн` : 'Ціна не вказана'
			card.appendChild(price)

			let button = document.createElement('button')
			button.textContent = 'Купити'
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
		price.textContent = item.price ? `${item.price} грн` : 'Ціна не вказана'
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

	let total = 0 // Загальна сума всіх товарів

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
		price.textContent = item.price ? `${item.price} грн` : 'Ціна не вказана'
		cartItem.appendChild(price)

		// Додаємо кнопку видалення товару
		let removeBtn = document.createElement('button')
		removeBtn.textContent = 'X'
		removeBtn.onclick = function () {
			removeFromCart(index)
		}
		cartItem.appendChild(removeBtn)

		cartContainer.appendChild(cartItem)

		// Рахуємо загальну суму
		if (item.price) {
			total += parseFloat(item.price)
		}
	})

	// Відображаємо загальну суму
	let totalElement = document.createElement('p')
	totalElement.textContent = `Загальна сума: ${total} грн`
	totalElement.style.fontWeight = 'bold'
	totalElement.style.marginTop = '10px'
	cartContainer.appendChild(totalElement)

	document.getElementById('cartCount').textContent = cart.length
}

// Функція для видалення товару з кошика
function removeFromCart(index) {
	cart.splice(index, 1)
	localStorage.setItem('cart', JSON.stringify(cart))
	updateCartUI()
}

function sendOrderToTelegram() {
	if (cart.length === 0) {
		alert('Ваш кошик порожній!')
		return
	}

	let totalPrice = 0
	let orderText = '🛒 *Ваше замовлення:*\n\n'

	cart.forEach((item, index) => {
		orderText += `${index + 1}. ${item.name} - ${item.price} грн\n`
		totalPrice += parseFloat(item.price)
	})

	orderText += `\n💰 *Загальна сума: ${totalPrice} грн*`

	let encodedText = encodeURIComponent(orderText)
	let telegramLink = `https://t.me/nicestbeer?text=${encodedText}`

	window.open(telegramLink, '_blank')
}

let lastScrollTop = 0
const header = document.querySelector('header')

window.addEventListener('scroll', function () {
	let scrollTop = window.scrollY || document.documentElement.scrollTop

	if (scrollTop > lastScrollTop && scrollTop > 50) {
		header.style.transform = 'translateY(-100%)' // Ховаємо хедер
	} else {
		header.style.transform = 'translateY(0)' // Показуємо хедер
	}

	lastScrollTop = scrollTop
})

document.addEventListener('DOMContentLoaded', function () {
	const button = document.getElementById('scrollToTopBtn')

	window.addEventListener('scroll', function () {
		if (window.scrollY > 300) {
			button.style.display = 'block'
		} else {
			button.style.display = 'none'
		}
	})

	button.addEventListener('click', function () {
		window.scrollTo({ top: 0, behavior: 'smooth' })
	})
})
function showNotification(message) {
	let notification = document.getElementById('notification')
	notification.textContent = message
	notification.style.display = 'block'

	setTimeout(() => {
		notification.style.display = 'none'
	}, 2000)
}
function addToCart(image, name, price) {
	cart.push({ image, name, price })
	localStorage.setItem('cart', JSON.stringify(cart))
	updateCartUI()
	showNotification('✅ Товар додано в кошик!')
}
