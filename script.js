const PERMISSION_KEY = "LSPD-FTO-2025";


function authorize() {
const key = document.getElementById('auth').value;
if (key === PERMISSION_KEY) {
document.getElementById('cadetPanel').classList.remove('hidden');
alert('Authorized');
} else {
alert('Invalid Permission');
}
}


function addCadet() {
const name = document.getElementById('cadetName').value;
const list = document.getElementById('cadetList');


const li = document.createElement('li');
li.innerHTML = `<a href="cadet.html?name=${encodeURIComponent(name)}">${name}</a>`;
list.appendChild(li);
}