import { motion } from "motion/react";
import { Play, Square, Camera, Users, Clock, AlertTriangle, RefreshCcw, ChevronDown, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useClassSimulator } from "../../hooks/useClassSimulator";

const spring = { type: "spring", stiffness: 100, damping: 20 };

export default function ProfessorClassControl() {
  const {
    courses,
    coursesLoading: loading,
    selectedCourse,
    scheduledCourse,
    setSelectedCourse,
    isActive,
    elapsedTime,
    lastCaptureTime,
    attendanceData,
    startSimulation,
    stopSimulation,
    triggerSensorPing,
  } = useClassSimulator();

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading || !selectedCourse) {
    return (
      <div className="max-w-7xl mx-auto pb-10 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-zinc-100 rounded-xl animate-pulse" />
          <div className="h-4 w-96 bg-zinc-100 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-zinc-200  p-6 space-y-3">
              <div className="h-5 w-32 bg-zinc-100 rounded-lg animate-pulse" />
              <div className="h-4 w-24 bg-zinc-100 rounded-lg animate-pulse" />
              <div className="h-4 w-40 bg-zinc-100 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-zinc-200  h-96 animate-pulse" />
          <div className="bg-white rounded-xl border border-zinc-200  h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">실시간 모니터링</h1>
        <p className="text-sm text-zinc-400 mt-1">교탁 앞 카메라가 주기적으로 학생들을 촬영하여 실시간 체류율을 분석합니다.</p>
      </div>

      {/* 현재 강의 */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {scheduledCourse && selectedCourse?.id === scheduledCourse.id ? (
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-xs font-medium text-primary">시간표 자동 감지</span>
              </div>
            ) : scheduledCourse ? (
              <p className="text-xs text-amber-600 font-medium mb-2">수동 선택됨 (시간표: {scheduledCourse.name})</p>
            ) : (
              <p className="text-xs text-zinc-400 mb-2">현재 시간표에 해당하는 강의가 없습니다</p>
            )}
            <h2 className="text-xl font-bold text-zinc-900">{selectedCourse?.name}</h2>
            <p className="text-sm text-zinc-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {selectedCourse?.room} | {selectedCourse?.schedule} | 수강생 {selectedCourse?.students}명
            </p>
          </div>
          <div className="relative">
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <select
              value={selectedCourse?.id ?? ""}
              onChange={(e) => {
                const found = courses.find((c) => c.id === Number(e.target.value));
                if (found) setSelectedCourse(found);
              }}
              disabled={isActive}
              className="rounded-xl border border-zinc-200 bg-white p-3 pr-9 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.id === scheduledCourse?.id ? " (현재 시간표)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Class Control Panel */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Camera Feed Simulator */}
        <Card className="bg-white rounded-xl border border-zinc-200  overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-zinc-100">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <Camera className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
              라즈베리파이 센서 상태
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="relative overflow-hidden bg-zinc-900 rounded-xl aspect-video flex flex-col items-center justify-center text-center p-6">
                {!isActive ? (
                  <>
                    <Camera className="w-12 h-12 text-zinc-600 mb-3" strokeWidth={1.5} />
                    <p className="text-zinc-400 text-sm font-medium">강의를 시작하면 라즈베리파이 카메라가 활성화됩니다</p>
                    <p className="text-zinc-500 text-xs mt-1">웹캠 대신 하드웨어 연동 시뮬레이터가 동작합니다</p>
                  </>
                ) : (
                  <>
                    <RefreshCcw className="w-12 h-12 text-primary-dark mb-3 animate-spin-slow" strokeWidth={1.5} />
                    <p className="text-primary-dark font-semibold text-lg relative z-10">데이터 수신 중...</p>
                    <p className="text-zinc-400 text-xs mt-1 font-mono relative z-10">마지막 스캔: {lastCaptureTime?.toLocaleTimeString()}</p>

                    <div className="absolute top-3 left-3">
                      <Badge className="bg-rose-500/90 text-white rounded-lg border-0 text-xs font-medium px-2.5 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse inline-block" />
                        LIVE
                      </Badge>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                {!isActive ? (
                  <Button onClick={startSimulation} className="flex-1 bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-hover h-12">
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    강의 시작
                  </Button>
                ) : (
                  <>
                    <Button onClick={stopSimulation} className="flex-1 bg-rose-600 text-white text-sm font-medium rounded-xl hover:bg-rose-700 h-12">
                      <Square className="w-4 h-4 mr-2 fill-current" />
                      강의 종료
                    </Button>
                    <Button onClick={triggerSensorPing} className="bg-white text-zinc-700 hover:bg-zinc-50 rounded-xl border border-zinc-200 h-12 px-3">
                      <RefreshCcw className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                  </>
                )}
              </div>

              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={spring}
                  className="p-4 bg-primary/10 rounded-xl border border-primary/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-primary-dark">진행 시간</span>
                    <span className="text-2xl font-bold text-primary-dark tracking-tight font-mono">{formatTime(elapsedTime)}</span>
                  </div>
                  <div className="text-xs text-primary-dark font-medium">
                    센서 수신 간격: 매 2분 (데모: 5초)
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Status */}
        <Card className="bg-white rounded-xl border border-zinc-200  overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-zinc-100">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <Users className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
              실시간 상태 분석
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-500 font-medium">현재 인식된 인원</span>
                  <span className="text-lg font-bold text-zinc-900">
                    {attendanceData.present} <span className="text-sm text-zinc-400 font-normal">/ {attendanceData.total}</span>
                  </span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(attendanceData.present / attendanceData.total) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-primary/10 rounded-xl text-center border border-primary/30">
                  <p className="text-3xl font-bold text-primary-dark">{attendanceData.present}</p>
                  <p className="text-xs font-medium text-primary-dark mt-1">현재 착석</p>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl text-center border border-rose-100">
                  <p className="text-3xl font-bold text-rose-700">{attendanceData.away}</p>
                  <p className="text-xs font-medium text-rose-600 mt-1">자리 비움</p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-xl text-center border border-zinc-200">
                  <p className="text-3xl font-bold text-zinc-500">{attendanceData.absent}</p>
                  <p className="text-xs font-medium text-zinc-400 mt-1">미출석</p>
                </div>
              </div>

              {isActive && attendanceData.away > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={spring}
                  className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex items-center gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <h4 className="font-semibold text-sm text-rose-800 mb-0.5">이탈자 발생 감지</h4>
                    <p className="text-xs text-rose-600">{attendanceData.away}명의 학생이 카메라 뷰에서 사라졌습니다. 체류율이 감소합니다.</p>
                  </div>
                </motion.div>
              )}

              {!isActive && (
                <div className="p-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-center">
                  <p className="text-sm text-zinc-400 font-medium">
                    모니터링이 시작되면 실시간 데이터가 렌더링됩니다
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-white rounded-xl border border-zinc-200  overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-zinc-100">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <Terminal className="w-4 h-4 text-zinc-400" /> System Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4 text-sm text-zinc-700">
            <p className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary-dark text-xs font-semibold shrink-0 mt-0.5">01</span>
              <span><strong className="text-zinc-900">모니터링 시작</strong> 버튼을 누르면 서버가 라즈베리파이 센서의 웹훅을 대기하기 시작합니다.</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary-dark text-xs font-semibold shrink-0 mt-0.5">02</span>
              <span>라즈베리파이는 2분 주기로 교탁 앞 카메라를 통해 전체 학생을 촬영하고, AWS Rekognition으로 얼굴을 검출합니다.</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary-dark text-xs font-semibold shrink-0 mt-0.5">03</span>
              <span>얼굴 매칭 결과(착석 여부)만 백엔드로 전송되며, 이 페이지에서 실시간으로 렌더링됩니다.</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary-dark text-xs font-semibold shrink-0 mt-0.5">04</span>
              <span><strong className="text-zinc-900">모니터링 종료</strong> 시, 총 강의 시간 중 카메라에 잡힌 비율(체류율)을 계산하여 출석/지각/결석이 최종 확정됩니다.</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Terminal({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  );
}
