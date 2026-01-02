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
  <td data-label="Ação"><button class="btn btn-danger">✕</button></td>
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


async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    let y = 20;

    // LOGO
    // ===== LOGO CENTRALIZADA =====
    const logo = localStorage.getItem("logoEmpresa");

    if (logo) {
        const logoWidth = 60; // largura ideal
        const pageWidth = doc.internal.pageSize.getWidth();
        const xCenter = (pageWidth - logoWidth) / 2;

        doc.addImage(logo, "PNG", xCenter, y, logoWidth, 0);
        y += 30;
    }

    // ===== TÍTULO =====
    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("Orçamento de Produtos", 105, y, { align: "center" });
    y += 20;


    // ===== DADOS DO CLIENTE =====
    doc.setFontSize(14);
    doc.text("Dados do Cliente", 15, y);
    y += 6;

    doc.setFontSize(11);
    doc.roundedRect(15, y, 180, 25, 5, 5);

    const cliente = {
        nome: clienteNome.value || "-",
        empresa: clienteEmpresa.value || "-",
        email: clienteEmail.value || "-",
        telefone: clienteTelefone.value || "-"
    };

    doc.text(`Nome: ${cliente.nome}`, 18, y + 6);
    doc.text(`Empresa: ${cliente.empresa}`, 18, y + 12);
    doc.text(`Email: ${cliente.email}`, 110, y + 6);
    doc.text(`Telefone: ${cliente.telefone}`, 110, y + 12);

    y += 35;

    // ===== PRODUTOS =====
    doc.setFontSize(14);
    doc.text("Itens do Orçamento", 15, y);
    y += 6;

    document.querySelectorAll("#productTable tbody tr").forEach(row => {
        if (y > 260) {
            doc.addPage();
            y = 20;
        }

        const produto = row.children[0].querySelector("input").value || "Produto";
        const qtd = row.children[1].querySelector("input").value;
        const valor = row.children[2].querySelector("input").value;
        const desconto = row.children[3].querySelector("input").value;
        const subtotal = row.children[4].innerText;

        doc.roundedRect(15, y, 180, 20, 5, 5);
        doc.setFontSize(11);
        doc.text(produto, 18, y + 6);
        doc.text(`Qtd: ${qtd} | Valor: R$ ${valor} | Desc: ${desconto}%`, 18, y + 12);
        doc.text(subtotal, 170, y + 12, { align: "right" });

        y += 24;
    });

    // ===== TOTAL =====
    if (y > 250) {
        doc.addPage();
        y = 20;
    }

    doc.setFillColor(109, 40, 217);
    doc.setFillColor(109, 40, 217);
    doc.roundedRect(15, y, 180, 15, 5, 5, "F");
    doc.setTextColor(255);
    doc.setFontSize(14);
    doc.text(`TOTAL: R$ ${total.innerText}`, 105, y + 10, { align: "center" });

    y += 25;
    doc.setTextColor(0);

    // ===== VALIDADE =====
    doc.setFontSize(11);
    doc.text(`Validade: ${validadeOrcamento.value || "-"}`, 15, y + 6);
    doc.text(`Responsável: ${assinaturaNome.value || "-"}`, 15, y + 12);

    doc.save(`orcamento-${Date.now()}.pdf`);
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
                <h1>Orçamento de Produto/Serviço</h1>
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
    `;
}

//LOGO LOCALSTORAGE
const logoInput = document.getElementById("logoEmpresa");

if (logoInput) {
    logoInput.addEventListener("change", () => {
        const file = logoInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            localStorage.setItem("logoEmpresa", e.target.result);
        };
        reader.readAsDataURL(file);
    });
}


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

