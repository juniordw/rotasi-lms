// src/components/course/CourseCurriculum.tsx
import { createContext, useContext, ReactNode, useState } from 'react';
import { FiPlay, FiFileText, FiEdit, FiChevronDown, FiChevronUp, FiCheck } from 'react-icons/fi';

// Context
type CourseCurriculumContextType = {
  activeModuleId: number | null;
  toggleModule: (id: number) => void;
};

const CourseCurriculumContext = createContext<CourseCurriculumContextType | undefined>(undefined);

const useCourseCurriculum = () => {
  const context = useContext(CourseCurriculumContext);
  if (!context) {
    throw new Error('useCourseCurriculum must be used within a CourseCurriculum component');
  }
  return context;
};

// Main Component
type CourseCurriculumProps = {
  children: ReactNode;
  className?: string;
};

const CourseCurriculum = ({ children, className = '' }: CourseCurriculumProps) => {
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);

  const toggleModule = (id: number) => {
    setActiveModuleId(prev => prev === id ? null : id);
  };

  return (
    <CourseCurriculumContext.Provider value={{ activeModuleId, toggleModule }}>
      <div className={`space-y-4 ${className}`}>
        {children}
      </div>
    </CourseCurriculumContext.Provider>
  );
};

// Module Component
type ModuleProps = {
  id: number;
  title: string;
  lessons?: number;
  children: ReactNode;
  className?: string;
};

const Module = ({ id, title, lessons = 0, children, className = '' }: ModuleProps) => {
  const { activeModuleId, toggleModule } = useCourseCurriculum();
  const isActive = activeModuleId === id;

  return (
    <div className={`rounded-lg border border-neutral-200 overflow-hidden dark:border-neutral-700 ${className}`}>
      <div 
        className="flex items-center justify-between p-4 cursor-pointer bg-neutral-50 dark:bg-neutral-800/50"
        onClick={() => toggleModule(id)}
      >
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center">
          <span className="mr-3 text-sm text-neutral-500 dark:text-neutral-400">{lessons} materi</span>
          {isActive ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </div>

      {isActive && (
        <div>{children}</div>
      )}
    </div>
  );
};

// Lesson Component
type LessonProps = {
  id: number;
  title: string;
  duration?: number;
  type: 'video' | 'article' | 'quiz';
  isCompleted?: boolean;
  onClick?: () => void;
  className?: string;
};

const Lesson = ({ id, title, duration = 0, type, isCompleted = false, onClick, className = '' }: LessonProps) => {
  const icons = {
    video: <FiPlay className="text-primary-400" />,
    article: <FiFileText className="text-mint-400" />,
    quiz: <FiEdit className="text-coral-400" />,
  };

  return (
    <div 
      className={`border-b border-neutral-200 dark:border-neutral-700 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-2">{icons[type]}</span>
          <span>{title}</span>
        </div>
        <div className="flex items-center">
          {isCompleted && (
            <FiCheck className="mr-2 text-green-500" />
          )}
          <span className="text-sm text-neutral-500 dark:text-neutral-400">{duration} menit</span>
        </div>
      </div>
    </div>
  );
};

// Compose the components
CourseCurriculum.Module = Module;
CourseCurriculum.Lesson = Lesson;

export default CourseCurriculum;