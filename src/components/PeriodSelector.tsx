import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PeriodSelector() {
  const { selectedMonth, selectedYear, setSelectedPeriod } = useStore();

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrevious = () => {
    if (selectedMonth === 0) {
      setSelectedPeriod(11, selectedYear - 1);
    } else {
      setSelectedPeriod(selectedMonth - 1, selectedYear);
    }
  };

  const handleNext = () => {
    if (selectedMonth === 11) {
      setSelectedPeriod(0, selectedYear + 1);
    } else {
      setSelectedPeriod(selectedMonth + 1, selectedYear);
    }
  };

  return (
    <div className="flex items-center bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl p-1 shadow-sm">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-slate-500" 
        onClick={handlePrevious}
      >
        <ChevronLeft size={16} />
      </Button>
      
      <div className="px-3 flex items-center gap-2 min-w-[140px] justify-center">
        <Calendar size={14} className="text-blue-500" />
        <span className="text-sm font-bold dark:text-white">
          {months[selectedMonth]} {selectedYear}
        </span>
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-slate-500" 
        onClick={handleNext}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
