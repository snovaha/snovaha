#!/usr/bin/env python3
"""
SNOVAHA Jira 이슈 생성 - 수정된 버전
"""

import os
import json
import base64
import urllib.request
import urllib.error
import ssl
from datetime import datetime

ssl._create_default_https_context = ssl._create_unverified_context

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

host = os.getenv('JIRA_HOST')
email = os.getenv('JIRA_EMAIL')
token = os.getenv('JIRA_API_TOKEN')
project_key = os.getenv('JIRA_PROJECT_KEY')

def make_request(method, path, body=None):
    try:
        url = f"{host}/rest/api/3{path}"
        auth_str = f"{email}:{token}"
        auth_b64 = base64.b64encode(auth_str.encode()).decode()
        
        req = urllib.request.Request(url, method=method)
        req.add_header('Authorization', f'Basic {auth_b64}')
        req.add_header('Content-Type', 'application/json')
        
        if body:
            req.data = json.dumps(body).encode('utf-8')
        
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8')) if e.code != 404 else {'error': '404'}
    except Exception as e:
        return 0, {'error': str(e)}

print("\n" + "="*60)
print("🚀 Jira 이슈 생성")
print("="*60)

# 1. 메타데이터 조회
print("\n1️⃣  프로젝트 메타데이터 조회...")
status, meta = make_request('GET', f'/issue/createmeta?projectKeys={project_key}')

if status == 200:
    print(f"   ✅ 메타데이터 조회 성공")
    
    projects = meta.get('projects', [])
    if projects:
        project = projects[0]
        print(f"   프로젝트: {project.get('name')} ({project.get('key')})")
        
        issue_types = project.get('issuetypes', [])
        print(f"   이슈 타입: {len(issue_types)}개")
        for it in issue_types:
            print(f"      • {it.get('name')} (ID: {it.get('id')})")
        
        # Story 타입 찾기
        story_type = next((it for it in issue_types if it.get('name') == 'Story'), None)
        
        if story_type:
            print(f"\n2️⃣  Story 이슈 생성 중...")
            
            # 이슈 생성
            issue_body = {
                'fields': {
                    'project': {'key': project_key},
                    'summary': f'🚀 Phase 1: AWS 인프라 구축 - {datetime.now().strftime("%Y-%m-%d")}',
                    'description': 'EC2, RDS, Node.js 환경 설정\n\n요구사항:\n• t3.micro EC2 인스턴스\n• PostgreSQL RDS\n• Node.js 20+',
                    'issuetype': {'id': story_type.get('id')}
                }
            }
            
            status, result = make_request('POST', '/issues', issue_body)
            
            if status == 201:
                issue_key = result.get('key')
                print(f"   ✅ 이슈 생성 성공!")
                print(f"   \n   티켓: {issue_key}")
                print(f"   URL: https://snovaha.atlassian.net/browse/{issue_key}")
                print(f"   ID: {result.get('id')}")
            else:
                print(f"   ❌ 이슈 생성 실패 (status {status})")
                print(f"      에러: {result}")
        else:
            print(f"   ❌ Story 타입을 찾을 수 없습니다")
    else:
        print(f"   ❌ 프로젝트를 찾을 수 없습니다")
else:
    print(f"   ❌ 메타데이터 조회 실패 (status {status})")
    print(f"      에러: {meta}")

print("\n" + "="*60 + "\n")
