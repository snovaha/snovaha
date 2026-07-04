#!/usr/bin/env python3
"""
SNOVAHA Integration Manager
Jira, Slack, Notion 자동화 관리
"""

import os
import sys
import json
import base64
import urllib.request
import urllib.error
import ssl
from datetime import datetime

# SSL 검증 무시
ssl._create_default_https_context = ssl._create_unverified_context

# .env 파일에서 환경변수 수동 로드
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

class JiraAPI:
    """Jira API 연동"""
    
    def __init__(self):
        self.host = os.getenv('JIRA_HOST')
        self.email = os.getenv('JIRA_EMAIL')
        self.token = os.getenv('JIRA_API_TOKEN')
        self.project_key = os.getenv('JIRA_PROJECT_KEY')
    
    def _make_request(self, method, path, body=None):
        """HTTPS 요청 실행"""
        try:
            url = f"{self.host}/rest/api/3{path}"
            auth_str = f"{self.email}:{self.token}"
            auth_bytes = auth_str.encode('ascii')
            auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
            
            req = urllib.request.Request(url, method=method)
            req.add_header('Authorization', f'Basic {auth_b64}')
            req.add_header('Content-Type', 'application/json')
            req.add_header('Accept', 'application/json')
            
            if body:
                req.data = json.dumps(body).encode('utf-8')
            
            with urllib.request.urlopen(req) as response:
                data = response.read().decode('utf-8')
                print(f"DEBUG: Raw response: {data[:200] if data else 'EMPTY'}")
                return {
                    'status': response.status,
                    'data': json.loads(data) if data and data.strip() else {}
                }
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            print(f"DEBUG: HTTP Error {e.code}: {error_body[:200] if error_body else 'EMPTY'}")
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
    
    def test_connection(self):
        """Jira 연결 테스트"""
        try:
            print(f"DEBUG: Jira Host: {self.host}")
            print(f"DEBUG: Jira Email: {self.email}")
            result = self._make_request('GET', '/myself')
            print(f"DEBUG: Response status: {result.get('status')}")
            print(f"DEBUG: Response data: {result.get('data', result.get('error'))}")
            if result['status'] == 200:
                print(f"✅ Jira 연결 성공! ({result['data'].get('displayName', 'Unknown')})")
                return True
            else:
                print(f"❌ Jira 연결 실패: {result['status']}")
                return False
        except Exception as e:
            print(f"❌ Jira 에러: {str(e)}")
            return False
    
    def create_ticket(self, summary, description, issue_type='Story'):
        """Jira 티켓 생성"""
        try:
            body = {
                'fields': {
                    'project': {'key': self.project_key},
                    'summary': summary,
                    'description': {
                        'type': 'doc',
                        'version': 3,
                        'content': [
                            {
                                'type': 'paragraph',
                                'content': [
                                    {
                                        'type': 'text',
                                        'text': description
                                    }
                                ]
                            }
                        ]
                    },
                    'issuetype': {'name': issue_type}
                }
            }
            
            result = self._make_request('POST', '/issues', body)
            print(f"DEBUG Jira POST: status={result.get('status')}, data={str(result.get('data'))[:200]}")
            if result['status'] == 201:
                ticket_key = result['data'].get('key')
                print(f"✅ Jira 티켓 생성: {ticket_key}")
                return ticket_key
            else:
                error_msg = result.get('data', {})
                if isinstance(error_msg, dict):
                    error_msg = error_msg.get('errorMessages', error_msg)
                print(f"❌ 티켓 생성 실패 (status {result['status']}): {error_msg}")
                return None
        except Exception as e:
            print(f"❌ Jira 티켓 생성 에러: {str(e)}")
            return None


