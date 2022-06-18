const test = document.getElementById("test");
const next = document.getElementById("next");
const prev = document.getElementById("prev");
const search = document.getElementById("search");
const submit = document.getElementById("submit");
const searchForm = document.getElementById("searchForm");
const body = document.getElementsByTagName("body")[0];
const log = document.getElementById("log");
const logState = log.innerHTML;

const nav = document.getElementById("nav");

function print(stuff) {
    const newElement = document.createElement("div");
    newElement.innerHTML = stuff;
    log.appendChild(newElement);
}

function printTable() {
    const newRow = document.createElement("tr");
    for (let arg of arguments) {
        const cell = document.createElement("td");
        if (arg.search(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g) != -1) {
            cell.innerHTML = `<img src="${arg}">`;
        } else {
            cell.innerHTML = arg;
        }
        newRow.appendChild(cell);
    }
    log.appendChild(newRow);
    newRow.scrollIntoView({behavior:'smooth'});
}

function printImage(stuff) {
    const newElement = document.createElement("img");
    newElement.src = stuff;
    log.appendChild(newElement);
}

function resetLog() {
    log.innerHTML = logState;
}

function searchPokemon(name, method) {
    if (name == "") {
        print("Please enter Pokemon name.");
        return;
    }
    let searchString = `https://pokeapi.co/api/v2/pokemon/${name}/`;
    if (document.getElementById("uncache").checked == true) {
        searchString = searchString + "?token=" + Math.floor(Math.random() * 100001);
    }
    let startDate;
    let endDate;
    switch (method) {
        case "ajax":
            startDate = new Date();
            const request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 404) {
                    print("Pokemon not found.");
                } else if (this.readyState == 4 && this.status == 200) {
                    endDate = new Date();
                    printTable(JSON.parse(this.response).sprites.front_default, `${endDate - startDate} ms`);
                }
            }
            request.open("GET", searchString);
            request.send();
            break;
        case "promise":
            startDate = new Date();
            const fetchPromise = fetch(searchString);
            fetchPromise.then((response) => {
                return response.json();
            }).catch(error => {
                print("Pokemon not found.")
            }).then((data) => {
                endDate = new Date();
                printTable(data.sprites.front_default, `${endDate - startDate} ms`);
            });
            break;
        case "await":
            startDate = new Date();
            (async function () {
                try {
                    const response = await fetch(searchString);
                    const data = await response.json();
                    endDate = new Date();
                    printTable(data.sprites.front_default, `${endDate - startDate} ms`)
                } catch (err) {
                    print("Pokemon not found.");
                }
            })();
            break;
        default:
            return;
    }
}

document.getElementById("ajax").addEventListener("click", () => {
    searchPokemon(search.value, "ajax");
});

document.getElementById("promise").addEventListener("click", () => {
    searchPokemon(search.value, "promise");
});

document.getElementById("await").addEventListener("click", () => {
    searchPokemon(search.value, "await");
});

search.addEventListener("keydown", function (event) {
    if (event.code === "Enter") {
        searchPokemon(search.value, "ajax");
    }
})

log.style.paddingTop = `${nav.offsetHeight}px`;