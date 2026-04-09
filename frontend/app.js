import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.7.0/+esm";

// 👉 ВСТАВЬ СВОЙ АДРЕС КОНТРАКТА
const CONTRACT = "0x240EFF0b744509155CBEb5bA77d38bb122A9b680";

const ABI = [
  "function createDocument(string _hash, address[] _signers)",
  "function signDocument(uint256 id)",
  "function isAllowed(uint256 id, address user) view returns (bool)",
  "function isSigned(uint256 id, address user) view returns (bool)",
  "function isCompleted(uint256 id) view returns (bool)"
];

let provider, signer, contract;

const walletDiv = document.getElementById("wallet");
const statusDiv = document.getElementById("status");
const hashDiv = document.getElementById("hash");

// 🔗 Подключение кошелька
window.connect = async function () {
  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();

    contract = new ethers.Contract(CONTRACT, ABI, signer);

    const addr = await signer.getAddress();
    walletDiv.innerText = "Connected: " + addr;
  } catch (e) {
    console.error(e);
    statusDiv.innerText = "Connection error ❌";
  }
};

// 📄 Хеш файла
window.hashFile = async function () {
  const file = document.getElementById("file").files[0];

  if (!file) {
    hashDiv.innerText = "No file ❌";
    return;
  }

  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);

  const hex = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  hashDiv.innerText = hex;
};

// 📄 Создание документа
window.createDoc = async function () {
  try {
    const hash = hashDiv.innerText;

    if (!hash || hash === "No file ❌") {
      statusDiv.innerText = "Hash first ❌";
      return;
    }

    const raw = document.getElementById("addresses").value;

    const signers = raw
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    if (signers.length === 0) {
      statusDiv.innerText = "Enter whitelist ❌";
      return;
    }

    statusDiv.innerText = "Creating...";

    const tx = await contract.createDocument(hash, signers);
    await tx.wait();

    statusDiv.innerText = "Created ✅";
  } catch (e) {
    console.error(e);
    statusDiv.innerText = "Error ❌";
  }
};

// ✍️ Подписание
window.signDoc = async function () {
  try {
    const id = document.getElementById("docId").value;

    if (!id) {
      statusDiv.innerText = "Enter ID ❌";
      return;
    }

    const user = await signer.getAddress();

    const allowed = await contract.isAllowed(id, user);

    if (!allowed) {
      statusDiv.innerText = "Not allowed ❌";
      return;
    }

    statusDiv.innerText = "Signing...";

    const tx = await contract.signDocument(id);
    await tx.wait();

    statusDiv.innerText = "Signed ✅";
  } catch (e) {
    console.error(e);
    statusDiv.innerText = "Error ❌";
  }
};

// 📊 Проверка статуса
window.checkStatus = async function () {
  try {
    const id = document.getElementById("docId").value;

    if (!id) {
      statusDiv.innerText = "Enter ID ❌";
      return;
    }

    const user = await signer.getAddress();

    const allowed = await contract.isAllowed(id, user);
    const signed = await contract.isSigned(id, user);
    const completed = await contract.isCompleted(id);

    statusDiv.innerText =
      `Allowed: ${allowed} | Signed: ${signed} | Completed: ${completed}`;
  } catch (e) {
    console.error(e);
    statusDiv.innerText = "Error ❌";
  }
};