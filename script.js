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

  const name = document.getElementById("cadetName").value.trim();
  if (!name) return;

  db.collection("cadets").doc(name).set({
    name: name,
    checklist: {},
    status: "In Training",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById("cadetName").value = "";
}

function listenForCadets() {
  db.collection("cadets").orderBy("createdAt").onSnapshot(snapshot => {
    const list = document.getElementById("cadetList");
    list.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement("li");
      li.innerHTML = `<a href="cadet.html?name=${encodeURIComponent(data.name)}">${data.name}</a>`;
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

function deleteCadet() {
  const key = document.getElementById("deleteKey").value.trim();
  if (key !== PERMISSION_KEY) {
    alert("Invalid FTO Permission Key");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  let cadetName = params.get("name");

  if (!cadetName) {
    alert("Cadet name not found in URL!");
    return;
  }

  // Decode in case URL has spaces or special characters
  cadetName = decodeURIComponent(cadetName);

  if (!confirm(`Are you sure you want to permanently delete cadet: ${cadetName}?`)) {
    return;
  }

  db.collection("cadets").doc(cadetName).delete()
    .then(() => {
      alert(`Cadet "${cadetName}" deleted successfully.`);
      window.location.href = "cadets.html";
    })
    .catch(err => {
      alert("Error deleting cadet. See console for details.");
      console.error("Delete error:", err);
    });
}

function normalizeCadetID(name) {
  // Trim, lowercase, replace spaces with underscores, remove special chars
  return name.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^\w\-]/g, "");
}

