import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
      <div className="max-w-3xl mx-auto px-6 py-12 flex-1">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 mb-8">
          <ArrowLeft className="w-4 h-4" /> 돌아가기
        </Link>

        <h1 className="text-3xl font-bold text-zinc-900 mb-2">개인정보처리방침</h1>
        <p className="text-sm text-zinc-400 mb-8">최종 수정일: 2026년 3월 1일</p>

        <div className="prose prose-zinc prose-sm max-w-none space-y-6 text-zinc-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">제1조 (목적)</h2>
            <p>ASaaS(이하 "시스템")는 출석 관리 서비스 제공을 위해 수집하는 개인정보를 관련 법령에 따라 적법하게 처리하고 안전하게 관리합니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">제2조 (수집하는 개인정보)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>필수 항목: 이름, 학번/교번, 이메일, 비밀번호, 전화번호</li>
              <li>선택 항목: 학과 정보</li>
              <li>자동 수집: 접속 로그, IP 주소, 서비스 이용 기록</li>
              <li>얼굴 인식용: 정면·좌측·우측 얼굴 사진 (출석 확인 목적)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">제3조 (개인정보의 이용 목적)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>학생 본인 확인 및 출석 관리</li>
              <li>강의 운영 및 수강생 관리</li>
              <li>공결/이의 신청 처리</li>
              <li>시스템 알림 서비스 제공</li>
              <li>서비스 개선을 위한 통계 분석</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">제4조 (개인정보의 보유 및 파기)</h2>
            <p>수집된 개인정보는 재학 기간 동안 보유하며, 회원 탈퇴 또는 졸업 시 지체 없이 파기합니다. 얼굴 사진 데이터는 해당 학기 종료 후 즉시 삭제됩니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">제5조 (개인정보의 제3자 제공)</h2>
            <p>본 시스템은 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 의해 요구되는 경우는 예외로 합니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">제6조 (이용자의 권리)</h2>
            <p>이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있으며, 회원 탈퇴를 통해 개인정보 처리 정지를 요청할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">제7조 (개인정보 보호 책임자)</h2>
            <p>개인정보 보호 관련 문의는 아래 연락처로 문의해 주시기 바랍니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>담당부서: 시스템 관리팀</li>
              <li>이메일: asaas-support@university.ac.kr</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
