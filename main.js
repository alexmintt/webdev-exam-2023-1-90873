'use strict'

const API_KEY = '8c8a3ade-5e32-4cd5-adb1-ed1504deeab4'

let routesData;
let filteredRoutes;

let selectedRoute = {};
let selectedGuide = {};

const itemsPerPage = 5;
let currentPage = 1;

function handleTableClick(event) {
    const { target } = event;
    const row = document.querySelectorAll('th');
    if (target.classList.contains('choose')) {
        for (let i = 6; i < row.length; i += 1) {
            if (target.id === row[i].id) {
                row[i].classList.add('table-success');
            } else {
                row[i].classList.remove('table-success');
            }
        }
    }
}

function guideOptions() {
    const list = document.querySelectorAll('.guide-table tr');
    const from = Number(document.getElementById('guide-input-expfrom').value);
    const to = Number(document.getElementById('guide-input-expto').value);
    Array.from(list.keys()).forEach((i) => {
        if ((from === 0 || from <= list[i].cells[3].innerHTML)
            && (to === 0 || to >= list[i].cells[3].innerHTML)
            && (document.getElementById('selectlang').options[document.getElementById('selectlang').selectedIndex].innerHTML === 'Язык экскурсии'
                || document.getElementById('selectlang').options[document.getElementById('selectlang').selectedIndex].innerHTML === list[i].cells[2].innerHTML)) {
            list[i].classList.remove('d-none');
        } else {
            list[i].classList.add('d-none');
        }
        console.log(list[i].cells[2].innerHTML);
    });
}

async function submitBooking(e) {
    e.preventDefault();
    const date = document.querySelector('#excursionDate').value;
    const time = document.querySelector('#excursionTime').value;
    const duration = document.querySelector('#excursionDuration').value;
    const persons = document.querySelector('#groupSize').value;
    const option1 = document.querySelector('#additionalOption1').checked;
    const option2 = document.querySelector('#additionalOption2').checked;
    const price = document.querySelector('#totalCost').value;
    const data = {
        date,
        duration: parseInt(duration, 10),
        guide_id: selectedGuide.id,
        optionFirst: option1 ? 1 : 0,
        optionSecond: option2 ? 1 : 0,
        persons: parseInt(persons, 10),
        price: parseInt(price, 10),
        route_id: selectedRoute.id,
        time,
    };

    const formData = new FormData();
    Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
    });

    await fetch(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=${API_KEY}`, {
        method: 'POST',
        body: formData,
    })
        .then((response) => response.json())
        .then((resData) => console.log(resData))
        .catch((error) => console.error('Ошибка:', error));
}

function clearTable() {
    const tableBody = document.getElementById('routesTableBody');
    tableBody.innerHTML = '';
}

function removeOptions(selectElement) {
    let i; const
        L = selectElement.options.length - 1;
    for (i = L; i >= 0; i -= 1) {
        selectElement.remove(i);
    }
    const selects = document.getElementById('selectlang');
    const option = document.createElement('option');
    option.value = '';
    option.innerHTML = 'Язык экскурсии';
    selects.appendChild(option);
}

function createLanguageSelect(arr) {
    const select = document.getElementById('selectlang');
    arr.forEach((language) => {
        const opt = document.createElement('option');
        opt.value = language;
        opt.innerHTML = language;
        select.appendChild(opt);
    });
}

function updatePricing(guide) {
    const hours = document.getElementById('excursionDuration').value;
    const groupSize = document.getElementById('groupSize').value;
    const option1 = document.getElementById('additionalOption1');
    const option2 = document.getElementById('additionalOption2');
    let cost = guide.pricePerHour * hours * groupSize;
    if (option1.checked) {
        cost *= 1.3;
        cost = Math.floor(cost);
    }
    if (option2.checked) {
        cost += groupSize * 500;
    }
    document.getElementById('totalCost').value = cost;
}

function formatDate(date) {
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`;
    const day = `${d.getDate()}`;
    const year = d.getFullYear();

    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
}

function openBookingModal(guide, selectedRouteId) {
    selectedGuide = guide;
    selectedRoute = routesData.find((route) => route.id === selectedRouteId);
    console.log(selectedGuide);
    document.getElementById('guideName').value = selectedGuide.name;
    document.getElementById('routeName').value = selectedRoute.name;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const threeMonthsFromTomorrow = new Date(tomorrow);
    threeMonthsFromTomorrow.setMonth(threeMonthsFromTomorrow.getMonth() + 3);

    if (threeMonthsFromTomorrow.getDate() !== tomorrow.getDate()) {
        threeMonthsFromTomorrow.setDate(0);
    }

    document.getElementById('excursionDate').min = formatDate(tomorrow);
    document.getElementById('excursionDate').max = formatDate(threeMonthsFromTomorrow);
    document.getElementById('excursionDate').value = formatDate(tomorrow);

    document.getElementById('excursionTime').value = '17:00';
    document.getElementById('excursionDuration').value = '1';
    document.getElementById('excursionDuration').addEventListener('change', () => updatePricing(guide));

    document.getElementById('groupSize').value = '5';
    document.getElementById('groupSize').addEventListener('change', () => updatePricing(guide));
    document.getElementById('totalCost').value = '';

    document.getElementById('additionalOption1').checked = false;
    document.getElementById('additionalOption1').addEventListener('change', () => updatePricing(guide));
    document.getElementById('additionalOption2').checked = false;
    document.getElementById('additionalOption2').addEventListener('change', () => updatePricing(guide));
    updatePricing(guide);
}

