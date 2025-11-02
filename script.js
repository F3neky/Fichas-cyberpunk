document.addEventListener('DOMContentLoaded', () => {

    let currentSheetId = localStorage.getItem('cyberpunkRedCurrentSheet') || 'ficha-0';
    let sheets = JSON.parse(localStorage.getItem('cyberpunkRedSheets')) || {};
    if (Object.keys(sheets).length === 0) {
        sheets['ficha-0'] = { 'alcunha': 'Nova Ficha' };
    }

    // --- DEFINIÇÃO DE PERÍCIAS (Baseado no PDF) ---
    const pdfPericias = {
        consciencia: [
            { nome: 'Concentração', stat: 'VON' },
            { nome: 'Leitura Labial', stat: 'INT' },
            { nome: 'Ocultar/Revelar Objeto', stat: 'INT' },
            { nome: 'Percepção', stat: 'INT' },
            { nome: 'Rastreamento', stat: 'INT' }
        ],
        corporais: [
            { nome: 'Atletismo', stat: 'DES' },
            { nome: 'Contorcionismo', stat: 'DES' },
            { nome: 'Dança', stat: 'DES' },
            { nome: 'Furtividade', stat: 'DES' },
            { nome: 'Resistência', stat: 'VON' },
            { nome: 'Resistir à Tortura/Drogas', stat: 'VON' }
        ],
        controle: [
            { nome: 'Condutor de Veículo Terrestre', stat: 'REF' },
            { nome: 'Montaria', stat: 'REF' },
            { nome: 'Piloto de Veículo Aéreo (x2)', stat: 'REF' },
            { nome: 'Piloto de Veículo Marítimo', stat: 'REF' }
        ],
        educacionais: [
            { nome: 'Burocracia', stat: 'INT' },
            { nome: 'Contabilidade', stat: 'INT' },
            { nome: 'Criação', stat: 'INT' },
            { nome: 'Criminologia', stat: 'INT' },
            { nome: 'Criptografia', stat: 'INT' },
            { nome: 'Dedução', stat: 'INT' },
            { nome: 'Educação', stat: 'INT' },
            { nome: 'Jogos de Azar', stat: 'INT' },
            { nome: 'Negócios', stat: 'INT' },
            { nome: 'Trato com Animais', stat: 'INT' },
            { nome: 'Biblioteconomia', stat: 'INT' },
            { nome: 'Sobrevivência na Natureza', stat: 'INT' },
            { nome: 'Táticas', stat: 'INT' }
        ],
        luta: [
            { nome: 'Armas Brancas', stat: 'DES' },
            { nome: 'Artes Marciais', stat: 'DES' },
            { nome: 'Briga', stat: 'DES' },
            { nome: 'Evasão', stat: 'DES' }
        ],
        longoalcance: [
            { nome: 'Armas Pesadas (x2)', stat: 'REF' },
            { nome: 'Armas de Ombro', stat: 'REF' },
            { nome: 'Arquearia', stat: 'REF' },
            { nome: 'Armas de Mão', stat: 'REF' },
            { nome: 'Fogo Automático (x2)', stat: 'REF' }
        ],
        sociais: [
            { nome: 'Comércio', stat: 'MOR' },
            { nome: 'Conversação', stat: 'EMP' },
            { nome: 'Cuidados Pessoais', stat: 'MOR' },
            { nome: 'Interrogação', stat: 'MOR' },
            { nome: 'Manha', stat: 'MOR' },
            { nome: 'Percepção Humana', stat: 'EMP' },
            { nome: 'Persuasão', stat: 'MOR' },
            { nome: 'Suborno', stat: 'MOR' },
            { nome: 'Vestimenta & Estilo', stat: 'MOR' }
        ],
        tecnicas: [
            { nome: 'Abrir Fechadura', stat: 'TEC' },
            { nome: 'Cibertecnologia', stat: 'TEC' },
            { nome: 'Demolição (x2)', stat: 'TEC' },
            { nome: 'Falsificação', stat: 'TEC' },
            { nome: 'Fotografia/Filmagem', stat: 'TEC' },
            { nome: 'Paramédico (x2)', stat: 'TEC' },
            { nome: 'Pintar/Desenhar/Esculpir', stat: 'TEC' },
            { nome: 'Primeiros Socorros', stat: 'TEC' },
            { nome: 'Punga', stat: 'TEC' },
            { nome: 'Tecnologia Básica', stat: 'TEC' },
            { nome: 'Tecnologia de Armas', stat: 'TEC' },
            { nome: 'Tecnologia de Veículos Aéreas', stat: 'TEC' },
            { nome: 'Tecnologia de Veículos Marítimos', stat: 'TEC' },
            { nome: 'Tecnologia de Veículos Terrestres', stat: 'TEC' },
            { nome: 'Tecnologia Eletrônica de Segurança (x2)', stat: 'TEC' }
        ]
    };

    // --- INICIALIZAÇÃO ---
    function init() {
        // Abas
        document.querySelectorAll('.tab-link').forEach(button => {
            button.addEventListener('click', () => switchTab(button.dataset.tab));
        });

        // Controles da Ficha
        document.getElementById('manageSheets').addEventListener('click', toggleSheetManager);
        document.getElementById('newSheet').addEventListener('click', newSheet);
        document.getElementById('savePDF').addEventListener('click', () => window.print());
        document.getElementById('exportJSON').addEventListener('click', exportSheet);
        document.getElementById('importJSON').addEventListener('change', importSheet);

        // Imagem
        document.getElementById('imageUpload').addEventListener('change', loadImage);

        // Listeners para Salvar e Calcular (APENAS HP/HUMANIDADE)
        document.querySelectorAll('[data-save]').forEach(el => {
            el.addEventListener('input', autoSave);
        });
        document.querySelectorAll('[data-stat]').forEach(el => {
            el.addEventListener('input', () => {
                updateAllCalculatedStats(); // Atualiza HP, etc.
                autoSave(); // Salva a mudança no stat
            });
        });

        // Botões de Adicionar
        document.getElementById('addArma').addEventListener('click', () => addArma());
        document.getElementById('addEquipamento').addEventListener('click', () => addEquipamento());
        document.querySelectorAll('.add-row-btn[data-skill-type]').forEach(btn => {
            btn.addEventListener('click', () => addDynamicSkillRow(btn.dataset.skillType));
        });
        document.querySelectorAll('.add-row-btn[data-cyber-type]').forEach(btn => {
            btn.addEventListener('click', () => addCyberItem(btn.dataset.cyberType));
        });

        renderAllPericias();
        loadFormData(getSavedData());
        renderSheetList();
        updateAllCalculatedStats();
    }

    // --- SISTEMA DE ABAS ---
    function switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`.tab-link[data-tab="${tabId}"]`).classList.add('active');
    }

    // --- GERENCIAMENTO DE FICHAS (Salvar, Carregar, Múltiplas Fichas) ---
    function getSavedData() {
        return sheets[currentSheetId] || {};
    }

    function autoSave() {
        sheets[currentSheetId] = getFormData();
        localStorage.setItem('cyberpunkRedSheets', JSON.stringify(sheets));
        localStorage.setItem('cyberpunkRedCurrentSheet', currentSheetId);
        // Atualiza o nome na lista
        const activeItem = document.querySelector(`#sheetList .sheet-item[data-id="${currentSheetId}"] span`);
        if (activeItem) {
            activeItem.textContent = sheets[currentSheetId].alcunha || 'Ficha Sem Nome';
        }
    }

    function getFormData() {
        const data = {
            dynamicSkills: {},
            armas: [],
            equipamentos: [],
            cyberware: {}
        };

        // Campos simples (Inputs e Textareas)
        document.querySelectorAll('[data-save]').forEach(el => {
            // Verifica se o elemento tem um ID
            if (el.id) {
                // Para números estáticos, armazena como número, senão como string
                data[el.id] = el.type === 'number' ? (parseInt(el.value) || 0) : el.value;
            }
        });
        
        // Checkboxes
        document.querySelectorAll('input[type="checkbox"][data-save]').forEach(el => {
            data[el.id] = el.checked;
        });

        // Imagem
        data.characterImage = document.getElementById('characterImage').src;

        // Perícias Dinâmicas (Idiomas, etc.)
        document.querySelectorAll('.dynamic-skill-list').forEach(list => {
            const type = list.id.replace('-list', '');
            data.dynamicSkills[type] = [];
            list.querySelectorAll('.dynamic-skill-item').forEach(item => {
                data.dynamicSkills[type].push({
                    id: item.dataset.id,
                    nome: item.querySelector('.skill-name-input').value,
                    nvl: item.querySelector('.skill-nvl').value,
                    stat: item.querySelector('.skill-stat').value, 
                    base: item.querySelector('.skill-base').value  
                });
            });
        });
        
        // Armas
        document.querySelectorAll('#armasList .arma-item').forEach(item => {
            data.armas.push({
                id: item.dataset.id,
                nome: item.querySelector('.arma-nome').value,
                dano: item.querySelector('.arma-dano').value,
                municao: item.querySelector('.arma-municao').value,
                cdt: item.querySelector('.arma-cdt').value,
                obs: item.querySelector('.arma-obs').value,
            });
        });
        
        // Equipamentos
        document.querySelectorAll('#equipamentoList .equip-item').forEach(item => {
            data.equipamentos.push({
                id: item.dataset.id,
                nome: item.querySelector('.equip-nome').value,
                qtd: item.querySelector('.equip-qtd').value,
                obs: item.querySelector('.equip-obs').value,
            });
        });

        // Cyberware
        document.querySelectorAll('.cyber-list-box').forEach(box => {
            // Encontra o tipo a partir do ID da lista UL (Ex: cyber-audio-list -> audio)
            const typeList = box.querySelector('ul[id^="cyber-"]');
            if (!typeList) return; 

            const type = typeList.id.split('-')[1] || typeList.id.split('-')[2]; // 'audio' ou 'olho-direito'
            
            data.cyberware[type] = [];
            typeList.querySelectorAll('.cyber-item').forEach(item => {
                data.cyberware[type].push({
                    id: item.dataset.id,
                    nome: item.querySelector('.cyber-nome').value,
                    info: item.querySelector('.cyber-info').value
                });
            });
        });


        return data;
    }

    function loadFormData(data) {
        // Limpa campos antes de carregar
        document.querySelectorAll('[data-save]').forEach(el => {
            if (el.type === 'checkbox') {
                 el.checked = false;
            } else {
                 el.value = el.type === 'number' ? 0 : '';
            }
        });
        
        // Recria as perícias estáticas para garantir que os campos de input existam
        renderAllPericias(); 
        
        // Limpa listas dinâmicas
        document.querySelectorAll('.dynamic-skill-list').forEach(list => {
            const header = list.querySelector('.skill-header');
            list.innerHTML = '';
            if(header) list.appendChild(header);
        });
        document.getElementById('armasList').innerHTML = '';
        document.getElementById('equipamentoList').innerHTML = '';
        document.querySelectorAll('.cyber-list-box ul').forEach(list => list.innerHTML = '');
        
        // Carrega campos simples
        for (const key in data) {
            const el = document.getElementById(key);
            if (el && el.hasAttribute('data-save')) {
                if (el.type === 'checkbox') {
                    el.checked = data[key] === true;
                } else {
                    el.value = data[key];
                }
            }
        }

        // Imagem
        const imgEl = document.getElementById('characterImage');
        const uploadTextEl = document.getElementById('uploadText');
        if (data.characterImage && data.characterImage.startsWith('data:image')) {
            imgEl.src = data.characterImage;
            imgEl.style.display = 'block';
            uploadTextEl.style.display = 'none';
        } else {
            imgEl.src = '';
            imgEl.style.display = 'none';
            uploadTextEl.style.display = 'block';
        }

        // Perícias Dinâmicas
        if (data.dynamicSkills) {
            for (const type in data.dynamicSkills) {
                // Garante que o header exista (se for uma lista dinâmicas)
                let list = document.getElementById(`${type}-list`);
                if(list && !list.querySelector('.skill-header')) {
                    // Recria o header se necessário (embora o HTML já deva ter)
                    const header = document.createElement('div');
                    header.className = 'skill-header';
                    let label = type === 'idiomas' ? 'Idiomas (INT)' : 
                                type === 'conhecimento' ? 'Conhecimento de Área (INT)' :
                                type === 'ciencias' ? 'Ciências (INT)' : 'Perícia';
                    header.innerHTML = `<span>${label}</span><span>NVL</span><span>STAT</span><span>BASE</span>`;
                    list.prepend(header);
                }
                
                if (Array.isArray(data.dynamicSkills[type])) {
                    data.dynamicSkills[type].forEach(skill => {
                        addDynamicSkillRow(type, skill);
                    });
                }
            }
        }
        
        // Armas
        if(data.armas && Array.isArray(data.armas)) {
            data.armas.forEach(arma => addArma(arma));
        }
        
        // Equipamentos
        if(data.equipamentos && Array.isArray(data.equipamentos)) {
            data.equipamentos.forEach(equip => addEquipamento(equip));
        }

        // Cyberware
        if(data.cyberware) {
            for (const type in data.cyberware) {
                if (Array.isArray(data.cyberware[type])) {
                    data.cyberware[type].forEach(item => addCyberItem(type, item));
                }
            }
        }

        updateAllCalculatedStats();
    }

    function toggleSheetManager() {
        const manager = document.getElementById('sheetManager');
        manager.style.display = manager.style.display === 'none' ? 'block' : 'none';
    }

    function renderSheetList() {
        const list = document.getElementById('sheetList');
        list.innerHTML = '';
        for (const id in sheets) {
            const name = sheets[id].alcunha || `Ficha ${id}`;
            const item = document.createElement('div');
            item.className = 'sheet-item' + (id === currentSheetId ? ' active' : '');
            item.dataset.id = id;
            item.innerHTML = `
                <span class="sheet-name">${name}</span>
                <button class="delete-btn" data-id="${id}">X</button>
            `;
            item.querySelector('.sheet-name').addEventListener('click', () => switchSheet(id));
            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteSheet(id);
            });
            list.appendChild(item);
        }
    }

    function switchSheet(id) {
        if (id === currentSheetId) return;
        autoSave(); // Salva a ficha atual
        currentSheetId = id;
        localStorage.setItem('cyberpunkRedCurrentSheet', currentSheetId);
        loadFormData(getSavedData()); // Carrega a nova ficha
        renderSheetList();
        toggleSheetManager();
    }

    function newSheet() {
        const newName = prompt('Digite a alcunha do novo personagem:');
        if (!newName) return;
        
        autoSave(); // Salva a ficha atual
        const newId = 'ficha-' + Date.now();
        currentSheetId = newId;
        sheets[newId] = { alcunha: newName };
        localStorage.setItem('cyberpunkRedCurrentSheet', currentSheetId);
        localStorage.setItem('cyberpunkRedSheets', JSON.stringify(sheets));
        
        loadFormData(getSavedData()); // Carrega a nova ficha (vazia)
        renderSheetList();
        updateAllCalculatedStats();
    }

    function deleteSheet(id) {
        if (Object.keys(sheets).length <= 1) {
            alert('Você deve ter pelo menos uma ficha.');
            return;
        }
        if (confirm(`Tem certeza que quer deletar a ficha "${sheets[id].alcunha || 'Sem Nome'}"?`)) {
            delete sheets[id];
            if (currentSheetId === id) {
                currentSheetId = Object.keys(sheets)[0]; // Muda para a primeira ficha
            }
            localStorage.setItem('cyberpunkRedSheets', JSON.stringify(sheets));
            localStorage.setItem('cyberpunkRedCurrentSheet', currentSheetId);
            loadFormData(getSavedData());
            renderSheetList();
        }
    }
    
    // --- IMPORTAR / EXPORTAR ---
    function exportSheet() {
        autoSave();
        const data = JSON.stringify(getFormData(), null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const fileName = (getFormData().alcunha || 'ficha_cyberpunk').replace(/\s/g, '_');
        a.href = url;
        a.download = `${fileName}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function importSheet(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                // Gera novo ID para a ficha importada
                const newId = 'ficha-' + Date.now();
                sheets[newId] = data;
                currentSheetId = newId;
                
                localStorage.setItem('cyberpunkRedSheets', JSON.stringify(sheets));
                localStorage.setItem('cyberpunkRedCurrentSheet', currentSheetId);
                
                loadFormData(data);
                renderSheetList();
                alert(`Ficha "${data.alcunha || 'Importada'}" carregada com sucesso!`);
            } catch (err) {
                alert('Erro ao ler o arquivo. O JSON é inválido.');
                console.error(err);
            }
        };
        reader.readAsText(file);
        // Limpa o input para permitir importar o mesmo arquivo novamente
        event.target.value = null;
    }

    // --- CARREGAR IMAGEM ---
    function loadImage(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const imgEl = document.getElementById('characterImage');
            const uploadTextEl = document.getElementById('uploadText');
            imgEl.src = e.target.result;
            imgEl.style.display = 'block';
            uploadTextEl.style.display = 'none';
            autoSave();
        };
        reader.readAsDataURL(file);
    }

    // --- CÁLCULOS DE STATS (Apenas HP, Humanidade, etc.) ---
    function getStatValue(statId) {
        const el = document.getElementById(statId);
        return el ? (parseInt(el.value) || 0) : 0;
    }

    function updateAllCalculatedStats() {
        // Calcula PV
        const corpo = getStatValue('CORPO');
        // BTM é o valor arredondado para cima de (CORPO + VON) / 2.
        const btm = Math.ceil((corpo + getStatValue('VON')) / 2);
        const pvMax = 10 + (5 * btm);
        document.getElementById('pv_max').value = pvMax;
        
        // Calcula Gravemente Ferido
        const gfLimiar = Math.ceil(pvMax / 2);
        document.getElementById('gf_limiar').textContent = `(Limiar: ${gfLimiar})`;
        
        // Calcula Teste de Morte
        document.getElementById('teste_morte').value = corpo;
        
        // Calcula Humanidade
        const empBase = getStatValue('EMP_base');
        document.getElementById('humanidade_max').value = empBase * 10;
    }

    // --- RENDERIZAÇÃO DE PERÍCIAS (AGORA COMPLETAMENTE MANUAIS) ---
    function renderAllPericias() {
        for (const categoria in pdfPericias) {
            const container = document.getElementById(`pericias-${categoria}`);
            // Limpa perícias antigas, mas mantém o header
            const header = container.querySelector('.skill-header');
            container.innerHTML = '';
            if(header) container.appendChild(header); // Adiciona o header de volta

            pdfPericias[categoria].forEach(pericia => {
                const el = createPericiaItem(pericia);
                container.appendChild(el);
            });
        }
    }

    function createPericiaItem(pericia) {
        // Cria IDs únicos para cada campo de input
        const baseId = pericia.nome.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
        const skillIdNvl = baseId + '_nvl';
        const skillIdStat = baseId + '_stat';
        const skillIdBase = baseId + '_base';

        // Pega os valores salvos
        const savedData = getSavedData();
        const nvl = savedData[skillIdNvl] || 0;
        const stat = savedData[skillIdStat] || 0;
        const base = savedData[skillIdBase] || 0;

        const item = document.createElement('div');
        item.className = 'skill-item';
        
        item.innerHTML = `
            <span class="skill-name">${pericia.nome} <span class="stat-label">(${pericia.stat})</span></span>
            <input type="number" class="skill-nvl" id="${skillIdNvl}" value="${nvl}" min="0" data-save>
            <input type="number" class="skill-stat" id="${skillIdStat}" value="${stat}" min="0" data-save>
            <input type="number" class="skill-base" id="${skillIdBase}" value="${base}" min="0" data-save>
        `;
        
        // Adiciona listeners de autoSave a cada input
        item.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', autoSave);
        });
        
        return item;
    }

    // --- PERÍCIAS DINÂMICAS (IDIOMAS, ETC.) ---
    function addDynamicSkillRow(type, data = { id: `skill-${type}-${Date.now()}`, nome: '', nvl: 0, stat: 0, base: 0 }) {
        const list = document.getElementById(`${type}-list`);
        const item = document.createElement('div');
        item.className = 'dynamic-skill-item';
        item.dataset.id = data.id;

        const nvl = data.nvl || 0;
        const stat = data.stat || 0;
        const base = data.base || 0;

        item.innerHTML = `
            <input type="text" class="skill-name-input" placeholder="Nomear ${type}" value="${data.nome}" data-save>
            <input type="number" class="skill-nvl" value="${nvl}" min="0" data-save>
            <input type="number" class="skill-stat" value="${stat}" min="0" data-save>
            <input type="number" class="skill-base" value="${base}" min="0" data-save>
            <button class="delete-row-btn">X</button>
        `;
        
        // Adiciona listeners de autoSave
        item.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', autoSave);
        });
        
        item.querySelector('.delete-row-btn').addEventListener('click', () => {
            item.remove();
            autoSave();
        });
        
        // Insere o novo item antes do botão de adicionar se ele existir na lista
        const addButton = list.closest('.dynamic-skill-box').querySelector('.add-row-btn');
        if (addButton) {
            list.insertBefore(item, addButton.nextSibling);
        } else {
            list.appendChild(item);
        }
    }

    // --- LISTAS DINÂMICAS (ARMAS, EQUIP, CYBER) ---
    
    function addArma(data = { id: `arma-${Date.now()}`, nome: '', dano: '', municao: '', cdt: '', obs: '' }) {
        const list = document.getElementById('armasList');
        const item = document.createElement('div');
        item.className = 'arma-item';
        item.dataset.id = data.id;
        item.innerHTML = `
            <input type="text" class="arma-nome" placeholder="Nome" value="${data.nome}" data-save>
            <input type="text" class="arma-dano" placeholder="Dano" value="${data.dano}" data-save>
            <input type="text" class="arma-municao" placeholder="Munição" value="${data.municao}" data-save>
            <input type="text" class="arma-cdt" placeholder="CDT" value="${data.cdt}" data-save>
            <input type="text" class="arma-obs" placeholder="Obs." value="${data.obs}" data-save>
            <button class="delete-row-btn">X</button>
        `;
        item.querySelectorAll('input').forEach(i => i.addEventListener('input', autoSave));
        item.querySelector('.delete-row-btn').addEventListener('click', () => {
            item.remove();
            autoSave();
        });
        list.appendChild(item);
    }

    function addEquipamento(data = { id: `equip-${Date.now()}`, nome: '', qtd: 1, obs: '' }) {
        const list = document.getElementById('equipamentoList');
        const item = document.createElement('div');
        item.className = 'equip-item';
        item.dataset.id = data.id;
        item.innerHTML = `
            <input type="text" class="equip-nome" placeholder="Nome do Item" value="${data.nome}" data-save>
            <input type="number" class="equip-qtd" placeholder="Qtd" value="${data.qtd}" min="1" data-save>
            <input type="text" class="equip-obs" placeholder="Notas" value="${data.obs}" data-save>
            <button class="delete-row-btn">X</button>
        `;
        item.querySelectorAll('input').forEach(i => i.addEventListener('input', autoSave));
        item.querySelector('.delete-row-btn').addEventListener('click', () => {
            item.remove();
            autoSave();
        });
        list.appendChild(item);
    }

    function addCyberItem(type, data = { id: `cyber-${type}-${Date.now()}`, nome: '', info: '' }) {
        const list = document.getElementById(`cyber-${type}-list`);
        const item = document.createElement('li');
        item.className = 'cyber-item';
        item.dataset.id = data.id;
        item.innerHTML = `
            <input type="text" class="cyber-nome" placeholder="Nome" value="${data.nome}" data-save>
            <input type="text" class="cyber-info" placeholder="Info/Custo" value="${data.info}" data-save>
            <button class="delete-row-btn">X</button>
        `;
        item.querySelectorAll('input').forEach(i => i.addEventListener('input', autoSave));
        item.querySelector('.delete-row-btn').addEventListener('click', () => {
            item.remove();
            autoSave();
        });
        list.appendChild(item);
    }

    // Inicia a aplicação
    init();
});
