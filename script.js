document.addEventListener("DOMContentLoaded", () => {
    addRow();
    calculateTotal();
});

function addRow() {
    const tbody = document.querySelector("#productTable tbody");
    if (!tbody) return;

    const row = document.createElement("tr");

    row.innerHTML = `
        <td><input type="text" placeholder="Ex: Desenvolvimento de site"></td>
        <td><input type="number" min="1" value="1" oninput="calculateTotal()"></td>
        <td><input type="number" min="0" value="0" oninput="calculateTotal()"></td>
        <td><input type="number" min="0" max="100" value="0" oninput="calculateTotal()"></td>
        <td class="subtotal">R$ 0,00</td>
        <td>
            <button class="btn btn-danger" onclick="removeRow(this)">✕</button>
        </td>
    `;

    tbody.appendChild(row);
}

function removeRow(button) {
    button.closest("tr").remove();
    calculateTotal();
}

function calculateTotal() {
    const rows = document.querySelectorAll("#productTable tbody tr");
    let total = 0;

    rows.forEach(row => {
        const qtd = parseFloat(row.children[1].querySelector("input").value) || 0;
        const valor = parseFloat(row.children[2].querySelector("input").value) || 0;
        const desconto = parseFloat(row.children[3].querySelector("input").value) || 0;

        const bruto = qtd * valor;
        const descontoValor = bruto * (desconto / 100);
        const subtotal = bruto - descontoValor;

        row.querySelector(".subtotal").innerText =
            `R$ ${subtotal.toFixed(2).replace('.', ',')}`;

        total += subtotal;
    });

    const frete = parseFloat(document.getElementById("frete").value) || 0;
    total += frete;

    document.getElementById("total").innerText =
        total.toFixed(2).replace('.', ',');
}
function downloadPDF() {
    buildPDFLayout();

    const element = document.getElementById("pdf-layout");
    element.style.display = "block";

    html2pdf()
        .from(element)
        .set({
            margin: 0.5,
            filename: `orcamento-${Date.now()}.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { format: 'a4', orientation: 'portrait' }
        })
        .save()
        .then(() => {
            element.style.display = "none";
        });
}



//PDF

function preparePDF() {
    const inputs = document.querySelectorAll("input, textarea");

    inputs.forEach(input => {
        const span = document.createElement("span");
        span.className = "pdf-text";
        span.innerText = input.value || "—";

        span.style.display = "block";
        span.style.padding = "8px";
        span.style.border = "1px solid #ddd";
        span.style.borderRadius = "6px";
        span.style.minHeight = "20px";

        input.style.display = "none";
        input.parentNode.insertBefore(span, input);
    });
}

function restoreAfterPDF() {
    document.querySelectorAll(".pdf-text").forEach(span => {
        const input = span.nextSibling;
        if (input) input.style.display = "";
        span.remove();
    });
}


function buildPDFLayout() {
    const pdf = document.getElementById("pdf-layout");

    const logoURL = localStorage.getItem("logoEmpresa") || "";

    if (logoInput.files && logoInput.files[0]) {
        logoURL = URL.createObjectURL(logoInput.files[0]);
    }

    // Dados do cliente
    const clienteNome = document.getElementById("clienteNome").value;
    const clienteEmpresa = document.getElementById("clienteEmpresa").value;
    const clienteEmail = document.getElementById("clienteEmail").value;
    const clienteTelefone = document.getElementById("clienteTelefone").value;


    const total = document.getElementById("total").innerText;

    pdf.innerHTML = `

    <div class="pdf-header">
    ${logoURL ? `<img src="${logoURL}" class="pdf-logo">` : ""}
    <h1>Orçamento de Produto</h1>
    </div>

        <div class="pdf-page">
            <h1>Orçamento</h1>

            <div class="pdf-section">
                <h3>Dados do Cliente</h3>
                <div class="pdf-card">
                    <p><b>Nome:</b> ${clienteNome || "-"}</p>
                    <p><b>Empresa:</b> ${clienteEmpresa || "-"}</p>
                    <p><b>Email:</b> ${clienteEmail || "-"}</p>
                    <p><b>Telefone:</b> ${clienteTelefone || "-"}</p>
                    <p>${clienteObs || ""}</p>
                </div>
            </div>

            <div class="pdf-section">
                <h3>Itens do Orçamento</h3>
                <div class="pdf-grid">
                    ${produtosHTML}
                </div>
            </div>

            <div class="pdf-section">
                <div class="pdf-card total-card">
                    <h2>Total: R$ ${total}</h2>
                </div>
            </div>

            <div class="pdf-section">
                <h3>Validade & Assinatura</h3>
                <div class="pdf-card">
                    <p><b>Validade:</b> ${validade || "-"}</p>
                    <p><b>Responsável:</b> ${assinatura || "-"}</p>
                    <p>${mensagemFinal || ""}</p>
                </div>
            </div>
        </div>
    `;
}

//LOGO LOCALSTORAGE
const logoInput = document.getElementById("logoEmpresa");

logoInput.addEventListener("change", () => {
    const file = logoInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        localStorage.setItem("logoEmpresa", e.target.result);
    };
    reader.readAsDataURL(file);
});

window.addEventListener("DOMContentLoaded", () => {
    const savedLogo = localStorage.getItem("logoEmpresa");

    if (savedLogo) {
        const preview = document.createElement("img");
        preview.src = savedLogo;
        preview.style.maxHeight = "60px";
        preview.style.display = "block";
        preview.style.marginBottom = "10px";

        logoInput.parentNode.insertBefore(preview, logoInput);
    }
});