function guideDownload(id) {
    const guideTable = document.querySelector('.guide-table');
    let arroption = [];
    fetch(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes/${id}/guides?api_key=${API_KEY}`)
        .then((response) => response.json())
        .then((response) => {
            arroption = [];
            removeOptions(document.getElementById('selectlang'));
            guideTable.innerHTML = '';
            console.log(response);
            response.forEach((guide) => {
                const row = guideTable.insertRow();
                const image = row.insertCell(0);
                image.innerHTML = '<img class="rounded-circle" src="him.jpg" height="40px" alt="Фоточка" />';
                row.insertCell(1).textContent = guide.name;
                row.insertCell(2).textContent = guide.language;
                row.insertCell(3).textContent = guide.workExperience;
                row.insertCell(4).textContent = guide.pricePerHour;

                const selectCell = row.insertCell();
                selectCell.innerHTML = '<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#requestModal">Выбрать</button>';
                selectCell.onclick = () => {
                    openBookingModal(guide, id);
                };
                arroption.push(guide.language);
            });
            createLanguageSelect([...new Set(arroption)]);
        });
}

function addRoutesToTable(routes) {
    const tableBody = document.getElementById('routesTableBody');

    routes.forEach((route) => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = route.name;
        row.cells[0].scope = 'row';
        row.insertCell(1).textContent = route.description;
        row.insertCell(2).textContent = route.mainObject;

        const selectButton = document.createElement('button');
        selectButton.innerText = 'Выбрать';
        selectButton.classList.add('btn', 'btn-primary');
        selectButton.addEventListener('click', () => guideDownload(route.id));
        row.insertCell(3).appendChild(selectButton);
    });
}

function handlePaginationClick(pageNumber) {
    currentPage = pageNumber;
    // eslint-disable-next-line no-use-before-define
    updateRoutesTableData();
}

function createPaginationItem(text, pageNumber) {
    const pageItem = document.createElement('li');
    pageItem.className = 'page-item';

    const pageLink = document.createElement('a');
    pageLink.className = 'page-link';
    pageLink.innerText = text;

    if ((text === '...') || (text === 'Previous' && currentPage === 1) || (text === 'Next' && currentPage === Math.ceil((filteredRoutes ? filteredRoutes.length : routesData.length) / itemsPerPage))) {
        pageItem.classList.add('disabled');
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            handlePaginationClick(pageNumber);
        });
    } else {
        pageLink.addEventListener('click', () => handlePaginationClick(pageNumber));
    }

    if (pageNumber === currentPage) {
        pageItem.classList.add('active');
    }

    pageItem.appendChild(pageLink);

    return pageItem;
}

function updatePagination() {
    const paginationElement = document.getElementById('pagination');
    const totalPages = Math.ceil((
        filteredRoutes ? filteredRoutes.length : routesData.length) / itemsPerPage);

    paginationElement.innerHTML = '';

    const prevItem = createPaginationItem('Previous', currentPage - 1);
    paginationElement.appendChild(prevItem);

    const allPagesArray = Array.from(Array(totalPages).keys()).map((it) => it + 1);
    let pagPages = allPagesArray.filter((page) => {
        if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
            return page;
        }
        return false;
    });
    if (pagPages[0] + 1 !== pagPages[1]) {
        pagPages = [...pagPages.slice(0, 1), '...', ...pagPages.slice(1)];
    }
    if (pagPages[pagPages.length - 1] - 1 !== pagPages[pagPages.length - 2]) {
        pagPages = [...pagPages.slice(0, pagPages.length - 1), '...', ...pagPages.slice(pagPages.length - 1)];
    }
    pagPages.forEach((item) => {
        const pageItem = createPaginationItem(item, item);
        paginationElement.appendChild(pageItem);
    });

    const nextItem = createPaginationItem('Next', currentPage + 1);
    paginationElement.appendChild(nextItem);
}

function highlightSearchResult(searchKeyword) {
    const tableBody = document.getElementById('routesTableBody');
    const rows = tableBody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i += 1) {
        const cells = rows[i].getElementsByTagName('td');
        const nameCell = cells[0];

        const cellValue = nameCell.innerText;

        const lowerCaseCellValue = cellValue.toLowerCase();
        const lowerCaseSearchKeyword = searchKeyword.toLowerCase();

        if (lowerCaseCellValue.includes(lowerCaseSearchKeyword)) {
            const startIndex = lowerCaseCellValue.indexOf(lowerCaseSearchKeyword);
            const endIndex = startIndex + searchKeyword.length;

            const highlightedText = `${cellValue.substring(0, startIndex)}<span class="search-highlight">${cellValue.substring(startIndex, endIndex)}</span>${cellValue.substring(endIndex)}`;

            nameCell.innerHTML = highlightedText;
        }
    }
}

function updateRoutesTableData() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRoutes = filteredRoutes
        ? filteredRoutes.slice(startIndex, endIndex)
        : routesData.slice(startIndex, endIndex);
    clearTable();
    addRoutesToTable(currentRoutes);
    updatePagination();

    const searchKeyword = document.getElementById('routeInput').value.toLowerCase();
    if (searchKeyword) {
        highlightSearchResult(searchKeyword);
    }
}

function fetchRoutesFromApi() {
    fetch(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=${API_KEY}`)
        .then((response) => response.json())
        .then((data) => {
            routesData = data;
            console.log(routesData);
            updateRoutesTableData();
        })
        .catch((error) => console.error('Error fetching route data:', error));
}

window.onload = function () {
    document.getElementById('guide-input-expfrom').oninput = guideOptions;
    document.getElementById('guide-input-expto').oninput = guideOptions;
    document.getElementById('selectlang').onchange = guideOptions;
    const table = document.querySelector('.table');
    const postBtn = document.querySelector('#postBooking');
    table.addEventListener('click', handleTableClick);
    postBtn.addEventListener('click', (e) => submitBooking(e));
    fetchRoutesFromApi();
};
