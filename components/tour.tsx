"use client";

import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface TourStep {
  content: React.ReactNode;
  selectorId: string;
  width?: number;
  height?: number;
  onClickWithinArea?: () => void;
  position?: "top" | "bottom" | "left" | "right";
}

interface TourContextType {
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  previousStep: () => void;
  endTour: () => void;
  isActive: boolean;
  startTour: () => void;
  setSteps: (steps: TourStep[]) => void;
  steps: TourStep[];
  isTourCompleted: boolean;
  setIsTourCompleted: (completed: boolean) => void;
}

interface TourProviderProps {
  children: React.ReactNode;
  onComplete?: () => void;
  className?: string;
  isTourCompleted?: boolean;
}

const TourContext = createContext<TourContextType | null>(null);

const PADDING = 16;

function getElementPosition(id: string) {
  const element = document.getElementById(id);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  // Se o elemento estiver oculto (ex: menu mobile fechado ou display:none), retorna null
  if (rect.width === 0 && rect.height === 0) return null;

  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  };
}

function calculateContentPosition(
  elementPos: { top: number; left: number; width: number; height: number },
  position: "top" | "bottom" | "left" | "right" = "bottom",
) {
  if (typeof window === "undefined") return { top: 0, left: 0, width: 300, height: 200 };

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isMobile = viewportWidth < 640;

  // Configurações responsivas
  const contentWidth = isMobile ? viewportWidth - PADDING * 2 : 300;
  const contentHeight = 200; // Altura base para cálculos de colisão

  // Lógica específica para mobile: posicionar no rodapé ou topo para não cobrir o elemento
  if (isMobile) {
    const elementCenterY = elementPos.top + elementPos.height / 2 - window.scrollY;
    const isTopHalf = elementCenterY < viewportHeight / 2;

    return {
      // Se o elemento está na metade superior, coloca o card embaixo. Se não, em cima.
      top: isTopHalf
        ? Math.max(elementPos.top + elementPos.height + PADDING, viewportHeight - 250)
        : PADDING + window.scrollY,
      left: PADDING,
      width: contentWidth,
      height: contentHeight,
    };
  }

  let left = elementPos.left;
  let top = elementPos.top;

  switch (position) {
    case "top":
      top = elementPos.top - contentHeight - PADDING;
      left = elementPos.left + elementPos.width / 2 - contentWidth / 2;
      break;
    case "bottom":
      top = elementPos.top + elementPos.height + PADDING;
      left = elementPos.left + elementPos.width / 2 - contentWidth / 2;
      break;
    case "left":
      left = elementPos.left - contentWidth - PADDING;
      top = elementPos.top + elementPos.height / 2 - contentHeight / 2;
      break;
    case "right":
      left = elementPos.left + elementPos.width + PADDING;
      top = elementPos.top + elementPos.height / 2 - contentHeight / 2;
      break;
  }

  return {
    top: Math.max(PADDING, Math.min(top, viewportHeight - contentHeight - PADDING)),
    left: Math.max(PADDING, Math.min(left, viewportWidth - contentWidth - PADDING)),
    width: contentWidth,
    height: contentHeight,
  };
}