class SlackAPI:
    """Slack API 연동"""
    
    def __init__(self):
        self.token = os.getenv('SLACK_BOT_TOKEN')
        self.channel_id = os.getenv('SLACK_CHANNEL_ID')
        self.base_url = 'https://slack.com/api'
    
    def _make_request(self, method, endpoint, body=None):
        """HTTP 요청 실행"""
        try:
            url = f"{self.base_url}{endpoint}"
            req = urllib.request.Request(url, method=method)
            req.add_header('Authorization', f'Bearer {self.token}')
            req.add_header('Content-Type', 'application/json')
            
            if body:
                req.data = json.dumps(body).encode('utf-8')
            
            with urllib.request.urlopen(req) as response:
                data = response.read().decode('utf-8')
                return json.loads(data)
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            return json.loads(error_body) if error_body else {'ok': False, 'error': str(e)}
        except Exception as e:
            return {'ok': False, 'error': str(e)}
    
    def test_connection(self):
        """Slack 연결 테스트"""
        try:
            result = self._make_request('POST', '/auth.test')
            if result.get('ok'):
                print(f"✅ Slack 연결 성공! ({result.get('user_id', 'Unknown')})")
                return True
            else:
                print(f"❌ Slack 연결 실패: {result.get('error', 'Unknown error')}")
                return False
        except Exception as e:
            print(f"❌ Slack 에러: {str(e)}")
            return False
    
    def send_message(self, text, blocks=None):
        """메시지 발송"""
        try:
            payload = {
                'channel': self.channel_id,
                'text': text
            }
            if blocks:
                payload['blocks'] = blocks
            
            result = self._make_request('POST', '/chat.postMessage', payload)
            if result.get('ok'):
                print("✅ Slack 메시지 발송 성공")
                return result.get('ts')
            else:
                print(f"❌ Slack 메시지 발송 실패: {result.get('error', 'Unknown error')}")
                return None
        except Exception as e:
            print(f"❌ Slack 메시지 발송 에러: {str(e)}")
            return None
    
    def send_progress_update(self, phase, status, details):
        """진행 상황 업데이트 발송"""
        emoji_map = {
            'completed': '✅',
            'in-progress': '🔄',
            'pending': '⏳'
        }
        emoji = emoji_map.get(status, '⏳')
        
        blocks = [
            {
                'type': 'section',
                'text': {
                    'type': 'mrkdwn',
                    'text': f"{emoji} *{phase}* - {status.upper()}"
                }
            },
            {
                'type': 'section',
                'text': {
                    'type': 'mrkdwn',
                    'text': details
                }
            }
        ]
        
        return self.send_message(f"{phase} 업데이트", blocks)


class NotionAPI:
    """Notion API 연동"""
    
    def __init__(self):
        self.api_key = os.getenv('NOTION_API_KEY')
        self.base_url = 'https://api.notion.com'
        self.version = '2022-06-28'
    
    def _make_request(self, method, path, body=None):
        """HTTP 요청 실행"""
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
                'data': json.loads(error_body) if error_body else {'error': str(e)}
            }
        except Exception as e:
            return {
                'status': 0,
                'error': str(e)
            }
    
    def test_connection(self):
        """Notion 연결 테스트"""
        try:
            result = self._make_request('GET', '/users/me')
            if result['status'] == 200:
                print("✅ Notion 연결 성공!")
                return True
            else:
                print(f"❌ Notion 연결 실패: {result['status']}")
                return False
        except Exception as e:
            print(f"❌ Notion 에러: {str(e)}")
            return False

    def add_page_content(self, databaseId, title, properties):
        """Notion 데이터베이스에 새 페이지 추가 및 콘텐츠 작성"""
        try:
            body = {
                "parent": {"database_id": databaseId},
                "properties": properties,
                "children": [
                    {
                        "object": "block",
                        "type": "heading_1",
                        "heading_1": {
                            "rich_text": [{"type": "text", "text": {"content": title}}]
                        }
                    }
                ]
            }
            result = self._make_request('POST', '/pages', body)
            if result['status'] == 200:
                page_id = result['data'].get('id')
                print(f"✅ Notion 페이지 생성: {page_id}")
                return page_id
            else:
                error_msg = result.get('data', {})
                if isinstance(error_msg, dict) and 'message' in error_msg:
                    error_msg = error_msg.get('message')
                print(f"❌ Notion 페이지 생성 실패 (status {result['status']}): {error_msg}")
                return None
        except Exception as e:
            print(f"❌ Notion 페이지 생성 에러: {str(e)}")
            return None


