import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
      <div className="max-w-3xl mx-auto px-6 py-12 flex-1">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 mb-8">
          <ArrowLeft className="w-4 h-4" /> 돌아가기
        </Link>

        <h1 className="text-3xl font-bold text-zinc-900 mb-2">이용약관</h1>
        <p className="text-sm text-zinc-400 mb-8">최종 수정일: 2026년 3월 1일</p>

        <div className="prose prose-zinc prose-sm max-w-none space-y-6 text-zinc-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">제1조 (목적)</h2>
            <p>본 약관은 ASaaS 출석 관리 시스템(이하 "서비스")의 이용과 관련하여 서비스 제공자와 이용자 간의 권리, 의무 및 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">제2조 (서비스의 내용)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>얼굴 인식 기반 자동 출석 확인</li>
              <li>출결 현황 조회 및 통계 제공</li>
              <li>공결 신청 및 출결 이의 신청</li>
              <li>강의 공지사항 및 Q&A</li>
              <li>수강생 및 강의 관리 (교수/관리자)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">제3조 (이용자의 의무)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>타인의 계정을 무단으로 사용하지 않아야 합니다.</li>
              <li>정확한 본인 정보를 등록해야 하며, 허위 정보 등록 시 서비스 이용이 제한될 수 있습니다.</li>
              <li>출석 인증을 위한 얼굴 사진은 본인의 것이어야 합니다.</li>
              <li>시스템을 악의적으로 이용하거나 비정상적인 방법으로 출석을 조작하는 행위를 금지합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">제4조 (서비스의 중단)</h2>
            <p>시스템 점검, 장비 교체, 천재지변 등 부득이한 사유가 있을 경우 서비스가 일시적으로 중단될 수 있으며, 사전 공지를 원칙으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">제5조 (계정 관리)</h2>
            <p>이용자는 자신의 계정 정보를 안전하게 관리할 의무가 있으며, 계정 도용 또는 비밀번호 유출 시 즉시 관리자에게 신고해야 합니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">제6조 (면책 조항)</h2>
            <p>네트워크 장애, 장치 오작동 등 서비스 제공자의 통제 범위 밖의 사유로 발생한 출석 인증 실패에 대해서는 이의 신청을 통해 처리할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">제7조 (약관의 변경)</h2>
            <p>본 약관은 필요에 따라 변경될 수 있으며, 변경 시 서비스 내 공지를 통해 안내합니다.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
