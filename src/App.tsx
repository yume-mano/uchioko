
import { useState, useEffect } from "react";

type Entry = {
  id: string;
  date: string;
  time: string;
  type?: string;
  category?: string;
  food?: string;
  foodName?: string;
  amount?: string;
  condition?: string;
  frequency?: string;
  stoolColor?: string;
  name?: string;
  status?: string;
  duration?: string;
  memo?: string;
  note?: string;
  [key: string]: unknown;
};

const KEY = "uchinoko-diary-v1";
const NAME_KEY = "uchinoko-pet-name";

const categories = [
  ["food", "🍚 食事"],
  ["pee", "💧 おしっこ"],
  ["poop", "💩 うんち"],
  ["water", "🥤 お水"],
  ["walk", "🐕 お散歩"],
  ["mood", "❤️ 体調"],
  ["medicine", "💊 お薬・サプリ"],
  ["memo", "📝 自由メモ"],
];

const choices: Record<string, string[]> = {
  frequency: [
    "😊 いつも通り",
    "⬇️ 少ない",
    "⬆️ 多い",
    "❔ 未確認",
    "🚫 出ていない",
  ],
  peeAmount: [
    "💧 普通",
    "⬇️ 少ない",
    "⬆️ 多い",
    "❔ わからない",
  ],
  hardness: [
    "🪨 硬い",
    "💩 普通",
    "🍦 柔らかい",
    "💦 下痢",
  ],
  color: [
    "🟤 茶色",
    "⚫ 黒っぽい",
    "🔴 赤っぽい",
    "🟡 黄色っぽい",
    "⚪ その他",
  ],
  quantity: [
    "⬇️ 少ない",
    "⚖️ 普通",
    "⬆️ 多い",
  ],
  mood: [
    "😄 元気",
    "😊 普通",
    "😔 元気がない",
    "🤒 気になる",
  ],
  medicine: [
    "✅ 飲んだ",
    "❌ 飲まなかった",
    "⏳ まだ飲んでいない",
  ],
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function nowTime() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function text(v: unknown) {
  return v == null ? "" : String(v);
}

function load(): Entry[] {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function kind(r: Entry) {
  const value = text(r.type || r.category);
  const aliases: Record<string, string> = {
    meal: "food",
    "食事": "food",
    urine: "pee",
    "おしっこ": "pee",
    stool: "poop",
    "うんち": "poop",
    "お水": "water",
    "お散歩": "walk",
    "体調": "mood",
    "お薬": "medicine",
    "サプリ": "medicine",
    "自由メモ": "memo",
  };
  return aliases[value] || value;
}

function detail(r: Entry) {
  const t = kind(r);
  if (t === "food") {
    return [r.food || r.foodName || r.foodType || r.name, r.amount ? `量 ${r.amount}g` : ""].filter(Boolean).join(" ／ ");
  }
  if (t === "pee") {
    return [r.frequency, r.amount, r.condition].filter(Boolean).join(" ／ ");
  }
  if (t === "poop") {
    return [r.condition, r.stoolColor, r.amount].filter(Boolean).join(" ／ ");
  }
  if (t === "water") return r.amount ? `${r.amount}ml` : "";
  if (t === "walk") return r.duration ? `${r.duration}分` : "";
  if (t === "mood") return text(r.condition || r.status);
  if (t === "medicine") {
    return [r.condition === "サプリ" ? "サプリ" : "お薬", r.name, r.status, r.amount].filter(Boolean).join(" ／ ");
  }
  return "";
}

export default function App() {
  const [records, setRecords] = useState<Entry[]>(load);
  const [petName, setPetName] = useState(
    () => localStorage.getItem(NAME_KEY) || ""
  );
  const [active, setActive] = useState("");
  const [editing, setEditing] = useState("");
  const [date, setDate] = useState(today());
  const [time, setTime] = useState(nowTime());
  const [food, setFood] = useState("");
  const [amount, setAmount] = useState("");
  const [condition, setCondition] = useState("");
  const [frequency, setFrequency] = useState("");
  const [stoolColor, setStoolColor] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [duration, setDuration] = useState("");
  const [memo, setMemo] = useState("");
  const [calendar, setCalendar] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selected, setSelected] = useState(today());

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(NAME_KEY, petName);
  }, [petName]);

  function reset() {
    setEditing("");
    setDate(today());
    setTime(nowTime());
    setFood("");
    setAmount("");
    setCondition("");
    setFrequency("");
    setStoolColor("");
    setName("");
    setStatus("");
    setDuration("");
    setMemo("");
  }

  function choose(t: string) {
    if (active === t && !editing) {
      setActive("");
    } else {
      reset();
      setActive(t);
    }
  }

  function save() {
    if (!active || !date || !time) {
      alert("日付と時間を確認してね");
      return;
    }
    if (active === "memo" && !memo.trim()) {
      alert("メモを入力してね");
      return;
    }
    if (active === "medicine" && !name.trim()) {
      alert("お薬・サプリの名前を入力してね");
      return;
    }

    const old = records.find(r => r.id === editing);
    const item: Entry = {
      ...(old || {}),
      id: editing || `${Date.now()}-${Math.random()}`,
      date, time, type: active, food, amount,
      condition, frequency, stoolColor,
      name, status, duration, memo,
    };

    setRecords(prev =>
      editing
        ? prev.map(r => r.id === editing ? item : r)
        : [...prev, item]
    );
    setSelected(date);
    setYear(Number(date.slice(0, 4)));
    setMonth(Number(date.slice(5, 7)) - 1);
    reset();
  }

  function edit(r: Entry) {
    setActive(kind(r));
    setEditing(r.id);
    setDate(r.date);
    setTime(r.time);
    setFood(text(r.food || r.foodName || r.foodType));
    setAmount(text(r.amount));
    setCondition(text(r.condition || r.state));
    setFrequency(text(r.frequency));
    setStoolColor(text(r.stoolColor));
    setName(text(r.name));
    setStatus(text(r.status));
    setDuration(text(r.duration));
    setMemo(text(r.memo || r.note));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function remove(id: string) {
    if (window.confirm("この記録を削除しますか？")) {
      setRecords(prev => prev.filter(r => r.id !== id));
      if (editing === id) reset();
    }
  }

  function selectButtons(
    items: string[],
    value: string,
    setter: (v: string) => void
  ) {
    return (
      <div className="choices">
        {items.map(v => (
          <button
            type="button"
            key={v}
            className={value === v ? "chosen" : ""}
            onClick={() => setter(v)}
          >
            {v}
          </button>
        ))}
      </div>
    );
  }

  function card(r: Entry) {
    return (
      <div className="record" key={r.id}>
        <b>{categories.find(c => c[0] === kind(r))?.[1] || "🐾 記録"}</b>
        <small>{r.date}　{r.time}</small>
        {detail(r) && <p>{detail(r)}</p>}
        {text(r.memo || r.note) && <p>📝 {text(r.memo || r.note)}</p>}
        <div className="actions">
          <button onClick={() => edit(r)}>✏️ 編集</button>
          <button onClick={() => remove(r.id)}>🗑️ 削除</button>
        </div>
      </div>
    );
  }

  const sorted = [...records].sort((a, b) =>
    `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)
  );
  const history = sorted.filter(r => kind(r) === active);
  const daily = sorted.filter(r => r.date === selected);
  const first = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(first).fill(0),
    ...Array.from({ length: count }, (_, i) => i + 1),
  ];
  const keyFor = (d: number) =>
    `${year}-${pad(month + 1)}-${pad(d)}`;
  const dates = new Set(records.map(r => r.date));

  return (
    <main className="app">
      <style>{`
        *{box-sizing:border-box}
        body{margin:0;background:#fff9f5;color:#57474a;font-family:sans-serif}
        .app{max-width:780px;margin:auto;padding:20px 14px 70px}
        h1{text-align:center;color:#a86e7b}
        h2{color:#a86e7b;font-size:21px}
        .sub{text-align:center;color:#9b8584}
        .panel{background:white;border:1px solid #f0dce0;border-radius:20px;padding:18px;margin-top:20px}
        label{display:block;font-weight:bold;margin:14px 0 6px}
        input,textarea,select{width:100%;padding:12px;border:1px solid #dfc6cb;border-radius:10px;font-size:16px;background:white;color:#57474a}
        textarea{min-height:85px}
        button{border:0;border-radius:10px;padding:11px;background:#f3e1e5;color:#694d56;cursor:pointer;font-size:15px}
        .primary{background:#bd8490;color:white;width:100%;font-weight:bold;margin-top:16px;padding:15px}
        .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
        .category{background:#fff3f5;padding:18px 8px}
        .category.chosen,.choices .chosen{background:#bd8490;color:white}
        .choices{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
        .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .record{border:1px solid #efd9dd;background:#fffafa;border-radius:13px;padding:13px;margin:10px 0}
        .record small{display:block;color:#988086;margin-top:5px}
        .record p{margin:10px 0}
        .actions{display:flex;gap:8px}
        .nav{display:flex;justify-content:space-between;align-items:center;margin:18px 0}
        .months{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
        .days{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-top:12px}
        .days button{min-height:49px;padding:5px 1px;background:#fff3f5;font-size:13px}
        .days .selected{background:#bd8490;color:white}
        .paw{display:block;font-size:11px}
        .hint{font-size:13px;color:#9b8584}
        @media(max-width:480px){.months{grid-template-columns:repeat(3,1fr)}}
      `}</style>

      <h1>🐾 うちの子日記</h1>
      <p className="sub">毎日の小さな変化を、大切な思い出に。</p>

      <section className="panel">
        <h2>🐶 うちの子プロフィール</h2>
        <label>ペットのお名前</label>
        <input
          value={petName}
          onChange={e => setPetName(e.target.value)}
          placeholder="例：モモ"
        />
      </section>

      <section className="panel">
        <h2>🐾 記録する・履歴を見る</h2>
        <p className="hint">項目をタップして簡単入力！</p>
        <div className="grid">
          {categories.map(([t, label]) => (
            <button
              key={t}
              className={`category ${active === t ? "chosen" : ""}`}
              onClick={() => choose(t)}
            >
              {label}
            </button>
          ))}
        </div>

        {active && (
          <>
            <h2>{categories.find(c => c[0] === active)?.[1]}を記録</h2>
            <div className="two">
              <div>
                <label>日付</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <label>時間</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>

            {active === "food" && (
              <>
                <label>食べたもの</label>
                <input value={food} onChange={e => setFood(e.target.value)} placeholder="例：ドライフード" />
                <label>量（g）</label>
                <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} />
              </>
            )}

            {active === "pee" && (
              <>
                <label>💧 頻度</label>
                {selectButtons(choices.frequency, frequency, setFrequency)}
                <label>💧 量</label>
                {selectButtons(choices.peeAmount, amount, setAmount)}
                <p className="hint">出そうとしても出ない場合は、早急に動物病院へ相談してね。</p>
              </>
            )}

            {active === "poop" && (
              <>
                <label>💩 硬さ</label>
                {selectButtons(choices.hardness, condition, setCondition)}
                <label>🎨 色</label>
                {selectButtons(choices.color, stoolColor, setStoolColor)}
                <label>💩 量</label>
                {selectButtons(choices.quantity, amount, setAmount)}
              </>
            )}

            {active === "water" && (
              <>
                <label>お水の量（ml）</label>
                <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} />
              </>
            )}

            {active === "walk" && (
              <>
                <label>お散歩した時間（分）</label>
                <input type="number" min="0" value={duration} onChange={e => setDuration(e.target.value)} />
              </>
            )}

            {active === "mood" && (
              <>
                <label>❤️ 今日の体調</label>
                {selectButtons(choices.mood, condition, setCondition)}
              </>
            )}

            {active === "medicine" && (
              <>
                <label>種類</label>
                {selectButtons(["💊 お薬", "🌿 サプリ"], condition, setCondition)}
                <label>名前</label>
                <input value={name} onChange={e => setName(e.target.value)} />
                <label>飲んだ？</label>
                {selectButtons(choices.medicine, status, setStatus)}
                <label>量（任意）</label>
                <input value={amount} onChange={e => setAmount(e.target.value)} />
              </>
            )}

            <label>{active === "memo" ? "📝 自由メモ" : "メモ（任意）"}</label>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="気づいたことを記録してね"
            />

            <button className="primary" onClick={save}>
              {editing ? "✏️ 変更を保存" : "🐾 この項目に記録する"}
            </button>

            {editing && <button onClick={reset}>編集をキャンセル</button>}

            <h2>📖 この項目の履歴</h2>
            {history.length
              ? history.map(card)
              : <p>まだ記録がありません。</p>}
          </>
        )}
      </section>

      <section className="panel">
        <button className="primary" onClick={() => setCalendar(!calendar)}>
          📅 年間カレンダーを{calendar ? "閉じる ▲" : "見る ▼"}
        </button>

        {calendar && (
          <>
            <div className="nav">
              <button onClick={() => setYear(year - 1)}>◀ 前年</button>
              <b>{year}年</b>
              <button onClick={() => setYear(year + 1)}>翌年 ▶</button>
            </div>
            <div className="months">
              {Array.from({ length: 12 }, (_, i) => (
                <button
                  key={i}
                  className={month === i ? "chosen" : ""}
                  onClick={() => setMonth(i)}
                >
                  {i + 1}月
                </button>
              ))}
            </div>
            <h2>{year}年 {month + 1}月</h2>
            <div className="days">
              {["日", "月", "火", "水", "木", "金", "土"].map(d => (
                <b key={d} style={{ textAlign: "center" }}>{d}</b>
              ))}
              {cells.map((d, i) =>
                d === 0 ? <span key={`blank-${i}`} /> : (
                  <button
                    key={i}
                    className={selected === keyFor(d) ? "selected" : ""}
                    onClick={() => setSelected(keyFor(d))}
                  >
                    {d}
                    {dates.has(keyFor(d)) && <span className="paw">🐾</span>}
                  </button>
                )
              )}
            </div>
            <h2>🐾 {selected} の記録</h2>
            {daily.length
              ? daily.map(card)
              : <p>この日の記録はまだありません。</p>}
          </>
        )}
      </section>
    </main>
  );
}
