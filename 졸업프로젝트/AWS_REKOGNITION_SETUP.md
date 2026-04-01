# AWS Rekognition 설정 가이드

이 프로젝트는 얼굴 인식 기능을 위해 Amazon Rekognition을 사용합니다.

## 필요한 것

1. AWS 계정
2. AWS Rekognition API 접근 권한
3. AWS 액세스 키와 시크릿 키

## 설정 단계

### 1. AWS 계정 생성 및 IAM 사용자 설정

1. [AWS Console](https://aws.amazon.com/console/)에 로그인
2. IAM 서비스로 이동
3. 새 사용자 생성 (프로그래밍 방식 액세스 선택)
4. `AmazonRekognitionFullAccess` 권한 부여
5. 액세스 키 ID와 시크릿 액세스 키를 안전하게 저장

### 2. Supabase 환경 변수 설정

Supabase 대시보드에서 다음 환경 변수를 추가하세요:

```
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=ap-northeast-2
```

### 3. 얼굴 인식 API 구현

`/supabase/functions/server/index.tsx` 파일의 `recognize-face` 엔드포인트를 다음과 같이 수정하세요:

```typescript
import { RekognitionClient, CompareFacesCommand } from "npm:@aws-sdk/client-rekognition@3";

const rekognitionClient = new RekognitionClient({
  region: Deno.env.get('AWS_REGION'),
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') || '',
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') || '',
  },
});

app.post("/make-server-08576cb3/recognize-face", async (c) => {
  try {
    const { photo, courseId } = await c.req.json();
    
    // Get enrolled students for this course
    const students = await kv.getByPrefix(`course:${courseId}:students`);
    
    const matches = [];
    
    // Compare captured photo with each student's registered photos
    for (const student of students) {
      const photos = JSON.parse(await kv.get(`user:${student.userId}:photos`));
      
      for (const registeredPhoto of Object.values(photos)) {
        const command = new CompareFacesCommand({
          SourceImage: {
            Bytes: Buffer.from(photo.split(',')[1], 'base64'),
          },
          TargetImage: {
            Bytes: Buffer.from(registeredPhoto.split(',')[1], 'base64'),
          },
          SimilarityThreshold: 80,
        });
        
        const response = await rekognitionClient.send(command);
        
        if (response.FaceMatches && response.FaceMatches.length > 0) {
          matches.push({
            studentId: student.studentId,
            confidence: response.FaceMatches[0].Similarity,
          });
          break; // Match found, no need to check other photos
        }
      }
    }
    
    return c.json({ success: true, matches });
  } catch (error) {
    console.error('Face recognition error:', error);
    return c.text(`Face recognition failed: ${error}`, 500);
  }
});
```

### 4. 필요한 패키지 설치

서버에서 AWS SDK를 사용하려면 다음을 import 하세요:

```typescript
import { RekognitionClient, CompareFacesCommand } from "npm:@aws-sdk/client-rekognition@3";
```

## 비용 고려사항

- AWS Rekognition은 무료 티어를 제공합니다 (첫 12개월)
- 무료 티어: 월 5,000개의 이미지 분석
- 이후 1,000개 이미지당 $1.00

## 보안 주의사항

- **절대** AWS 자격 증명을 코드에 하드코딩하지 마세요
- 환경 변수를 통해서만 자격 증명을 전달하세요
- IAM 사용자에게 최소 권한 원칙을 적용하세요
- 정기적으로 액세스 키를 교체하세요

## 테스트

얼굴 인식이 제대로 작동하는지 확인하려면:

1. 교수 계정으로 로그인
2. "수업 제어" 메뉴로 이동
3. 강의 시작 버튼 클릭
4. 카메라가 학생들의 얼굴을 캡처하는지 확인
5. 실시간 출석 현황이 업데이트되는지 확인

## 문제 해결

### "AccessDenied" 오류
- IAM 사용자에게 Rekognition 권한이 있는지 확인
- AWS 자격 증명이 올바른지 확인

### "InvalidImageFormatException" 오류
- 이미지가 Base64로 올바르게 인코딩되었는지 확인
- 지원되는 이미지 형식(JPEG, PNG)인지 확인

### 낮은 인식률
- 조명이 충분한 환경에서 사진 촬영
- 카메라 해상도 확인
- SimilarityThreshold 값 조정 (기본값 80)

## 대안

AWS Rekognition 대신 다음과 같은 대안을 고려할 수 있습니다:

- **Azure Face API**: Microsoft의 얼굴 인식 서비스
- **Google Cloud Vision API**: Google의 이미지 분석 서비스
- **Face-api.js**: 브라우저에서 실행되는 JavaScript 얼굴 인식 라이브러리 (무료, 오픈소스)

## 참고 자료

- [AWS Rekognition 공식 문서](https://docs.aws.amazon.com/rekognition/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [CompareFaces API Reference](https://docs.aws.amazon.com/rekognition/latest/dg/API_CompareFaces.html)
