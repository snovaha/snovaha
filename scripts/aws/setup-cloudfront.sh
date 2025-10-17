#!/bin/bash

# CloudFront 배포 설정 스크립트
# 사용법: ./setup-cloudfront.sh

BUCKET_NAME="1st-birthday-invitation-20251011"
REGION="ap-northeast-2"

echo "☁️  CloudFront 배포 설정을 시작합니다..."

# CloudFront 배포 생성
DISTRIBUTION_CONFIG='{
    "CallerReference": "1st-birthday-'$(date +%s)'",
    "Comment": "돌잔치 초대장 웹사이트 CDN",
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-'$BUCKET_NAME'",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "Compress": true
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-'$BUCKET_NAME'",
                "DomainName": "'$BUCKET_NAME'.s3-website.'$REGION'.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "Enabled": true,
    "DefaultRootObject": "index.html",
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "PriceClass": "PriceClass_100"
}'

echo "🚀 CloudFront 배포 생성 중... (5-15분 소요)"
DISTRIBUTION_ID=$(aws cloudfront create-distribution --distribution-config "$DISTRIBUTION_CONFIG" --query 'Distribution.Id' --output text)

if [ $? -eq 0 ]; then
    echo "✅ CloudFront 배포 생성 완료!"
    echo "📋 배포 ID: $DISTRIBUTION_ID"
    echo ""
    echo "⏳ 배포 상태 확인 중..."
    
    # 배포 상태 확인
    aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.Status' --output text
    
    # CloudFront 도메인 이름 가져오기
    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)
    
    echo ""
    echo "🌐 CloudFront URL: https://$CLOUDFRONT_DOMAIN"
    echo ""
    echo "📝 주의사항:"
    echo "   - CloudFront 배포 완료까지 5-15분 소요"
    echo "   - 완료 후 HTTPS로 안전하게 접속 가능"
    echo "   - 전 세계 빠른 속도로 서비스 제공"
else
    echo "❌ CloudFront 배포 생성 실패"
    echo "AWS 자격 증명 및 권한을 확인해주세요."
fi
