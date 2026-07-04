#!/usr/bin/env python3
"""
SNOVAHA Jira 테스트 - API 경로 수정
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

class JiraTest:
    def __init__(self):
        self.host = os.getenv('JIRA_HOST')
        self.email = os.getenv('JIRA_EMAIL')
        self.token = os.getenv('JIRA_API_TOKEN')
        self.project_key = os.getenv('JIRA_PROJECT_KEY')
        
        print(f"✅ Jira Host: {self.host}")
        print(f"✅ Email: {self.email}")
        print(f"✅ Token: {self.token[:30]}...{self.token[-10:]}")
        print(f"✅ Project Key: {self.project_key}")
    
    def _make_request(self, method, path, body=None):
        try:
            url = f"{self.host}/rest/api/3{path}"
            print(f"\n📡 Request: {method} {url}")
            
            auth_str = f"{self.email}:{self.token}"
            auth_bytes = auth_str.encode('ascii')
            auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
            
            req = urllib.request.Request(url, method=method)
            req.add_header('Authorization', f'Basic {auth_b64}')
            req.add_header('Content-Type', 'application/json')
            req.add_header('Accept', 'application/json')
            
            if body:
                req.data = json.dumps(body).encode('utf-8')
                print(f"   Body: {str(body)[:100]}...")
            
            with urllib.request.urlopen(req) as response:
                data = response.read().decode('utf-8')
                print(f"   ✅ Status: {response.status}")
                return {
                    'status': response.status,
                    'data': json.loads(data) if data else None
                }
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            print(f"   ❌ HTTP Error {e.code}")
            print(f"   Body: {error_body[:200]}")
            return {
                'status': e.code,
                'data': json.loads(error_body) if error_body and error_body.strip() else {'error': str(e)}
            }
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
            return {
                'status': 0,
                'error': str(e)
            }
    
    def test_connection(self):
        """연결 테스트"""
        print("\n1️⃣  연결 테스트...")
        result = self._make_request('GET', '/myself')
        if result['status'] == 200:
            print(f"   ✅ 연결 성공! ({result['data'].get('displayName')})")
            return True
        else:
            print(f"   ❌ 연결 실패")
            return False
    
    def create_issue(self):
        """이슈 생성"""
        print("\n2️⃣  이슈 생성 시도...")
        body = {
            'fields': {
                'project': {'key': self.project_key},
                'summary': f'🚀 Phase 1 개발 시작 - {datetime.now().strftime("%Y-%m-%d")}',
                'description': 'AWS 인프라 기초 구축: EC2, RDS, Node.js 환경 설정',
                'issuetype': {'name': 'Story'}
            }
        }
        
        result = self._make_request('POST', '/issues', body)
        if result['status'] == 201:
            issue_key = result['data'].get('key')
            print(f"   ✅ 이슈 생성 성공: {issue_key}")
            print(f"      URL: https://snovaha.atlassian.net/browse/{issue_key}")
            return issue_key
        else:
            print(f"   ❌ 이슈 생성 실패 (status {result['status']})")
            return None

# 테스트 실행
print("\n" + "="*60)
print("🚀 JIRA API 테스트")
print("="*60 + "\n")

jira = JiraTest()

if jira.test_connection():
    jira.create_issue()
else:
    print("\n❌ 연결 실패로 이슈 생성 스킵")

print("\n" + "="*60)
print("✨ 테스트 완료")
print("="*60 + "\n")
