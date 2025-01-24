// Script principal

document.addEventListener("DOMContentLoaded", () => {
    // Seletores de elementos do DOM
    const marcaSelect = document.getElementById("marca");
    const modeloSelect = document.getElementById("modelo");
    const anoSelect = document.getElementById("ano");
    const novaConsultaBtn = document.getElementById("novaConsulta");
    const toggleThemeCheckbox = document.getElementById("toggleTheme");

    /**
     * Função para limpar o conteúdo de um select.
     * @param {HTMLElement} selectElement - O elemento select a ser limpo.
     */
    function limparSelect(selectElement) {
        selectElement.innerHTML = '<option value="" disabled selected>Selecione uma opção</option>';
    }

    /**
     * Função para buscar os modelos de uma marca.
     */
    async function buscarModelos() {
        const codigoMarca = marcaSelect.value;
        limparSelect(modeloSelect);
        limparSelect(anoSelect);

        if (codigoMarca) {
            try {
                const response = await fetch(`/modelos/${codigoMarca}`);
                if (!response.ok) {
                    throw new Error("Erro ao buscar modelos");
                }

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
    }

    /**
     * Função para buscar os anos de um modelo.
     */
    async function buscarAnos() {
        const codigoMarca = marcaSelect.value;
        const codigoModelo = modeloSelect.value;
        limparSelect(anoSelect);

        if (codigoModelo) {
            try {
                const response = await fetch(`/anos/${codigoMarca}/${codigoModelo}`);
                if (!response.ok) {
                    throw new Error("Erro ao buscar anos");
                }

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
    }

    /**
     * Função para alternar o tema entre claro e escuro.
     */
    function toggleTheme() {
        const isDark = toggleThemeCheckbox.checked;
        const newTheme = isDark ? "dark" : "light";

        // Atualiza o atributo do tema
        document.documentElement.setAttribute("data-theme", newTheme);

        // Salva a preferência no localStorage
        localStorage.setItem("theme", newTheme);
    }

    /**
     * Configuração inicial do tema.
     */
    function configurarTemaInicial() {
        const savedTheme = localStorage.getItem("theme") || "light";
        const isDark = savedTheme === "dark";

        // Configurar o tema salvo
        document.documentElement.setAttribute("data-theme", savedTheme);
        toggleThemeCheckbox.checked = isDark;
    }

    /**
     * Função para resetar o formulário e limpar selects dinâmicos.
     */
    function resetarFormulario() {
        document.querySelector("form").reset();
        limparSelect(modeloSelect);
        limparSelect(anoSelect);
    }

    // Event listeners
    marcaSelect.addEventListener("change", buscarModelos);
    modeloSelect.addEventListener("change", buscarAnos);
    novaConsultaBtn.addEventListener("click", resetarFormulario);
    toggleThemeCheckbox.addEventListener("change", toggleTheme);

    // Configuração inicial
    configurarTemaInicial();
});