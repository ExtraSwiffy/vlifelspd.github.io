/* ================= PERMISSION KEYS ================= */
const LIST_KEY   = "LSPD-FTO-2025";        // Access cadet list
const DELETE_KEY = "LSPD-DELETE-2025";     // Delete cadet
const CERTIFY_KEY = "LSPD-CERT-2025";      // Certify cadet

let authorized = false;

/* ================= AUTH ================= */
function authorize() {
  const key = document.getElementById("auth").value.trim();

  if (key === LIST_KEY) {
    authorized = true;
    document.getElementById("cadetPanel").classList.remove("hidden");
    listenForCadets();
  } else {
    alert("Invalid Permission Key");
  }
}

/* ================= CADETS ================= */
function addCadet() {
  if (!authorized) return;

  const input = document.getElementById("cadetName");
  const fullName = input.value.trim();

  if (!fullName) {
    alert("Cadet name cannot be empty");
    return;
  }

  // Extract the number at the start
  const numberMatch = fullName.match(/^(\d+)/);
  if (!numberMatch) {
    alert("Cadet name must start with a number (ex: 530 | CDT | L. Hudson)");
    return;
  }

  const number = parseInt(numberMatch[1], 10);

  db.collection("cadets").doc(fullName).set({
    name: fullName,
    number: number, // numeric sort field
    checklist: {},
    status: "In Training",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  input.value = "";
}

function listenForCadets() {
  db.collection("cadets")
    .orderBy("number")
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

    const docData = doc.data();
    const data = docData.checklist || {};

    boxes.forEach(box => {
      box.checked = data[box.dataset.item] || false;
      box.onchange = () => saveChecklist(cadet);
    });

    updateProgress(data, docData.status);
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

function updateProgress(data, status) {
  const total = Object.keys(data).length;
  const done = Object.values(data).filter(v => v).length;

  document.getElementById("progress").innerText =
    `Progress: ${done} / ${total}`;

  if (status === "Certified") {
    document.getElementById("status").innerText = "CERTIFIED";
  } else if (total > 0 && done === total) {
    document.getElementById("status").innerText = "READY FOR CERTIFICATION";
  } else {
    document.getElementById("status").innerText = "In Training";
  }
}

/* ================= DELETE CADET ================= */
function deleteCadet() {
  if (!confirm("Are you sure you want to permanently delete this cadet?")) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const cadetName = params.get("name");

  db.collection("cadets").doc(cadetName).delete()
    .then(() => {
      alert("Cadet deleted successfully.");
      window.location.href = "cadets.html";
    })
    .catch(err => {
      console.error(err);
      alert("Error deleting cadet.");
    });
}

/* ================= CERTIFY CADET ================= */
function certifyCadet() {
  const params = new URLSearchParams(window.location.search);
  const cadetName = params.get("name");

  db.collection("cadets").doc(cadetName).update({
    status: "Certified",
    certifiedAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    document.getElementById("status").innerText = "CERTIFIED";
    alert("Cadet certified successfully.");
  })
  .catch(err => {
    console.error(err);
    alert("Error certifying cadet.");
  });
}

/* ================= GLOBAL ================= */
window.authorize = authorize;
window.addCadet = addCadet;
window.deleteCadet = deleteCadet;
window.certifyCadet = certifyCadet;
