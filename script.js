document.addEventListener("DOMContentLoaded", () => {
    addRow();
    calculateTotal();
});

function addRow() {
    const tbody = document.querySelector("#productTable tbody");
    if (!tbody) return;

    const row = document.createElement("tr");

    row.innerHTML = `
        <td data-label="Produto"><input type="text"></td>
        <td data-label="Qtd"><input type="number"></td>
        <td data-label="Valor"><input type="number"></td>
        <td data-label="Desc (%)"><input type="number"></td>
        <td data-label="Subtotal" class="subtotal">R$ 0,00</td>
        <td data-label="Ação">
            <button class="btn btn-danger" onclick="removeRow(this)">✕</button>
        </td>
    `;

    // 🔥 EVENTOS PARA MOBILE
    row.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", calculateTotal);
        input.addEventListener("keyup", calculateTotal);
    });

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
        const qtd = num(row.children[1].querySelector("input").value);
        const valor = num(row.children[2].querySelector("input").value);
        const desconto = num(row.children[3].querySelector("input").value);

        const bruto = qtd * valor;
        const subtotal = bruto - (bruto * desconto / 100);

        row.querySelector(".subtotal").innerText =
            `R$ ${subtotal.toFixed(2).replace('.', ',')}`;

        total += subtotal;
    });

    const frete = num(document.getElementById("frete")?.value);
    total += frete;

    document.getElementById("total").innerText =
        total.toFixed(2).replace('.', ',');
}

function downloadPDF() {
    buildPDFLayout(); // monta o HTML

    const element = document.getElementById("pdf-layout");

    const opt = {
        margin: 10,
        filename: `orcamento-${Date.now()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true
        },
        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
        }
    };

    html2pdf().set(opt).from(element).save();
}




function buildPDFLayout() {
    const pdf = document.getElementById("pdf-layout");

    // Logo salva
    const logoURL = localStorage.getItem("logoEmpresa") || "";

    // Dados do cliente
    const clienteNome = document.getElementById("clienteNome")?.value || "";
    const clienteEmpresa = document.getElementById("clienteEmpresa")?.value || "";
    const clienteEmail = document.getElementById("clienteEmail")?.value || "";
    const clienteTelefone = document.getElementById("clienteTelefone")?.value || "";
    const clienteObs = document.getElementById("clienteObs")?.value || "";

    // Validade
    const validade = document.getElementById("validadeOrcamento")?.value || "";
    const assinatura = document.getElementById("assinaturaNome")?.value || "";
    const mensagemFinal = document.getElementById("mensagemFinal")?.value || "";

    // 🔴 CORREÇÃO CRÍTICA
    let produtosHTML = "";

    document.querySelectorAll("#productTable tbody tr").forEach(row => {
        const produto = row.children[0].querySelector("input")?.value || "Produto";
        const qtd = row.children[1].querySelector("input")?.value || 0;
        const valor = row.children[2].querySelector("input")?.value || 0;
        const desconto = row.children[3].querySelector("input")?.value || 0;
        const subtotal = row.children[4].innerText || "R$ 0,00";

        produtosHTML += `
            <div class="pdf-card">
                <strong>${produto}</strong>
                <p>Qtd: ${qtd}</p>
                <p>Valor Unitário: R$ ${valor}</p>
                <p>Desconto: ${desconto}%</p>
                <p><b>${subtotal}</b></p>
            </div>
        `;


    });

    const total = document.getElementById("total")?.innerText || "0,00";

    pdf.innerHTML = `
        <div class="pdf-page">

            <div class="pdf-header">
                ${logoURL ? `<img src="${logoURL}" class="pdf-logo">` : ""}
                <h1 class="pdf-title">Orçamento de Produtos</h1>
            </div>


            <div class="pdf-section">
                <h3>Dados do Cliente</h3>
                <div class="pdf-card" style="width:100%">
                    <p><b>Nome:</b> ${clienteNome || "-"}</p>
                    <p><b>Empresa:</b> ${clienteEmpresa || "-"}</p>
                    <p><b>Email:</b> ${clienteEmail || "-"}</p>
                    <p><b>Telefone:</b> ${clienteTelefone || "-"}</p>
                    ${clienteObs ? `<p>${clienteObs}</p>` : ""}
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
                <div class="pdf-card" style="width:100%">
                    <p><b>Validade:</b> ${validade || "-"}</p>
                    <p><b>Responsável:</b> ${assinatura || "-"}</p>
                    ${mensagemFinal ? `<p>${mensagemFinal}</p>` : ""}
                </div>
            </div>

        </div>

        <div id="pdf-layout" style="display:none"></div>

    `;
}

//LOGO LOCALSTORAGE
const logoInput = document.getElementById("logoEmpresa");

logoInput.addEventListener("change", () => {
    const file = logoInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
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


function num(v) {
    return parseFloat(v) || 0;
}

let logoAtiva = true;

document.getElementById("removerLogo").addEventListener("click", () => {
    logoAtiva = false;
    document.getElementById("logoEmpresa").style.display = "none";
    document.getElementById("removerLogo").style.display = "none";
});


document.getElementById("year").textContent = new Date().getFullYear();
