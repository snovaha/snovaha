#!/usr/bin/env python3
"""
SNOVAHA Jira 디버그 - 프로젝트 정보 확인
"""

import os
import json
import base64
import urllib.request
import urllib.error
import ssl

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

class JiraDebug:
    def __init__(self):
        self.host = os.getenv('JIRA_HOST')
        self.email = os.getenv('JIRA_EMAIL')
        self.token = os.getenv('JIRA_API_TOKEN')
        self.project_key = os.getenv('JIRA_PROJECT_KEY')
    
    def _make_request(self, method, path):
        try:
            url = f"{self.host}/rest/api/3{path}"
            auth_str = f"{self.email}:{self.token}"
            auth_b64 = base64.b64encode(auth_str.encode()).decode()
            
            req = urllib.request.Request(url, method=method)
            req.add_header('Authorization', f'Basic {auth_b64}')
            req.add_header('Content-Type', 'application/json')
            
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            return {'error': e.code, 'message': e.read().decode()[:200]}
        except Exception as e:
            return {'error': str(e)}
    
    def get_projects(self):
        """모든 프로젝트 조회"""
        print("\n📋 모든 프로젝트 조회...")
        result = self._make_request('GET', '/projects')
        
        if isinstance(result, list):
            print(f"   찾은 프로젝트: {len(result)}개")
            for proj in result:
                print(f"   • {proj.get('name')} (Key: {proj.get('key')}, ID: {proj.get('id')})")
            return result
        elif isinstance(result, dict) and result.get('values'):
            print(f"   찾은 프로젝트: {len(result.get('values', []))}개")
            for proj in result.get('values', []):
                print(f"   • {proj.get('name')} (Key: {proj.get('key')}, ID: {proj.get('id')})")
            return result.get('values', [])
        else:
            print(f"   ❌ 에러: {result}")
            return []
    
    def get_project_detail(self, project_key):
        """특정 프로젝트 상세 정보"""
        print(f"\n🔍 프로젝트 '{project_key}' 상세 정보...")
        result = self._make_request('GET', f'/projects/{project_key}')
        
        if 'error' not in result:
            print(f"   프로젝트 이름: {result.get('name')}")
            print(f"   프로젝트 ID: {result.get('id')}")
            print(f"   프로젝트 유형: {result.get('projectTypeKey')}")
            print(f"   프로젝트 키: {result.get('key')}")
            
            # 이슈 타입 확인
            issue_types = result.get('issueTypes', [])
            print(f"   사용 가능한 이슈 타입: {len(issue_types)}개")
            for it in issue_types:
                print(f"      • {it.get('name')} (ID: {it.get('id')})")
            
            return result
        else:
            print(f"   ❌ 에러: {result}")
            return None
    
    def get_issue_types(self):
        """모든 이슈 타입 조회"""
        print(f"\n📌 모든 이슈 타입...")
        result = self._make_request('GET', '/issuetypes')
        
        if isinstance(result, list):
            print(f"   찾은 이슈 타입: {len(result)}개")
            for it in result:
                print(f"   • {it.get('name')} (ID: {it.get('id')})")
            return result
        else:
            print(f"   ❌ 에러: {result}")
            return []

# 실행
print("\n" + "="*60)
print("🔧 JIRA 디버그")
print("="*60)

jira = JiraDebug()

print(f"\n설정값:")
print(f"  Host: {jira.host}")
print(f"  Email: {jira.email}")
print(f"  Project Key: {jira.project_key}")

jira.get_projects()
jira.get_project_detail(jira.project_key)
jira.get_issue_types()

print("\n" + "="*60 + "\n")
