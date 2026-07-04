#!/usr/bin/env python3
"""
SNOVAHA Notion 고급 테스트
"""

import os
import json
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

class NotionAdvanced:
    def __init__(self):
        self.api_key = os.getenv('NOTION_API_KEY')
        self.base_url = 'https://api.notion.com'
        self.version = '2022-06-28'
        print(f"✅ API Key loaded: {self.api_key[:20]}...{self.api_key[-10:]}")
    
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
                'error': str(e)
            }
    
    def list_databases(self):
        """현재 접근 가능한 데이터베이스 목록 조회"""
        print("\n📚 접근 가능한 데이터베이스 조회...")
        result = self._make_request('POST', '/search', {
            "query": "",
            "sort": {"direction": "ascending", "timestamp": "last_edited_time"},
            "filter": {"value": "database", "property": "object"}
        })
        
        if result['status'] == 200:
            databases = result['data'].get('results', [])
            print(f"   찾은 데이터베이스: {len(databases)}개")
            for db in databases:
                db_id = db.get('id')
                db_title = db.get('title', [{}])[0].get('plain_text', 'Untitled')
                print(f"   • {db_title} (ID: {db_id})")
            return databases
        else:
            print(f"   ❌ 실패: {result['data'].get('message', 'Unknown error')}")
            return []
    
    def list_pages(self):
        """현재 접근 가능한 페이지 목록 조회"""
        print("\n📄 접근 가능한 페이지 조회...")
        result = self._make_request('POST', '/search', {
            "query": "",
            "sort": {"direction": "ascending", "timestamp": "last_edited_time"},
            "filter": {"value": "page", "property": "object"}
        })
        
        if result['status'] == 200:
            pages = result['data'].get('results', [])
            print(f"   찾은 페이지: {len(pages)}개")
            for page in pages:
                page_id = page.get('id')
                page_title = page.get('properties', {}).get('title', {}).get('title', [{}])[0].get('text', {}).get('content', 'Untitled')
                print(f"   • {page_title} (ID: {page_id})")
            return pages
        else:
            print(f"   ❌ 실패: {result['data'].get('message', 'Unknown error')}")
            return []
    
    def add_block_to_page(self, page_id, text_content):
        """페이지에 블록 추가"""
        print(f"\n✍️  페이지 {page_id[:8]}...에 텍스트 블록 추가 중...")
        
        body = {
            "children": [
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": text_content
                                }
                            }
                        ]
                    }
                }
            ]
        }
        
        result = self._make_request('PATCH', f'/blocks/{page_id}/children', body)
        
        if result['status'] == 200:
            print(f"   ✅ 블록 추가 성공!")
            return True
        else:
            error = result.get('data', {})
            print(f"   ❌ 실패 (status {result['status']}): {error.get('message', error.get('error', str(error)))}")
            return False

# 테스트 실행
print("\n" + "="*60)
print("🚀 NOTION 고급 테스트")
print("="*60)

notion = NotionAdvanced()

# 1. 접근 가능한 데이터베이스 찾기
print("\n1️⃣  데이터베이스 검색...")
databases = notion.list_databases()

# 2. 접근 가능한 페이지 찾기
print("\n2️⃣  페이지 검색...")
pages = notion.list_pages()

# 3. 첫 번째 페이지에 블록 추가
if pages:
    print("\n3️⃣  테스트: 첫 번째 페이지에 콘텐츠 추가...")
    first_page = pages[0]
    page_id = first_page.get('id')
    page_title = first_page.get('properties', {}).get('title', {}).get('title', [{}])[0].get('text', {}).get('content', 'Unknown')
    
    print(f"\n   대상 페이지: {page_title} ({page_id[:8]}...)")
    
    test_content = f"🤖 자동화 테스트 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n✅ Jira + Notion + Git 통합 테스트 완료"
    success = notion.add_block_to_page(page_id, test_content)
    
    if success:
        print(f"\n✨ 성공! {page_title} 페이지에 내용이 추가되었습니다.")
    else:
        print(f"\n⚠️  페이지에 블록 추가 실패")
else:
    print("\n⚠️  접근 가능한 페이지가 없습니다.")
    print("   👉 Notion 페이지/데이터베이스를 SNOVAHA API 인테그레이션과 공유해주세요.")

print("\n" + "="*60)
print("✨ 테스트 완료")
print("="*60 + "\n")
