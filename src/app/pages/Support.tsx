import { Link } from "react-router";
import { ArrowLeft, Mail, Clock, MessageSquare } from "lucide-react";

export default function Support() {
  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
      <div className="max-w-3xl mx-auto px-6 py-12 flex-1">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 mb-8">
          <ArrowLeft className="w-4 h-4" /> 돌아가기
        </Link>

        <h1 className="text-3xl font-bold text-zinc-900 mb-2">고객센터</h1>
        <p className="text-sm text-zinc-400 mb-8">ASaaS 시스템 이용 중 문제가 발생하면 아래 안내를 참고해 주세요.</p>

        <div className="space-y-6">
          {/* 연락처 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-5">
              <Mail className="w-5 h-5 text-zinc-400 mb-3" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-zinc-900">이메일 문의</p>
              <p className="text-xs text-zinc-500 mt-1">asaas-support@university.ac.kr</p>
            </div>
            <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-5">
              <Clock className="w-5 h-5 text-zinc-400 mb-3" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-zinc-900">운영 시간</p>
              <p className="text-xs text-zinc-500 mt-1">평일 09:00 ~ 18:00</p>
            </div>
            <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-5">
              <MessageSquare className="w-5 h-5 text-zinc-400 mb-3" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-zinc-900">응답 소요</p>
              <p className="text-xs text-zinc-500 mt-1">접수 후 1~2 영업일 이내</p>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100">
              <h2 className="text-base font-semibold text-zinc-900">자주 묻는 질문</h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {[
                {
                  q: "출석이 정상적으로 인식되지 않았어요.",
                  a: "출결 통계 페이지에서 해당 날짜의 '이의 신청' 버튼을 눌러 증빙 서류와 함께 신청해 주세요. 교수님 검토 후 출결이 변경됩니다.",
                },
                {
                  q: "비밀번호를 잊어버렸어요.",
                  a: "로그인 페이지 하단의 '비밀번호 재설정' 링크를 클릭하여 등록된 이메일로 인증번호를 받은 후 새 비밀번호를 설정할 수 있습니다.",
                },
                {
                  q: "얼굴 사진을 변경하고 싶어요.",
                  a: "마이페이지 > 프로필에서 '사진 변경 요청'을 통해 새 사진을 제출할 수 있습니다. 관리자 승인 후 반영됩니다.",
                },
                {
                  q: "회원 탈퇴는 어떻게 하나요?",
                  a: "마이페이지 하단의 '회원 탈퇴' 버튼을 통해 진행할 수 있습니다. 탈퇴 시 모든 데이터가 삭제되며 복구가 불가합니다.",
                },
                {
                  q: "공결 신청 기한이 있나요?",
                  a: "결석일로부터 7일 이내에 공결 신청을 완료해야 합니다. 기한 초과 시 신청이 제한될 수 있습니다.",
                },
              ].map((faq, i) => (
                <div key={i} className="px-6 py-4">
                  <p className="text-sm font-medium text-zinc-900">Q. {faq.q}</p>
                  <p className="text-sm text-zinc-500 mt-1.5">A. {faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
