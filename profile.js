const API_KEY = '8c8a3ade-5e32-4cd5-adb1-ed1504deeab4';

window.onload = async function () {
  await fetch(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=${API_KEY}`)
    .then((response) => response.json())
    .then((data) => {
      const orders = document.querySelector('#orders');
      console.log(data);
      orders.innerText = JSON.stringify(data);
    })
    .catch((error) => console.error('Ошибка:', error));
};
