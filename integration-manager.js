/**
 * SNOVAHA Integration Manager
 * Jira, Slack, Notion 자동화 관리
 */

require('dotenv').config();
const https = require('https');

// ============================================
// 1️⃣ JIRA API 클래스
// ============================================
class JiraAPI {
  constructor() {
    this.host = process.env.JIRA_HOST;
    this.email = process.env.JIRA_EMAIL;
    this.token = process.env.JIRA_API_TOKEN;
    this.projectKey = process.env.JIRA_PROJECT_KEY;
  }

  async makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const auth = Buffer.from(`${this.email}:${this.token}`).toString('base64');
      const url = new URL(path, this.host);

      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  async testConnection() {
    try {
      const result = await this.makeRequest('GET', '/rest/api/3/myself');
      if (result.status === 200) {
        console.log('✅ Jira 연결 성공!', result.data.displayName);
        return true;
      }
      console.log('❌ Jira 연결 실패:', result.status);
      return false;
    } catch (error) {
      console.error('❌ Jira 에러:', error.message);
      return false;
    }
  }

  async createTicket(summary, description, issueType = 'Story') {
    try {
      const body = {
        fields: {
          project: { key: this.projectKey },
          summary: summary,
          description: {
            type: 'doc',
            version: 3,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: description
                  }
                ]
              }
            ]
          },
          issuetype: { name: issueType }
        }
      };

      const result = await this.makeRequest('POST', '/rest/api/3/issues', body);
      if (result.status === 201) {
        console.log(`✅ Jira 티켓 생성: ${result.data.key}`);
        return result.data.key;
      }
      console.log('❌ 티켓 생성 실패:', result.data);
      return null;
    } catch (error) {
      console.error('❌ Jira 티켓 생성 에러:', error.message);
      return null;
    }
  }

  async updateTicketStatus(issueKey, status) {
    try {
      // 먼저 전이 가능한 상태 확인
      const transitionsResult = await this.makeRequest(
        'GET',
        `/rest/api/3/issues/${issueKey}/transitions`
      );

      if (transitionsResult.status !== 200) {
        console.log('❌ 전이 상태 조회 실패');
        return false;
      }

      const targetTransition = transitionsResult.data.transitions.find(t => 
        t.to.name.toLowerCase() === status.toLowerCase()
      );

      if (!targetTransition) {
        console.log(`❌ 상태 "${status}"로 전이 불가능`);
        return false;
      }

      const updateResult = await this.makeRequest(
        'POST',
        `/rest/api/3/issues/${issueKey}/transitions`,
        { transition: { id: targetTransition.id } }
      );

      if (updateResult.status === 204) {
        console.log(`✅ ${issueKey} 상태 변경: ${status}`);
        return true;
      }
      console.log('❌ 상태 변경 실패:', updateResult.data);
      return false;
    } catch (error) {
      console.error('❌ 상태 변경 에러:', error.message);
      return false;
    }
  }
}

// ============================================
// 2️⃣ SLACK API 클래스
// ============================================
class SlackAPI {
  constructor() {
    this.token = process.env.SLACK_BOT_TOKEN;
    this.channelId = process.env.SLACK_CHANNEL_ID;
  }

  async makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, 'https://slack.com');

      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  async testConnection() {
    try {
      const result = await this.makeRequest('POST', '/api/auth.test');
      if (result.data.ok) {
        console.log('✅ Slack 연결 성공!', result.data.user_id);
        return true;
      }
      console.log('❌ Slack 연결 실패');
      return false;
    } catch (error) {
      console.error('❌ Slack 에러:', error.message);
      return false;
    }
  }

  async sendMessage(text, blocks = null) {
    try {
      const payload = {
        channel: this.channelId,
        text: text
      };

      if (blocks) payload.blocks = blocks;

      const result = await this.makeRequest('POST', '/api/chat.postMessage', payload);
      if (result.data.ok) {
        console.log('✅ Slack 메시지 발송 성공');
        return result.data.ts;
      }
      console.log('❌ Slack 메시지 발송 실패:', result.data);
      return null;
    } catch (error) {
      console.error('❌ Slack 메시지 발송 에러:', error.message);
      return null;
    }
  }

  async sendProgressUpdate(phase, status, details) {
    const emoji = status === 'completed' ? '✅' : status === 'in-progress' ? '🔄' : '⏳';
    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${emoji} *${phase}* - ${status.toUpperCase()}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: details
        }
      }
    ];

    return this.sendMessage(`${phase} 업데이트`, blocks);
  }
}

// ============================================
// 3️⃣ NOTION API 클래스
// ============================================
class NotionAPI {
  constructor() {
    this.apiKey = process.env.NOTION_API_KEY;
  }

  async makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, 'https://api.notion.com');

      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  async testConnection() {
    try {
      const result = await this.makeRequest('GET', '/v1/users/me');
      if (result.status === 200) {
        console.log('✅ Notion 연결 성공!');
        return true;
      }
      console.log('❌ Notion 연결 실패:', result.status);
      return false;
    } catch (error) {
      console.error('❌ Notion 에러:', error.message);
      return false;
    }
  }

  async addPageContent(databaseId, title, properties) {
    try {
      const body = {
        parent: { database_id: databaseId },
        properties: {
          title: {
            title: [
              {
                text: { content: title }
              }
            ]
          },
          ...properties
        }
      };

      const result = await this.makeRequest('POST', '/v1/pages', body);
      if (result.status === 200) {
        console.log('✅ Notion 페이지 생성 성공');
        return result.data.id;
      }
      console.log('❌ Notion 페이지 생성 실패:', result.data);
      return null;
    } catch (error) {
      console.error('❌ Notion 페이지 생성 에러:', error.message);
      return null;
    }
  }
}

// ============================================
// 4️⃣ 통합 테스트 함수
// ============================================
async function testAllConnections() {
  console.log('\n🔗 === SNOVAHA Integration Test ===\n');

  const jira = new JiraAPI();
  const slack = new SlackAPI();
  const notion = new NotionAPI();

  console.log('Jira 테스트 중...');
  const jiraOk = await jira.testConnection();

  console.log('\nSlack 테스트 중...');
  const slackOk = await slack.testConnection();

  console.log('\nNotion 테스트 중...');
  const notionOk = await notion.testConnection();

  console.log('\n📊 테스트 결과:');
  console.log(`Jira:   ${jiraOk ? '✅ 연결됨' : '❌ 연결 안 됨'}`);
  console.log(`Slack:  ${slackOk ? '✅ 연결됨' : '❌ 연결 안 됨'}`);
  console.log(`Notion: ${notionOk ? '✅ 연결됨' : '❌ 연결 안 됨'}\n`);

  if (jiraOk && slackOk && notionOk) {
    console.log('🎉 모든 서비스가 정상 연결되었습니다!');
    
    // 데모: Slack에 테스트 메시지 발송
    console.log('\n📨 Slack에 테스트 메시지 발송 중...');
    await slack.sendProgressUpdate(
      'SNOVAHA DevBot',
      'completed',
      '모든 Integration이 정상적으로 연결되었습니다! ✅'
    );

    return true;
  } else {
    console.log('⚠️  일부 서비스 연결에 문제가 있습니다.');
    return false;
  }
}

// ============================================
// 5️⃣ 메인 실행
// ============================================
if (require.main === module) {
  testAllConnections().catch(console.error);
}

module.exports = { JiraAPI, SlackAPI, NotionAPI };
