let cart = JSON.parse(localStorage.getItem("cart")) || [];

const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTmfwSchEjlnHla2WdD3Nf3qLlptqHDtrK4OSsHNC4_0WE1N0fmfy1nrs4rduHOR1IZrpQMwgTy7JKO/pub?output=csv";

async function loadSheetData() {
  try {
    const response = await fetch(sheetURL);
    const data = await response.text();
    const rows = data
      .split("\n")
      .map((row) => row.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")));

    displayData(rows);
  } catch (error) {
    console.error("Помилка завантаження даних:", error);
  }
}

function displayData(data) {
  let container = document.getElementById("productsContainer");
  container.innerHTML = "";

  data.forEach((row, index) => {
    if (index === 0) return; // Пропускаем заголовки

    let imageUrl = row[0] || "";
    let name = row[1] || "";
    let description = row[2] || "";
    let price = row[3] || "";

    // Проверяем, есть ли основные данные (название и цена)
    if (!name || !price) return;

    let card = document.createElement("div");
    card.classList.add("product-card");

    let img = document.createElement("img");
    if (imageUrl.includes("drive.google.com")) {
      let fileId = imageUrl.split("/d/")[1]?.split("/")[0];
      imageUrl = fileId
        ? `https://drive.google.com/uc?export=view&id=${fileId}`
        : imageUrl;
    }
    img.src = imageUrl || "https://via.placeholder.com/150"; // Заглушка, если нет картинки
    card.appendChild(img);

    let title = document.createElement("h3");
    title.textContent = name;
    card.appendChild(title);

    let desc = document.createElement("p");
    desc.textContent = description || "Опис відсутній";
    card.appendChild(desc);

    let priceEl = document.createElement("p");
    priceEl.classList.add("price");
    priceEl.textContent = `${price} грн`;
    card.appendChild(priceEl);

    let button = document.createElement("button");
    button.textContent = "Купити";
    button.onclick = function () {
      addToCart(imageUrl, name, price);
    };
    card.appendChild(button);

    container.appendChild(card);
  });
}

function addToCart(image, name, price) {
  cart.push({ image, name, price });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  let cartContainer = document.getElementById("cartContainer");
  cartContainer.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    let cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");

    let img = document.createElement("img");
    img.src = item.image;
    cartItem.appendChild(img);

    let name = document.createElement("p");
    name.textContent = item.name;
    cartItem.appendChild(name);

    let price = document.createElement("p");
    price.textContent = `${item.price} грн`;
    cartItem.appendChild(price);

    let removeBtn = document.createElement("button");
    removeBtn.textContent = "X";
    removeBtn.onclick = function () {
      removeFromCart(index);
    };
    cartItem.appendChild(removeBtn);

    cartContainer.appendChild(cartItem);

    total += parseFloat(item.price);
  });

  let totalElement = document.createElement("p");
  totalElement.textContent = `Загальна сума: ${total} грн`;
  totalElement.style.fontWeight = "bold";
  totalElement.style.marginTop = "10px";
  cartContainer.appendChild(totalElement);

  // Добавляем кнопку оформления заказа

  
  orderButton.onclick = sendOrderToTelegram;
  cartContainer.appendChild(orderButton);

  document.getElementById("cartCount").textContent = cart.length;
}

// Функции для работы с корзиной
function toggleCart() {
  let cartModal = document.getElementById("cartModal");
  cartModal.style.display = cartModal.style.display === "flex" ? "none" : "flex";
}

function closeCart() {
  document.getElementById("cartModal").style.display = "none";
}

function clearCart() {
  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

// Функция для отправки заказа в Telegram
function sendOrderToTelegram() {
  if (cart.length === 0) {
    alert("Ваш кошик порожній!");
    return;
  }

  let totalPrice = 0;
  let orderText = "🛒 Ваше замовлення:\n\n";

  cart.forEach((item, index) => {
    orderText += `${index + 1}. ${item.name} - ${item.price} грн\n`;
    totalPrice += parseFloat(item.price);
  });

  orderText += `\n💰 Загальна сума: ${totalPrice} грн`;

  let encodedText = encodeURIComponent(orderText);
  let telegramLink = `https://t.me/nicestbeer?text=${encodedText}`;

  window.open(telegramLink, "_blank");
}

// При загрузке страницы загружаем данные и обновляем корзину
document.addEventListener("DOMContentLoaded", function () {
  loadSheetData();
  updateCartUI();
});
