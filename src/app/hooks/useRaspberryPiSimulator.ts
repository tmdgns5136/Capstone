import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface SimulatorConfig {
  intervalMs?: number; // How often the Raspberry Pi "takes a picture" (in real life, 2 mins)
  totalStudents?: number;
  initialPresentRatio?: number;
  courseId: number | string;
  courseName: string;
}

export interface StudentStatus {
  id: string;
  name: string;
  status: 'present' | 'absent' | 'away'; // 'away' if missing for a single frame
  lastSeenTime: number; // timestamp
}

export function useRaspberryPiSimulator(config: SimulatorConfig) {
  const {
    intervalMs = 3000, // 3 seconds in demo instead of 2 minutes
    totalStudents = 45,
    initialPresentRatio = 0.9,
    courseId,
    courseName
  } = config;

  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lastCaptureTime, setLastCaptureTime] = useState<Date | null>(null);
  
  const [attendanceData, setAttendanceData] = useState({
    present: 0,
    away: 0,
    absent: totalStudents,
    total: totalStudents,
  });

  // Start the simulated class
  const startSimulation = useCallback(() => {
    setIsActive(true);
    setElapsedTime(0);
    
    const initialPresent = Math.floor(totalStudents * initialPresentRatio);
    setAttendanceData({
      present: initialPresent,
      away: 0,
      absent: totalStudents - initialPresent,
      total: totalStudents,
    });
    
    setLastCaptureTime(new Date());
    toast.success(`${courseName} 실시간 모니터링이 시작되었습니다.`);
    toast.info("라즈베리파이 센서와 연동 대기 중...");
  }, [totalStudents, initialPresentRatio, courseName]);

  // Stop the simulated class
  const stopSimulation = useCallback(() => {
    setIsActive(false);
    toast.success("강의가 종료되었습니다. 전체 체류율 기반 출결이 산정됩니다.");
  }, []);

  // Main simulation loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isActive) {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        
        // Every intervalMs, simulate a Raspberry Pi ping
        if ((elapsedTime + 1) % (intervalMs / 1000) === 0) {
          triggerSensorPing();
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, elapsedTime, intervalMs]);

  // Simulate receiving data from the Raspberry Pi server
  const triggerSensorPing = useCallback(() => {
    setLastCaptureTime(new Date());
    
    // Simulate some students leaving or coming back to make the dashboard dynamic
    setAttendanceData(prev => {
      // 10% chance a present student steps away
      const presentToAway = Math.floor(Math.random() * (prev.present * 0.1));
      
      // 30% chance an away student comes back
      const awayToPresent = Math.floor(Math.random() * (prev.away * 0.3 + 1));
      
      return {
        ...prev,
        present: prev.present - presentToAway + awayToPresent,
        away: prev.away + presentToAway - awayToPresent,
        // Absent stays the same for this simple simulation
      };
    });
    
    // In a real app, this would actually fetch from Supabase:
    // const { data } = await supabase.from('current_attendance').select('*')
    // setAttendanceData(data)
  }, []);

  return {
    isActive,
    elapsedTime,
    lastCaptureTime,
    attendanceData,
    startSimulation,
    stopSimulation,
    triggerSensorPing // allow manual trigger
  };
}