export function TourProvider({
  children,
  onComplete,
  className,
  isTourCompleted = false,
}: TourProviderProps) {
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [elementPosition, setElementPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState(isTourCompleted);

  const updateElementPosition = useCallback(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      const position = getElementPosition(steps[currentStep]?.selectorId ?? "");
      // Atualiza a posição mesmo que seja null (para tratar o caso de elemento não encontrado/mobile)
      setElementPosition(position);
    }
  }, [currentStep, steps]);

  useEffect(() => {
    updateElementPosition();
    window.addEventListener("resize", updateElementPosition);
    window.addEventListener("scroll", updateElementPosition);

    return () => {
      window.removeEventListener("resize", updateElementPosition);
      window.removeEventListener("scroll", updateElementPosition);
    };
  }, [updateElementPosition]);

  const nextStep = useCallback(async () => {
    setCurrentStep((prev) => {
      if (prev >= steps.length - 1) {
        return -1;
      }
      return prev + 1;
    });

    if (currentStep === steps.length - 1) {
      setIsTourCompleted(true);
      onComplete?.();
    }
  }, [steps.length, onComplete, currentStep]);

  const previousStep = useCallback(() => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const endTour = useCallback(() => {
    setCurrentStep(-1);
  }, []);

  const startTour = useCallback(() => {
    if (isTourCompleted) {
      return;
    }
    setCurrentStep(0);
  }, [isTourCompleted]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (currentStep >= 0 && elementPosition && steps[currentStep]?.onClickWithinArea) {
        const clickX = e.clientX + window.scrollX;
        const clickY = e.clientY + window.scrollY;

        const isWithinBounds =
          clickX >= elementPosition.left &&
          clickX <= elementPosition.left + (steps[currentStep]?.width || elementPosition.width) &&
          clickY >= elementPosition.top &&
          clickY <= elementPosition.top + (steps[currentStep]?.height || elementPosition.height);

        if (isWithinBounds) {
          steps[currentStep].onClickWithinArea?.();
        }
      }
    },
    [currentStep, elementPosition, steps],
  );

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [handleClick]);

  const setIsTourCompleted = useCallback((completed: boolean) => {
    setIsCompleted(completed);
  }, []);

  return (
    <TourContext.Provider
      value={{
        currentStep,
        totalSteps: steps.length,
        nextStep,
        previousStep,
        endTour,
        isActive: currentStep >= 0,
        startTour,
        setSteps,
        steps,
        isTourCompleted: isCompleted,
        setIsTourCompleted,
      }}
    >
      {children}
      <AnimatePresence>
        {currentStep >= 0 && (
          <>
            {/* Backdrop e Highlight (apenas se o elemento for encontrado) */}
            {elementPosition && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 overflow-hidden bg-black/50"
                style={{
                  clipPath: `polygon(
                  0% 0%,
                  0% 100%,
                  100% 100%,
                  100% 0%,
                  ${elementPosition.left}px 0%,
                  ${elementPosition.left}px ${elementPosition.top}px,
                  ${elementPosition.left + (steps[currentStep]?.width || elementPosition.width)}px ${elementPosition.top}px,
                  ${elementPosition.left + (steps[currentStep]?.width || elementPosition.width)}px ${elementPosition.top + (steps[currentStep]?.height || elementPosition.height)}px,
                  ${elementPosition.left}px ${elementPosition.top + (steps[currentStep]?.height || elementPosition.height)}px,
                  ${elementPosition.left}px 0%
                )`,
                }}
              />
            )}

            {/* Backdrop simples (se o elemento NÃO for encontrado - ex: mobile menu fechado) */}
            {!elementPosition && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50"
              />
            )}

            {/* Borda de destaque (apenas se elemento encontrado) */}
            {elementPosition && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  position: "absolute",
                  top: elementPosition.top,
                  left: elementPosition.left,
                  width: steps[currentStep]?.width || elementPosition.width,
                  height: steps[currentStep]?.height || elementPosition.height,
                }}
                className={cn("z-[100] border-2 border-muted-foreground", className)}
              />
            )}

            {/* Card de Conteúdo */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                // Se elemento encontrado, usa posição calculada. Se não, centraliza na tela.
                top: elementPosition
                  ? calculateContentPosition(elementPosition, steps[currentStep]?.position).top
                  : "50%",
                left: elementPosition
                  ? calculateContentPosition(elementPosition, steps[currentStep]?.position).left
                  : "50%",
                x: elementPosition ? 0 : "-50%",
                y: elementPosition ? 0 : "-50%",
                width: elementPosition
                  ? calculateContentPosition(elementPosition, steps[currentStep]?.position).width
                  : "min(90vw, 400px)",
              }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
              }}
              exit={{ opacity: 0, y: 10 }}
              style={{
                position: elementPosition ? "absolute" : "fixed",
              }}
              className="bg-background relative z-[100] rounded-lg border p-4 shadow-lg"
            >
              <div className="text-muted-foreground absolute right-4 top-4 text-xs">
                {currentStep + 1} / {steps.length}
              </div>
              <AnimatePresence mode="wait">
                <div>
                  <motion.div
                    key={`tour-content-${currentStep}`}
                    initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                    className="overflow-hidden"
                    transition={{
                      duration: 0.2,
                      height: {
                        duration: 0.4,
                      },
                    }}
                  >
                    {steps[currentStep]?.content}
                  </motion.div>
                  <div className="mt-4 flex justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={previousStep}
                      disabled={currentStep === 0}
                    >
                      Anterior
                    </Button>
                    <Button size="sm" onClick={nextStep}>
                      {currentStep === steps.length - 1 ? "Concluir" : "Próximo"}
                    </Button>
                  </div>
                </div>
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}

export function TourAlertDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { startTour, steps, isTourCompleted, currentStep } = useTour();

  if (isTourCompleted || steps.length === 0 || currentStep > -1) {
    return null;
  }
  const handleSkip = async () => {
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md p-6">
        <AlertDialogHeader className="flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <motion.div
              initial={{ scale: 0.7, filter: "blur(10px)" }}
              animate={{
                scale: 1,
                filter: "blur(0px)",
                y: [0, -8, 0],
              }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
                y: {
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                },
              }}
            >
              <div className="relative size-32">
                <Image
                  src="/logo_clips_light.svg"
                  alt="Clips Logo"
                  fill
                  className="object-contain dark:hidden"
                  priority
                />
                <Image
                  src="/logo_clips.svg"
                  alt="Clips Logo"
                  fill
                  className="object-contain hidden dark:block"
                  priority
                />
              </div>
            </motion.div>
          </div>
          <AlertDialogTitle className="text-center text-xl font-medium">
            Bem-vindo ao Tour
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground mt-2 text-center text-sm">
            Faça um tour rápido para conhecer as principais funcionalidades e aprender a usar o
            sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={handleSkip} variant="ghost">
            Pular Tour
          </Button>
          <Button onClick={startTour}>Iniciar Tour</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
