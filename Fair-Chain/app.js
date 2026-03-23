
console.log("JS loaded");

// Connect to Stellar Testnet
const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
const networkPassphrase = StellarSdk.Networks.TESTNET;

// HASH FUNCTION (optional)
async function hashData(data) {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// ✅ Submit Verification
async function submitVerification() {
  try {
    const factory = document.getElementById("factory").value;
    const auditor = document.getElementById("auditor").value;
    const userSecret = document.getElementById("secretKey").value;

    if (!factory || !auditor || !userSecret) {
      document.getElementById("status").innerText = "❌ Please fill all fields";
      return;
    }

    const userKeypair = StellarSdk.Keypair.fromSecret(userSecret);
    const account = await server.loadAccount(userKeypair.publicKey());

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        StellarSdk.Operation.manageData({
          name: "verify_" + Date.now(),
          value: factory + "|" + auditor,
        })
      )
      .setTimeout(30)
      .build();

    transaction.sign(userKeypair);

    await server.submitTransaction(transaction);

    document.getElementById("status").innerText =
      "✅ Verification submitted by " + auditor;

  } catch (error) {
    console.error("ERROR:", error);
    document.getElementById("status").innerText = "❌ Error — check console";
  }
}

// ✅ Load Verifications (Dashboard Style)
window.loadVerifications = async function () {
  try {
    const userSecret = document.getElementById("secretKey").value;
    const searchFactory = document.getElementById("searchFactory").value.trim().toLowerCase();

    if (!userSecret) { alert("Enter a secret key"); return; }

    const userKeypair = StellarSdk.Keypair.fromSecret(userSecret);
    const account = await server.loadAccount(userKeypair.publicKey());
    const dataEntries = account.data_attr;

    const results = document.getElementById("results");
    results.innerHTML = "";

    const reputation = {};

    for (let key in dataEntries) {
      if (key.startsWith("verify_")) {
        const decoded = atob(dataEntries[key]);
        const [factory, auditor] = decoded.split("|");

        const fKey = factory.toLowerCase();
        if (!reputation[fKey]) reputation[fKey] = { name: factory, count: 0, auditors: new Set() };

        reputation[fKey].count++;
        reputation[fKey].auditors.add(auditor);
      }
    }

    for (let fKey in reputation) {
      if (searchFactory && !fKey.includes(searchFactory)) continue;

      const li = document.createElement("li");
      let auditorsHTML = "";
      reputation[fKey].auditors.forEach(aud => auditorsHTML += `<span class="badge">${aud}</span>`);

      li.innerHTML = `
        <strong>🏭 ${reputation[fKey].name}</strong><br>
        ✅ Verifications: <span class="badge">${reputation[fKey].count}</span><br>
        👨‍⚖️ Auditors: ${auditorsHTML}
      `;
      results.appendChild(li);
    }

    if (!results.children.length) results.innerHTML = "<li>No matching verifications found</li>";

  } catch (error) { console.error("LOAD ERROR:", error); }
};

//  Load Full History
window.loadHistory = async function () {
  try {
    const userSecret = document.getElementById("secretKey").value;
    if (!userSecret) { alert("Enter a secret key"); return; }

    const userKeypair = StellarSdk.Keypair.fromSecret(userSecret);

    const response = await server
      .operations()
      .forAccount(userKeypair.publicKey())
      .limit(50)
      .order("desc")
      .call();

    const historyList = document.getElementById("history");
    historyList.innerHTML = "";

    for (let record of response.records) {
      if (record.type === "manage_data" && record.name.startsWith("verify_")) {
        const decoded = atob(record.value);
        const [factory, auditor] = decoded.split("|");

        const li = document.createElement("li");
        li.innerHTML = `
          <strong>🏭 ${factory}</strong><br>
          👨‍⚖️ Auditor: <span class="badge">${auditor}</span><br>
          📅 ${new Date(record.created_at).toLocaleString()}
        `;
        historyList.appendChild(li);
      }
    }

    if (!historyList.children.length) historyList.innerHTML = "<li>No history found</li>";

  } catch (error) { console.error("HISTORY ERROR:", error); }
};
// 
window.loadBuyerView = async function () {
  try {
    const searchFactory = document.getElementById("buyerSearchFactory").value.trim().toLowerCase();

    const buyerResults = document.getElementById("buyerResults");
    buyerResults.innerHTML = "";

    // 🔹 we can replace with public account keys of known factories
    const factoryPublicKeys = [
      "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Factory 1
      "GYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY", // Factory 2
      // We can add more known factories here
    ];

    for (let pubKey of factoryPublicKeys) {
      try {
        const account = await server.loadAccount(pubKey);
        const dataEntries = account.data_attr;

        const reputation = { count: 0, auditors: new Set(), name: pubKey };

        for (let key in dataEntries) {
          if (key.startsWith("verify_")) {
            const decoded = atob(dataEntries[key]);
            const [factory, auditor] = decoded.split("|");

            if (searchFactory && !factory.toLowerCase().includes(searchFactory)) continue;

            reputation.name = factory;
            reputation.count++;
            reputation.auditors.add(auditor);
          }
        }

        if (reputation.count > 0) {
          const li = document.createElement("li");
          let auditorsHTML = "";
          reputation.auditors.forEach(aud => auditorsHTML += `<span class="badge">${aud}</span>`);

          li.innerHTML = `
            <strong>🏭 ${reputation.name}</strong><br>
            ✅ Verifications: <span class="badge">${reputation.count}</span><br>
            👨‍⚖️ Auditors: ${auditorsHTML}
          `;
          buyerResults.appendChild(li);
        }

      } catch (err) {
        console.warn("Error loading factory account:", pubKey, err);
      }
    }

    if (!buyerResults.children.length) {
      buyerResults.innerHTML = "<li>No matching factories found</li>";
    }

  } catch (error) {
    console.error("BUYER VIEW ERROR:", error);
  }
};