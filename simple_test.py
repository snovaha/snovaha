#!/usr/bin/env python3
"""
SNOVAHA Notion 테스트 - 간단한 버전
"""

import os
import json
import base64
import urllib.request
import urllib.error
import ssl
from datetime import datetime

# SSL 검증 무시
ssl._create_default_https_context = ssl._create_unverified_context

# .env 파일 로드
def load_env():
    env_file = '/Users/hs/dev/snovaha/.env'
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

load_env()

class NotionAPI:
    def __init__(self):
        self.api_key = os.getenv('NOTION_API_KEY')
        self.base_url = 'https://api.notion.com'
        self.version = '2022-06-28'
    
    def _make_request(self, method, path, body=None):
        try:
            url = f"{self.base_url}/v1{path}"
            req = urllib.request.Request(url, method=method)
            req.add_header('Authorization', f'Bearer {self.api_key}')
            req.add_header('Notion-Version', self.version)
            req.add_header('Content-Type', 'application/json')
            
            if body:
                req.data = json.dumps(body).encode('utf-8')
            
            with urllib.request.urlopen(req) as response:
                data = response.read().decode('utf-8')
                return {
                    'status': response.status,
                    'data': json.loads(data) if data else None
                }
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            return {
                'status': e.code,
                'data': json.loads(error_body) if error_body and error_body.strip() else {'error': str(e)}
            }
        except Exception as e:
            return {
                'status': 0,
                'error': str(e),
                'data': {}
            }
    
    def create_simple_page(self, title, text_content=""):
        """더 간단한 Notion 페이지 생성"""
        try:
            body = {
                "parent": {
                    "page_id": "2901a4ad-823b-81ed-80b2-c04ad87e6e2c"  # 기존 Notion 페이지
                },
                "properties": {
                    "title": {
                        "title": [
                            {
                                "type": "text",
                                "text": {"content": title}
                            }
                        ]
                    }
                },
                "children": [
                    {
                        "object": "block",
                        "type": "paragraph",
                        "paragraph": {
                            "rich_text": [
                                {
                                    "type": "text",
                                    "text": {
                                        "content": text_content or "자동 생성된 문서입니다."
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
            
            result = self._make_request('POST', '/pages', body)
            print(f"Notion 요청 상태: {result['status']}")
            
            if result['status'] == 200:
                page_id = result['data'].get('id')
                print(f"✅ Notion 페이지 생성 성공!")
                print(f"   ID: {page_id}")
                print(f"   URL: https://www.notion.so/{page_id.replace('-', '')}")
                return page_id
            else:
                print(f"❌ 실패 (status {result['status']})")
                error = result.get('data', {})
                if isinstance(error, dict):
                    print(f"   에러: {error.get('message', error.get('error', str(error)))}")
                else:
                    print(f"   에러: {error}")
                return None
        except Exception as e:
            print(f"❌ 에러: {str(e)}")
            return None

# 테스트 실행
print("\n" + "="*50)
print("📄 NOTION 페이지 생성 테스트")
print("="*50 + "\n")

notion = NotionAPI()
print("1️⃣  API 키 확인:")
print(f"   API Key: {notion.api_key[:20]}...{notion.api_key[-10:]}")

print("\n2️⃣  Notion에 페이지 생성 중...")
page_id = notion.create_simple_page(
    title="🚀 Phase 1 개발 시작 - " + datetime.now().strftime("%Y-%m-%d %H:%M"),
    text_content="이것은 자동화된 통합 테스트 문서입니다.\n\n• Jira: 티켓 관리\n• Notion: 문서 작성\n• Git: 코드 형상 관리"
)

print("\n" + "="*50)
if page_id:
    print("✨ Notion 테스트 완료!")
    print(f"   새 페이지가 생성되었습니다: {page_id}")
else:
    print("⚠️  Notion 페이지 생성에 실패했습니다.")
print("="*50 + "\n")
