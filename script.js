const clienteNome = document.getElementById("clienteNome");
const clienteEmpresa = document.getElementById("clienteEmpresa");
const clienteEmail = document.getElementById("clienteEmail");
const clienteTelefone = document.getElementById("clienteTelefone");

const validadeOrcamento = document.getElementById("validadeOrcamento");
const assinaturaNome = document.getElementById("assinaturaNome");


document.addEventListener("DOMContentLoaded", () => {
    addRow();
    calculateTotal();
    document.getElementById("year").textContent = new Date().getFullYear();
});

/* =======================
   TABELA DE PRODUTOS
======================= */

function addRow() {
    const tbody = document.querySelector("#productTable tbody");
    if (!tbody) return;

    const row = document.createElement("tr");

    row.innerHTML = `
        <td><input type="text" data-label="Produto / Serviço"></td>
        <td><input type="number" data-label="Qtd"></td>
        <td><input type="number"  data-label="Valor Unitário"></td>
        <td><input type="number" data-label="Desconto (%)"></td>
        <td class="subtotal" data-label="Subtotal">R$ 0,00</td>
        <td>
            <button class="btn btn-danger" onclick="removeRow(this)">✕</button>
        </td>
    `;

    row.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", calculateTotal);
    });

    tbody.appendChild(row);
}

function removeRow(btn) {
    btn.closest("tr").remove();
    calculateTotal();
}

function calculateTotal() {
    let total = 0;

    document.querySelectorAll("#productTable tbody tr").forEach(row => {
        const qtd = num(row.children[1].querySelector("input").value);
        const valor = num(row.children[2].querySelector("input").value);
        const desconto = num(row.children[3].querySelector("input").value);

        const bruto = qtd * valor;
        const subtotal = bruto - (bruto * desconto / 100);

        row.querySelector(".subtotal").innerText =
            `R$ ${subtotal.toFixed(2).replace(".", ",")}`;

        total += subtotal;
    });

    total += num(document.getElementById("frete").value);
    document.getElementById("total").innerText =
        total.toFixed(2).replace(".", ",");
}

function num(v) {
    return parseFloat(v) || 0;
}

/* =======================
   PDF
======================= */
async function gerarPDF() {
    preencherPDF();

    const pdfArea = document.getElementById("pdf-area");

    // garante visibilidade real
    pdfArea.style.opacity = "1";
    pdfArea.style.display = "block";

    const canvas = await html2canvas(pdfArea, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`orcamento-${Date.now()}.pdf`);

    // esconde novamente
    pdfArea.style.opacity = "0";
}

function preencherPDF() {
    // Preenche os dados do cliente
    document.getElementById("pdf-cliente").innerHTML = `
        <p><strong>Nome:</strong> ${document.getElementById("clienteNome").value || "-"}</p>
        <p><strong>Empresa:</strong> ${document.getElementById("clienteEmpresa").value || "-"}</p>
        <p><strong>Email:</strong> ${document.getElementById("clienteEmail").value || "-"}</p>
        <p><strong>Telefone:</strong> ${document.getElementById("clienteTelefone").value || "-"}</p>
    `;

    // Preenche os produtos/itens
    const produtosDiv = document.getElementById("pdf-produtos");
    produtosDiv.innerHTML = "";  // Limpa a área de produtos

    document.querySelectorAll("#productTable tbody tr").forEach((row, index) => {
        const produto = row.children[0].querySelector("input").value || "-";
        const qtd = row.children[1].querySelector("input").value || 0;
        const valor = row.children[2].querySelector("input").value || 0;
        const desconto = row.children[3].querySelector("input").value || 0;
        const subtotal = row.children[4].innerText || "R$ 0,00";

        produtosDiv.insertAdjacentHTML("beforeend", `
            <div class="pdf-item">
                <strong>${produto}</strong><br>
                Qtd: ${qtd} | Valor: R$ ${valor} | Desc: ${desconto}%<br>
                <b>${subtotal}</b>
            </div>
        `);
    });

    // Preenche a logo
    const logo = localStorage.getItem("logoEmpresa");
    const pdfLogo = document.getElementById("pdf-logo");
    if (logo) {
        pdfLogo.src = logo;
        pdfLogo.style.display = "block";  // Exibe a logo se houver
    } else {
        pdfLogo.style.display = "none";  // Caso contrário, esconde

    }

    // Preenche o total
    document.getElementById("pdf-total").innerText = document.getElementById("total").innerText;

    // Preenche validade e responsável
    document.getElementById("pdf-validade").innerText = document.getElementById("validadeOrcamento").value || "-";
    document.getElementById("pdf-responsavel").innerText = document.getElementById("assinaturaNome").value || "-";

}



const logoInput = document.getElementById("logoEmpresa");

if (logoInput) {
    logoInput.addEventListener("change", () => {
        const file = logoInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            localStorage.setItem("logoEmpresa", e.target.result);
        };
        reader.readAsDataURL(file);
    });
}



function getVal(id) {
    const el = document.getElementById(id);
    return el && el.value ? el.value : "-";
}

function card(pdf, x, y, w, h) {
    pdf.setDrawColor(200);
    pdf.setFillColor(245, 247, 250);
    pdf.roundedRect(x, y, w, h, 5, 5, "FD");
}
