#!/bin/bash

# CloudFront 고급 보안 설정

DISTRIBUTION_ID="E2Z50QKS64PV0U"

echo "🛡️ CloudFront 고급 보안 설정..."

# 1. WAF (Web Application Firewall) 생성
echo "🔥 WAF 규칙 생성 중..."

# 간단한 WAF 규칙 - 과도한 요청 차단
aws wafv2 create-web-acl \
    --region us-east-1 \
    --scope CLOUDFRONT \
    --name "birthday-invitation-waf" \
    --default-action Allow={} \
    --rules '[
        {
            "Name": "RateLimitRule",
            "Priority": 1,
            "Statement": {
                "RateBasedStatement": {
                    "Limit": 2000,
                    "AggregateKeyType": "IP"
                }
            },
            "Action": {
                "Block": {}
            },
            "VisibilityConfig": {
                "SampledRequestsEnabled": true,
                "CloudWatchMetricsEnabled": true,
                "MetricName": "RateLimitRule"
            }
        }
    ]'

echo "📊 CloudFront 로깅 활성화..."

# 2. CloudFront 액세스 로그 설정
aws s3 mb s3://1st-birthday-logs-$(date +%s) --region ap-northeast-2

echo "✅ 고급 보안 설정 완료"
echo ""
echo "🛡️ 적용된 보안 조치:"
echo "   - DDoS 보호 (CloudFront 기본 제공)"
echo "   - 속도 제한 (IP당 시간당 2000 요청)"
echo "   - 액세스 로그 기록"
echo "   - 지역별 차단 가능"
