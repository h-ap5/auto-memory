// ==UserScript==
// @name         크랙 요약 메모리 편집 & AI 자동 요약 추가
// @namespace    https://crack.wrtn.ai/
// @version      1.4
// @description  크랙 내부에서 장기기억용 요약 메모리 생성 및 자동 추가
// @author       User
// @match        https://crack.wrtn.ai/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const API_BASE = 'https://crack-api.wrtn.ai/crack-gen/v3/chats';
    const TYPE_MAP = {
        '단기 기억': 'shortTerm'
    };

    const DEFAULT_PROMPT = `# 📔 장기기억 아카이브 요약 프롬프트

## 🎯 목적
채팅 로그를 분석하여 이후 서사가 어긋나지 않도록 **'사건 단위의 독립적 앵커'**를 생성하되, **인물 간의 감정선과 미묘한 상호작용의 질감(Texture)**을 보존한다.
생성된 요약문은 향후 AI가 인물 간의 관계 역학부터 소소한 추억까지 생생하고 섬세하게 기억하여, 이후의 롤플레잉을 보다 입체적으로 이끌어가는 참고 자료로 쓰일 예정이다.

---

## 🧩 출력 단위 및 분리 기준
- **단위**: 출력의 최소 단위는 ‘사건’이다.
- **분리 필수 조건**: 아래 중 하나라도 해당하면 반드시 **새로운 사건 슬롯**으로 분리하여 출력한다.
1. **장소 이동** (예: 복도 → 교실 / 교정 → 중앙 정원)
2. **시간대 변화** (예: 오전 → 오후 / 수업 시간 → 쉬는 시간)
3. **주요 인물 구성 변화** (예: 1:1 대화 중 제3자 난입)
- **병합 금지**: 주제가 이어지더라도 장소가 바뀌면 정보를 절대 합치지 않는다.
- **소급 금지**: 나중에 발생한 일(대사, 결정, 물건 등장 등)을 앞선 사건 요약에 미리 포함하지 않는다.

---

## 📋 출력 형식 (강제)

[제목]
- 내용

### 1. 제목 규칙 (최고 중요도: 시맨틱 검색 최적화)
- **제한**: 공백 포함 **20자 이내 최대 활용**. 조사(~의, ~와, ~에서) 및 특수기호(# 등) 사용 금지.
- **형식 고정**: 유저명은 제외하고 관련된 **NPC명(필수)**을 포함하되, **세력명/국가명/소재/핵심행동** 등 검색에 유의미한 고유명사를 띄어쓰기로 나열. (날짜/시간 및 주관적 감정 기재 금지)
- 제목은 항상 []로 가둘 것. []는 20자 제한에 미포함, 대괄호[] 안의 내용 기준 공백 포함 20자 제한.
- **예시**:
- \`[NPC명 연회 독살시도 찻잔]\` (O)
- \`[NPC명 말다툼 사과 바닐라라떼]\` (O)
- \`[#NPC 말다툼 사과]\` (X - '#' 기호 사용 금지)
- \`[유저명 NPC명 말다툼 사과]\` (X - 기본값인 유저명 포함으로 글자수 낭비)

### 2. 내용 규칙
- **제한**: 공백 포함 **500자 이내**. **요약체(~함, ~임)**를 사용할 것.
- **형식**: 반드시 \`- \` (하이픈과 공백)으로 시작하되, 항목은 1개로 유지.
- **타임라인**: 본문 첫머리에 반드시 \`MM/DD 시간대\`를 명시할 것. (예: \`08/24 오후\`)
- **시간대**: 새벽 / 오전 / 오후 / 저녁 / 밤 중 택1.
- **대명사 금지**: '그', '그녀' 대신 반드시 **정확한 이름(유저명, NPC명 등)**을 명시하여 맥락 독립성을 확보할 것.
- **핵심 기록 요소**:
- **상호작용의 연쇄(Flow)**: 단순 '자극-반응'을 넘어, **[누군가의 행동/발화] → [상대의 리액션] → [그로 인한 재반응/변화]**의 인과 사슬을 명확히 기록할 것. **대사는 " " 인용**
- **사건의 배경 및 정보(Context & Lore)**: 단순 결과만 적지 말 것. '누가 무엇 때문에 공표했는지', '무슨 속셈으로 한 거짓말인지' 등 대화 중 언급된 **공식 발표, 전언, 소문, 은밀한 동기** 등 떡밥이 되는 맥락 정보를 구체적으로 포함할 것.
- **구체적 양상(How)**: '애교', '화냄' 등 추상적 표현 대신 **"옷자락을 당김", "미간을 찌푸림", "시선을 피함"** 등 로그에 명시된 행동과 표정을 적을 것.
- **미묘한 기류(Mood)**: 사건 전개에 필수적이지 않더라도, 두 인물 간의 **사소한 장난, 묘한 긴장감, 말투의 변화** 등 질감을 살리는 디테일을 포함할 것.
- **전환점 (Turning Point)**: **관계 변화** 및 **결정적 약속/은폐** 사실.
- **구체적 명사(Keywords)**: 상징적인 **선물, 물건, 공간**을 정확한 명칭으로 기록할 것.

---

## 🚫 기록 원칙 (Strict)
- **❌ 통합 금지**: 하루 전체를 하나로 요약하거나, 여러 사건을 대표 사건 하나로 뭉뚱그리지 말 것.
- **❌ 소설 금지**: AI의 주관적 해석, 의도 추론, 로그에 없는 사실 기록 금지. (동기는 오직 로그 안에서 확인된 것만 적을 것)
- **❌ 뭉개기 금지**: '대화를 나눴다'는 식의 결과적 요약 금지. **어떻게 시작되었고 그 대화가 어떻게 흘러갔는지(인과)**를 적을 것.
- **❌ 순서 변경 금지**: 반드시 입력 로그의 시간 흐름(Timeline)을 엄격히 준수할 것.
- **❌ 정보 이동 금지**: 특정 장소에서 일어난 대화나 물건을 다른 장소의 요약문에 섞지 말 것.
- **❌ 대괄표 남발 금지**: 제목 이외의 어떠한 내용에도 대괄호([,])를 사용하지 않는다.
- **⭕ 팩트의 확장 보존**: 물리적 사건뿐만 아니라, 인물 간 전달된 **간접 정보(미확인 소문, 제3자의 동향, 공표 내용 등)**도 스토리의 핵심 팩트로 간주하여 명확히 기록할 것.
- **⭕ 주체 보존**: 발단이 누구인지 구분하여, 상호작용의 방향성과 주체를 명확히 할 것.

---

## ⚠️ 오류 조건
- 서로 다른 장소의 사건이 하나로 합쳐질 경우 **출력 오류**.
- 제목 형식 미준수 또는 공백 포함 20자 초과 시 **출력 오류**.
- 내용이 공백 포함 500자를 초과하거나 로그의 순서가 뒤섞일 경우 **출력 오류**.
- 인물 간의 인과적 연쇄가 누락되면 **출력 오류**.
- 한국어 외의 언어로 출력시 **출력 오류**.`;

    function getChatId() {
        const m = location.pathname.match(/\/episodes\/([a-f0-9]+)/);
        return m ? m[1] : null;
    }

    function getToken() {
        const m = document.cookie.match(/(^| )access_token=([^;]+)/);
        return m ? m[2] : null;
    }

    function escapeHtml(s) {
        if (!s) return "";
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    function apiCall(method, path, body) {
        const token = getToken(), chatId = getChatId();
        if (!token || !chatId) {
            alert('인증 정보 또는 채팅 ID를 찾을 수 없습니다.');
            return Promise.resolve(null);
        }
        const opts = {
            method,
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        };
        if (body) opts.body = JSON.stringify(body);
        return fetch(API_BASE + '/' + chatId + path, opts)
            .then(function (r) {
                if (!r.ok) {
                    return r.text().then(function (t) {
                        console.error('API Error:', r.status, t);
                        return null;
                    });
                }
                return r.text().then(function (t) {
                    return t ? JSON.parse(t) : { result: 'SUCCESS' };
                });
            })
            .catch(function (e) {
                alert('네트워크 오류: ' + e.message);
                return null;
            });
    }

    function fetchRecentMessages(limit) {
        return apiCall('GET', '/messages?limit=' + limit).then(res => {
            if (!res || !res.data || !res.data.messages) return null;
            let msgs = res.data.messages.slice().reverse();
            let chatText = msgs.map(m => {
                let role = m.role === 'user' ? 'User' : 'Character';
                return `${role}: ${m.content}`;
            }).join('\n\n');
            return chatText;
        });
    }

    async function callGeminiApi(apiKey, model, chatLog) {
        const currentPrompt = localStorage.getItem('crack_ext_custom_prompt') || DEFAULT_PROMPT;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const payload = {
            system_instruction: { parts: [{ text: currentPrompt }] },
            contents: [{ role: "user", parts: [{ text: chatLog }] }]
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Gemini API 에러');
        }
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    function injectAiStyles() {
        if (document.getElementById('crack-ext-ai-css')) return;
        const s = document.createElement('style');
        s.id = 'crack-ext-ai-css';
        s.textContent = `
            .crack-ext-ai-overlay { background:rgba(0,0,0,.5); z-index:100000; pointer-events:auto !important; }
            .crack-ext-ai-modal { background:#fff !important; border-radius:16px; padding:28px; width:600px; max-width:90vw; max-height: 90vh; overflow-y: auto; box-shadow:0 8px 40px rgba(0,0,0,.2); pointer-events:auto !important; color:#222 !important; }
            .crack-ext-ai-modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
            .crack-ext-ai-modal-header h3 { margin: 0; color:#222 !important; font-size: 17px; font-weight: 700; }
            .crack-ext-ai-modal label { display:flex; font-size:13px; font-weight:600; margin-bottom:6px; color:#333 !important; align-items:center; justify-content:space-between;}
            .crack-ext-ai-modal input, .crack-ext-ai-modal textarea, .crack-ext-ai-modal select { width:100%; padding:10px 12px; border:1px solid #ddd !important; border-radius:8px; font-size:14px; box-sizing:border-box; font-family:inherit; pointer-events:auto !important; background-color:#fff !important; color:#222 !important; }
            .crack-ext-ai-modal input::placeholder, .crack-ext-ai-modal textarea::placeholder { color:#999 !important; }
            .crack-ext-ai-modal-btns { display:flex; gap:8px; justify-content:flex-end; margin-top:20px; }
            .crack-ext-ai-mbtn { padding:10px 24px; border-radius:8px; border:1px solid #ddd !important; background:#fff !important; color:#222 !important; cursor:pointer; font-size:14px; font-weight:600; transition: background 0.2s;}
            .crack-ext-ai-mbtn:hover { background: #f5f5f5 !important; }
            .crack-ext-ai-mbtn-p { background:#222 !important; color:#fff !important; border-color:#222 !important; }
            .crack-ext-ai-mbtn-p:hover { background:#444 !important; }
            .crack-ext-ai-mbtn-p:disabled { background:#ccc !important; border-color:#ccc !important; color:#666 !important; cursor:not-allowed; }
            .crack-flex-ai-row { display:flex; gap:12px; margin-bottom: 16px; }
            .crack-flex-ai-row .fg { flex:1; }

            #ce-ai-preview-container { margin-top: 12px; }
            #ce-ai-card-nav { display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom: 8px; font-size: 13px; font-weight: bold; }
            #ce-ai-card-nav button { cursor:pointer; background:#f0f0f0; border:1px solid #ddd; border-radius:6px; padding:4px 10px; font-size:12px; transition: background 0.2s; color:#333; }
            #ce-ai-card-nav button:hover { background:#e4e4e4; }

            .crack-ext-session-card { background:#f9f9f9 !important; border:1px solid #eee !important; border-radius:8px; padding:12px; font-size:13px; }
            .crack-ext-session-title { font-weight:bold; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; }
            .crack-ext-session-content { color:#555 !important; line-height:1.4; white-space: pre-wrap; word-break: break-all; }
            .crack-ext-char-count { font-size:11px; font-weight:normal; color: #777; }
            .crack-ext-count-error { color: #e74c3c !important; font-weight:bold; }

            .crack-ext-header-ai-btn { display: inline-flex; align-items: center; justify-content: center; padding: 0 12px; height: 36px; border-radius: 6px; background: linear-gradient(135deg, #6e8efb, #a777e3) !important; color: white !important; font-weight: 600; font-size: 13px; border: none !important; cursor: pointer; transition: transform 0.1s; white-space: nowrap !important; }

            body[data-theme="dark"] .crack-ext-ai-modal { background: #242321 !important; color: #F0EFEB !important; }
            body[data-theme="dark"] .crack-ext-ai-modal-header h3, body[data-theme="dark"] .crack-ext-ai-modal label { color: #F0EFEB !important; }
            body[data-theme="dark"] .crack-ext-ai-modal input, body[data-theme="dark"] .crack-ext-ai-modal textarea, body[data-theme="dark"] .crack-ext-ai-modal select { background: #141413 !important; color: #F0EFEB !important; border: 1px solid #42413D !important; }

            body[data-theme="dark"] #ce-ai-card-nav button { background: #2E2D2B !important; color: #F0EFEB !important; border: 1px solid #42413D !important; }
            body[data-theme="dark"] #ce-ai-card-nav button:hover { background: #42413D !important; }

            body[data-theme="dark"] .crack-ext-session-card { background: #1a1918 !important; border: 1px solid #42413D !important; }
            body[data-theme="dark"] .crack-ext-session-content { color: #ccc !important; }
            body[data-theme="dark"] .crack-ext-ai-mbtn { background: #2E2D2B !important; color: #F0EFEB !important; border: 1px solid #42413D !important; }
            body[data-theme="dark"] .crack-ext-ai-mbtn-p { background: #F0EFEB !important; color: #1A1918 !important; }
            body[data-theme="dark"] .crack-ext-count-error { color: #ff6b6b !important; }
        `;
        document.head.appendChild(s);
    }

    function showToast(message) {
        var old = document.getElementById('crack-ext-toast');
        if (old) old.remove();
        var toast = document.createElement('div');
        toast.id = 'crack-ext-toast';
        toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-10px);z-index:999999999;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:500;box-shadow:0 4px 20px rgba(0,0,0,0.25);transition:opacity 0.3s,transform 0.3s;';
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)'; });
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-50%) translateY(-10px)'; setTimeout(() => toast.remove(), 300); }, 3000);
    }

    function refreshCurrentTab(dialog) {
        var btns = dialog.querySelectorAll('button'), activeBtn = null, otherBtn = null;
        for (var i = 0; i < btns.length; i++) {
            var txt = btns[i].textContent.trim();
            if (txt === '단기 기억' || txt === '장기 기억') {
                var bg = getComputedStyle(btns[i]).backgroundColor;
                var m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)\)/);
                if (m && (parseInt(m[1]) + parseInt(m[2]) + parseInt(m[3])) / 3 < 128) activeBtn = btns[i];
                else if (txt === '장기 기억') otherBtn = btns[i];
            }
        }
        if (!activeBtn) return;
        if (otherBtn) { otherBtn.click(); setTimeout(() => { activeBtn.click(); }, 150); }
        else { activeBtn.click(); }
    }

    function showAiSummaryModal() {
        var overlay = document.createElement('div');
        overlay.className = 'crack-ext-ai-overlay';
        overlay.style.position = 'fixed'; overlay.style.inset = '0'; overlay.style.display = 'flex'; overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center';

        const savedApiKey = localStorage.getItem('crack_ext_gemini_key') || '';
        const savedModel = localStorage.getItem('crack_ext_gemini_model') || 'gemini-3.1-pro-preview';
        const savedTurnCount = localStorage.getItem('crack_ext_turn_count') || '15';

        let isPromptMode = false;
        let tempResultContent = "";

        let parsedCards = [];
        let currentCardIndex = 0;

        var html = '<div class="crack-ext-ai-modal">';
        html += '<div class="crack-ext-ai-modal-header"><h3>✨ AI 요약 / 장기 기억 추가</h3></div>';

        html += '<div class="crack-flex-ai-row" id="ce-ai-top-settings">';
        html += '<div class="fg" style="flex: 2;"><label>Gemini API Key</label><input type="password" id="ce-ai-key" value="' + escapeHtml(savedApiKey) + '"></div>';
        html += '<div class="fg" style="flex: 1.5;"><label>모델</label><select id="ce-ai-model">';
        html += '<option value="gemini-3.1-pro-preview" ' + (savedModel === 'gemini-3.1-pro-preview' ? 'selected' : '') + '>3.1 Pro Preview</option>';
        html += '<option value="gemini-3-flash-preview" ' + (savedModel === 'gemini-3-flash-preview' ? 'selected' : '') + '>3 Flash Preview</option>';
        html += '<option value="gemini-3.1-flash-lite-preview" ' + (savedModel === 'gemini-3.1-flash-lite-preview' ? 'selected' : '') + '>3.1 Flash-Lite</option>';
        html += '<option value="gemini-2.5-pro" ' + (savedModel === 'gemini-2.5-pro' ? 'selected' : '') + '>2.5 Pro</option>';
        html += '<option value="gemini-2.5-flash" ' + (savedModel === 'gemini-2.5-flash' ? 'selected' : '') + '>2.5 Flash</option>';
        html += '<option value="gemini-2.5-flash-lite" ' + (savedModel === 'gemini-2.5-flash-lite' ? 'selected' : '') + '>2.5 Flash-Lite</option>';
        html += '</select></div>';
        html += '<div class="fg" style="flex: 1;"><label>턴 수</label><input type="number" id="ce-ai-turns" value="' + escapeHtml(savedTurnCount) + '" min="5" max="50"></div>';
        html += '</div>';

        html += '<div class="fg"><label id="ce-ai-result-label-wrapper" style="display:flex; justify-content:space-between;">';
        html += '<span id="ce-ai-result-label">생성 결과</span>';
        html += '<div style="display:flex; align-items:center; gap:10px;">';
        html += '<span id="ce-ai-selection-counter" style="color:#a777e3; font-size:12px; font-weight:normal;"></span>';
        html += '<button id="ce-ai-toggle-prompt" style="font-size:12px; background:none; border:1px solid #ddd; padding:4px 8px; border-radius:4px; cursor:pointer;">⚙️ 프롬프트 설정</button>';
        html += '</div></label>';

        html += '<textarea id="ce-ai-result" rows="7" placeholder="생성 버튼을 누르면 요약 결과가 나오고, 직접 써서 추가할 수도 있습니다. 여러 개의 사건을 [제목] 내용 형식으로 적어주면 자동으로 분리해서 추가됩니다."></textarea>';

        html += '<div id="ce-ai-preview-container">';
        html += '<div id="ce-ai-card-nav" style="display:none;"><button id="ce-ai-card-prev">◀</button><span id="ce-ai-card-page">1 / 1</span><button id="ce-ai-card-next">▶</button></div>';
        html += '<div id="ce-ai-preview-cards"></div>';
        html += '</div></div>';

        html += '<div class="crack-ext-ai-modal-btns" style="justify-content: space-between; align-items: flex-end;">';
        html += '<div><button class="crack-ext-ai-mbtn" id="ce-ai-generate">요약 생성</button></div>';
        html += '<div style="display:flex; gap:8px;"><button class="crack-ext-ai-mbtn" id="ce-ai-cancel">취소</button><button class="crack-ext-ai-mbtn crack-ext-ai-mbtn-p" id="ce-ai-save">추가하기</button></div></div></div>';

        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        const txtResult = overlay.querySelector('#ce-ai-result');
        const selCounter = overlay.querySelector('#ce-ai-selection-counter');
        const previewCards = overlay.querySelector('#ce-ai-preview-cards');
        const cardNav = overlay.querySelector('#ce-ai-card-nav');
        const spanCardPage = overlay.querySelector('#ce-ai-card-page');
        const btnCardPrev = overlay.querySelector('#ce-ai-card-prev');
        const btnCardNext = overlay.querySelector('#ce-ai-card-next');
        const btnSave = overlay.querySelector('#ce-ai-save');

        function updateSelectionCount() {
            const selectedText = txtResult.value.substring(txtResult.selectionStart, txtResult.selectionEnd);
            selCounter.textContent = selectedText.length > 0 ? `(드래그: ${selectedText.length}자)` : '';
        }
        txtResult.addEventListener('select', updateSelectionCount);
        txtResult.addEventListener('keyup', updateSelectionCount);
        txtResult.addEventListener('mouseup', updateSelectionCount);

        function updatePreviewCards() {
            if (isPromptMode) { previewCards.innerHTML = ''; cardNav.style.display = 'none'; return; }
            const content = txtResult.value.trim();
            if (!content) { previewCards.innerHTML = ''; cardNav.style.display = 'none'; parsedCards = []; return; }

            const blocks = content.split(/\[(.*?)\]/);
            parsedCards = [];

            for (let i = 1; i < blocks.length; i += 2) {
                let title = blocks[i].trim();
                let summary = blocks[i + 1] ? blocks[i + 1].replace(/^[\s\n]*[-*]?\s*/, '').trim() : '';
                if (title || summary) parsedCards.push({ title, summary });
            }

            if (parsedCards.length === 0 && content) {
                let summary = content.replace(/^[\s\n]*[-*]?\s*/, '').trim();
                parsedCards.push({ title: "수동 요약", summary });
            }

            if (parsedCards.length === 0) {
                previewCards.innerHTML = ''; cardNav.style.display = 'none'; return;
            }

            if (currentCardIndex >= parsedCards.length) currentCardIndex = parsedCards.length - 1;
            if (currentCardIndex < 0) currentCardIndex = 0;

            if (parsedCards.length > 1) {
                cardNav.style.display = 'flex';
                spanCardPage.textContent = `${currentCardIndex + 1} / ${parsedCards.length}`;
            } else {
                cardNav.style.display = 'none';
            }

            let mem = parsedCards[currentCardIndex];
            let tClass = mem.title.length > 20 ? 'crack-ext-count-error' : '';
            let sClass = mem.summary.length > 300 ? 'crack-ext-count-error' : '';

            let cardHtml = '<div class="crack-ext-session-card">' +
                '<div class="crack-ext-session-title">' +
                '<div><span style="color:#888;">[ </span>' + escapeHtml(mem.title) + '<span style="color:#888;"> ]</span></div>' +
                '<span class="crack-ext-char-count ' + tClass + '">(' + mem.title.length + '/20자)</span>' +
                '</div>' +
                '<div class="crack-ext-session-content">' + escapeHtml(mem.summary) +
                '<div style="text-align:right; margin-top:8px;"><span class="crack-ext-char-count ' + sClass + '">(' + mem.summary.length + '/300자)</span></div>' +
                '</div>' +
                '</div>';

            previewCards.innerHTML = cardHtml;
        }

        txtResult.addEventListener('input', updatePreviewCards);

        btnCardPrev.onclick = (e) => { e.preventDefault(); if (currentCardIndex > 0) { currentCardIndex--; updatePreviewCards(); } };
        btnCardNext.onclick = (e) => { e.preventDefault(); if (currentCardIndex < parsedCards.length - 1) { currentCardIndex++; updatePreviewCards(); } };

        const btnGen = overlay.querySelector('#ce-ai-generate'), btnCancel = overlay.querySelector('#ce-ai-cancel');
        const inputKey = overlay.querySelector('#ce-ai-key'), inputModel = overlay.querySelector('#ce-ai-model'), inputTurns = overlay.querySelector('#ce-ai-turns');
        const btnTogglePrompt = overlay.querySelector('#ce-ai-toggle-prompt');

        btnTogglePrompt.onclick = (e) => {
            e.stopPropagation(); e.preventDefault();
            isPromptMode = !isPromptMode;
            if (isPromptMode) {
                tempResultContent = txtResult.value;
                txtResult.value = localStorage.getItem('crack_ext_custom_prompt') || DEFAULT_PROMPT;
                btnTogglePrompt.textContent = '돌아가기';
                overlay.querySelector('#ce-ai-top-settings').style.display = 'none';
                btnSave.style.display = 'none'; btnGen.style.display = 'none';
                updatePreviewCards();
            } else {
                localStorage.setItem('crack_ext_custom_prompt', txtResult.value.trim());
                txtResult.value = tempResultContent;
                btnTogglePrompt.textContent = '⚙️ 프롬프트 설정';
                overlay.querySelector('#ce-ai-top-settings').style.display = 'flex';
                btnSave.style.display = 'block'; btnGen.style.display = 'block';
                updatePreviewCards();
            }
        };

        btnCancel.onclick = e => { e.stopPropagation(); overlay.remove(); };
        ['click', 'mousedown', 'mouseup'].forEach(evt => overlay.addEventListener(evt, e => e.stopPropagation()));

        btnGen.onclick = async (e) => {
            e.stopPropagation();
            const apiKey = inputKey.value.trim(), model = inputModel.value, turns = parseInt(inputTurns.value, 10) || 15;
            if (!apiKey) return alert("API Key를 입력해주세요.");

            localStorage.setItem('crack_ext_gemini_key', apiKey); localStorage.setItem('crack_ext_gemini_model', model); localStorage.setItem('crack_ext_turn_count', turns.toString());
            btnGen.disabled = true; btnSave.disabled = true; txtResult.value = "요약 중..."; currentCardIndex = 0; updatePreviewCards();

            try {
                const chatLog = await fetchRecentMessages(turns);
                if (!chatLog) throw new Error("내역을 불러올 수 없습니다.");
                const finalResult = await callGeminiApi(apiKey, model, chatLog);
                txtResult.value = finalResult.trim();
            } catch (err) {
                txtResult.value = "오류: " + err.message;
            } finally {
                btnGen.disabled = false; btnSave.disabled = false; btnGen.textContent = "재생성 (리롤)"; updatePreviewCards();
            }
        };

        btnSave.onclick = async (e) => {
            e.stopPropagation();
            const content = txtResult.value.trim();
            if (!content) return alert("결과가 비어있습니다.");

            let isExceeded = false;
            let errorIndex = -1;

            for (let i = 0; i < parsedCards.length; i++) {
                if (parsedCards[i].title.length > 20 || parsedCards[i].summary.length > 300) {
                    isExceeded = true;
                    errorIndex = i;
                    break;
                }
            }

            if (isExceeded) {
                currentCardIndex = errorIndex;
                updatePreviewCards();
                alert("글자 수 제한(제목 20자, 내용 300자)을 초과한 항목이 있습니다.\n붉은색으로 표시된 내용을 수정해 주세요.");
                return;
            }

            btnSave.disabled = true; btnCancel.disabled = true;
            let successCount = 0;

            for (let i = 0; i < parsedCards.length; i++) {
                btnSave.textContent = `추가 중... (${i + 1}/${parsedCards.length})`;
                await new Promise(resolve => setTimeout(resolve, 50));
                const res = await apiCall('POST', '/summaries', { type: 'shortTerm', title: parsedCards[i].title, summary: parsedCards[i].summary });
                if (res) successCount++;
                else alert(`[${parsedCards[i].title}] 추가 중 오류 발생`);
            }

            if (successCount > 0) {
                showToast(`✅ ${successCount}개의 요약이 장기 기억에 추가되었습니다.`);
                overlay.remove();
                var dialogEl = document.querySelector('[role="dialog"]');
                if (dialogEl) refreshCurrentTab(dialogEl);
            } else {
                btnSave.textContent = "추가하기"; btnSave.disabled = false; btnCancel.disabled = false;
            }
        };
    }

    function injectTopHeaderBtn() {
        const headerContainer = document.querySelector('.absolute.z-\\[5\\] .flex.gap-3.items-center');
        if (!headerContainer || headerContainer.querySelector('.crack-ext-header-ai-btn')) return;
        const aiBtn = document.createElement('button');
        aiBtn.className = 'crack-ext-header-ai-btn'; aiBtn.innerHTML = '✨ AI 요약';
        aiBtn.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); showAiSummaryModal(); });
        headerContainer.prepend(aiBtn);
    }

    function inject() { injectAiStyles(); injectTopHeaderBtn(); }
    
    function start() {
        var obs = new MutationObserver(() => requestAnimationFrame(inject));
        obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        setInterval(inject, 800);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
