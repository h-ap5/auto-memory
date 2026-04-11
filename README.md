# 자동 장기 메모리 편집
- API 키를 사용하여 즉석에서 채팅 턴을 불러와, 장기 메모리 요약본을 생성 및 추가합니다.
- 다운로드:
https://github.com/h-ap5/auto-memory/raw/refs/heads/main/auto-memory.user.js


---
## 업데이트 내역

### V1.5
- Vertex AI API 키 호환 기능을 추가했습니다.

※키 입력시, 반드시  firebaseConfig 부터 시작하는 부분을 붙여넣어주세요. 

예:

   firebaseConfig = {
   
 apiKey: "..."
 
 .
 
 .
 
 .
 
 appId: "..."
 
};

위의 템플릿처럼 };로 닫힌 부분에 해당하는 부분까지 넣어주세요.

### V1.4
- 건의로 받은 초과 방지 팝업, 카드 슬라이드, UI여백 오류 수정, 글자수 실시간 확인이 추가되었습니다.
- 해당 업데이트는 글쓴이가 아닌 건의자가 짜준 업데이트 코드를 그대로 반영하였습니다. 건의자분께 좋은 업데이트에 대해서 감사드립니다.
- 건의하신 분께서 제공한 업데이트본 적용 화면
 <img width="366" height="623" alt="image" src="https://github.com/user-attachments/assets/acb99db9-63b8-4dee-8804-3b1723635452" />
 
### V1.3
- 다크모드 호환 기능을 추가했습니다. UI 전체가 다크모드에 맞추어 검정색으로 변경됩니다.
- 다크모드 적용 화면
 <img width="546" height="516" alt="image" src="https://github.com/user-attachments/assets/77f53db2-8332-419e-a496-0bc9c8ec7887" />
 
- 팝업창의 '✨ AI 요약 / 단기 기억 추가' 제목의 '단기'를 '장기'로 변경했습니다.
- '크랙 요약 메모리 편집 확장' 확장 프로그램과 충돌해서 인터페이스가 깨지는 현상을 수정했습니다. 다만 같은 CSS로 인해 두 확장 프로그램을 동시에 켜 놓을 시 기능에 문제가 있을 수 있으니, 동시 사용은 권장 드리지 않습니다.

### V1.2
- 다크모드 시 글자가 하얗게 보이는 오류를 수정했습니다.

### V1.1
- 첫 릴리스 입니다.
- 적용 화면
 <img width="594" height="522" alt="image" src="https://github.com/user-attachments/assets/8b64d8ab-67c7-4a1a-bc7e-f55122595056" />
