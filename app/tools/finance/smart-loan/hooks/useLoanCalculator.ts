import { useState, useEffect, useMemo } from "react";

// ✅ RESTORED INTERFACES
export interface MonthlyPayment {
  month: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanSummary {
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
  payoffDate: string;
}

export function useLoanCalculator() {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(5);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const reset = () => {
    setAmount(500000);
    setRate(8.5);
    setYears(5);
    setStartDate(new Date().toISOString().slice(0, 10));
  };

  const { summary, schedule } = useMemo(() => {
    const r = rate / 12 / 100;
    const n = years * 12;
    
    let monthlyEMI = 0;
    let totalPayment = 0;
    let totalInterest = 0;
    const scheduleData: MonthlyPayment[] = [];

    if (amount > 0 && rate > 0 && years > 0) {
      monthlyEMI = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      totalPayment = monthlyEMI * n;
      totalInterest = totalPayment - amount;

      let balance = amount;
      let currentDate = new Date(startDate);

      for (let i = 1; i <= n; i++) {
        const interestPart = balance * r;
        const principalPart = monthlyEMI - interestPart;
        balance -= principalPart;
        if (balance < 0) balance = 0;

        scheduleData.push({
          month: i,
          date: currentDate.toLocaleDateString(),
          payment: monthlyEMI,
          principal: principalPart,
          interest: interestPart,
          balance: balance
        });
        
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    const payoffDate = new Date(startDate);
    payoffDate.setMonth(payoffDate.getMonth() + n);

    return {
      summary: {
        monthlyEMI: Math.round(monthlyEMI),
        totalInterest: Math.round(totalInterest),
        totalPayment: Math.round(totalPayment),
        payoffDate: payoffDate.toDateString()
      },
      schedule: scheduleData
    };
  }, [amount, rate, years, startDate]);

  return {
    amount, setAmount,
    rate, setRate,
    years, setYears,
    startDate, setStartDate,
    summary,
    schedule,
    reset,
    isLoaded
  };
}
