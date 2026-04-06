let data = { items: [], materials: [], monsters: [] };
let currentTab = "items";

// ※ data/index.json をルートとして使用
// 例:
// {
//   "items": "items.json",
//   "materials": "materials.json",
//   "monsters": "monsters.json"
// }
// 各jsonの中身はファイルパス配列
// 例: ["items/001_sword.json", "items/002_axe.json"]
// ===== データ読み込み =====
async function loadData() {
  // カテゴリごとのindexを読む関数
  async function loadCategory(indexFile, folder) {
    const fileList = await fetch(`data/index/${indexFile}`).then(r => r.json());
    let result = [];

    for (const file of fileList) {
      const json = await fetch(`data/${folder}/${file}`).then(r => r.json());
      result = result.concat(json);
    }

    return result;
  }

  // 各カテゴリ読み込み
  data.items = await loadCategory("item.json", "items");
  data.materials = await loadCategory("mate.json", "materials");
  data.monsters = await loadCategory("mons.json", "monsters");

  renderList(data.items);
  updateFilters();
}

// ===== タブ =====
function switchTab(tab) {
  currentTab = tab;
  updateFilters();
  renderList(data[tab]);
}

// ===== フィルタ制御 =====
function updateFilters() {
  const ids = [
    "filter_lv","filter_attack","filter_weight","filter_hit",
    "filter_dodge","filter_pdef","filter_mdef",
    "filter_action","filter_move","filter_element","filter_hp"
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  if (currentTab === "items") {
    ["filter_lv","filter_attack","filter_weight","filter_hit",
     "filter_dodge","filter_pdef","filter_mdef",
     "filter_action","filter_move"]
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "inline-block";
    });
  }

  if (currentTab === "materials") {
    ["filter_weight"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "inline-block";
    });
  }

  if (currentTab === "monsters") {
    ["filter_lv","filter_element","filter_hp",
     "filter_dodge","filter_pdef","filter_mdef",
     "filter_action","filter_move"]
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "inline-block";
    });
  }
}

// ===== 一覧 =====
function renderList(list) {
  const el = document.getElementById("list");
  el.innerHTML = "";

  list.forEach(obj => {
    el.innerHTML += `<div><a onclick="showDetail('${obj.id}')">${obj.name}</a></div>`;
  });
}

// ===== 詳細振り分け =====
function showDetail(id) {
  if (currentTab === "items") showItem(id);
  if (currentTab === "materials") showMaterial(id);
  if (currentTab === "monsters") showMonster(id);
}

// ===== リンク =====
function linkItem(id) {
  const obj = data.items.find(i => i.id === id);
  return `<a onclick="switchTab('items');showItem('${id}')">${obj.name}</a>`;
}
function linkMaterial(id) {
  const obj = data.materials.find(i => i.id === id);
  return `<a onclick="switchTab('materials');showMaterial('${id}')">${obj.name}</a>`;
}
function linkMonster(id) {
  const obj = data.monsters.find(i => i.id === id);
  return `<a onclick="switchTab('monsters');showMonster('${id}')">${obj.name}</a>`;
}

// ===== アイテム =====
function showItem(id) {
  const i = data.items.find(x => x.id === id);

  const recipe = (i.recipe || []).map(r => {
    const link = r.type === "item" ? linkItem(r.id) : linkMaterial(r.id);
    return `${link} x${r.count}`;
  });

  const drops = (i.drops || []).map(linkMonster);

  document.getElementById("detail").innerHTML = `
  <div class="card">
    <h2>${i.name}</h2>
    <p>タイプ: ${i.type || "="}</p>
    <p>クラス制限: ${i.class?.length ? i.class.join(", ") : "-"}</p>
    <p>装備部位: ${i.slot || "="}</p><a>    </a><p>射程: ${i.range || "="}</p>
    <p>LV: ${i.lv || 1}</p>
    <p>重量: ${i.weight || "="}</p>
  </div>

  <div class="card">
    <p>命中: ${i.hit ?? "="}</p>
    <p>攻撃: ${i.attack ?? "="}</p>
    <p>回避: ${i.dodge ?? "="}</p>
    <p>物理防御: ${i.pdef ?? "="}</p>
    <p>魔法防御: ${i.mdef ?? "="}</p>
    <p>行動値: ${i.action ?? "="}</p>
    <p>移動値: ${i.move ?? "="}</p>
    <p>特殊効果: ${i.effect || "-"}</p>
  </div>

  <div class="card">
    <p><i>${i.lore || ""}</i></p>
    <p>素材:<br>${recipe.join("<br>")}</p>
    <p>ドロップ: ${drops.join(", ")}</p>
  </div>
  `;
}

