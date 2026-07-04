#!/usr/bin/env python3
"""
SNOVAHA Jira Cloud 테스트
"""

import os
import json
import base64
import urllib.request
import urllib.error
import ssl

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

def test_endpoint(path):
    """엔드포인트 테스트"""
    try:
        url = f"{host}/rest/api/3{path}"
        auth_str = f"{email}:{token}"
        auth_b64 = base64.b64encode(auth_str.encode()).decode()
        
        req = urllib.request.Request(url, method='GET')
        req.add_header('Authorization', f'Basic {auth_b64}')
        req.add_header('Content-Type', 'application/json')
        
        with urllib.request.urlopen(req) as response:
            return response.status, "✅ OK"
    except urllib.error.HTTPError as e:
        return e.code, "❌ " + str(e.code)
    except Exception as e:
        return 0, f"❌ {str(e)[:30]}"

print("\n" + "="*60)
print("🔍 Jira API 엔드포인트 테스트")
print("="*60 + "\n")

endpoints = [
    '/myself',
    '/projects',
    '/projects/CCS',
    '/issuetypes',
    '/search?jql=project=CCS',
    '/issue/createmeta?projectKeys=CCS',
]

print("엔드포인트 상태:")
for endpoint in endpoints:
    status, result = test_endpoint(endpoint)
    print(f"  {endpoint:40s} → {result} ({status})")

print("\n💡 해석:")
print("  • /myself: 연결 OK")
print("  • /projects: 404 → API 버전 문제 가능성")
print("  • /issue/createmeta: 이것을 통해 이슈 생성!")

print("\n" + "="*60 + "\n")