def test_all_connections():
    """모든 서비스 연결 테스트"""
    print("\n🔗 === SNOVAHA Integration Test ===\n")
    
    jira = JiraAPI()
    slack = SlackAPI()
    notion = NotionAPI()
    
    print("Jira 테스트 중...")
    jira_ok = jira.test_connection()
    
    print("\nSlack 테스트 중...")
    slack_ok = slack.test_connection()
    
    print("\nNotion 테스트 중...")
    notion_ok = notion.test_connection()
    
    print("\n📊 테스트 결과:")
    print(f"Jira:   {'✅ 연결됨' if jira_ok else '❌ 연결 안 됨'}")
    print(f"Slack:  {'✅ 연결됨' if slack_ok else '❌ 연결 안 됨'}")
    print(f"Notion: {'✅ 연결됨' if notion_ok else '❌ 연결 안 됨'}\n")
    
    if slack_ok and notion_ok:
        print("✅ Slack과 Notion 연결 성공!")
        
        print("\n📨 Slack 채널에 데모 메시지 발송 중...")
        slack.send_progress_update(
            'SNOVAHA DevBot',
            'completed',
            '✅ 모든 Integration 테스트 완료!\n• Slack: 연결됨\n• Notion: 연결됨\n' + 
            ('• Jira: 연결됨\n' if jira_ok else '• Jira: 이메일 확인 필요\n') +
            f'시간: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}'
        )
        
        if not jira_ok:
            print("\n⚠️  Jira 연결 문제:")
            print("  1. https://snovaha.atlassian.net 에서 당신의 이메일 확인")
            print("  2. .env 파일의 JIRA_EMAIL을 올바른 이메일로 변경")
            print("  3. 다시 테스트 실행")
        
        return True
    else:
        print("⚠️  Slack 또는 Notion 연결에 문제가 있습니다.")
        return False


if __name__ == '__main__':
    # 먼저 연결 테스트
    print("\n" + "="*50)
    print("1️⃣  CONNECTION TEST")
    print("="*50)
    test_all_connections()
    
    # 이제 데모 시작
    print("\n" + "="*50)
    print("2️⃣  DEMO: Jira + Notion 자동화 테스트")
    print("="*50 + "\n")
    
    jira = JiraAPI()
    notion = NotionAPI()
    
    # Jira에 테스트 티켓 생성
    print("📝 Jira 티켓 생성 중...")
    ticket_key = jira.create_ticket(
        summary="Phase 1: AWS 인프라 구축 (EC2/RDS)",
        description="초대장 서비스를 위한 기본 인프라 셋업\n\n요구사항:\n- EC2 인스턴스 (t3.micro)\n- RDS PostgreSQL (db.t3.micro)\n- Node.js 20+ 환경 설정\n- 데이터베이스 스키마 생성",
        issue_type="Story"
    )
    
    if ticket_key:
        print(f"\n✅ Jira 티켓 성공적으로 생성됨: {ticket_key}")
        print(f"   URL: https://snovaha.atlassian.net/browse/{ticket_key}")
    
    print("\n" + "-"*50 + "\n")
    
    # Notion에 문서 작성
    print("📄 Notion 문서 작성 중...")
    notion_page_id = notion.add_page_content(
        databaseId="2901a4ad823b81ed80b2c04ad87e6e2c",
        title="🚀 Phase 1 개발 로그",
        properties={
            "Status": {
                "select": {"name": "In Progress"}
            },
            "Date": {
                "date": {"start": datetime.now().strftime("%Y-%m-%d")}
            }
        }
    )
    
    if notion_page_id:
        print(f"\n✅ Notion 문서 성공적으로 작성됨")
        print(f"   ID: {notion_page_id}")
        print(f"   URL: https://www.notion.so/{notion_page_id.replace('-', '')}")
    
    print("\n" + "="*50)
    print("✨ 데모 완료!")
    print("="*50 + "\n")
