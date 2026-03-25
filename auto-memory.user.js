// ==UserScript==
// @name         크랙 요약 메모리 편집 & AI 자동 요약 추가
// @namespace    https://crack.wrtn.ai/
// @version      1.2
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

    function injectStyles() {
        if (document.getElementById('crack-ext-css')) return;
        const s = document.createElement('style');
        s.id = 'crack-ext-css';
        s.textContent = `
            .crack-ext-dot-btn { background:none; border:none; cursor:pointer; padding:2px 6px; font-size:20px; color:#999; letter-spacing:2px; line-height:1; flex-shrink:0; }
            .crack-ext-dot-btn:hover { color:#222; }
            .crack-ext-dot-menu { position:absolute; right:0; top:30px; background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.15); z-index:99999; min-width:120px; padding:6px 0; pointer-events:auto !important; }
            .crack-ext-dot-menu button { display:block; width:100%; padding:10px 16px; background:none; border:none; cursor:pointer; font-size:14px; text-align:left; color:#222; }
            .crack-ext-dot-menu button:hover { background:#f5f5f5; }
            .crack-ext-panel { padding:4px 0; max-height:350px; overflow-y:auto; }
            .crack-ext-select-header { display:flex; align-items:center; gap:12px; padding:12px 24px; border-bottom:1px solid #f0f0f0; font-size:15px; font-weight:600; color:#222; }
            .crack-ext-edit-item { position:relative; display:flex; align-items:flex-start; gap:10px; padding:14px 24px; border-bottom:1px solid #f0f0f0; }
            .crack-ext-edit-item-expand { background:none; border:none; cursor:pointer; padding:0; font-size:16px; color:#999; flex-shrink:0; transition:transform 0.2s; }
            .crack-ext-edit-item-expand.open { transform:rotate(90deg); }
            .crack-ext-edit-item-content { flex:1; min-width:0; }
            .crack-ext-edit-item-title { font-weight:700; font-size:14px; color:#222; display:flex; align-items:center; gap:8px; }
            .crack-ext-badge { display:inline-block; padding:2px 8px; border-radius:4px; background:#222; color:#fff; font-size:11px; font-weight:600; }
            .crack-ext-edit-item-summary { font-size:13px; color:#555; line-height:1.6; white-space:pre-wrap; word-break:break-word; margin-top:8px; }
            .crack-ext-edit-item-menu-btn { background:none; border:none; cursor:pointer; padding:4px; font-size:18px; color:#999; flex-shrink:0; letter-spacing:1px; }
            .crack-ext-edit-menu-popup { position:absolute; right:24px; top:40px; background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.15); z-index:99999; min-width:140px; padding:6px 0; }
            .crack-ext-edit-menu-popup button { display:block; width:100%; padding:10px 16px; background:none; border:none; cursor:pointer; font-size:14px; text-align:left; color:#222; }
            .crack-ext-toolbar { display:flex; gap:8px; justify-content:flex-end; padding:16px 24px 8px; }
            .crack-ext-btn-bottom { padding:10px 24px; border-radius:8px; border:1px solid #ddd; background:#fff; cursor:pointer; font-size:14px; font-weight:600; }
            .crack-ext-btn-delete { background:#222; color:#fff; border-color:#222; }
            .crack-ext-empty { text-align:center; padding:24px 0; color:#999; font-size:14px; }
            .crack-ext-overlay { background:rgba(0,0,0,.5); z-index:100000; pointer-events:auto !important; }
            
            /* 다크모드 대응을 위한 글자색 및 배경색 강제 지정 */
            .crack-ext-modal { background:#fff; border-radius:16px; padding:28px; width:550px; max-width:90vw; box-shadow:0 8px 40px rgba(0,0,0,.2); pointer-events:auto !important; color:#222 !important;}
            .crack-ext-modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
            .crack-ext-modal-header h3 { color:#222 !important; margin: 0; font-size: 17px; font-weight: 700;}
            .crack-ext-modal label { display:flex; font-size:13px; font-weight:600; margin-bottom:6px; color:#333 !important; align-items:center; justify-content:space-between;}
            .crack-ext-modal input, .crack-ext-modal textarea, .crack-ext-modal select { width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box; font-family:inherit; pointer-events:auto !important; background-color: #fff !important; color:#222 !important; }
            .crack-ext-modal input::placeholder, .crack-ext-modal textarea::placeholder { color:#999 !important; }
            .crack-ext-modal .cc { text-align:right; font-size:12px; color:#999 !important; margin-top:4px; }
            .crack-ext-modal .fg { margin-bottom:16px; }
            .crack-ext-modal-btns { display:flex; gap:8px; justify-content:flex-end; margin-top:20px; }
            .crack-ext-mbtn { padding:10px 24px; border-radius:8px; border:1px solid #ddd; background:#fff; color:#222; cursor:pointer; font-size:14px; font-weight:600; pointer-events:auto !important; display:flex; align-items:center; justify-content:center;}
            .crack-ext-mbtn-p { background:#222; color:#fff; border-color:#222; }
            .crack-ext-mbtn-p:disabled { background:#eee; border-color:#eee; color:#666 !important; cursor:not-allowed; }
            .crack-ext-edit-btn { padding:8px 18px; border-radius:8px; border:1px solid #ddd; background:#fff; color:#222; cursor:pointer; font-size:14px; font-weight:600; margin-right:8px; transition:all .15s; }
            .crack-flex-row { display:flex; gap:12px; }
            .crack-flex-row .fg { flex:1; }
            .ai-loading-spinner { display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,.3); border-radius:50%; border-top-color:#fff; animation:spin 1s ease-in-out infinite; margin-right:8px; vertical-align:middle; }
            @keyframes spin { to { transform: rotate(360deg); } }

            /* 상단 헤더 버튼 모바일 호환 CSS */
            .crack-ext-header-ai-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0 12px;
                height: 36px;
                border-radius: 6px;
                background: linear-gradient(135deg, #6e8efb, #a777e3);
                color: white;
                font-weight: 600;
                font-size: 13px;
                border: none;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: transform 0.1s, opacity 0.2s;
                letter-spacing: -0.3px;
                white-space: nowrap; /* 줄바꿈 절대 방지 */
                flex-shrink: 0;      /* 플렉스 박스에서 찌그러짐 방지 */
            }
            .crack-ext-header-ai-btn:hover { opacity: 0.9; transform: translateY(-1px); }
            .crack-ext-header-ai-btn:active { transform: translateY(1px); }
            .crack-ext-toggle-prompt-btn { font-size:12px; background:none; color: #333 !important; border:1px solid #ddd; padding:4px 8px; border-radius:4px; cursor:pointer; transition:background 0.2s;}
            .crack-ext-toggle-prompt-btn:hover { background:#f5f5f5;}
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

    function showEditModal(opts) {
        var title = opts.title || '';
        var summary = opts.summary || '';
        var tabLabel = opts.tabLabel || '수정';
        var isGoal = opts.isGoal || false;
        var onSave = opts.onSave;

        var overlay = document.createElement('div');
        overlay.className = 'crack-ext-overlay';
        overlay.style.pointerEvents = 'auto';
        var html = '<div class="crack-ext-modal" style="width: 480px;">';
        html += '<div class="crack-ext-modal-header"><h3>' + escapeHtml(tabLabel) + '</h3></div>';
        if (!isGoal) {
            html += '<div class="fg"><label>제목 <span>*</span></label>';
            html += '<input id="ce-ti" maxlength="20" placeholder="[NPC명 사건 핵심어]"><div class="cc"><span id="ce-tc">0</span>/20</div></div>';
        }
        html += '<div class="fg"><label>내용 <span>*</span></label>';
        html += '<textarea id="ce-si" rows="6" maxlength="500"></textarea>';
        html += '<div class="cc"><span id="ce-sc">0</span>/500</div></div>';
        html += '<div class="crack-ext-modal-btns">';
        html += '<button class="crack-ext-mbtn" id="ce-cancel">취소</button>';
        html += '<button class="crack-ext-mbtn crack-ext-mbtn-p" id="ce-save">확인</button>';
        html += '</div></div>';
        overlay.innerHTML = html;
        var dialogEl = document.querySelector('[role="dialog"]');
        var appendTarget = dialogEl || document.body;
        appendTarget.appendChild(overlay);
        if (dialogEl) {
            overlay.style.position = 'absolute'; overlay.style.inset = '0';
            overlay.style.width = '100%'; overlay.style.height = '100%';
            overlay.style.display = 'flex'; overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center'; overlay.style.borderRadius = getComputedStyle(dialogEl).borderRadius || '16px';
            overlay.style.overflow = 'hidden';
        }

        var ti = overlay.querySelector('#ce-ti');
        var si = overlay.querySelector('#ce-si');
        if (ti) {
            ti.value = title; overlay.querySelector('#ce-tc').textContent = title.length;
            ti.oninput = () => overlay.querySelector('#ce-tc').textContent = ti.value.length;
        }
        si.value = summary;
        overlay.querySelector('#ce-sc').textContent = summary.length;
        si.oninput = () => overlay.querySelector('#ce-sc').textContent = si.value.length;

        ['click', 'mousedown', 'mouseup', 'pointerdown'].forEach(evt => {
            overlay.addEventListener(evt, e => e.stopPropagation());
        });
        overlay.querySelector('#ce-cancel').onclick = e => { e.stopPropagation(); overlay.remove(); };
        overlay.addEventListener('click', e => { e.stopPropagation(); if (e.target === overlay) overlay.remove(); });
        overlay.querySelector('#ce-save').onclick = e => {
            e.stopPropagation();
            var nt = ti ? ti.value.trim() : '';
            var ns = si.value.trim();
            if (!isGoal && !nt) { alert('제목을 입력해주세요.'); return; }
            if (!ns) { alert('내용을 입력해주세요.'); return; }
            overlay.remove();
            onSave({ title: nt, summary: ns });
        };
        (ti || si).focus();
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

    function showAiSummaryModal() {
        var overlay = document.createElement('div');
        overlay.className = 'crack-ext-overlay';
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

        var html = '<div class="crack-ext-modal" style="width: 580px;">';
        html += '<div class="crack-ext-modal-header"><h3>✨ AI 요약 / 단기 기억 추가</h3></div>';

        html += '<div class="crack-flex-row" id="ce-ai-top-settings">';
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

        html += '<div class="fg"><label>';
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

        html += '<div class="crack-ext-modal-btns" style="justify-content: space-between; align-items: flex-end;">';
        html += '<div><button class="crack-ext-mbtn crack-ext-ai-btn" id="ce-ai-generate" style="background: linear-gradient(135deg, #6e8efb, #a777e3); color: white; border:none; height: 38px;">요약 생성</button></div>';

        html += '<div style="display:flex; gap:8px; align-items: center;">';
        html += '<button class="crack-ext-mbtn" id="ce-ai-cancel" style="height: 38px;">취소</button>';
        html += '<button class="crack-ext-mbtn crack-ext-mbtn-p" id="ce-ai-save" style="height: 38px;">추가하기</button>';
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
                btnPrev.style.color = btnPrev.disabled ? '#ccc' : '#222';
                btnNext.style.color = btnNext.disabled ? '#ccc' : '#222';
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

    function closeAllDotMenus() {
        document.querySelectorAll('.crack-ext-dot-menu').forEach(m => m.remove());
    }

    function clearAllDotElements(dialog) {
        dialog.querySelectorAll('.crack-ext-dot-btn').forEach(b => b.remove());
        dialog.querySelectorAll('.crack-ext-dot-menu').forEach(m => m.remove());
        dialog.querySelectorAll('[data-crack-matched]').forEach(el => {
            el.removeAttribute('data-crack-matched');
            el.removeAttribute('data-crack-api-type');
            el.removeAttribute('data-crack-summary-id');
            el.style.paddingRight = '';
        });
    }

    var dotInjectionId = 0;

    function getCurrentApiType(dialog) {
        var activeTab = getActiveTargetTab(dialog);
        if (!activeTab) return null;
        return TYPE_MAP[activeTab] || null;
    }

    function injectDotMenus(dialog, apiType, injectionId) {
        if (injectionId !== dotInjectionId) return;
        if (TARGET_TABS.indexOf(getTabLabelFromApiType(apiType)) === -1) return;

        var currentType = getCurrentApiType(dialog);
        if (currentType !== apiType) return;

        var scrollArea = dialog.querySelector('[class*="overflow-y-auto"]');
        if (!scrollArea) return;

        apiCall('GET', '/summaries?limit=20&type=' + apiType + '&orderBy=newest').then(res => {
            if (injectionId !== dotInjectionId) return;
            var currentTypeAfterApi = getCurrentApiType(dialog);
            if (currentTypeAfterApi !== apiType) return;

            if (!res || !res.data || !res.data.summaries) return;
            var summaries = res.data.summaries;

            clearAllDotElements(dialog);

            var itemEls = [];
            scrollArea.querySelectorAll('div').forEach(div => {
                if (div.parentElement === scrollArea || (div.parentElement && div.parentElement.parentElement === scrollArea)) {
                    if (div.querySelector('.crack-ext-dot-btn')) return;
                    var divText = (div.textContent || '').trim();
                    for (var i = 0; i < summaries.length; i++) {
                        var s = summaries[i];
                        var matchText = s.title || (s.summary || '').substring(0, 20);
                        if (matchText && divText.indexOf(matchText) !== -1 && !div.getAttribute('data-crack-matched')) {
                            div.setAttribute('data-crack-matched', 'true');
                            div.setAttribute('data-crack-summary-id', s._id);
                            div.setAttribute('data-crack-api-type', apiType);
                            itemEls.push({ el: div, summary: s });
                            break;
                        }
                    }
                }
            });

            if (itemEls.length === 0) {
                var candidates = [];
                for (var c = 0; c < scrollArea.children.length; c++) {
                    var child = scrollArea.children[c];
                    if (child.offsetHeight > 30 && !child.querySelector('.crack-ext-dot-btn')) candidates.push(child);
                }
                for (var idx = 0; idx < Math.min(candidates.length, summaries.length); idx++) {
                    candidates[idx].setAttribute('data-crack-summary-id', summaries[idx]._id);
                    candidates[idx].setAttribute('data-crack-api-type', apiType);
                    itemEls.push({ el: candidates[idx], summary: summaries[idx] });
                }
            }

            if (injectionId !== dotInjectionId) return;
            var finalCheck = getCurrentApiType(dialog);
            if (finalCheck !== apiType) return;

            itemEls.forEach(item => {
                var el = item.el;
                var summaryData = item.summary;
                var itemApiType = apiType;

                var cs = getComputedStyle(el);
                if (cs.position === 'static') el.style.position = 'relative';

                var dotBtn = document.createElement('button');
                dotBtn.className = 'crack-ext-dot-btn';
                dotBtn.textContent = '\u22EF';
                dotBtn.title = '더보기';
                dotBtn.style.cssText = 'position:absolute;right:0;top:12px;z-index:10;';
                el.style.paddingRight = '40px';
                el.appendChild(dotBtn);

                dotBtn.addEventListener('click', ev => {
                    ev.stopPropagation(); ev.preventDefault();
                    closeAllDotMenus();

                    var currentId = el.getAttribute('data-crack-summary-id') || summaryData._id;
                    var currentApiType = el.getAttribute('data-crack-api-type') || itemApiType;

                    var activeType = getCurrentApiType(dialog);
                    if (activeType && activeType !== currentApiType) {
                        refreshCurrentTab(dialog);
                        return;
                    }

                    var menu = document.createElement('div');
                    menu.className = 'crack-ext-dot-menu';
                    menu.style.cssText = 'position:absolute;right:0;top:36px;z-index:99999;';

                    var editBtn = document.createElement('button');
                    editBtn.textContent = '수정';
                    editBtn.addEventListener('click', e2 => {
                        e2.stopPropagation(); menu.remove();
                        var editApiType = getCurrentApiType(dialog) || currentApiType;
                        apiCall('GET', '/summaries?limit=20&type=' + editApiType + '&orderBy=newest').then(freshRes => {
                            if (!freshRes || !freshRes.data || !freshRes.data.summaries) return;
                            var freshItem = freshRes.data.summaries.find(fi => fi._id === currentId);
                            if (!freshItem) return alert('해당 항목을 찾을 수 없습니다.');
                            var tabLabel = editApiType === 'shortTerm' ? '단기 기억' : editApiType === 'relationship' ? '관계도' : '목표';
                            showEditModal({
                                title: freshItem.title || '', summary: freshItem.summary || '',
                                tabLabel: tabLabel, isGoal: editApiType === 'goal',
                                onSave: d => {
                                    var patchBody = editApiType === 'goal' ? { title: '목표', summary: d.summary } : { title: d.title, summary: d.summary };
                                    apiCall('PATCH', '/summaries/' + currentId, patchBody).then(r => {
                                        if (r) { showToast('요약 메모리가 수정되었어요'); refreshCurrentTab(dialog); }
                                    });
                                }
                            });
                        });
                    });
                    menu.appendChild(editBtn);

                    var delBtn = document.createElement('button');
                    delBtn.textContent = '삭제';
                    delBtn.addEventListener('click', e2 => {
                        e2.stopPropagation(); menu.remove();
                        if (!confirm('정말 삭제하시겠습니까?')) return;
                        apiCall('DELETE', '/summaries/' + currentId).then(r => {
                            if (r) { showToast('요약 메모리가 삭제되었어요'); refreshCurrentTab(dialog); }
                        });
                    });
                    menu.appendChild(delBtn);

                    el.appendChild(menu);
                    setTimeout(() => {
                        function close(e3) {
                            if (!menu.contains(e3.target) && e3.target !== dotBtn) {
                                menu.remove(); document.removeEventListener('click', close, true);
                            }
                        }
                        document.addEventListener('click', close, true);
                    }, 0);
                });
            });
        });
    }

    function getTabLabelFromApiType(apiType) {
        for (var key in TYPE_MAP) { if (TYPE_MAP[key] === apiType) return key; }
        return '';
    }

    function refreshCurrentTab(dialog) {
        var activeTab = getActiveTargetTab(dialog);
        if (!activeTab) return;
        var btns = dialog.querySelectorAll('button');
        var activeBtn = null, otherBtn = null;
        for (var i = 0; i < btns.length; i++) {
            var txt = btns[i].textContent.trim();
            if (txt === activeTab) activeBtn = btns[i];
            else if (txt === '장기 기억') otherBtn = btns[i];
        }
        if (!activeBtn) return;

        clearAllDotElements(dialog);
        dotInjectionId++;

        if (otherBtn) {
            isRefreshing = true;
            otherBtn.click();
            setTimeout(() => {
                activeBtn.click();
                setTimeout(() => { isRefreshing = false; lastDotInjectedTab = null; }, 400);
            }, 150);
        } else {
            lastDotInjectedTab = null;
            activeBtn.click();
        }
    }

    function renderEditPanel(panel, items, apiType, refresh) {
        panel.innerHTML = '';
        var selectedIds = new Set();
        var header = document.createElement('div');
        header.className = 'crack-ext-select-header';
        var selectAllCb = document.createElement('input'); selectAllCb.type = 'checkbox';
        var selectLabel = document.createElement('span'); selectLabel.textContent = '선택 0개';
        header.appendChild(selectAllCb); header.appendChild(selectLabel);
        panel.appendChild(header);

        function updateLabel() {
            selectLabel.textContent = '선택 ' + selectedIds.size + '개';
            selectAllCb.checked = items.length > 0 && selectedIds.size === items.length;
            selectAllCb.indeterminate = selectedIds.size > 0 && selectedIds.size < items.length;
            var db = panel.querySelector('.crack-ext-btn-delete');
            if (db) db.disabled = selectedIds.size === 0;
        }

        selectAllCb.addEventListener('change', () => {
            if (selectAllCb.checked) items.forEach(it => selectedIds.add(it._id));
            else selectedIds.clear();
            panel.querySelectorAll('.crack-ext-edit-cb').forEach(cb => cb.checked = selectAllCb.checked);
            updateLabel();
        });

        var container = document.createElement('div');
        if (!items.length) container.innerHTML = '<div class="crack-ext-empty">등록된 항목이 없습니다.</div>';

        items.forEach(item => {
            var div = document.createElement('div'); div.className = 'crack-ext-edit-item';
            var cb = document.createElement('input'); cb.type = 'checkbox'; cb.className = 'crack-ext-edit-cb';
            cb.addEventListener('change', () => { if (cb.checked) selectedIds.add(item._id); else selectedIds.delete(item._id); updateLabel(); });
            div.appendChild(cb);

            var expandBtn = document.createElement('button'); expandBtn.className = 'crack-ext-edit-item-expand'; expandBtn.innerHTML = '›';
            div.appendChild(expandBtn);

            var contentDiv = document.createElement('div'); contentDiv.className = 'crack-ext-edit-item-content';
            var titleDiv = document.createElement('div'); titleDiv.className = 'crack-ext-edit-item-title';
            var badge = document.createElement('span'); badge.className = 'crack-ext-badge'; badge.textContent = '추가';
            titleDiv.appendChild(badge);
            var titleSpan = document.createElement('span'); titleSpan.textContent = item.title || (item.summary || '').substring(0, 30);
            titleDiv.appendChild(titleSpan); contentDiv.appendChild(titleDiv);

            var summaryDiv = document.createElement('div'); summaryDiv.className = 'crack-ext-edit-item-summary';
            summaryDiv.textContent = item.summary || ''; summaryDiv.style.display = 'none';
            contentDiv.appendChild(summaryDiv); div.appendChild(contentDiv);

            expandBtn.addEventListener('click', () => {
                var open = summaryDiv.style.display !== 'none';
                summaryDiv.style.display = open ? 'none' : 'block';
                expandBtn.classList.toggle('open', !open);
            });
            container.appendChild(div);
        });
        panel.appendChild(container);

        var toolbar = document.createElement('div'); toolbar.className = 'crack-ext-toolbar';
        var cancelBtn = document.createElement('button'); cancelBtn.className = 'crack-ext-btn-bottom'; cancelBtn.textContent = '취소';
        cancelBtn.addEventListener('click', () => exitEditMode()); toolbar.appendChild(cancelBtn);

        var bulkDel = document.createElement('button'); bulkDel.className = 'crack-ext-btn-bottom crack-ext-btn-delete';
        bulkDel.textContent = '삭제'; bulkDel.disabled = true;
        bulkDel.addEventListener('click', () => {
            if (selectedIds.size === 0) return;
            if (!confirm('선택한 ' + selectedIds.size + '개 항목을 삭제하시겠습니까?')) return;
            var promises = Array.from(selectedIds).map(id => apiCall('DELETE', '/summaries/' + id));
            Promise.all(promises).then(() => { showToast('요약 메모리가 삭제되었어요'); refresh(); });
        });
        toolbar.appendChild(bulkDel); panel.appendChild(toolbar);
        updateLabel();
    }

    function loadEditPanel(panel, apiType) {
        panel.innerHTML = '<div style="text-align:center;padding:20px;color:#999;">불러오는 중...</div>';
        apiCall('GET', '/summaries?limit=20&type=' + apiType + '&orderBy=newest').then(res => {
            if (!res || !res.data) return panel.innerHTML = '<div style="color:#ff4d4f;text-align:center;padding:20px;">데이터를 불러올 수 없습니다.</div>';
            renderEditPanel(panel, res.data.summaries || [], apiType, () => loadEditPanel(panel, apiType));
        });
    }

    function getActiveTargetTab(dialog) {
        var btns = dialog.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
            var text = btns[i].textContent.trim();
            if (TARGET_TABS.indexOf(text) !== -1) {
                var bg = getComputedStyle(btns[i]).backgroundColor;
                var m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                if (m && (parseInt(m[1]) + parseInt(m[2]) + parseInt(m[3])) / 3 < 128) return text;
            }
        }
        return null;
    }

    var lastInjectedTab = null;
    var editMode = false;
    var panelEl = null;
    var lastDotInjectedTab = null;
    var isRefreshing = false;

    function exitEditMode() {
        editMode = false;
        var dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return;
        var scrollArea = dialog.querySelector('[class*="overflow-y-auto"]');
        if (scrollArea) scrollArea.style.display = '';
        if (panelEl) panelEl.style.display = 'none';
        dialog.querySelectorAll('button').forEach(btn => {
            if (btn.dataset.crackHidden === 'true') {
                btn.style.display = ''; delete btn.dataset.crackHidden;
            }
        });
    }

    function inject() {
        injectTopHeaderBtn();

        var dialog = document.querySelector('[role="dialog"]');
        if (!dialog) {
            lastInjectedTab = null; lastDotInjectedTab = null; editMode = false;
            return;
        }

        var allText = dialog.textContent || '';
        if (allText.indexOf('요약 메모리') === -1 || allText.indexOf('장기 기억') === -1) return;

        var activeTab = getActiveTargetTab(dialog);
        if (!activeTab) {
            dialog.querySelectorAll('.crack-ext-edit-btn').forEach(t => t.remove());
            if (panelEl && panelEl.parentElement) panelEl.remove();
            var sa = dialog.querySelector('[class*="overflow-y-auto"]');
            if (sa) sa.style.display = '';
            lastInjectedTab = null; lastDotInjectedTab = null; editMode = false;
            return;
        }

        if (activeTab !== lastInjectedTab) {
            dialog.querySelectorAll('.crack-ext-edit-btn').forEach(t => t.remove());
            if (panelEl && panelEl.parentElement) panelEl.remove();
            var sa2 = dialog.querySelector('[class*="overflow-y-auto"]');
            if (sa2) sa2.style.display = '';
            editMode = false; lastInjectedTab = activeTab;
            clearAllDotElements(dialog);
            lastDotInjectedTab = null; dotInjectionId++;
        }

        var apiType = TYPE_MAP[activeTab];

        if (!editMode && activeTab !== lastDotInjectedTab && !isRefreshing) {
            lastDotInjectedTab = activeTab;
            dotInjectionId++;
            var currentInjectionId = dotInjectionId;
            setTimeout(() => {
                if (!editMode && !isRefreshing) {
                    var dialogNow = document.querySelector('[role="dialog"]');
                    if (!dialogNow) return;
                    if (getActiveTargetTab(dialogNow) !== getTabLabelFromApiType(apiType)) return;
                    injectDotMenus(dialogNow, apiType, currentInjectionId);
                }
            }, 800);
        }

        if (dialog.querySelector('.crack-ext-edit-btn')) return;

        var allBtns = dialog.querySelectorAll('button');
        var confirmBtn = null;
        for (var j = 0; j < allBtns.length; j++) {
            if (allBtns[j].textContent.trim() === '확인') { confirmBtn = allBtns[j]; break; }
        }
        if (!confirmBtn) return;

        if (apiType === 'goal') return;

        var editBtn = document.createElement('button');
        editBtn.className = 'crack-ext-edit-btn';
        editBtn.textContent = '편집';
        confirmBtn.parentElement.insertBefore(editBtn, confirmBtn);

        panelEl = document.createElement('div');
        panelEl.className = 'crack-ext-panel';
        panelEl.style.display = 'none';

        editBtn.addEventListener('click', () => {
            editMode = !editMode;
            var scrollArea = dialog.querySelector('[class*="overflow-y-auto"]');
            var currentApiType = getCurrentApiType(dialog) || apiType;
            if (editMode) {
                if (scrollArea) scrollArea.style.display = 'none';
                var btnsInFooter = confirmBtn.parentElement.querySelectorAll('button');
                btnsInFooter.forEach(btn => {
                    if (!btn.classList.contains('crack-ext-edit-btn')) {
                        btn.style.display = 'none'; btn.dataset.crackHidden = 'true';
                    }
                });
                editBtn.style.display = 'none'; editBtn.dataset.crackHidden = 'true';
                if (!panelEl.parentElement && scrollArea) scrollArea.parentElement.insertBefore(panelEl, scrollArea);
                panelEl.style.display = 'block';
                loadEditPanel(panelEl, currentApiType);
            } else {
                exitEditMode();
            }
        });
    }

    function start() {
        injectStyles();
        var obs = new MutationObserver(() => requestAnimationFrame(inject));
        obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'data-state'] });
        setInterval(inject, 800);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
