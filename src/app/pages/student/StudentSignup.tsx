import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { User, Hash, Check, ArrowLeft, ArrowRight, Mail, Eye, EyeOff, RefreshCcw, ShieldCheck, Upload, ImagePlus, X, Info, Phone } from "lucide-react";
import { OtpInput } from "../../components/OtpInput";
import { toast } from "sonner";
import { useVerificationTimer } from "../../hooks/useVerificationTimer";
import { sendEmailCode, verifyEmailCode, signupStudent } from "../../api/auth";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

function formatPhone(value: string) {
  const nums = value.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 3) return nums;
  if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
  return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`;
}

/* ------------------------------------------------------------------ */
/*  Face Guideline Images                                              */
/* ------------------------------------------------------------------ */

const faceGuideImages: Record<string, string> = {
  front: "/guideline/정면.png",
  left: "/guideline/좌측.png",
  right: "/guideline/우측.png",
};

function FaceGuide({ angle }: { angle: "front" | "left" | "right" }) {
  return (
    <img
      src={faceGuideImages[angle]}
      alt={angle === "front" ? "정면 가이드" : angle === "left" ? "좌측 가이드" : "우측 가이드"}
      className="w-full h-full object-contain"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function StudentSignup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const timer = useVerificationTimer();

  // Face photos (base64 for preview, File for upload)
  const [photoFiles, setPhotoFiles] = useState<{ front: File | null; left: File | null; right: File | null }>({
    front: null,
    left: null,
    right: null,
  });
  const [photos, setPhotos] = useState<{ front: string | null; left: string | null; right: string | null }>({
    front: null,
    left: null,
    right: null,
  });
  const [isFaceAuthenticated, setIsFaceAuthenticated] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    left: useRef<HTMLInputElement>(null),
    right: useRef<HTMLInputElement>(null),
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId.length !== 9) {
      toast.error("학번은 9자리여야 합니다.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }
    setStep(2);
  };

  const sendVerificationCode = async () => {
    if (!email.includes("@")) {
      toast.error("잘못된 이메일 형식입니다");
      return;
    }

    setLoading(true);
    try {
      await sendEmailCode(email);
      setSentCode("sent");
      setVerificationCode("");
      timer.start();
      toast.success("인증번호가 이메일로 전송되었습니다.");
    } catch (err: any) {
      toast.error(err.message || "인증번호 전송 오류");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (timer.expired) {
      toast.error("인증번호가 만료되었습니다. 재전송해 주세요.");
      return;
    }
    try {
      await verifyEmailCode(email, verificationCode);
      timer.clear();
      setIsEmailVerified(true);
      toast.success("인증 완료되었습니다");
    } catch (err: any) {
      toast.error(err.message || "인증번호가 일치하지 않습니다");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "front" | "left" | "right") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    // File 객체 저장 (API 전송용)
    setPhotoFiles(prev => ({ ...prev, [type]: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let MAX_WIDTH = 400;
        let scaleSize = 1;
        if (img.width > MAX_WIDTH) {
          scaleSize = MAX_WIDTH / img.width;
        } else {
          MAX_WIDTH = img.width;
        }

        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);

        setPhotos(prev => ({ ...prev, [type]: compressedBase64 }));
        setIsFaceAuthenticated(false);
        toast.success(`${type === "front" ? "정면" : type === "left" ? "좌측" : "우측"} 사진이 등록되었습니다`);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const removePhoto = (type: "front" | "left" | "right") => {
    setPhotos(prev => ({ ...prev, [type]: null }));
    setPhotoFiles(prev => ({ ...prev, [type]: null }));
    setIsFaceAuthenticated(false);
  };

  const handleAuthenticateFace = async () => {
    if (!photos.front || !photos.left || !photos.right) {
      toast.error("3장의 사진을 모두 등록해주세요");
      return;
    }

    setAuthenticating(true);
    setTimeout(() => {
      setAuthenticating(false);
      setIsFaceAuthenticated(true);
      toast.success("얼굴 인증 및 모델 생성이 완료되었습니다");
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailVerified) {
      toast.error("이메일 인증이 필요합니다");
      return;
    }

    if (!photoFiles.front || !photoFiles.left || !photoFiles.right) {
      toast.error("얼굴 사진 3장을 모두 등록해주세요");
      return;
    }

    if (!isFaceAuthenticated) {
      toast.error("얼굴 인증을 먼저 진행해주세요");
      return;
    }

    setLoading(true);
    try {
      await signupStudent(
        studentId,
        name,
        email,
        password,
        phone,
        photoFiles.left,
        photoFiles.front,
        photoFiles.right,
      );
      toast.success("회원가입이 완료되었습니다. 얼굴 사진은 관리자 승인 후 반영됩니다.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "회원가입 오류");
    } finally {
      setLoading(false);
    }
  };

  const uploadedCount = [photos.front, photos.left, photos.right].filter(Boolean).length;

  const inputClass = "w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-zinc-300";
  const inputErrorClass = "w-full rounded-xl border border-rose-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all placeholder:text-zinc-300";

  const photoSlots: { type: "front" | "left" | "right"; label: string; desc: string }[] = [
    { type: "front", label: "정면", desc: "카메라를 정면으로 바라봐 주세요" },
    { type: "left", label: "좌측 45°", desc: "고개를 좌측으로 돌려주세요" },
    { type: "right", label: "우측 45°", desc: "고개를 우측으로 돌려주세요" },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#F8FAF9] dark:bg-[#09090b] py-12 px-4 sm:px-6 flex flex-col items-center justify-start">

      <div className="max-w-2xl w-full mx-auto mt-8">

        {/* Role Badge & Step Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="flex items-center justify-between mb-5"
        >
          <span className="text-xs font-medium text-zinc-900 bg-primary px-3 py-1 rounded-full">
            학생 회원가입
          </span>
          <div className="flex items-center gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full transition-colors ${step === s
                  ? "bg-primary text-white"
                  : step > s
                    ? "bg-primary/20 text-primary-dark"
                    : "bg-zinc-100 text-zinc-400"
                  }`}
              >
                {step > s ? <Check className="w-3 h-3" strokeWidth={1.5} /> : null}
                {s === 1 ? "정보 입력" : "얼굴 등록"}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <div className="bg-white rounded-xl border border-zinc-200 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] overflow-hidden">

            {/* Header */}
            <div className="bg-primary px-8 py-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <h2 className="text-2xl font-bold tracking-tight text-white relative z-10">
                {step === 1 ? "기본 정보 입력" : "얼굴 사진 등록"}
              </h2>
              <p className="text-primary/60 text-sm mt-1 relative z-10">
                {step === 1 ? "개인 정보를 입력해 주세요." : "얼굴 인식을 위한 사진 파일을 등록해 주세요."}
              </p>
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={spring}
                    onSubmit={handleNextStep}
                    className="space-y-5"
                  >

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">이름</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                          <input
                            placeholder="홍길동"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`${inputClass} pl-10`}
                            required
                          />
                        </div>
                      </div>

                      {/* Student ID */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">학번</label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                          <input
                            placeholder="예: 202400001"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value.replace(/\D/g, '').slice(0, 9))}
                            maxLength={9}
                            className={`${studentId.length > 0 && studentId.length !== 9 ? inputErrorClass : inputClass} pl-10`}
                            required
                          />
                        </div>
                        {studentId.length > 0 && studentId.length !== 9 && (
                          <p className="text-xs text-rose-500 mt-1">학번은 9자리 숫자로 입력해주세요.</p>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">전화번호</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                        <input
                          type="tel"
                          placeholder="010-1234-5678"
                          value={phone}
                          onChange={(e) => setPhone(formatPhone(e.target.value))}
                          maxLength={13}
                          className={`${phone.length > 0 && phone.replace(/-/g, '').length < 10 ? inputErrorClass : inputClass} pl-10`}
                          required
                        />
                      </div>
                      {phone.length > 0 && phone.replace(/-/g, '').length < 10 && (
                        <p className="text-xs text-rose-500 mt-1">전화번호를 올바르게 입력해주세요.</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">학교 이메일</label>
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                          <input
                            type="email"
                            placeholder="학번@sangmyung.kr"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`${inputClass} pl-10 disabled:opacity-50 disabled:bg-zinc-50`}
                            required
                            disabled={isEmailVerified}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={sendVerificationCode}
                          disabled={loading || isEmailVerified}
                          className={`text-sm font-medium px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 whitespace-nowrap ${isEmailVerified
                            ? "bg-primary/10 text-primary-dark border border-primary"
                            : "bg-primary text-white hover:bg-primary-hover"
                            }`}
                        >
                          {isEmailVerified ? (
                            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" strokeWidth={1.5} /> 인증됨</span>
                          ) : sentCode ? "인증번호 재전송" : "인증번호 전송"}
                        </button>
                      </div>
                    </div>

                    {/* Verification Code */}
                    {sentCode && !isEmailVerified && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={spring}
                        className="bg-primary/10 border border-primary rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-medium text-primary-dark">인증번호 입력</label>
                          <span className={`text-xs font-mono font-semibold ${timer.expired ? "text-rose-500" : timer.timeLeft <= 30 ? "text-amber-500" : "text-primary-dark"}`}>
                            {timer.expired ? "만료됨" : timer.formatted}
                          </span>
                        </div>
                        <OtpInput value={verificationCode} onChange={setVerificationCode} disabled={timer.expired} accentColor="primary" />
                        <div className="flex justify-center mt-3">
                          {!timer.expired ? (
                            <button
                              type="button"
                              onClick={verifyCode}
                              className="bg-primary text-white text-sm font-medium px-8 py-2.5 rounded-xl hover:bg-primary-hover transition-colors"
                            >
                              확인
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={sendVerificationCode}
                              disabled={loading}
                              className="bg-primary text-white text-sm font-medium px-8 py-2.5 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
                            >
                              재전송
                            </button>
                          )}
                        </div>
                        {timer.expired && (
                          <p className="text-xs text-rose-500 mt-2">인증번호가 만료되었습니다. 재전송해 주세요.</p>
                        )}
                      </motion.div>
                    )}

                    {/* Passwords */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">비밀번호</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="최소 8자"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            className={`${inputClass} pr-10`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                          >
                            {showPassword ? <Eye className="w-4 h-4" strokeWidth={1.5} /> : <EyeOff className="w-4 h-4" strokeWidth={1.5} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">비밀번호 확인</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="비밀번호 재입력"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            minLength={8}
                            className={`${confirmPassword && password !== confirmPassword ? inputErrorClass : inputClass} pr-10`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                          >
                            {showConfirmPassword ? <Eye className="w-4 h-4" strokeWidth={1.5} /> : <EyeOff className="w-4 h-4" strokeWidth={1.5} />}
                          </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                          <p className="text-xs text-rose-500 mt-1">비밀번호가 일치하지 않습니다.</p>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 bg-primary text-white text-sm font-medium px-5 py-3 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      disabled={!isEmailVerified}
                    >
                      다음 단계 <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={spring}
                    className="space-y-6"
                  >
                    {/* Guidelines Info */}
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex gap-3">
                      <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div className="space-y-1.5">
                        <p className="text-sm font-medium text-sky-800">촬영 가이드라인</p>
                        <ul className="text-xs text-sky-700 space-y-1 leading-relaxed">
                          <li>- 주변에 사람이 없는 밝은 곳에서 촬영한 사진을 사용해주세요</li>
                          <li>- 얼굴이 사진의 중앙에 위치하도록 해주세요</li>
                          <li>- 모자, 선글라스 등 얼굴을 가리는 액세서리를 제거해주세요</li>
                          <li>- JPG, PNG 형식 / 10MB 이하 파일만 업로드 가능합니다</li>
                          <li>- 등록된 사진은 <strong>관리자 승인 후</strong> 프로필에 반영됩니다</li>
                        </ul>
                      </div>
                    </div>

                    {/* Upload progress */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-700">사진 등록 현황</span>
                      <span className="text-sm text-zinc-400">
                        <span className={`font-semibold ${uploadedCount === 3 ? "text-primary-dark" : "text-zinc-700"}`}>{uploadedCount}</span> / 3장
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="bg-primary h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(uploadedCount / 3) * 100}%` }}
                        transition={spring}
                      />
                    </div>

                    {/* Photo Upload Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {photoSlots.map(({ type, label, desc }, index) => (
                        <motion.div
                          key={type}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...spring, delay: index * 0.08 }}
                          className="flex flex-col"
                        >
                          {/* Hidden file input */}
                          <input
                            ref={fileInputRefs[type]}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handleFileUpload(e, type)}
                            className="hidden"
                          />

                          {photos[type] ? (
                            /* Uploaded state */
                            <div className="relative group rounded-xl border border-primary bg-zinc-900 aspect-[3/4] overflow-hidden">
                              <img
                                src={photos[type]!}
                                alt={label}
                                className="w-full h-full object-cover"
                              />
                              {/* Success badge */}
                              <div className="absolute top-2 right-2 bg-primary p-1 rounded-md shadow-sm">
                                <Check className="w-3 h-3 text-white" strokeWidth={2} />
                              </div>
                              {/* Hover overlay */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => fileInputRefs[type].current?.click()}
                                  className="p-2.5 bg-white/90 rounded-xl hover:bg-white transition-colors"
                                  title="다시 선택"
                                >
                                  <RefreshCcw className="w-4 h-4 text-zinc-700" strokeWidth={1.5} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removePhoto(type)}
                                  className="p-2.5 bg-white/90 rounded-xl hover:bg-white transition-colors"
                                  title="삭제"
                                >
                                  <X className="w-4 h-4 text-rose-500" strokeWidth={1.5} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Empty state with guideline */
                            <button
                              type="button"
                              onClick={() => fileInputRefs[type].current?.click()}
                              className="relative rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 aspect-[3/4] overflow-hidden cursor-pointer transition-all hover:border-primary hover:bg-primary/10/30 group flex flex-col items-center justify-center"
                            >
                              {/* Guideline illustration */}
                              <div className="w-24 h-28 opacity-40 group-hover:opacity-60 transition-opacity mb-2">
                                <FaceGuide angle={type} />
                              </div>

                              {/* Upload prompt */}
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-8 h-8 rounded-lg bg-zinc-100 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                                  <ImagePlus className="w-4 h-4 text-zinc-400 group-hover:text-primary-dark transition-colors" strokeWidth={1.5} />
                                </div>
                                <span className="text-[11px] font-medium text-zinc-400 group-hover:text-primary-dark transition-colors">
                                  파일 선택
                                </span>
                              </div>
                            </button>
                          )}

                          {/* Label */}
                          <div className="mt-2 text-center">
                            <p className="text-xs font-semibold text-zinc-700">{label}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-5 border-t border-zinc-100">
                      {!isFaceAuthenticated ? (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex items-center justify-center gap-1.5 flex-1 py-2.5 bg-white border border-zinc-200 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-50 transition-colors"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} /> 이전
                          </button>
                          <button
                            type="button"
                            onClick={handleAuthenticateFace}
                            disabled={uploadedCount < 3 || authenticating}
                            className="flex-[2] py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {authenticating ? <RefreshCcw className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />}
                            {authenticating ? "얼굴 모델 분석 중..." : "얼굴 인증 및 모델 생성"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div className="bg-primary/10 border border-primary rounded-xl p-3.5 flex items-center justify-center gap-2.5">
                            <ShieldCheck className="w-5 h-5 text-primary-dark" strokeWidth={1.5} />
                            <span className="text-sm font-medium text-primary-dark">인증 완료 (생체 데이터 생성됨)</span>
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setIsFaceAuthenticated(false)}
                              className="flex-1 py-2.5 bg-white border border-zinc-200 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-50 transition-colors"
                            >
                              재등록
                            </button>
                            <button
                              type="button"
                              onClick={handleSubmit}
                              disabled={loading}
                              className="flex-[2] py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {loading ? "처리 중..." : "가입 완료"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-5 text-center">
            <Link to="/login" className="text-sm text-zinc-400 hover:text-primary-dark transition-colors">
              가입 취소 및 로그인으로 돌아가기
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
