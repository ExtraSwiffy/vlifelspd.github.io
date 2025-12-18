const PERMISSION_KEY = "LSPD-FTO-2025";
let authorized = false;

/* ================= AUTH ================= */
function authorize() {
  const key = document.getElementById("auth").value;
  if (key === PERMISSION_KEY) {
    authorized = true;
    document.getElementById("cadetPanel").classList.remove("hidden");
    listenForCadets();
  } else {
    alert("Invalid Permission");
  }
}
/* ================= CADETS ================= */
function addCadet() {
  if (!authorized) return;

  const nameInput = document.getElementById("cadetName");
  const name = nameInput.value.trim();
  const number = parseInt(name, 10);

  if (!name || isNaN(number)) {
    alert("Cadet name must be a number (ex: 530)");
    return;
  }

  db.collection("cadets").doc(name).set({
    name: name,
    number: number, // 👈 numeric field for sorting
    checklist: {},
    status: "In Training",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  nameInput.value = "";
}

function listenForCadets() {
  db.collection("cadets")
    .orderBy("number") // 👈 numeric sort
    .onSnapshot(snapshot => {
      const list = document.getElementById("cadetList");
      list.innerHTML = "";

      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");
        li.innerHTML = `
          <a href="cadet.html?name=${encodeURIComponent(data.name)}">
            ${data.name}
          </a>
        `;
        list.appendChild(li);
      });
    });
}

/* ================= CHECKLIST ================= */
function loadChecklist(cadet) {
  const boxes = document.querySelectorAll(".checklist input");

  db.collection("cadets").doc(cadet).onSnapshot(doc => {
    if (!doc.exists) return;

    const data = doc.data().checklist || {};

    boxes.forEach(box => {
      box.checked = data[box.dataset.item] || false;
      box.onchange = () => saveChecklist(cadet);
    });

    updateProgress(data);
  });
}

function saveChecklist(cadet) {
  const boxes = document.querySelectorAll(".checklist input");
  let data = {};

  boxes.forEach(box => {
    data[box.dataset.item] = box.checked;
  });

  db.collection("cadets").doc(cadet).update({
    checklist: data
  });
}

function updateProgress(data) {
  const total = Object.keys(data).length;
  const done = Object.values(data).filter(v => v).length;

  document.getElementById("progress").innerText =
    `Progress: ${done} / ${total}`;

  if (total > 0 && done === total) {
    document.getElementById("status").innerText = "READY FOR CERTIFICATION";
  }
}
