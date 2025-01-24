document.addEventListener("DOMContentLoaded", () => {
    const marcaSelect = document.getElementById("marca");
    const modeloSelect = document.getElementById("modelo");
    const anoSelect = document.getElementById("ano");
    const novaConsultaBtn = document.getElementById("novaConsulta");

    // Função para limpar os selects de modelo e ano
    function limparSelect(selectElement) {
        selectElement.innerHTML = '<option value="" disabled selected>Selecione uma opção</option>';
    }

    // Quando a marca é selecionada, buscar os modelos
    marcaSelect.addEventListener("change", async () => {
        const codigoMarca = marcaSelect.value;
        limparSelect(modeloSelect);
        limparSelect(anoSelect);

        if (codigoMarca) {
            try {
                const response = await fetch(`/modelos/${codigoMarca}`);
                const modelos = await response.json();

                modelos.forEach(modelo => {
                    const option = document.createElement("option");
                    option.value = modelo.codigo;
                    option.textContent = modelo.nome;
                    modeloSelect.appendChild(option);
                });
            } catch (error) {
                console.error("Erro ao buscar modelos:", error);
                alert("Não foi possível carregar os modelos. Tente novamente mais tarde.");
            }
        }
    });

    // Quando o modelo é selecionado, buscar os anos
    modeloSelect.addEventListener("change", async () => {
        const codigoMarca = marcaSelect.value;
        const codigoModelo = modeloSelect.value;
        limparSelect(anoSelect);

        if (codigoModelo) {
            try {
                const response = await fetch(`/anos/${codigoMarca}/${codigoModelo}`);
                const anos = await response.json();

                anos.forEach(ano => {
                    const option = document.createElement("option");
                    option.value = ano.codigo;
                    option.textContent = ano.nome;
                    anoSelect.appendChild(option);
                });
            } catch (error) {
                console.error("Erro ao buscar anos:", error);
                alert("Não foi possível carregar os anos. Tente novamente mais tarde.");
            }
        }
    });

    // Botão "Nova Consulta" para resetar o formulário
    novaConsultaBtn.addEventListener("click", () => {
        document.querySelector("form").reset();
        limparSelect(modeloSelect);
        limparSelect(anoSelect);
    });
});
