#!/bin/bash

# 보안 강화 설정 스크립트

BUCKET_NAME="1st-birthday-invitation-20251011"

echo "🛡️ S3 보안 강화 설정을 시작합니다..."

# 1. Referer 기반 접근 제한 (특정 도메인에서만 접근 허용)
echo "🔒 도메인 기반 접근 제한 설정 중..."

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObjectWithReferer",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*",
            "Condition": {
                "StringLike": {
                    "aws:Referer": [
                        "https://snovaha.com/*",
                        "https://*.cloudfront.net/*",
                        "http://localhost:*/*"
                    ]
                }
            }
        }
    ]
}'

echo "✅ 보안 정책 업데이트 완료"
echo ""
echo "📝 설정된 보안 조치:"
echo "   - snovaha.com 도메인에서만 접근 허용"
echo "   - CloudFront를 통해서만 접근 허용"
echo "   - 직접 S3 URL 접근 시 차단"
echo "   - 로컬 개발환경 접근 허용"
echo ""
echo "⚠️  주의사항:"
echo "   - 직접 S3 URL로는 접근 불가능해짐"
echo "   - CloudFront나 snovaha.com을 통해서만 접근 가능"