// ===== 素材 =====
function showMaterial(id) {
  const m = data.materials.find(x => x.id === id);

  document.getElementById("detail").innerHTML = `
    <div class="card">
      <h2>${m.name}</h2>
      <p>重量: ${m.weight ?? "="}</p>
      <p><i>${m.lore || ""}</i></p>
    </div>

    <div class="card">
      <p>ドロップ: ${(m.gets || []).map(linkMonster).join(", ")}</p>
    </div>
  `;
}

// ===== モンスター =====
function showMonster(id) {
  const m = data.monsters.find(x => x.id === id);

  const drops = (m.drops || []).map(d => {
    const item = data.items.find(i => i.id === d.id);
    const mat = data.materials.find(i => i.id === d.id);
    const name = item ? linkItem(d.id) : mat ? linkMaterial(d.id) : d.id;
    const count = d.min === d.max ? d.min : `${d.min}~${d.max}`;
    return `${count} ${name}`;
  });

  document.getElementById("detail").innerHTML = `

  <div class="card">
    <h2>${m.name}</h2>
    <p>分類: ${m.type || "="}</p>
    <p>属性: ${m.element || "="}</p>
    <p>LV: ${m.lv || "="} / 識別値: ${m.identify || "="}</p>
  </div>

  <div class="card">
    ${m.judge ? `<p>判定: ${m.judge}</p>` : ""}
    <p>HP: ${m.hp || "="} / MP: ${m.mp || "="}</p>
    <p>物理装甲: ${m.pdef || "="} / 魔法装甲: ${m.mdef || "="}</p>
    <p>行動値: ${m.action || "="} / 移動値: ${m.move || "="} / 回避: ${m.dodge || "="}</p>
  </div>

  ${(m.attacks && m.attacks.length) ? `
  <div class="card">
    <h3>攻撃</h3>
    ${m.attacks.map(a => `<p>${a}</p>`).join("")}
  </div>` : ""}

  ${m.stats ? `
  <div class="card">
    <h3>能力値</h3>
    <p>${m.stats}</p>
  </div>` : ""}

  ${(m.skills && m.skills.length) ? `
  <div class="card">
    <h3>エネミースキル</h3>
    ${m.skills.map(s => `<p>${s}</p>`).join("")}
  </div>` : ""}

  <div class="card">
    <h3>ロア</h3>
    <p><i>${m.lore || ""}</i></p>
  </div>

  ${(drops.length) ? `
  <div class="card">
    <h3>ドロップ品</h3>
    ${drops.join("<br>")}
  </div>` : ""}

  <div class="card">
    <button onclick="rollDrops('${id}')">戦利品決定</button>
    <textarea id="dropResult" style="width:100%;height:100px;"></textarea>
  </div>

  <div class="card">
    <button onclick="exportKoma('${id}')">駒抽出</button>
  </div>

  `;
}

// ===== 戦利品 =====
function rollDrops(id) {
  const m = data.monsters.find(x => x.id === id);
  let result = "";

  m.drops.forEach(d => {
    const count = Math.floor(Math.random() * (d.max - d.min + 1)) + d.min;

    const name =
      data.items.find(i => i.id === d.id)?.name ||
      data.materials.find(i => i.id === d.id)?.name;

    result += `${name} x${count}\n`;
  });

  document.getElementById("dropResult").value = result;
}

// ===== 駒（修正版） =====
function exportKoma(id) {
  const m = data.monsters.find(x => x.id === id);

  const commands = `### ■エネミー識別情報
種別: ${m.type || "="}
HP: ${m.hp} / MP: ${m.mp}

### ■基本情報
物理防御値: ${m.pdef}
魔法防御値: ${m.mdef}
行動値: ${m.action}
移動値: ${m.move}

//----------[ 判定 ]----------
${m.judge || ""}

//----------[ 攻撃 ]----------
${(m.attacks || []).join("\n")}

//----------[ スキル ]----------
${(m.skills || []).join("\n")}
`;

  const koma = {
    kind: "character",
    data: {
      name: m.name,
      externalUrl: "",
      status: [
        { label: "HP", value: String(m.hp), max: String(m.hp) },
        { label: "MP", value: String(m.mp), max: String(m.mp) }
      ],
      initiative: m.action || 0,
      params: [
        { label: "防御値", value: String(m.pdef) }
      ],
      commands: commands,
      memo: `種別:${m.type} / LV${m.lv}`,
      secret: false
    }
  };

  navigator.clipboard.writeText(JSON.stringify(koma, null, 2));
  alert("コピーした");
}

// ===== 検索 =====
function doSearch() {
  const keywordRaw = document.getElementById("searchInput").value.toLowerCase();
  const keywords = keywordRaw.split(" ").filter(k => k);

  const list = data[currentTab];

  const result = list.filter(obj => {
    const text = [obj.name, obj.lore, obj.effect].join(" ").toLowerCase();
    return keywords.every(k => text.includes(k));
  });

  renderList(result);
}

loadData();
