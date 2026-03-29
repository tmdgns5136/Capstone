import { Link } from "react-router";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b]">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-slate-200">404</h1>
        <p className="text-2xl font-semibold text-slate-700 mb-4">
          페이지를 찾을 수 없습니다
        </p>
        <Link to="/">
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    </div>
  );
}
