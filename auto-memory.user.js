// ==UserScript==
// @name         크랙 요약 메모리 편집 & AI 자동 요약 추가
// @namespace    https://crack.wrtn.ai/
// @version      1.3
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

    // 사용자가 제공한 기본 프롬프트 상수
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

    // --- AI 전용 스타일 (충돌 방지를 위해 -ai 클래스명 사용, 다크모드 대응 포함) ---
    function injectAiStyles() {
        if (document.getElementById('crack-ext-ai-css')) return;
        const s = document.createElement('style');
        s.id = 'crack-ext-ai-css';
        s.textContent = `
            .crack-ext-ai-overlay { background:rgba(0,0,0,.5); z-index:100000; pointer-events:auto !important; }

            /* --- 기본 라이트모드 스타일 --- */
            .crack-ext-ai-modal { background:#fff !important; border-radius:16px; padding:28px; width:550px; max-width:90vw; box-shadow:0 8px 40px rgba(0,0,0,.2); pointer-events:auto !important; color:#222 !important; }
            .crack-ext-ai-modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
            .crack-ext-ai-modal-header h3 { margin: 0; color:#222 !important; font-size: 17px; font-weight: 700; }
            .crack-ext-ai-modal label { display:flex; font-size:13px; font-weight:600; margin-bottom:6px; color:#333 !important; align-items:center; justify-content:space-between;}
            .crack-ext-ai-modal input, .crack-ext-ai-modal textarea, .crack-ext-ai-modal select { width:100%; padding:10px 12px; border:1px solid #ddd !important; border-radius:8px; font-size:14px; box-sizing:border-box; font-family:inherit; pointer-events:auto !important; background-color:#fff !important; color:#222 !important; }
            .crack-ext-ai-modal input::placeholder, .crack-ext-ai-modal textarea::placeholder { color:#999 !important; }
            .crack-ext-ai-modal .cc { text-align:right; font-size:12px; color:#999 !important; margin-top:4px; }
            .crack-ext-ai-modal .fg { margin-bottom:16px; }
            .crack-ext-ai-modal-btns { display:flex; gap:8px; justify-content:flex-end; margin-top:20px; }
            .crack-ext-ai-mbtn { padding:10px 24px; border-radius:8px; border:1px solid #ddd !important; background:#fff !important; color:#222 !important; cursor:pointer; font-size:14px; font-weight:600; pointer-events:auto !important; display:flex; align-items:center; justify-content:center; transition: background 0.2s;}
            .crack-ext-ai-mbtn:hover { background: #f5f5f5 !important; }
            .crack-ext-ai-mbtn-p { background:#222 !important; color:#fff !important; border-color:#222 !important; }
            .crack-ext-ai-mbtn-p:hover { background:#444 !important; }
            .crack-ext-ai-mbtn-p:disabled { background:#ccc !important; border-color:#ccc !important; color:#666 !important; cursor:not-allowed; }
            .crack-flex-ai-row { display:flex; gap:12px; }
            .crack-flex-ai-row .fg { flex:1; }
            .ai-loading-spinner { display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,.3); border-radius:50%; border-top-color:#fff; animation:spin 1s ease-in-out infinite; margin-right:8px; vertical-align:middle; }
            @keyframes spin { to { transform: rotate(360deg); } }

            .crack-ext-header-ai-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0 12px;
                height: 36px;
                border-radius: 6px;
                background: linear-gradient(135deg, #6e8efb, #a777e3) !important;
                color: white !important;
                font-weight: 600;
                font-size: 13px;
                border: none !important;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: transform 0.1s, opacity 0.2s;
                letter-spacing: -0.3px;
                white-space: nowrap !important;
                flex-shrink: 0 !important;
            }
            .crack-ext-header-ai-btn:hover { opacity: 0.9; transform: translateY(-1px); }
            .crack-ext-header-ai-btn:active { transform: translateY(1px); }

            #ce-ai-generate { background: linear-gradient(135deg, #6e8efb, #a777e3) !important; color: white !important; border: none !important; }
            .crack-ext-toggle-prompt-btn { font-size:12px; background:none !important; color: #333 !important; border:1px solid #ddd !important; padding:4px 8px; border-radius:4px; cursor:pointer; transition:background 0.2s;}
            .crack-ext-toggle-prompt-btn:hover { background:#f5f5f5 !important;}
            #ce-ai-history-nav { color: #555 !important; }
            #ce-ai-history-nav button { color: #222 !important; }
            #ce-ai-result-label { color: #333 !important; }

            /* --- 다크모드 대응 스타일 --- */
            body[data-theme="dark"] .crack-ext-ai-modal { background: #242321 !important; color: #F0EFEB !important; box-shadow: 0 8px 40px rgba(0,0,0,.5); }
            body[data-theme="dark"] .crack-ext-ai-modal-header h3 { color: #F0EFEB !important; }
            body[data-theme="dark"] .crack-ext-ai-modal label { color: #E5E5E1 !important; }
            body[data-theme="dark"] .crack-ext-ai-modal input,
            body[data-theme="dark"] .crack-ext-ai-modal textarea,
            body[data-theme="dark"] .crack-ext-ai-modal select { background: #141413 !important; color: #F0EFEB !important; border: 1px solid #42413D !important; }
            body[data-theme="dark"] .crack-ext-ai-modal input::placeholder,
            body[data-theme="dark"] .crack-ext-ai-modal textarea::placeholder { color: #85837D !important; }
            body[data-theme="dark"] .crack-ext-ai-modal .cc { color: #85837D !important; }

            body[data-theme="dark"] .crack-ext-ai-mbtn { background: #2E2D2B !important; color: #F0EFEB !important; border: 1px solid #42413D !important; }
            body[data-theme="dark"] .crack-ext-ai-mbtn:hover { background: #42413D !important; }

            body[data-theme="dark"] .crack-ext-ai-mbtn-p { background: #F0EFEB !important; color: #1A1918 !important; border-color: #F0EFEB !important; }
            body[data-theme="dark"] .crack-ext-ai-mbtn-p:hover { background: #E5E5E1 !important; }
            body[data-theme="dark"] .crack-ext-ai-mbtn-p:disabled { background: #42413D !important; border-color: #42413D !important; color: #85837D !important; }

            body[data-theme="dark"] .crack-ext-toggle-prompt-btn { color: #F0EFEB !important; border: 1px solid #42413D !important; }
            body[data-theme="dark"] .crack-ext-toggle-prompt-btn:hover { background: #42413D !important; }

            body[data-theme="dark"] #ce-ai-history-nav { color: #a8a69d !important; }
            body[data-theme="dark"] #ce-ai-history-nav button { color: #F0EFEB !important; }
            body[data-theme="dark"] #ce-ai-history-nav button:disabled { color: #61605A !important; }
            body[data-theme="dark"] #ce-ai-result-label { color: #E5E5E1 !important; }

            /* 모바일 반응형 미디어 쿼리 - 하단 버튼 레이아웃 포함 */
            @media (max-width: 600px) {
                .crack-flex-ai-row { flex-direction: column; gap: 8px; }
                .crack-ext-ai-modal { width: 95vw; padding: 20px; }
                .crack-ext-ai-modal .fg { margin-bottom: 10px; }

                .crack-ext-ai-modal-btns { flex-direction: column; align-items: stretch !important; gap: 8px; justify-content: flex-end; margin-top: 20px; }
                .crack-ext-ai-modal-btns > div { display: flex; flex-direction: row; gap: 8px; width: 100%; justify-content: space-between; }
                .crack-ext-ai-modal-btns .crack-ext-ai-mbtn { flex: 1; padding: 10px 12px; font-size: 13px; }

                #ce-ai-result-label-wrapper { flex-direction: column; align-items: flex-start; gap: 4px; }
                #ce-ai-result-label-wrapper > div { width: 100%; justify-content: space-between; }
            }
        `;
        document.head.appendChild(s);
    }

    function showToast(message) {
        var old = document.getElementById('crack-ext-toast');
        if (old) old.remove();
        var toast = document.createElement('div');
        toast.id = 'crack-ext-toast';
        toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-10px);z-index:999999999;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:500;box-shadow:0 4px 20px rgba(0,0,0,0.25);pointer-events:auto;opacity:0;transition:opacity 0.3s ease,transform 0.3s ease;';
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)'; });
        setTimeout(() => {
            toast.style.opacity = '0'; toast.style.transform = 'translateX(-50%) translateY(-10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function refreshCurrentTab(dialog) {
        // 기존 탭 갱신 로직
        var btns = dialog.querySelectorAll('button');
        var activeBtn = null, otherBtn = null;
        for (var i = 0; i < btns.length; i++) {
            var txt = btns[i].textContent.trim();
            if (txt === '단기 기억' || txt === '장기 기억') {
                var bg = getComputedStyle(btns[i]).backgroundColor;
                var m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                if (m && (parseInt(m[1]) + parseInt(m[2]) + parseInt(m[3])) / 3 < 128) {
                    activeBtn = btns[i];
                } else {
                    if (txt === '장기 기억') otherBtn = btns[i];
                }
            }
        }
        if (!activeBtn) return;
        if (otherBtn) {
            otherBtn.click();
            setTimeout(() => { activeBtn.click(); }, 150);
        } else {
            activeBtn.click();
        }
    }

    function showAiSummaryModal() {
        var overlay = document.createElement('div');
        overlay.className = 'crack-ext-ai-overlay';
        overlay.style.pointerEvents = 'auto';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';

        const savedApiKey = localStorage.getItem('crack_ext_gemini_key') || '';
        const savedModel = localStorage.getItem('crack_ext_gemini_model') || 'gemini-3.1-pro-preview';
        const savedTurnCount = localStorage.getItem('crack_ext_turn_count') || '15';

        let resultHistory = [];
        let historyIndex = -1;
        let isPromptMode = false;
        let tempResultContent = "";

        var html = '<div class="crack-ext-ai-modal">';
        html += '<div class="crack-ext-ai-modal-header"><h3>✨ AI 요약 / 장기 기억 추가</h3></div>';

        html += '<div class="crack-flex-ai-row" id="ce-ai-top-settings">';
        html += '<div class="fg" style="flex: 2;"><label>Gemini API Key</label><input type="password" id="ce-ai-key" value="' + escapeHtml(savedApiKey) + '"></div>';
        html += '<div class="fg" style="flex: 1.5;"><label>모델</label><select id="ce-ai-model">';
        html += '<option value="gemini-3.1-pro-preview" ' + (savedModel==='gemini-3.1-pro-preview'?'selected':'') + '>3.1 Pro Preview</option>';
        html += '<option value="gemini-3-flash-preview" ' + (savedModel==='gemini-3-flash-preview'?'selected':'') + '>3 Flash Preview</option>';
        html += '<option value="gemini-3.1-flash-lite-preview" ' + (savedModel==='gemini-3.1-flash-lite-preview'?'selected':'') + '>3.1 Flash-Lite</option>';
        html += '<option value="gemini-2.5-pro" ' + (savedModel==='gemini-2.5-pro'?'selected':'') + '>2.5 Pro</option>';
        html += '<option value="gemini-2.5-flash" ' + (savedModel==='gemini-2.5-flash'?'selected':'') + '>2.5 Flash</option>';
        html += '<option value="gemini-2.5-flash-lite" ' + (savedModel==='gemini-2.5-flash-lite'?'selected':'') + '>2.5 Flash-Lite</option>';
        html += '</select></div>';
        html += '<div class="fg" style="flex: 1;"><label>턴 수</label><input type="number" id="ce-ai-turns" value="' + escapeHtml(savedTurnCount) + '" min="5" max="50"></div>';
        html += '</div>';

        html += '<div class="fg"><label id="ce-ai-result-label-wrapper">';
        html += '<span id="ce-ai-result-label">생성 결과</span>';

        html += '<div style="display:flex; align-items:center; gap:10px;">';
        html += '<span id="ce-ai-history-nav" style="display:none; font-size:13px; font-weight:normal; color:#555;">';
        html += '<button id="ce-ai-prev" style="cursor:pointer; border:none; background:none; padding:0 4px; font-size:12px;">◀</button>';
        html += '<span id="ce-ai-page" style="margin: 0 4px;">1/1</span>';
        html += '<button id="ce-ai-next" style="cursor:pointer; border:none; background:none; padding:0 4px; font-size:12px;">▶</button>';
        html += '</span>';
        html += '<button id="ce-ai-toggle-prompt" class="crack-ext-toggle-prompt-btn">⚙️ 프롬프트 설정</button>';
        html += '</div>';
        html += '</label>';

        html += '<textarea id="ce-ai-result" rows="10" placeholder="생성 버튼을 누르면 요약 결과가 나오고, 직접 써서 추가할 수도 있습니다. 여러 개의 사건을 [제목] 내용 형식으로 적어주면 자동으로 분리해서 추가됩니다."></textarea></div>';

        // 버튼 레이아웃 1.2 버전 롤백 (justify-content: space-between 적용, div 묶음 변경)
        html += '<div class="crack-ext-ai-modal-btns" style="justify-content: space-between; align-items: flex-end;">';
        html += '<div><button class="crack-ext-ai-mbtn crack-ext-ai-btn" id="ce-ai-generate" style="height: 38px;">요약 생성</button></div>';

        html += '<div style="display:flex; gap:8px; align-items: center;">';
        html += '<button class="crack-ext-ai-mbtn" id="ce-ai-cancel" style="height: 38px;">취소</button>';
        html += '<button class="crack-ext-ai-mbtn crack-ext-ai-mbtn-p" id="ce-ai-save" style="height: 38px;">추가하기</button>';
        html += '</div></div></div>';

        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        const topSettings = overlay.querySelector('#ce-ai-top-settings');
        const btnGen = overlay.querySelector('#ce-ai-generate');
        const btnSave = overlay.querySelector('#ce-ai-save');
        const btnCancel = overlay.querySelector('#ce-ai-cancel');
        const inputKey = overlay.querySelector('#ce-ai-key');
        const inputModel = overlay.querySelector('#ce-ai-model');
        const inputTurns = overlay.querySelector('#ce-ai-turns');
        const txtResult = overlay.querySelector('#ce-ai-result');
        const lblResult = overlay.querySelector('#ce-ai-result-label');

        const btnPrev = overlay.querySelector('#ce-ai-prev');
        const btnNext = overlay.querySelector('#ce-ai-next');
        const spanPage = overlay.querySelector('#ce-ai-page');
        const navContainer = overlay.querySelector('#ce-ai-history-nav');
        const btnTogglePrompt = overlay.querySelector('#ce-ai-toggle-prompt');

        function updateHistoryUI() {
            if (resultHistory.length > 0 && !isPromptMode) {
                navContainer.style.display = 'inline-flex';
                spanPage.textContent = (historyIndex + 1) + '/' + resultHistory.length;
                btnPrev.disabled = historyIndex === 0;
                btnNext.disabled = historyIndex === resultHistory.length - 1;
                // 다크모드는 CSS에서 :disabled 로 처리하므로 인라인 스타일 제거
                btnPrev.style.color = '';
                btnNext.style.color = '';
            } else {
                navContainer.style.display = 'none';
            }
        }

        btnPrev.onclick = (e) => {
            e.stopPropagation(); e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                txtResult.value = resultHistory[historyIndex];
                updateHistoryUI();
            }
        };

        btnNext.onclick = (e) => {
            e.stopPropagation(); e.preventDefault();
            if (historyIndex < resultHistory.length - 1) {
                historyIndex++;
                txtResult.value = resultHistory[historyIndex];
                updateHistoryUI();
            }
        };

        btnTogglePrompt.onclick = (e) => {
            e.stopPropagation(); e.preventDefault();
            isPromptMode = !isPromptMode;

            if (isPromptMode) {
                if (txtResult.value !== "채팅 내역을 불러오는 중..." && txtResult.value !== "Gemini API 요약 중...") {
                    tempResultContent = txtResult.value;
                }
                const curPrompt = localStorage.getItem('crack_ext_custom_prompt') || DEFAULT_PROMPT;
                txtResult.value = curPrompt;

                lblResult.innerHTML = '프롬프트 설정 <span style="font-size:11px; color:#ff4d4f; font-weight:normal; margin-left:8px;">(수정 시 자동 저장)</span>';
                btnTogglePrompt.textContent = '돌아가기';

                topSettings.style.display = 'none';
                btnSave.style.display = 'none';
                btnGen.style.display = 'none';
                navContainer.style.display = 'none';
            } else {
                localStorage.setItem('crack_ext_custom_prompt', txtResult.value.trim());
                txtResult.value = tempResultContent;

                lblResult.textContent = '생성 결과';
                btnTogglePrompt.textContent = '⚙️ 프롬프트 설정';

                topSettings.style.display = 'flex';
                btnSave.style.display = 'flex';
                btnGen.style.display = 'flex';
                updateHistoryUI();
            }
        };

        ['click', 'mousedown', 'mouseup', 'pointerdown'].forEach(evt => overlay.addEventListener(evt, e => e.stopPropagation()));
        overlay.addEventListener('click', e => { e.stopPropagation(); if (e.target === overlay) overlay.remove(); });
        btnCancel.onclick = e => { e.stopPropagation(); overlay.remove(); };

        btnGen.onclick = async (e) => {
            e.stopPropagation();
            const apiKey = inputKey.value.trim();
            const model = inputModel.value;
            const turns = parseInt(inputTurns.value, 10) || 15;

            if (!apiKey) return alert("API Key를 입력해주세요.");

            localStorage.setItem('crack_ext_gemini_key', apiKey);
            localStorage.setItem('crack_ext_gemini_model', model);
            localStorage.setItem('crack_ext_turn_count', turns.toString());

            btnGen.disabled = true;
            btnSave.disabled = true;
            btnGen.innerHTML = '<span class="ai-loading-spinner"></span>생성 중...';

            if (txtResult.value.trim() !== "" && resultHistory.length === 0) {
                resultHistory.push(txtResult.value.trim());
            }

            txtResult.value = "채팅 내역을 불러오는 중...";

            try {
                const chatLog = await fetchRecentMessages(turns);
                if (!chatLog) throw new Error("채팅 내역을 불러올 수 없습니다.");

                txtResult.value = "Gemini API 요약 중...";
                const aiResponse = await callGeminiApi(apiKey, model, chatLog);

                const finalResult = aiResponse.trim();
                txtResult.value = finalResult;

                resultHistory.push(finalResult);
                historyIndex = resultHistory.length - 1;
                updateHistoryUI();

                btnGen.textContent = "재생성 (리롤)";
                btnSave.disabled = false;
            } catch (err) {
                txtResult.value = "오류 발생: " + err.message;
                btnGen.textContent = "다시 시도";
            } finally {
                btnGen.disabled = false;
                if(btnGen.textContent === "재생성 (리롤)" || btnGen.textContent === "다시 시도") {
                    // Spinner 제거됨
                } else {
                    btnGen.innerHTML = btnGen.textContent;
                }
            }
        };

        btnSave.onclick = async (e) => {
            e.stopPropagation();
            const content = txtResult.value.trim();
            if (!content) return alert("결과가 비어있습니다.");

            const blocks = content.split(/\[(.*?)\]/);
            const memories = [];

            for (let i = 1; i < blocks.length; i += 2) {
                let title = blocks[i].trim();
                let summary = blocks[i+1] ? blocks[i+1].replace(/^[\s\n]*[-*]?\s*/, '').trim() : '';

                if (title.length > 20) title = title.substring(0, 20);
                if (summary.length > 500) summary = summary.substring(0, 500);

                if (title && summary) {
                    memories.push({ title, summary });
                }
            }

            if (memories.length === 0) {
                let title = "수동 요약";
                let summary = content.replace(/^[\s\n]*[-*]?\s*/, '').trim();
                if (summary.length > 500) summary = summary.substring(0, 500);
                memories.push({ title, summary });
            }

            btnSave.disabled = true;
            btnCancel.disabled = true;
            let successCount = 0;

            for (let i = 0; i < memories.length; i++) {
                btnSave.textContent = `추가 중... (${i + 1}/${memories.length})`;
                await new Promise(resolve => setTimeout(resolve, 50));

                const mem = memories[i];
                const postBody = { type: 'shortTerm', title: mem.title, summary: mem.summary };

                const res = await apiCall('POST', '/summaries', postBody);
                if (res) {
                    successCount++;
                } else {
                    alert(`[${mem.title}] 추가 중 오류가 발생했습니다.`);
                }
            }

            if (successCount > 0) {
                showToast(`✅ ${successCount}개의 요약이 장기 기억에 추가되었습니다.`);
                overlay.remove();
                var dialogEl = document.querySelector('[role="dialog"]');
                if (dialogEl) refreshCurrentTab(dialogEl);
            } else {
                btnSave.textContent = "추가하기";
                btnSave.disabled = false;
                btnCancel.disabled = false;
            }
        };
    }

    function injectTopHeaderBtn() {
        const headerContainer = document.querySelector('.absolute.z-\\[5\\] .flex.gap-3.items-center');
        if (!headerContainer) return;

        if (headerContainer.querySelector('.crack-ext-header-ai-btn')) return;

        const aiBtn = document.createElement('button');
        aiBtn.className = 'crack-ext-header-ai-btn';
        aiBtn.innerHTML = '✨ AI 요약';

        aiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            showAiSummaryModal();
        });

        headerContainer.prepend(aiBtn);
    }

    function inject() {
        injectAiStyles(); // AI 모달 전용 스타일 주입
        injectTopHeaderBtn();
    }

    // 초기 실행을 위해 MutationObserver 대신 직접 DOM 로드 후 inject 호출.
    // 기존 스크립트와의 충돌을 최소화하기 위함.
    function start() {
        var obs = new MutationObserver(() => requestAnimationFrame(inject));
        obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'data-state'] });
        setInterval(inject, 800);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
