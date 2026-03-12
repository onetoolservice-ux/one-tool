"use client";
import React, { useState, useMemo } from 'react';
import { Car, Fuel, MapPin, AlertTriangle, Users, Lightbulb } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const inputCls =
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-orange-400 transition-colors w-full';
const labelCls =
  'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'EV';

const FUEL_DEFAULTS: Record<FuelType, { price: number; mileage: number; unit: string }> = {
  Petrol: { price: 102, mileage: 15, unit: 'litre' },
  Diesel: { price: 90, mileage: 18, unit: 'litre' },
  CNG: { price: 95, mileage: 25, unit: 'kg' },
  EV: { price: 8, mileage: 6, unit: 'kWh' },
};

const FUEL_COLORS: Record<FuelType, string> = {
  Petrol: 'bg-orange-500',
  Diesel: 'bg-yellow-600',
  CNG: 'bg-blue-500',
  EV: 'bg-emerald-500',
};

export const RoadTrip = () => {
  const [origin, setOrigin] = useState('Mumbai');
  const [destination, setDestination] = useState('Goa');
  const [distance, setDistance] = useState(590);
  const [roundTrip, setRoundTrip] = useState(true);
  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  const [fuelPrice, setFuelPrice] = useState(102);
  const [mileage, setMileage] = useState(15);
  const [passengers, setPassengers] = useState(4);
  const [tollOneWay, setTollOneWay] = useState(800);
  const [food, setFood] = useState(1500);
  const [parking, setParking] = useState(200);

  const handleFuelTypeChange = (ft: FuelType) => {
    setFuelType(ft);
    setFuelPrice(FUEL_DEFAULTS[ft].price);
    setMileage(FUEL_DEFAULTS[ft].mileage);
  };

  const calc = useMemo(() => {
    const effectiveDistance = distance * (roundTrip ? 2 : 1);
    const fuelConsumed = mileage > 0 ? effectiveDistance / mileage : 0;
    const fuelCost = fuelConsumed * fuelPrice;
    const tollTotal = tollOneWay * (roundTrip ? 2 : 1);
    const totalCost = fuelCost + tollTotal + food + parking;
    const perPerson = passengers > 0 ? totalCost / passengers : totalCost;
    const costPerKm = effectiveDistance > 0 ? totalCost / effectiveDistance : 0;
    const trainBenchmark = distance * 1 * passengers * (roundTrip ? 2 : 1);
    const savings = totalCost - trainBenchmark;

    return { effectiveDistance, fuelConsumed, fuelCost, tollTotal, totalCost, perPerson, costPerKm, trainBenchmark, savings };
  }, [distance, roundTrip, mileage, fuelPrice, tollOneWay, food, parking, passengers]);

  const unit = FUEL_DEFAULTS[fuelType].unit;

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Road Trip Cost"
        subtitle="Fuel, toll, and total cost for your drive"
        kpis={[
          { label: 'Fuel Cost', value: fmt(calc.fuelCost), color: 'warning' },
          { label: 'Total Trip Cost', value: fmt(calc.totalCost), color: 'neutral' },
          { label: 'Per Person', value: fmt(calc.perPerson), color: 'primary' },
          { label: 'Cost per km', value: `${fmt(calc.costPerKm)}/km`, color: 'neutral' },
        ]}
      />

      <div className="p-4 space-y-4">

        {/* Route Summary Card */}
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <input
                  className="text-lg font-black bg-transparent border-none outline-none text-orange-700 dark:text-orange-300 w-32"
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <div className="h-0.5 w-8 bg-orange-400" />
                <Car className="w-5 h-5 text-orange-500" />
                <div className="h-0.5 w-8 bg-orange-400" />
              </div>
              <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 mt-0.5">
                {calc.effectiveDistance} km {roundTrip ? '(round)' : '(one-way)'}
              </div>
            </div>
            <div className="flex-1 flex justify-end">
              <div className="flex items-center gap-2">
                <input
                  className="text-lg font-black bg-transparent border-none outline-none text-orange-700 dark:text-orange-300 w-32 text-right"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                />
                <MapPin className="w-4 h-4 text-orange-500" />
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${FUEL_COLORS[fuelType]}`}>{fuelType}</span>
              <span className="text-xs text-orange-600 dark:text-orange-400">
                {calc.fuelConsumed.toFixed(1)} {unit} consumed
              </span>
            </div>
            <button
              onClick={() => setRoundTrip(r => !r)}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${roundTrip ? 'bg-orange-500 text-white border-orange-500' : 'border-orange-300 text-orange-600 dark:text-orange-400'}`}
            >
              {roundTrip ? 'Round Trip' : 'One Way'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Vehicle & Route Inputs */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Route & Vehicle</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Distance One-Way (km)</label>
                  <input type="number" className={inputCls} value={distance} onChange={e => setDistance(Math.max(1, +e.target.value))} />
                </div>
                <div>
                  <label className={labelCls}>Passengers</label>
                  <input type="number" min={1} className={inputCls} value={passengers} onChange={e => setPassengers(Math.max(1, +e.target.value))} />
                </div>
              </div>

              <div className="mt-3">
                <label className={labelCls + ' mb-2 block'}>Fuel Type</label>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(FUEL_DEFAULTS) as FuelType[]).map(ft => (
                    <button
                      key={ft}
                      onClick={() => handleFuelTypeChange(ft)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${fuelType === ft ? `${FUEL_COLORS[ft]} text-white border-transparent` : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                    >
                      {ft}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className={labelCls}>
                    {fuelType === 'EV' ? 'Electricity (₹/kWh)' : fuelType === 'CNG' ? 'CNG Price (₹/kg)' : `${fuelType} Price (₹/litre)`}
                  </label>
                  <input type="number" className={inputCls} value={fuelPrice} onChange={e => setFuelPrice(+e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>
                    {fuelType === 'EV' ? 'Efficiency (km/kWh)' : `Mileage (km/${unit})`}
                  </label>
                  <input type="number" className={inputCls} value={mileage} onChange={e => setMileage(Math.max(0.1, +e.target.value))} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Additional Costs</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className={labelCls}>Toll Charges — One Way (₹)</label>
                  <input type="number" className={inputCls} value={tollOneWay} onChange={e => setTollOneWay(+e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Food & Tea Stops (₹)</label>
                  <input type="number" className={inputCls} value={food} onChange={e => setFood(+e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Parking (₹)</label>
                  <input type="number" className={inputCls} value={parking} onChange={e => setParking(+e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown & Comparison */}
          <div className="space-y-4">
            {/* Cost Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Cost Breakdown</h3>
              <div className="space-y-2">
                {[
                  { label: `Fuel (${calc.fuelConsumed.toFixed(1)} ${unit})`, value: calc.fuelCost, pct: calc.totalCost > 0 ? (calc.fuelCost / calc.totalCost) * 100 : 0, color: 'bg-orange-500' },
                  { label: `Tolls${roundTrip ? ' (both ways)' : ''}`, value: calc.tollTotal, pct: calc.totalCost > 0 ? (calc.tollTotal / calc.totalCost) * 100 : 0, color: 'bg-amber-500' },
                  { label: 'Food & Tea', value: food, pct: calc.totalCost > 0 ? (food / calc.totalCost) * 100 : 0, color: 'bg-yellow-500' },
                  { label: 'Parking', value: parking, pct: calc.totalCost > 0 ? (parking / calc.totalCost) * 100 : 0, color: 'bg-orange-300' },
                ].map((row, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">{row.label}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{fmt(row.value)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                ))}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Total</span>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{fmt(calc.totalCost)}</span>
                </div>
              </div>
            </div>

            {/* Per Person */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Split across {passengers} {passengers === 1 ? 'person' : 'people'}
                </h3>
              </div>
              <div className="text-3xl font-black text-orange-600 dark:text-orange-400 mb-1">{fmt(calc.perPerson)}</div>
              <div className="text-xs text-slate-400">per person total</div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {fmt(calc.costPerKm)} per km &bull; {calc.effectiveDistance} km total
              </div>
            </div>

            {/* Train comparison */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">vs. Train / Bus Benchmark</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Estimated train/bus cost</div>
                  <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{fmt(calc.trainBenchmark)}</div>
                  <div className="text-[10px] text-slate-400">at ₹1/km/person</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-0.5">Road trip {calc.savings > 0 ? 'costs more by' : 'saves'}</div>
                  <div className={`text-lg font-bold ${calc.savings > 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {fmt(Math.abs(calc.savings))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Road Trip Tips</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'Refuel in smaller towns — prices are often lower than highways.',
              'Inflate tyres to recommended PSI before a long drive for better mileage.',
              'Drive at 80-90 km/h for optimal fuel efficiency on highways.',
              'Carry an FASTag to avoid toll plaza delays and get cashback discounts.',
              'Avoid peak traffic hours in metro areas to save fuel.',
              'Keep an emergency cash reserve for breakdowns or detours.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-1 h-1 rounded-full bg-orange-400 flex-shrink-0 mt-1.5" />
                {tip}
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">Disclaimer</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Fuel prices, toll rates, and mileage figures are indicative. Actual costs depend on current fuel prices, road conditions, vehicle load, driving style, and seasonal tolls. The train/bus benchmark is a rough estimate at ₹1/km/person and may not reflect actual ticket prices. Always verify current rates before travel.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
