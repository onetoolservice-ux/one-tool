"use client";
import React, { useState, useEffect } from "react";
import { RefreshCw, Trophy, Zap, Heart, Star, Bell, Cloud, Camera, Moon, Sun, Music, Anchor } from "lucide-react";
import Button from "@/app/shared/ui/Button";

// Safe, Enterprise-grade icons instead of emojis
const ICON_SET = [
  { id: 'zap', Icon: Zap, color: "text-amber-500" },
  { id: 'heart', Icon: Heart, color: "text-rose-500" },
  { id: 'star', Icon: Star, color: "text-yellow-400" },
  { id: 'bell', Icon: Bell, color: "text-blue-500" },
  { id: 'cloud', Icon: Cloud, color: "text-sky-400" },
  { id: 'camera', Icon: Camera, color: "text-emerald-500" },
  { id: 'moon', Icon: Moon, color: "text-indigo-500" },
  { id: 'sun', Icon: Sun, color: "text-orange-500" },
];

export default function MemoryGame() {
  const [cards, setCards] = useState<{uid: number, data: typeof ICON_SET[0], flipped: boolean, matched: boolean}[]>([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState<any>(null);
  const [choiceTwo, setChoiceTwo] = useState<any>(null);
  const [disabled, setDisabled] = useState(false);

  const shuffleCards = () => {
    const shuffled = [...ICON_SET, ...ICON_SET]
      .sort(() => Math.random() - 0.5)
      .map((item) => ({ uid: Math.random(), data: item, flipped: false, matched: false }));
    
    setChoiceOne(null);
    setChoiceTwo(null);
    setCards(shuffled);
    setTurns(0);
  };

  const handleChoice = (card: any) => {
     if(choiceOne) setChoiceTwo(card);
     else setChoiceOne(card);
  };

  useEffect(() => {
    if (choiceOne && choiceTwo) {
       setDisabled(true);
       if(choiceOne.data.id === choiceTwo.data.id) {
          setCards(prev => prev.map(c => (c.data.id === choiceOne.data.id ? {...c, matched: true} : c)));
          resetTurn();
       } else {
          setTimeout(() => resetTurn(), 1000);
       }
    }
  }, [choiceOne, choiceTwo]);

  const resetTurn = () => {
     setChoiceOne(null);
     setChoiceTwo(null);
     setTurns(t => t + 1);
     setDisabled(false);
  };

  useEffect(shuffleCards, []);

  return (
    <div className="max-w-2xl mx-auto p-6 text-center space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Memory Match</h1>
        <p className="text-slate-500">Train your brain. Find the matching icons.</p>
      </div>

      <div className="flex justify-between items-center px-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
         <Button onClick={shuffleCards} variant="secondary" className="text-xs h-8"><RefreshCw size={14} className="mr-2"/> Restart</Button>
         <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 text-sm">
            <Trophy size={16} className="text-amber-500"/> Turns: {turns}
         </div>
      </div>

      <div className="grid grid-cols-4 gap-3 aspect-square">
         {cards.map(card => {
            const isVisible = card.flipped || card.matched || choiceOne === card || choiceTwo === card;
            const Icon = card.data.Icon;
            return (
                <div 
                   key={card.uid} 
                   className="relative w-full h-full cursor-pointer group perspective-1000"
                   onClick={() => !disabled && !isVisible && !card.matched && handleChoice(card)}
                >
                   <div className={`
                      absolute inset-0 rounded-2xl transition-all duration-500 transform 
                      flex items-center justify-center shadow-sm border-2
                      ${isVisible 
                        ? 'bg-white dark:bg-slate-800 border-indigo-500 rotate-y-0' 
                        : 'bg-indigo-600 border-indigo-600 rotate-y-180 group-hover:bg-indigo-500'}
                   `}>
                      {isVisible ? (
                          <Icon size={32} className={card.data.color} />
                      ) : (
                          <div className="w-3 h-3 bg-white/20 rounded-full" />
                      )}
                   </div>
                </div>
            );
         })}
      </div>
    </div>
  );
}
