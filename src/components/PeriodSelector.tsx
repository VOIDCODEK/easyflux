import { useStore } from '@/lib/store';
import { Calendar } from 'lucide-react';

export function PeriodSelector() {
  const { selectedMonth, selectedYear, setSelectedPeriod } = useStore();

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Generate a range of years around the selected year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => Math.min(selectedYear, currentYear - 5) + i);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl p-1 shadow-sm px-3">
        <Calendar size={14} className="text-blue-500 mr-2" />
        <select 
          className="bg-transparent border-none text-sm font-bold dark:text-white focus:outline-none cursor-pointer pr-2"
          value={selectedMonth}
          onChange={(e) => setSelectedPeriod(Number(e.target.value), selectedYear)}
        >
          {months.map((month, index) => (
            <option key={month} value={index} className="dark:bg-slate-900">
              {month}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl p-1 shadow-sm px-3">
        <select 
          className="bg-transparent border-none text-sm font-bold dark:text-white focus:outline-none cursor-pointer pr-2"
          value={selectedYear}
          onChange={(e) => setSelectedPeriod(selectedMonth, Number(e.target.value))}
        >
          {years.map((year) => (
            <option key={year} value={year} className="dark:bg-slate-900">
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
