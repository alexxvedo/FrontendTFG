import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Timer, Play, Pause, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_WORK_TIME = 25;
const DEFAULT_BREAK_TIME = 5;

export default function PomodoroTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_WORK_TIME * 60);
  const [showSettings, setShowSettings] = useState(false);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [workTime, setWorkTime] = useState(DEFAULT_WORK_TIME);
  const [breakTime, setBreakTime] = useState(DEFAULT_BREAK_TIME);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(workTime * 60);
    setIsBreak(false);
  }, [workTime]);

  const startBreak = useCallback(() => {
    setIsBreak(true);
    setTimeLeft(breakTime * 60);
    setShowBreakDialog(true);
    setIsRunning(true);
  }, [breakTime]);

  const continueStudying = useCallback(() => {
    setIsBreak(false);
    setTimeLeft(workTime * 60);
    setShowBreakDialog(false);
    setIsRunning(true);
  }, [workTime]);

  useEffect(() => {
    let interval;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (!isBreak) {
        startBreak();
      } else {
        continueStudying();
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, startBreak, continueStudying]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "text-4xl font-bold font-mono",
            isBreak && "text-green-500",
            !isBreak && isRunning && "text-blue-500"
          )}
        >
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={isRunning ? pauseTimer : startTimer}
            className="rounded-full hover:bg-accent"
          >
            {isRunning ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="rounded-full hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#0A0A0F] border-zinc-800/30 backdrop-blur-sm text-white sm:max-w-md">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 rounded-md -z-10"></div>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Configuración del Pomodoro
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Ajusta los tiempos de trabajo y descanso
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Tiempo de trabajo</label>
              <Select
                value={workTime.toString()}
                onValueChange={(value) => setWorkTime(Number(value))}
              >
                <SelectTrigger className="w-full bg-white/5 border-zinc-800/50 text-zinc-300">
                  <SelectValue placeholder="Selecciona tiempo" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0A0F] border-zinc-800/50">
                  {[1, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((time) => (
                    <SelectItem key={time} value={time.toString()} className="text-zinc-300 hover:bg-white/5">
                      {time} minutos
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Tiempo de descanso</label>
              <Select
                value={breakTime.toString()}
                onValueChange={(value) => setBreakTime(Number(value))}
              >
                <SelectTrigger className="w-full bg-white/5 border-zinc-800/50 text-zinc-300">
                  <SelectValue placeholder="Selecciona tiempo" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0A0F] border-zinc-800/50">
                  {[3, 5, 7, 10, 15].map((time) => (
                    <SelectItem key={time} value={time.toString()} className="text-zinc-300 hover:bg-white/5">
                      {time} minutos
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowSettings(false);
                resetTimer();
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
        <DialogContent className="bg-[#0A0A0F] border-zinc-800/30 backdrop-blur-sm text-white sm:max-w-md">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 rounded-md -z-10"></div>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ¡Tiempo de descanso!
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Has completado tu sesión de trabajo. Toma un descanso.
            </DialogDescription>
          </DialogHeader>
          <div className="py-10 flex flex-col items-center justify-center">
            <div className="mb-4 relative">
              <div className="w-36 h-36 rounded-full bg-white/5 border border-zinc-800/50 flex items-center justify-center relative">
                {/* Círculo de fondo */}
                <div className="absolute inset-0 rounded-full border-4 border-zinc-800/30"></div>
                
                {/* Círculo de progreso */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="68"
                    fill="none"
                    strokeWidth="4"
                    stroke="url(#gradient)"
                    strokeDasharray={`${2 * Math.PI * 68}`}
                    strokeDashoffset={`${2 * Math.PI * 68 * (1 - timeLeft / (breakTime * 60))}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Texto del temporizador */}
                <div className="text-4xl font-bold font-mono bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent z-10">
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
            <p className="text-zinc-400 text-sm">
              Relájate y vuelve con energía renovada
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={continueStudying}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full"
            >
              Continuar estudiando
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
