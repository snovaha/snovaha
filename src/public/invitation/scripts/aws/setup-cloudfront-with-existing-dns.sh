#!/bin/bash

# 호스팅케이알 DNS 유지하면서 CloudFront 연결 스크립트
# 사전 요구사항: 호스팅케이알에서 DNS 레코드 추가 완료

DOMAIN="snovaha.com"
CLOUDFRONT_DOMAIN="d104xm32ar1ns2.cloudfront.net"
DISTRIBUTION_ID="E2Z50QKS64PV0U"

echo "🌐 호스팅케이알 DNS 연동 CloudFront 설정을 시작합니다..."
echo "도메인: $DOMAIN (호스팅케이알 DNS 유지)"

# 1. SSL 인증서 요청 (CloudFront용 - us-east-1 필수)
echo "🔒 SSL 인증서 요청 중..."
CERT_ARN=$(aws acm request-certificate \
    --region us-east-1 \
    --domain-name $DOMAIN \
    --subject-alternative-names "www.$DOMAIN" \
    --validation-method DNS \
    --query 'CertificateArn' \
    --output text)

echo "📋 인증서 ARN: $CERT_ARN"
echo ""

# 2. 인증서 검증 정보 표시
echo "⏳ 인증서 검증 레코드 정보 가져오는 중..."
sleep 15

# 검증 레코드 정보 출력
echo ""
echo "🔍 호스팅케이알에 다음 DNS 레코드를 추가해주세요:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

aws acm describe-certificate \
    --region us-east-1 \
    --certificate-arn $CERT_ARN \
    --query 'Certificate.DomainValidationOptions[].ResourceRecord' \
    --output table

echo ""
echo "📝 호스팅케이알 DNS 설정 방법:"
echo "1. 호스팅케이알 관리자 페이지 → 도메인 관리 → snovaha.com"
echo "2. DNS 관리 또는 네임서버 관리 클릭"
echo "3. 위 표의 각 레코드를 다음과 같이 추가:"
echo ""
echo "   레코드 타입: CNAME"
echo "   호스트명: (Name 필드에서 '.snovaha.com' 제거한 부분)"
echo "   값: (Value 필드 전체)"
echo "   TTL: 300"
echo ""
echo "4. 추가 완료 후 아무 키나 눌러주세요..."
read -p "DNS 레코드 추가 완료 후 Enter를 눌러주세요: "

# 3. 인증서 검증 대기
echo "⏳ SSL 인증서 검증 대기 중... (최대 30분)"
echo "검증 중... 호스팅케이알 DNS 전파를 기다리는 중입니다."

# 타임아웃과 함께 인증서 검증 대기
timeout 1800 aws acm wait certificate-validated --region us-east-1 --certificate-arn $CERT_ARN

if [ $? -eq 0 ]; then
    echo "✅ SSL 인증서 검증 완료!"
else
    echo "⚠️  인증서 검증이 시간 초과되었습니다."
    echo "DNS 레코드 설정을 다시 확인해주세요."
    echo "검증은 백그라운드에서 계속 진행됩니다."
fi

# 4. CloudFront 배포 업데이트
echo "☁️ CloudFront 배포에 사용자 정의 도메인 추가 중..."

# 현재 배포 설정 가져오기
ETAG=$(aws cloudfront get-distribution-config --id $DISTRIBUTION_ID --query 'ETag' --output text)

# 배포 설정 업데이트
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID --query 'DistributionConfig' > /tmp/distribution-config.json

# 사용자 정의 도메인과 SSL 인증서 추가
jq --arg domain "$DOMAIN" --arg cert "$CERT_ARN" '
.Aliases = {
    "Quantity": 2,
    "Items": [$domain, ("www." + $domain)]
} |
.ViewerCertificate = {
    "ACMCertificateArn": $cert,
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021",
    "CertificateSource": "acm"
} |
.Comment = "한우주 돌잔치 초대장 - " + $domain + " (호스팅케이알 DNS)"
' /tmp/distribution-config.json > /tmp/distribution-config-updated.json

aws cloudfront update-distribution \
    --id $DISTRIBUTION_ID \
    --distribution-config file:///tmp/distribution-config-updated.json \
    --if-match $ETAG

echo "✅ CloudFront 배포 업데이트 완료"

# 5. 최종 DNS 레코드 안내
echo ""
echo "🌐 마지막 단계: 도메인 연결 DNS 레코드 추가"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "호스팅케이알에 다음 레코드들을 추가해주세요:"
echo ""
echo "📍 루트 도메인 (snovaha.com):"
echo "   레코드 타입: CNAME"
echo "   호스트명: @"
echo "   값: $CLOUDFRONT_DOMAIN"
echo "   TTL: 300"
echo ""
echo "📍 www 서브도메인:"
echo "   레코드 타입: CNAME"
echo "   호스트명: www"
echo "   값: $CLOUDFRONT_DOMAIN"
echo "   TTL: 300"
echo ""
echo "🎉 설정 완료 후 접속 가능한 URL:"
echo "   - https://$DOMAIN"
echo "   - https://www.$DOMAIN"
echo ""
echo "⏳ 완전 적용까지 15-30분 소요"
echo "📝 DNS 전파까지 최대 24시간 (보통 1-2시간)"
echo ""
echo "🔧 문제 발생 시:"
echo "   - 호스팅케이알 고객센터: 1588-2030"
echo "   - DNS 설정 관련 문의 가능"

# 임시 파일 정리
rm -f /tmp/distribution-config.json /tmp/distribution-config-updated.json

echo ""
echo "✨ 모든 설정이 완료되었습니다!"
