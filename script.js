const PERMISSION_KEY = "LSPD-FTO-2025";
let cadets = JSON.parse(localStorage.getItem("cadets")) || [];


function authorize() {
const key = document.getElementById("auth").value;
if (key === PERMISSION_KEY) {
document.getElementById("cadetPanel").classList.remove("hidden");
renderCadets();
} else alert("Invalid Permission");
}


function addCadet() {
const name = document.getElementById("cadetName").value.trim();
if (!name) return;


cadets.push(name);
localStorage.setItem("cadets", JSON.stringify(cadets));
document.getElementById("cadetName").value = "";
renderCadets();
}


function renderCadets() {
const list = document.getElementById("cadetList");
list.innerHTML = "";


cadets.forEach(name => {
const li = document.createElement("li");
li.innerHTML = `<a href="cadet.html?name=${encodeURIComponent(name)}">${name}</a>`;
list.appendChild(li);
});
}


/* === CHECKLIST STORAGE === */
function loadChecklist(cadet) {
const saved = JSON.parse(localStorage.getItem(`checklist_${cadet}`)) || {};
const boxes = document.querySelectorAll(".checklist input");


boxes.forEach(box => {
box.checked = saved[box.dataset.item] || false;
box.addEventListener("change", () => saveChecklist(cadet));
});


updateProgress(cadet);
}


function saveChecklist(cadet) {
const boxes = document.querySelectorAll(".checklist input");
let data = {};


boxes.forEach(box => data[box.dataset.item] = box.checked);
localStorage.setItem(`checklist_${cadet}`, JSON.stringify(data));


updateProgress(cadet);
}


function updateProgress(cadet) {
const data = JSON.parse(localStorage.getItem(`checklist_${cadet}`)) || {};
const total = Object.keys(data).length;
const done = Object.values(data).filter(v => v).length;


const progress = document.getElementById("progress");
const status = document.getElementById("status");


progress.innerText = `Progress: ${done} / ${total}`;
if (total > 0 && done === total) status.innerText = "READY FOR CERTIFICATION";
}